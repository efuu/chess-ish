import { useEffect, useState } from 'react';
import { socket, emit } from './socket.js';

export default function Room({ session, onLeave }) {
  const [pub, setPub] = useState(null);
  const [hand, setHand] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onPub(view) {
      setPub(view);
    }
    function onHand({ hand }) {
      setHand(hand);
    }
    socket.on('publicGameUpdate', onPub);
    socket.on('privateHandUpdate', onHand);
    return () => {
      socket.off('publicGameUpdate', onPub);
      socket.off('privateHandUpdate', onHand);
    };
  }, []);

  async function call(event, payload) {
    setError('');
    const res = await emit(event, { code: session.code, playerId: session.playerId, ...payload });
    if (!res?.ok && res?.error) setError(res.error);
    return res;
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }

  if (!pub) {
    return (
      <div className="room">
        <p className="muted">Joining room {session.code}…</p>
        <button onClick={onLeave} className="ghost">Leave</button>
      </div>
    );
  }

  const me = pub.players[session.playerId];
  const opponent = Object.values(pub.players).find((p) => p.id !== session.playerId);
  const waiting = pub.status === 'waiting';
  const canStart = !waiting ? false : Object.keys(pub.players).length === 2 && me?.slot === 'player1';

  // Find this player's most recent play in the bank — that's what undo targets.
  const myLastBankIdx = (() => {
    for (let i = pub.usedBank.length - 1; i >= 0; i--) {
      if (pub.usedBank[i].playedBy === session.playerId) return i;
    }
    return -1;
  })();

  return (
    <div className="room">
      <div className="room-bar">
        <div className="room-bar-item">{session.name}</div>
        <button onClick={copyCode} className="code-pill" title="Tap to copy">
          {session.code}
          <span className="code-hint">{copied ? 'copied!' : 'tap to copy'}</span>
        </button>
        <button onClick={onLeave} className="ghost small">
          Leave
        </button>
      </div>

      {waiting && (
        <div className="panel waiting">
          <h2>Waiting for opponent</h2>
          <p>
            Share the room code with your opponent.
          </p>
          <p className="muted">
            Players seated: <strong>{Object.keys(pub.players).length}/2</strong>
            {opponent && <span> — {opponent.name}{opponent.connected ? '' : ' (offline)'}</span>}
          </p>
          {canStart && <button onClick={() => call('startGame', {})}>Deal Cards</button>}
          {Object.keys(pub.players).length === 2 && !canStart && (
            <p className="muted">
              Waiting for {Object.values(pub.players).find((p) => p.slot === 'player1')?.name} to deal…
            </p>
          )}
        </div>
      )}

      {!waiting && (
        <>
          <div className="opponent-strip">
            <span>
              <strong>{opponent?.name || 'Opponent'}</strong>
              {' '}holds {opponent?.handCount ?? 0} cards
            </span>
            <span className={opponent?.connected ? 'pill ok' : 'pill bad'}>
              {opponent?.connected ? 'online' : 'offline'}
            </span>
          </div>

          <section className="bank">
            <div className="section-title">Used cards · {pub.usedBank.length}</div>
            {pub.usedBank.length === 0 && (
              <div className="muted small">No cards played yet.</div>
            )}
            <div className="bank-list">
              {pub.usedBank.slice().reverse().map((entry, revIdx) => {
                const idx = pub.usedBank.length - 1 - revIdx;
                const isMyMostRecent = idx === myLastBankIdx;
                const mine = entry.playedBy === session.playerId;
                return (
                  <div key={idx} className={`bank-card ${mine ? 'mine' : 'theirs'}`}>
                    <div className="bank-card-head">
                      <strong>{entry.card.name}</strong>
                      <span className="muted small">by {entry.playedByName}</span>
                    </div>
                    <div className="bank-card-rule">{entry.card.description}</div>
                    {isMyMostRecent && (
                      <button
                        className="small ghost undo-btn"
                        onClick={() => call('undoLastPlay', {})}
                      >
                        Undo
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="hand-meta">
            <span>Your hand · {hand.length} cards</span>
          </div>
          <div className="hand">
            {hand.length === 0 && <div className="muted">No cards in hand.</div>}
            {hand.map((card) => (
              <CardView
                key={card.instanceId}
                card={card}
                onUse={() => call('playCard', { instanceId: card.instanceId })}
              />
            ))}
          </div>
        </>
      )}

      {error && <div className="error toast">{error}</div>}
    </div>
  );
}

function CardView({ card, onUse }) {
  return (
    <div className="card">
      <div className="card-name">{card.name}</div>
      <div className="card-rule">{card.description}</div>
      <button className="card-use" onClick={onUse}>Use Card</button>
    </div>
  );
}
