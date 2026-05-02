// Two-client smoke: create, join, deal, play (both players see), undo, opponent-still-sees.
import { io } from '../client/node_modules/socket.io-client/build/esm/index.js';

const URL = 'http://localhost:3001';

function emit(s, ev, p) {
  return new Promise((res) => s.emit(ev, p, (r) => res(r)));
}
function makeClient() {
  const s = io(URL);
  const st = { pub: null, hand: null };
  s.on('publicGameUpdate', (d) => (st.pub = d));
  s.on('privateHandUpdate', (d) => (st.hand = d.hand));
  return { s, st };
}
function waitUntil(get, pred, label, ms = 3000) {
  return new Promise((res, rej) => {
    const t0 = Date.now();
    const tick = () => {
      const v = get();
      if (v && pred(v)) return res(v);
      if (Date.now() - t0 > ms) return rej(new Error(`timeout: ${label}`));
      setTimeout(tick, 30);
    };
    tick();
  });
}

async function main() {
  const A = makeClient();
  const B = makeClient();
  await Promise.all([
    new Promise((r) => A.s.once('connect', r)),
    new Promise((r) => B.s.once('connect', r)),
  ]);

  const created = await emit(A.s, 'createRoom', { name: 'Alice' });
  console.log('createRoom →', created);
  if (!created.ok) throw new Error('create failed');
  const aId = created.playerId;

  const joined = await emit(B.s, 'joinRoom', { code: created.code, name: 'Bob' });
  console.log('joinRoom →', joined);
  if (!joined.ok) throw new Error('join failed');
  const bId = joined.playerId;

  const start = await emit(A.s, 'startGame', { code: created.code });
  console.log('startGame →', start);
  await waitUntil(() => A.st.hand, (h) => h.length === 7, 'A hand 7');
  await waitUntil(() => B.st.hand, (h) => h.length === 7, 'B hand 7');
  await waitUntil(() => A.st.pub, (p) => p.status === 'playing', 'playing');

  // Alice plays a card.
  const cardA = A.st.hand[0];
  const playA = await emit(A.s, 'playCard', { code: created.code, playerId: aId, instanceId: cardA.instanceId });
  console.log('Alice playCard', cardA.name, '→', playA);
  await waitUntil(() => A.st.hand, (h) => h.length === 6, 'A hand 6');
  await waitUntil(() => A.st.pub, (p) => p.usedBank.length === 1 && p.usedBank[0].playedBy === aId, 'A sees bank w/ Alice play');
  await waitUntil(() => B.st.pub, (p) => p.usedBank.length === 1 && p.usedBank[0].card.name === cardA.name, 'B sees Alice play');
  console.log('  → both see bank:', B.st.pub.usedBank[0].card.name, 'by', B.st.pub.usedBank[0].playedByName);

  // Bob plays a card.
  const cardB = B.st.hand[0];
  await emit(B.s, 'playCard', { code: created.code, playerId: bId, instanceId: cardB.instanceId });
  await waitUntil(() => A.st.pub, (p) => p.usedBank.length === 2, 'A sees 2');
  await waitUntil(() => B.st.hand, (h) => h.length === 6, 'B hand 6');
  console.log('  → bank now:', A.st.pub.usedBank.map((e) => `${e.card.name}/${e.playedByName}`).join(', '));

  // Alice undoes — should pull back her play even though Bob played after.
  const undo = await emit(A.s, 'undoLastPlay', { code: created.code, playerId: aId });
  console.log('Alice undo →', undo);
  await waitUntil(() => A.st.hand, (h) => h.length === 7, 'A hand back to 7');
  await waitUntil(() => A.st.pub, (p) => p.usedBank.length === 1 && p.usedBank[0].playedBy === bId, 'bank only Bob');
  await waitUntil(() => B.st.pub, (p) => p.usedBank.length === 1, 'B sees undo');
  console.log('  → bank after undo:', A.st.pub.usedBank.map((e) => `${e.card.name}/${e.playedByName}`).join(', '));

  // Alice tries to undo again — should fail (nothing of hers).
  const noUndo = await emit(A.s, 'undoLastPlay', { code: created.code, playerId: aId });
  console.log('Alice undo (none) →', noUndo);
  if (noUndo.ok) throw new Error('undo with nothing should fail');

  // Bob undoes — bank should empty.
  const bUndo = await emit(B.s, 'undoLastPlay', { code: created.code, playerId: bId });
  console.log('Bob undo →', bUndo);
  await waitUntil(() => A.st.pub, (p) => p.usedBank.length === 0, 'bank empty');

  // Try playing a card not in hand.
  const bogus = await emit(A.s, 'playCard', { code: created.code, playerId: aId, instanceId: 'nope' });
  console.log('bogus play →', bogus);
  if (bogus.ok) throw new Error('bogus play should fail');

  console.log('\nSMOKE PASSED');
  A.s.close();
  B.s.close();
  process.exit(0);
}

main().catch((e) => {
  console.error('SMOKE FAILED:', e);
  process.exit(1);
});
