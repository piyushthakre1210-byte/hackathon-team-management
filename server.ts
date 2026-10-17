import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatarColor: string;
  senderHandle: string;
  text: string;
  timestamp: string;
  channel: string;
}

// In-memory server-authoritative chat store
const chatMessages: ChatMessage[] = [
  {
    id: 'msg-seed-1',
    senderId: 'm-1',
    senderName: 'Elena Rostova',
    senderRole: 'Full-Stack',
    senderAvatarColor: '#6366F1',
    senderHandle: '@elena_dev',
    text: 'Locked in the WebSocket schema for telemetry streaming. Testing real-time canvas buffer now! 🚀',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    channel: 'general',
  },
  {
    id: 'msg-seed-2',
    senderId: 'm-2',
    senderName: 'Marcus Vance',
    senderRole: 'ML / AI',
    senderAvatarColor: '#10B981',
    senderHandle: '@mvance_ai',
    text: 'ONNX model export is complete. Latency is ~42ms on local CPU benchmarks with 98.4% detection precision.',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    channel: 'general',
  },
  {
    id: 'msg-seed-3',
    senderId: 'm-3',
    senderName: 'Sophia Lin',
    senderRole: 'UI / UX Designer',
    senderAvatarColor: '#EC4899',
    senderHandle: '@sophialin',
    text: 'Figma pitch deck template updated with high-contrast waveform mockups. Slide 4 has the architecture diagram ready for judges.',
    timestamp: new Date(Date.now() - 3600000 * 0.9).toISOString(),
    channel: 'pitch',
  },
  {
    id: 'msg-seed-4',
    senderId: 'm-5',
    senderName: 'Chloe Dupont',
    senderRole: 'PM / Pitch Lead',
    senderAvatarColor: '#8B5CF6',
    senderHandle: '@chloedupont',
    text: 'Awesome work team! Code freeze is in 4 hours. Let us do a full 3-minute pitch run-through in the Pitch Room at 2:00 PM.',
    timestamp: new Date(Date.now() - 3600000 * 0.4).toISOString(),
    channel: 'general',
  },
];

// Initialize WebSocket server attached to HTTP server
const wss = new WebSocketServer({ server: httpServer });

// Broadcast helper
const broadcast = (data: object, senderWs?: WebSocket) => {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

wss.on('connection', (ws: WebSocket) => {
  // Send initial authoritative state
  ws.send(
    JSON.stringify({
      type: 'init',
      messages: chatMessages,
      connectedClientsCount: wss.clients.size,
    })
  );

  // Notify all of updated client count
  broadcast({
    type: 'presence:update',
    connectedClientsCount: wss.clients.size,
  });

  ws.on('message', (rawData: string) => {
    try {
      const data = JSON.parse(rawData.toString());

      if (data.type === 'chat:send') {
        const { senderId, senderName, senderRole, senderAvatarColor, senderHandle, text, channel } = data;
        if (!text || typeof text !== 'string' || !text.trim()) return;

        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          senderId: senderId || 'm-1',
          senderName: senderName || 'Teammate',
          senderRole: senderRole || 'Full-Stack',
          senderAvatarColor: senderAvatarColor || '#6366F1',
          senderHandle: senderHandle || '@teammate',
          text: text.trim().slice(0, 1000),
          timestamp: new Date().toISOString(),
          channel: channel || 'general',
        };

        // Server authoritative store
        chatMessages.push(newMsg);
        // Keep last 250 messages
        if (chatMessages.length > 250) {
          chatMessages.shift();
        }

        // Broadcast to all clients immediately
        broadcast({
          type: 'chat:new_message',
          message: newMsg,
        });
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    broadcast({
      type: 'presence:update',
      connectedClientsCount: wss.clients.size,
    });
  });
});

// REST Endpoints for chat synchronization & health
app.get('/api/chat/messages', (_req: Request, res: Response) => {
  res.json({
    messages: chatMessages,
    connectedClientsCount: wss.clients.size,
  });
});

app.post('/api/chat/messages', (req: Request, res: Response) => {
  const { senderId, senderName, senderRole, senderAvatarColor, senderHandle, text, channel } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Message text is required' });
    return;
  }

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: senderId || 'm-1',
    senderName: senderName || 'Teammate',
    senderRole: senderRole || 'Full-Stack',
    senderAvatarColor: senderAvatarColor || '#6366F1',
    senderHandle: senderHandle || '@teammate',
    text: text.trim().slice(0, 1000),
    timestamp: new Date().toISOString(),
    channel: channel || 'general',
  };

  chatMessages.push(newMsg);
  if (chatMessages.length > 250) {
    chatMessages.shift();
  }

  broadcast({
    type: 'chat:new_message',
    message: newMsg,
  });

  res.status(201).json(newMsg);
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`HackHub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
