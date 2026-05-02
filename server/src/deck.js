import { CARDS } from './cards.js';

let nextInstanceId = 1;

function makeInstance(card) {
  return {
    instanceId: `c${nextInstanceId++}`,
    cardId: card.id,
    name: card.name,
    description: card.description,
  };
}

export function buildDeck() {
  const deck = [];
  for (const card of CARDS) {
    for (let i = 0; i < card.count; i++) {
      deck.push(makeInstance(card));
    }
  }
  return shuffle(deck);
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function dealHand(deck, count) {
  return deck.splice(0, count);
}
