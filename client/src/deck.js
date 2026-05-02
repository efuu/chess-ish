import { CARDS } from './cards.js';

const HAND_SIZE = 7;

function makeInstance(card, copyIndex) {
  return {
    instanceId: `${card.id}_${copyIndex}`,
    cardId: card.id,
    name: card.name,
    description: card.description,
  };
}

function buildDeck() {
  const deck = [];
  for (const card of CARDS) {
    for (let i = 0; i < card.count; i++) {
      deck.push(makeInstance(card, i));
    }
  }
  return deck;
}

// FNV-1a → 32-bit unsigned int.
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 PRNG: tiny, seedable, good enough for shuffling cards.
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Shuffles by seed and returns the hand for the given slot.
// Both players using the same code get the same shuffle; creator takes 0..6, joiner takes 7..13.
export function dealForSeed(code, slot) {
  const deck = buildDeck();
  const rand = mulberry32(hashSeed(code));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const offset = slot === 'joiner' ? HAND_SIZE : 0;
  return deck.slice(offset, offset + HAND_SIZE);
}

const ROOM_CODE_DIGITS = '0123456789';

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_DIGITS[Math.floor(Math.random() * ROOM_CODE_DIGITS.length)];
  }
  return code;
}

export function normalizeRoomCode(input) {
  return (input || '').replace(/\D/g, '').slice(0, 4);
}
