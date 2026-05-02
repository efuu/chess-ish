import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  playCard,
  undoLastPlay,
  attachSocket,
  detachSocket,
  publicView,
  privateHand,
} from './rooms.js';

const PORT = process.env.PORT || 3001;
// Comma-separated list of allowed origins; defaults cover local dev + Pages.
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,https://efuu.github.io')
  .split(',')
  .map((s) => s.trim());

const app = express();
app.use(cors({ origin: CLIENT_ORIGINS }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.send('chess-ish server'));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGINS },
});

function broadcastRoom(room) {
  const view = publicView(room);
  for (const player of Object.values(room.players)) {
    if (!player.socketId) continue;
    const socket = io.sockets.sockets.get(player.socketId);
    if (!socket) continue;
    socket.emit('publicGameUpdate', view);
    socket.emit('privateHandUpdate', { hand: privateHand(room, player.id) });
  }
}

io.on('connection', (socket) => {
  socket.on('createRoom', ({ name }, cb) => {
    const { room, playerId } = createRoom(name);
    attachSocket(room.code, playerId, socket.id);
    socket.join(room.code);
    cb?.({ ok: true, code: room.code, playerId });
    broadcastRoom(room);
  });

  socket.on('joinRoom', ({ code, name }, cb) => {
    const trimmed = (code || '').trim();
    const result = joinRoom(trimmed, name);
    if (result.error) return cb?.({ ok: false, error: result.error });
    attachSocket(trimmed, result.playerId, socket.id);
    socket.join(trimmed);
    cb?.({ ok: true, code: trimmed, playerId: result.playerId });
    broadcastRoom(result.room);
  });

  socket.on('reconnectRoom', ({ code, playerId }, cb) => {
    const trimmed = (code || '').trim();
    const room = getRoom(trimmed);
    if (!room || !room.players[playerId]) {
      return cb?.({ ok: false, error: 'Room or player not found' });
    }
    attachSocket(trimmed, playerId, socket.id);
    socket.join(trimmed);
    cb?.({ ok: true, code: trimmed, playerId });
    broadcastRoom(room);
  });

  socket.on('startGame', ({ code }, cb) => {
    const result = startGame((code || '').trim());
    if (result.error) return cb?.({ ok: false, error: result.error });
    cb?.({ ok: true });
    broadcastRoom(result.room);
  });

  socket.on('playCard', ({ code, playerId, instanceId }, cb) => {
    const result = playCard((code || '').trim(), playerId, instanceId);
    if (result.error) return cb?.({ ok: false, error: result.error });
    cb?.({ ok: true });
    broadcastRoom(result.room);
  });

  socket.on('undoLastPlay', ({ code, playerId }, cb) => {
    const result = undoLastPlay((code || '').trim(), playerId);
    if (result.error) return cb?.({ ok: false, error: result.error });
    cb?.({ ok: true });
    broadcastRoom(result.room);
  });

  socket.on('disconnect', () => {
    detachSocket(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`chess-ish server listening on :${PORT}`);
  console.log(`Allowed origins: ${CLIENT_ORIGINS.join(', ')}`);
});
