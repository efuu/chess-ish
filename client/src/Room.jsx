import { useState } from 'react';

export default function Room({ session, onLeave }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  }

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

      <p className="share-hint">
        {session.slot === 'creator'
          ? 'Share this code with your opponent. They’ll get the other half of the deck.'
          : 'You joined with this code. You and your opponent each got half the same deck.'}
      </p>

      <div className="hand-meta">
        <span>Your hand · {session.hand.length} cards</span>
      </div>
      <div className="hand">
        {session.hand.map((card) => (
          <CardView key={card.instanceId} card={card} />
        ))}
      </div>
    </div>
  );
}

function CardView({ card }) {
  return (
    <div className="card">
      <div className="card-name">{card.name}</div>
      <div className="card-rule">{card.description}</div>
    </div>
  );
}
