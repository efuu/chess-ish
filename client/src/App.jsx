import { useState } from 'react';
import Lobby from './Lobby.jsx';
import Room from './Room.jsx';
import { dealForSeed } from './deck.js';

const SESSION_KEY = 'chessish_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.code || !s.slot) return null;
    return { ...s, hand: dealForSeed(s.code, s.slot) };
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    const { code, name, slot } = session;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ code, name, slot }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export default function App() {
  const [session, setSession] = useState(loadSession());

  function handleStart({ code, name, slot }) {
    const next = { code, name, slot, hand: dealForSeed(code, slot) };
    saveSession(next);
    setSession(next);
  }

  function handleLeave() {
    saveSession(null);
    setSession(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chess-ish</h1>
      </header>
      {session ? (
        <Room session={session} onLeave={handleLeave} />
      ) : (
        <Lobby onStart={handleStart} />
      )}
    </div>
  );
}
