import { buildDeck, dealHand } from './deck.js';

const STARTING_HAND_SIZE = 7;
const ROOM_CODE_DIGITS = '0123456789';
const ROOM_TTL_MS = 1000 * 60 * 60 * 6; // 6h
const rooms = new Map();

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_DIGITS[Math.floor(Math.random() * ROOM_CODE_DIGITS.length)];
  }
  return code;
}

function uniqueRoomCode() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const code = generateRoomCode();
    if (!rooms.has(code)) return code;
  }
  // Fallback: 5 digits if all 4-digit codes happen to be in use.
  return generateRoomCode() + Math.floor(Math.random() * 10);
}

function makePlayerId() {
  return 'p_' + Math.random().toString(36).slice(2, 10);
}

// Periodically clean up stale rooms.
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.lastActivityAt > ROOM_TTL_MS) {
      rooms.delete(code);
    }
  }
}, 1000 * 60 * 30).unref();

function touch(room) {
  room.lastActivityAt = Date.now();
}

export function createRoom(playerName) {
  const code = uniqueRoomCode();
  const playerId = makePlayerId();
  const room = {
    code,
    status: 'waiting',
    players: {
      [playerId]: {
        id: playerId,
        slot: 'player1',
        name: playerName || 'Player 1',
        hand: [],
        socketId: null,
      },
    },
    deck: [],
    usedBank: [], // [{ card, playedBy, playedByName, ts }]
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  };
  rooms.set(code, room);
  return { room, playerId };
}

export function joinRoom(code, playerName) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  const playerCount = Object.keys(room.players).length;
  if (playerCount >= 2) return { error: 'Room is full' };

  const playerId = makePlayerId();
  room.players[playerId] = {
    id: playerId,
    slot: 'player2',
    name: playerName || 'Player 2',
    hand: [],
    socketId: null,
  };
  touch(room);
  return { room, playerId };
}

export function getRoom(code) {
  return rooms.get(code);
}

export function startGame(code) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (Object.keys(room.players).length !== 2) return { error: 'Need 2 players to start' };

  room.deck = buildDeck();
  room.usedBank = [];
  for (const player of Object.values(room.players)) {
    player.hand = dealHand(room.deck, STARTING_HAND_SIZE);
  }
  room.status = 'playing';
  touch(room);
  return { room };
}

export function playCard(code, playerId, instanceId) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.status !== 'playing') return { error: 'Game is not in progress' };

  const player = room.players[playerId];
  if (!player) return { error: 'Unknown player' };
  const idx = player.hand.findIndex((c) => c.instanceId === instanceId);
  if (idx === -1) return { error: 'Card not in your hand' };

  const card = player.hand.splice(idx, 1)[0];
  room.usedBank.push({
    card,
    playedBy: playerId,
    playedByName: player.name,
    ts: Date.now(),
  });
  touch(room);
  return { room, card };
}

// Undo this player's most recent play (regardless of opponent's plays after).
export function undoLastPlay(code, playerId) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };

  let lastIdx = -1;
  for (let i = room.usedBank.length - 1; i >= 0; i--) {
    if (room.usedBank[i].playedBy === playerId) {
      lastIdx = i;
      break;
    }
  }
  if (lastIdx === -1) return { error: 'You have nothing to undo' };

  const entry = room.usedBank.splice(lastIdx, 1)[0];
  const player = room.players[playerId];
  player.hand.push(entry.card);
  touch(room);
  return { room, card: entry.card };
}

export function attachSocket(code, playerId, socketId) {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players[playerId];
  if (!player) return null;
  player.socketId = socketId;
  touch(room);
  return room;
}

export function detachSocket(socketId) {
  for (const room of rooms.values()) {
    for (const player of Object.values(room.players)) {
      if (player.socketId === socketId) {
        player.socketId = null;
      }
    }
  }
}

export function publicView(room) {
  const players = {};
  for (const [id, p] of Object.entries(room.players)) {
    players[id] = {
      id: p.id,
      slot: p.slot,
      name: p.name,
      handCount: p.hand.length,
      connected: !!p.socketId,
    };
  }
  return {
    code: room.code,
    status: room.status,
    players,
    deckCount: room.deck.length,
    usedBank: room.usedBank,
  };
}

export function privateHand(room, playerId) {
  const player = room.players[playerId];
  return player ? player.hand : [];
}
