import React, { useEffect, useRef, useState } from 'react';
import TrackLikeButton from './TrackLikeButton';
import { motion } from 'framer-motion';
import { PlayerService, usePlayerStore } from '../lib/playerService';
import { AZURACAST_URL } from '../utils/config';

const AzuracastPlayer = () => {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);

  const sseRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const isConnecting = useRef(false);

  const station = nowPlaying?.station || { name: 'OurMusic', listen_url: null };
  const currentSong = nowPlaying?.now_playing?.song || null;

  const sseUri = `${AZURACAST_URL}/api/live/nowplaying/sse?${new URLSearchParams({
    cf_connect: JSON.stringify({ subs: { 'station:ourmusic': { recover: true } } }),
  })}`;

  const updateNowPlaying = (data) => {
    setNowPlaying(data);
    const np = data?.now_playing;
    setElapsed(np?.elapsed || 0);
    setDuration(np?.duration || 0);
  };

  const handleSSEPayload = (payload, useTime = true) => {
    const data = payload?.data;
    if (useTime && data?.current_time) setElapsed(data.current_time);
    if (data?.np) updateNowPlaying(data.np);
  };

  const connectSSE = () => {
    if (isConnecting.current || sseRef.current) return;
    isConnecting.current = true;

    const sse = new EventSource(sseUri, { withCredentials: true });
    sseRef.current = sse;

    sse.onopen = () => {
      setConnected(true);
      setError('');
      isConnecting.current = false;
    };

    sse.onmessage = (e) => {
      if (!e.data || e.data.trim() === '.') return;

      try {
        const json = JSON.parse(e.data);
        if (json.connect?.data) {
          json.connect.data.forEach((item) => handleSSEPayload(item));
        } else if (json.connect?.subs) {
          Object.values(json.connect.subs).forEach((sub) =>
            sub.publications?.forEach((item) => handleSSEPayload(item, false))
          );
        } else if (json.pub) {
          handleSSEPayload(json.pub);
        }
      } catch (err) {
        console.error('[AzuracastPlayer] Erreur parsing SSE :', err);
      }
    };

    sse.onerror = () => {
      setError('Erreur de connexion SSE. Reconnexion dans 5s...');
      setConnected(false);
      isConnecting.current = false;
      sse.close();
      sseRef.current = null;

      if (!reconnectTimeout.current) {
        reconnectTimeout.current = setTimeout(() => {
          reconnectTimeout.current = null;
          if (navigator.onLine) connectSSE();
        }, 5000);
      }
    };
  };

  useEffect(() => {
    connectSSE();
    window.addEventListener('online', connectSSE);

    return () => {
      window.removeEventListener('online', connectSSE);
      sseRef.current?.close();
      sseRef.current = null;
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    };
  }, []);

  useEffect(() => {
    if (elapsed < duration) {
      const interval = setInterval(() => setElapsed((t) => (t < duration ? t + 1 : t)), 1000);
      return () => clearInterval(interval);
    }
  }, [elapsed, duration]);

  useEffect(() => {
    PlayerService.setVolume(volume);
  }, [volume]);

  const handlePlay = () => {
    if (!station.listen_url) return;
    PlayerService.setSource(station.listen_url);
    PlayerService.play();
  };

  const handleStop = () => {
    PlayerService.stop();
  };

  if (!nowPlaying) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="w-12 h-12 border-8 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mx-auto my-6 max-w-3xl px-4 text-center"
    >
      <h2 className="text-2xl font-bold mb-4">{station.name}</h2>

      {currentSong && (
        <div className="mb-4">
          <p className="text-lg font-semibold break-words">
            🎵 {currentSong.artist} - {currentSong.title}
          </p>
          {currentSong.art && (
            <img
              src={currentSong.art}
              alt={`${currentSong.artist} - ${currentSong.title}`}
              className="w-48 mx-auto rounded shadow my-3"
            />
          )}
          <TrackLikeButton track={currentSong} />
        </div>
      )}

      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          disabled={!station.listen_url}
          className={`px-6 py-2 text-white rounded transition-colors ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>

        <label className="text-lg font-medium">
          Volume:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => PlayerService.setVolume(Number(e.target.value))}
            className="ml-2 align-middle"
          />
        </label>
      </div>

      <div className="mt-4 text-sm">
        {Math.floor(elapsed / 60)}:{('0' + (elapsed % 60)).slice(-2)} /{' '}
        {Math.floor(duration / 60)}:{('0' + (duration % 60)).slice(-2)}
      </div>

      {nowPlaying?.song_history?.length > 0 && (
        <div className="mt-6 text-left">
          <h3 className="text-xl font-semibold mb-2">Historique des 5 derniers morceaux :</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {nowPlaying.song_history.slice(0, 5).map((item) => (
              <li key={item.sh_id}>
                {item.song.artist} - {item.song.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </motion.div>
  );
};

export default AzuracastPlayer;
