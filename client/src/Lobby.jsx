import { useState } from 'react';
import { emit } from './socket.js';
import { normalizeRoomCode } from './deck.js';

export default function Lobby({ onJoined, connected }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name.trim()) return setError('Enter your name first.');
    setError('');
    setBusy(true);
    const res = await emit('createRoom', { name: name.trim() });
    setBusy(false);
    if (res?.ok) onJoined({ code: res.code, playerId: res.playerId, name: name.trim() });
    else setError(res?.error || 'Could not create room');
  }

  async function join() {
    if (!name.trim()) return setError('Enter your name first.');
    const code = normalizeRoomCode(joinCode);
    if (code.length !== 4) return setError('Room code is 4 digits.');
    setError('');
    setBusy(true);
    const res = await emit('joinRoom', { code, name: name.trim() });
    setBusy(false);
    if (res?.ok) onJoined({ code: res.code, playerId: res.playerId, name: name.trim() });
    else setError(res?.error || 'Could not join room');
  }

  return (
    <div className="lobby">
      <div className="lobby-card">
        <label>
          Your name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dylan"
            maxLength={24}
          />
        </label>
        <button onClick={create} disabled={busy || !connected}>
          Create Game
        </button>
        <div className="divider">or join one</div>
        <label>
          Room code
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
            placeholder="1234"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            style={{ letterSpacing: 6, fontSize: 22, textAlign: 'center' }}
          />
        </label>
        <button onClick={join} disabled={busy || !connected} className="ghost">
          Join Game
        </button>
        {!connected && <div className="muted small">Connecting to server…</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
