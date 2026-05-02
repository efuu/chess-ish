import { useState } from 'react';
import { generateRoomCode, normalizeRoomCode } from './deck.js';

export default function Lobby({ onStart }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  function create() {
    if (!name.trim()) return setError('Enter your name first.');
    setError('');
    onStart({ code: generateRoomCode(), name: name.trim(), slot: 'creator' });
  }

  function join() {
    if (!name.trim()) return setError('Enter your name first.');
    const code = normalizeRoomCode(joinCode);
    if (code.length !== 4) return setError('Room code is 4 digits.');
    setError('');
    onStart({ code, name: name.trim(), slot: 'joiner' });
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
        <button onClick={create}>Create Game</button>
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
        <button onClick={join} className="ghost">
          Join Game
        </button>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
