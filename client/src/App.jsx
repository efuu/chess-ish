import { useEffect, useState } from 'react';
import { socket, emit } from './socket.js';
import Lobby from './Lobby.jsx';
import Room from './Room.jsx';

const SESSION_KEY = 'chessish_session';

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [session, setSession] = useState(loadSession());
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Auto-reconnect to a saved room when the socket connects.
  useEffect(() => {
    if (!connected || !session) return;
    let cancelled = false;
    (async () => {
      const res = await emit('reconnectRoom', { code: session.code, playerId: session.playerId });
      if (cancelled) return;
      if (!res?.ok) {
        saveSession(null);
        setSession(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connected, session]);

  function handleJoined({ code, playerId, name }) {
    const next = { code, playerId, name };
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
        <Lobby onJoined={handleJoined} connected={connected} />
      )}
    </div>
  );
}
