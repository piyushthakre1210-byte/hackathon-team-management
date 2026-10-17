import React, { useState, useEffect, useRef } from 'react';
import { Member, ChatMessage } from '../types/hackathon';

interface ChatViewProps {
  members: Member[];
  currentUserId: string;
  onSelectActiveUser: (memberId: string) => void;
}

const CHANNELS = [
  { id: 'general', name: 'sprint-general', desc: 'Core architecture & daily team sync' },
  { id: 'blockers', name: 'blockers-and-help', desc: 'Critical bug fixes, PR reviews & code freeze' },
  { id: 'pitch', name: 'pitch-and-demo', desc: 'Slide deck, demo rehearsal & submission prep' },
];

const QUICK_SNIPPETS = [
  '🚨 Need a quick code review on my latest PR!',
  '✅ Staging deploy successful on Cloud Run',
  '⏱️ Code freeze reminder: only 4 hours remaining!',
  '📊 Telemetry waveform canvas running at 60fps',
  '📹 3-minute pitch video recorded & uploaded',
];

export const ChatView: React.FC<ChatViewProps> = ({
  members,
  currentUserId,
  onSelectActiveUser,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedClientsCount, setConnectedClientsCount] = useState(1);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = members.find((m) => m.id === currentUserId) || members[0];

  // Auto-scroll helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  // WebSocket Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        ws = new WebSocket(`${protocol}//${host}`);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'init') {
              if (Array.isArray(data.messages)) {
                setMessages(data.messages);
              }
              if (typeof data.connectedClientsCount === 'number') {
                setConnectedClientsCount(data.connectedClientsCount);
              }
            } else if (data.type === 'presence:update') {
              if (typeof data.connectedClientsCount === 'number') {
                setConnectedClientsCount(data.connectedClientsCount);
              }
            } else if (data.type === 'chat:new_message') {
              const newMsg = data.message;
              if (newMsg && newMsg.id) {
                setMessages((prev) => {
                  // Idempotent guard
                  if (prev.some((m) => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
              }
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnecting after 2.5 seconds
          reconnectTimeout = setTimeout(connect, 2500);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (e) {
        console.error('WebSocket connection error:', e);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    // Fallback: initial REST fetch to ensure messages load even if WS is negotiating
    fetch('/api/chat/messages')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (prev.length === 0) return data.messages;
            // merge uniquely
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            return [...prev, ...fresh];
          });
        }
      })
      .catch(() => {
        // ignore REST fallback error
      });

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const payload = {
      type: 'chat:send',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatarColor: currentUser.avatarColor,
      senderHandle: currentUser.handle,
      text: inputText.trim(),
      channel: activeChannel,
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      // REST fallback
      fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.error('Failed to post message via REST:', err));
    }

    setInputText('');
  };

  const channelMessages = messages.filter((m) => (m.channel || 'general') === activeChannel);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Top Bar for Chat */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Team War Room Chat</h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                isConnected
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>{isConnected ? 'Real-Time WS Active' : 'Connecting...'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant peer-to-peer sprint communication across all connected teammates.
          </p>
        </div>

        {/* Sender identity switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <span className="text-slate-400">Logged in as:</span>
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ backgroundColor: currentUser?.avatarColor }}
          >
            {currentUser?.name.charAt(0)}
          </div>
          <select
            value={currentUserId}
            onChange={(e) => onSelectActiveUser(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 mt-4 overflow-hidden">
        {/* Left: Channel Selector & Teammate Roster */}
        <div className="w-full md:w-64 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-4 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Sprint Channels
            </span>
            <div className="space-y-1">
              {CHANNELS.map((ch) => {
                const isActive = activeChannel === ch.id;
                const unreadCount = messages.filter((m) => m.channel === ch.id).length;

                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-indigo-950/70 text-indigo-200 border border-indigo-800/60 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <span className="truncate"># {ch.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{unreadCount}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Teammates Roster */}
          <div className="flex-1 overflow-y-auto pt-3 border-t border-slate-800/60">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Teammates ({members.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {connectedClientsCount} online
              </span>
            </div>

            <div className="space-y-1.5">
              {members.map((m) => {
                const isSelected = m.id === currentUserId;

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectActiveUser(m.id)}
                    className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                    }`}
                    title="Click to switch your logged-in sender identity"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: m.avatarColor }}
                      >
                        {m.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="text-slate-200 font-medium block truncate">
                          {m.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {m.role}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        m.status === 'coding'
                          ? 'bg-emerald-400'
                          : m.status === 'reviewing'
                          ? 'bg-sky-400'
                          : m.status === 'available'
                          ? 'bg-amber-400'
                          : 'bg-purple-400'
                      }`}
                      title={`Status: ${m.status}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Message Stream & Input Box */}
        <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col overflow-hidden">
          {/* Channel Header Banner */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                #{CHANNELS.find((c) => c.id === activeChannel)?.name}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                — {CHANNELS.find((c) => c.id === activeChannel)?.desc}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {channelMessages.length} messages
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {channelMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 group transition-colors ${
                    isMe ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Sender Avatar */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm"
                    style={{ backgroundColor: msg.senderAvatarColor || '#6366F1' }}
                  >
                    {msg.senderName.charAt(0)}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] ${
                      isMe ? 'items-end' : 'items-start'
                    } flex flex-col`}
                  >
                    {/* Header: Sender Name, Role, Timestamp */}
                    <div
                      className={`flex items-center gap-2 mb-1 text-xs ${
                        isMe ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span className="font-semibold text-slate-200">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-medium">
                        {msg.senderRole}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                      {isMe && (
                        <span className="text-[9px] text-slate-400 bg-slate-800 px-1 py-0.2 rounded font-medium">
                          You
                        </span>
                      )}
                    </div>

                    {/* Text Body */}
                    <div
                      className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm leading-relaxed shadow-sm break-words ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800/80 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {channelMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
                <span className="text-xl mb-1">💬</span>
                <span className="font-medium text-slate-400">
                  No messages yet in #{CHANNELS.find((c) => c.id === activeChannel)?.name}
                </span>
                <span className="mt-1 max-w-xs">
                  Type a sprint update below or select a quick sprint prompt to notify your team!
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Snippets Bar */}
          <div className="px-4 py-1.5 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">
              Quick:
            </span>
            {QUICK_SNIPPETS.map((snip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(snip)}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {snip}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Message #${CHANNELS.find((c) => c.id === activeChannel)?.name} as ${currentUser?.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
