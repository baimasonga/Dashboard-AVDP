import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const server = http.createServer(app);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// In-memory server-authoritative state for real-time collaboration and cloud syncing
interface Collaborator {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string;
  cursor?: { x: number; y: number };
  lastActive: number;
}

interface SyncItem {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  author: string;
}

let serverCanvasState: any = null;
let serverDatasets: Record<string, any> = {};
const activeCollaborators = new Map<string, { ws: WebSocket; user: Collaborator }>();
let changeLog: SyncItem[] = [];

// WebSocket setup
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(message: any, senderWs?: WebSocket) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== senderWs) {
      client.send(data);
    }
  });
}

function broadcastAll(message: any) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws) => {
  let userId = 'user_' + Math.random().toString(36).substring(2, 9);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      switch (msg.type) {
        case 'join': {
          userId = msg.user.id || userId;
          activeCollaborators.set(userId, {
            ws,
            user: {
              ...msg.user,
              id: userId,
              lastActive: Date.now(),
            },
          });
          // Send initial authoritative state to client
          ws.send(
            JSON.stringify({
              type: 'init_state',
              canvas: serverCanvasState,
              collaborators: Array.from(activeCollaborators.values()).map((c) => c.user),
              datasets: Object.keys(serverDatasets),
            })
          );
          // Broadcast user joined to others
          broadcast(
            {
              type: 'user_joined',
              user: activeCollaborators.get(userId)?.user,
            },
            ws
          );
          break;
        }

        case 'cursor_move': {
          const entry = activeCollaborators.get(userId);
          if (entry) {
            entry.user.cursor = msg.cursor;
            entry.user.lastActive = Date.now();
            broadcast(
              {
                type: 'cursor_update',
                userId,
                cursor: msg.cursor,
                userName: entry.user.name,
                userColor: entry.user.color,
              },
              ws
            );
          }
          break;
        }

        case 'canvas_update': {
          serverCanvasState = msg.canvas;
          const syncEvent: SyncItem = {
            id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: 'canvas_update',
            payload: msg.canvas,
            timestamp: Date.now(),
            author: msg.author || userId,
          };
          changeLog.push(syncEvent);
          if (changeLog.length > 500) changeLog.shift();

          broadcast(
            {
              type: 'canvas_updated',
              canvas: msg.canvas,
              author: msg.author || userId,
              widgetId: msg.widgetId,
            },
            ws
          );
          break;
        }

        case 'chat_message': {
          broadcastAll({
            type: 'chat_message',
            message: {
              id: 'chat_' + Date.now(),
              text: msg.text,
              sender: msg.sender,
              color: msg.color,
              timestamp: Date.now(),
            },
          });
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        }
      }
    } catch (err) {
      console.error('WS Error:', err);
    }
  });

  ws.on('close', () => {
    activeCollaborators.delete(userId);
    broadcast({
      type: 'user_left',
      userId,
    });
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sierra Leone AVCDP Data Engine',
    collaboratorsCount: activeCollaborators.size,
    timestamp: new Date().toISOString(),
  });
});

// Cloud Sync endpoint for merging offline cached changes
app.post('/api/sync', (req, res) => {
  try {
    const { queue = [], clientLastSync = 0, clientCanvas } = req.body;
    const applied: string[] = [];

    // Process each queued offline mutation
    for (const item of queue) {
      if (item.type === 'canvas_update' && item.payload) {
        // Last-write-wins by timestamp
        serverCanvasState = item.payload;
        applied.push(item.id);
      } else if (item.type === 'dataset_save' && item.payload) {
        serverDatasets[item.payload.id] = item.payload;
        applied.push(item.id);
      }
    }

    // If client had offline changes, broadcast merged canvas to all active WS clients
    if (applied.length > 0 && serverCanvasState) {
      broadcastAll({
        type: 'canvas_updated',
        canvas: serverCanvasState,
        author: 'cloud_sync',
      });
    }

    // Return current authoritative server state & new changes since clientLastSync
    const newerChanges = changeLog.filter((c) => c.timestamp > clientLastSync);

    res.json({
      success: true,
      syncedCount: applied.length,
      appliedIds: applied,
      serverTimestamp: Date.now(),
      serverCanvas: serverCanvasState,
      recentChanges: newerChanges,
    });
  } catch (err: any) {
    console.error('Sync error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// CARTO Integration & Token status endpoint
app.get('/api/carto/config', (req, res) => {
  const token = process.env.CARTO_TOKEN;
  const apiBaseUrl =
    process.env.CARTO_API_BASE_URL ||
    process.env.VITE_CARTO_API_BASE_URL ||
    'https://gcp-us-east1.api.carto.com';

  res.json({
    success: true,
    configured: Boolean(token),
    apiBaseUrl,
    region: 'gcp-us-east1',
    account: process.env.CARTO_ACCOUNT_ID || null,
    allowedApis: ['maps'],
    attribution: '© CARTO © OpenStreetMap contributors',
  });
});

// Live CARTO Platform API Ping / Health Check
app.get('/api/carto/status', async (req, res) => {
  const token = process.env.CARTO_TOKEN;
  const apiBaseUrl =
    process.env.CARTO_API_BASE_URL ||
    process.env.VITE_CARTO_API_BASE_URL ||
    'https://gcp-us-east1.api.carto.com';

  if (!token) {
    return res.status(503).json({
      success: false,
      authenticated: false,
      configured: false,
      apiBaseUrl,
      error: 'CARTO integration is not configured',
    });
  }

  const startTime = Date.now();
  try {
    const probeResponse = await fetch(`${apiBaseUrl}/v3/maps`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const latencyMs = Date.now() - startTime;
    const isAuthorized = probeResponse.ok;

    res.json({
      success: true,
      apiBaseUrl,
      region: 'gcp-us-east1',
      account: process.env.CARTO_ACCOUNT_ID || null,
      statusCode: probeResponse.status,
      authenticated: isAuthorized,
      latencyMs,
      allowedApis: ['maps'],
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.json({
      success: false,
      apiBaseUrl,
      error: err.message,
      latencyMs: Date.now() - startTime,
    });
  }
});

// External AI analysis is intentionally disabled. Dashboard insights are calculated
// locally in the browser so row-level programme data is not transmitted externally.
app.post('/api/ai/analyze-data', (_req, res) => {
  res.status(410).json({
    success: false,
    code: 'LOCAL_INSIGHTS_ONLY',
    error: 'External AI analysis is disabled. Use the dashboard Local Insights panel.',
  });
});

// Vite middleware for dev or static serving for prod
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Sierra Leone AVCDP Server running on port ${PORT}`);
  });
}

start();
