import { CanvasState, Collaborator, ChatMessage } from '../types';
import { storageService } from './storageService';

type CollabEventListener = (event: {
  type: string;
  data?: any;
}) => void;

class CollabService {
  private ws: WebSocket | null = null;
  private currentUser: Collaborator;
  private collaborators: Map<string, Collaborator> = new Map();
  private listeners: CollabEventListener[] = [];
  private reconnectTimer: any = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private pingInterval: any = null;

  constructor() {
    const defaultUsers = [
      { name: 'Fatu Koroma', role: 'M&E Field Coordinator (Bo)', color: '#10B981', avatar: 'FK' },
      { name: 'Dr. Alie Conteh', role: 'Chief Agribusiness Specialist (Freetown)', color: '#3B82F6', avatar: 'AC' },
      { name: 'Ibrahim Sesay', role: 'Cocoa Value Chain Lead (Kenema)', color: '#F59E0B', avatar: 'IS' },
      { name: 'Mariama Bangura', role: 'Data Analyst & M&E Officer (Port Loko)', color: '#EC4899', avatar: 'MB' },
      { name: 'Patrick Gbao', role: 'Rural Logistics Specialist (Kailahun)', color: '#8B5CF6', avatar: 'PG' },
    ];
    // Pick user based on random or cached
    let savedId = '';
    let savedIndex = 0;
    if (typeof window !== 'undefined') {
      savedId = localStorage.getItem('avcdp_user_id') || '';
      savedIndex = parseInt(localStorage.getItem('avcdp_user_idx') || '0', 10);
      if (!savedId) {
        savedId = 'usr_' + Math.random().toString(36).substring(2, 9);
        savedIndex = Math.floor(Math.random() * defaultUsers.length);
        localStorage.setItem('avcdp_user_id', savedId);
        localStorage.setItem('avcdp_user_idx', String(savedIndex));
      }
    } else {
      savedId = 'usr_default';
    }

    const profile = defaultUsers[savedIndex % defaultUsers.length];
    this.currentUser = {
      id: savedId,
      name: profile.name,
      role: profile.role,
      color: profile.color,
      avatar: profile.avatar,
      isOnline: true,
      lastActive: Date.now(),
    };
  }

  public getCurrentUser(): Collaborator {
    return this.currentUser;
  }

  public setCurrentUser(user: Partial<Collaborator>) {
    this.currentUser = { ...this.currentUser, ...user };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'join',
          user: this.currentUser,
        })
      );
    }
    this.notifyListeners({ type: 'profile_updated', data: this.currentUser });
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (storageService.isSimulatedOffline()) return;
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        // Announce join
        this.ws?.send(
          JSON.stringify({
            type: 'join',
            user: this.currentUser,
          })
        );
        this.notifyListeners({ type: 'connection_status', data: { connected: true } });

        // Start ping interval
        clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error('Error handling WS msg:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        clearInterval(this.pingInterval);
        this.notifyListeners({ type: 'connection_status', data: { connected: false } });
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.notifyListeners({ type: 'connection_status', data: { connected: false } });
      };
    } catch (e) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (storageService.isSimulatedOffline()) return;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 4000);
  }

  public disconnect() {
    clearTimeout(this.reconnectTimer);
    clearInterval(this.pingInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private handleMessage(msg: any) {
    switch (msg.type) {
      case 'init_state': {
        this.collaborators.clear();
        if (Array.isArray(msg.collaborators)) {
          msg.collaborators.forEach((c: Collaborator) => {
            if (c.id !== this.currentUser.id) {
              this.collaborators.set(c.id, c);
            }
          });
        }
        this.notifyListeners({
          type: 'collaborators_changed',
          data: Array.from(this.collaborators.values()),
        });

        if (msg.canvas) {
          this.notifyListeners({ type: 'remote_canvas_init', data: msg.canvas });
        }
        break;
      }

      case 'user_joined': {
        if (msg.user && msg.user.id !== this.currentUser.id) {
          this.collaborators.set(msg.user.id, msg.user);
          this.notifyListeners({
            type: 'collaborators_changed',
            data: Array.from(this.collaborators.values()),
          });
          this.notifyListeners({ type: 'user_joined', data: msg.user });
        }
        break;
      }

      case 'user_left': {
        if (msg.userId) {
          const departing = this.collaborators.get(msg.userId);
          this.collaborators.delete(msg.userId);
          this.notifyListeners({
            type: 'collaborators_changed',
            data: Array.from(this.collaborators.values()),
          });
          if (departing) {
            this.notifyListeners({ type: 'user_left', data: departing });
          }
        }
        break;
      }

      case 'cursor_update': {
        if (msg.userId !== this.currentUser.id) {
          const existing = this.collaborators.get(msg.userId);
          if (existing) {
            existing.cursor = msg.cursor;
            existing.lastActive = Date.now();
          }
          this.notifyListeners({
            type: 'cursor_moved',
            data: {
              userId: msg.userId,
              cursor: msg.cursor,
              name: msg.userName,
              color: msg.userColor,
            },
          });
        }
        break;
      }

      case 'canvas_updated': {
        if (msg.author !== this.currentUser.id) {
          this.notifyListeners({
            type: 'remote_canvas_updated',
            data: { canvas: msg.canvas, author: msg.author, widgetId: msg.widgetId },
          });
        }
        break;
      }

      case 'chat_message': {
        this.notifyListeners({ type: 'chat_message', data: msg.message });
        break;
      }
    }
  }

  // Emitters
  public sendCanvasUpdate(canvas: CanvasState, widgetId?: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'canvas_update',
          canvas,
          author: this.currentUser.id,
          widgetId,
        })
      );
    }
  }

  public sendCursorMove(x: number, y: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'cursor_move',
          cursor: { x, y },
        })
      );
    }
  }

  public sendChatMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'chat_message',
          text,
          sender: this.currentUser.name,
          color: this.currentUser.color,
        })
      );
    }
  }

  public getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }

  public subscribe(listener: CollabEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(event: { type: string; data?: any }) {
    this.listeners.forEach((l) => l(event));
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const collabService = new CollabService();
