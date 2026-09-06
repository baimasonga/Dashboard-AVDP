import React, { useState, useEffect, useRef } from 'react';
import { Collaborator, ChatMessage } from '../../types';
import { collabService } from '../../services/collabService';
import { storageService } from '../../services/storageService';
import {
  Users,
  Send,
  Wifi,
  WifiOff,
  Radio,
  UserCheck,
  Shield,
  MessageSquare,
  X,
} from 'lucide-react';

interface CollabDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollabDrawer: React.FC<CollabDrawerProps> = ({ isOpen, onClose }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(collabService.getCollaborators());
  const [currentUser, setCurrentUser] = useState<Collaborator>(collabService.getCurrentUser());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Dr. Alie Conteh',
      text: 'Verified Q3 Rice yield reports from Bo and Kenema IVS clusters. Excellent progress!',
      timestamp: Date.now() - 1000 * 60 * 18,
      color: '#3B82F6',
    },
    {
      id: 'm2',
      sender: 'Fatu Koroma',
      text: 'Syncing 42 new FBO farmer registry forms collected offline in Moyamba and Bonthe.',
      timestamp: Date.now() - 1000 * 60 * 6,
      color: '#10B981',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(collabService.getIsConnected());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = collabService.subscribe((event) => {
      if (event.type === 'collaborators_changed') {
        setCollaborators(event.data);
      } else if (event.type === 'connection_status') {
        setIsConnected(event.data.connected);
      } else if (event.type === 'chat_message') {
        setMessages((prev) => [...prev, event.data]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: currentUser.name,
      text: inputText.trim(),
      timestamp: Date.now(),
      color: currentUser.color,
    };

    setMessages((prev) => [...prev, newMsg]);
    collabService.sendChatMessage(inputText.trim());
    setInputText('');
  };

  const handleSwitchProfile = (name: string, role: string, color: string, avatar: string) => {
    const updated = { name, role, color, avatar };
    collabService.setCurrentUser(updated);
    setCurrentUser(collabService.getCurrentUser());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Live Field Collaboration</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 border border-slate-700">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300">Live P2P</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-300">Offline Room</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current User Identity Bar */}
      <div className="p-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-950 shadow"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.avatar}
          </div>
          <div>
            <div className="text-xs font-bold text-white">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</div>
          </div>
        </div>

        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'AC') handleSwitchProfile('Dr. Alie Conteh', 'Chief Agribusiness Specialist (Freetown)', '#3B82F6', 'AC');
            if (val === 'FK') handleSwitchProfile('Fatu Koroma', 'M&E Field Coordinator (Bo)', '#10B981', 'FK');
            if (val === 'IS') handleSwitchProfile('Ibrahim Sesay', 'Cocoa Value Chain Lead (Kenema)', '#F59E0B', 'IS');
            if (val === 'MB') handleSwitchProfile('Mariama Bangura', 'Data Analyst & M&E Officer (Port Loko)', '#EC4899', 'MB');
          }}
          className="px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-300 focus:outline-none"
        >
          <option value="">Switch Role...</option>
          <option value="FK">Fatu (Bo M&E)</option>
          <option value="AC">Dr. Conteh (Freetown HQ)</option>
          <option value="IS">Ibrahim (Kenema Cocoa)</option>
          <option value="MB">Mariama (Port Loko)</option>
        </select>
      </div>

      {/* Online Collaborators Roster */}
      <div className="px-4 py-2 bg-slate-850/50 border-b border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
          <span>Active Field &amp; HQ Staff</span>
          <span className="text-emerald-400 font-bold">{collaborators.length + 1} present</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {/* Self */}
          <div
            className="relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 ring-2 ring-emerald-500"
            style={{ backgroundColor: currentUser.color }}
            title={`${currentUser.name} (You)`}
          >
            {currentUser.avatar}
          </div>

          {/* Remote peers */}
          {collaborators.map((c) => (
            <div
              key={c.id}
              className="relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 ring-1 ring-slate-700"
              style={{ backgroundColor: c.color }}
              title={`${c.name} - ${c.role}`}
            >
              {c.avatar}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
            </div>
          ))}

          {collaborators.length === 0 && (
            <span className="text-[10px] text-slate-500 italic">No other peers online right now</span>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => {
          const isSelf = m.sender === currentUser.name;
          const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={m.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                <span className="font-semibold" style={{ color: m.color || '#94a3b8' }}>
                  {m.sender}
                </span>
                <span>• {time}</span>
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                  isSelf
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Share field update or note..."
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
