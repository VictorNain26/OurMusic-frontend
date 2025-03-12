import React, { useEffect, useRef, useState } from 'react';
import TrackLikeButton from './TrackLikeButton';

const AzuracastPlayer = ({ onLikeChange, likedTracks = [], setLikedTracks }) => {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [connected, setConnected] = useState(false);

  const audioRef = useRef(null);
  const sseRef = useRef(null);
  const reconnectRef = useRef(null);

  const sseUri = `https://ourmusic-azuracast.ovh/api/live/nowplaying/sse?${new URLSearchParams({
    cf_connect: JSON.stringify({ subs: { "station:ourmusic": { recover: true } } })
  })}`;

  const updateNowPlaying = (data) => {
    setNowPlaying(data);
    const np = data?.now_playing;
    setElapsed(np?.elapsed || 0);
    setDuration(np?.duration || 0);
  };

  const handleSseData = (payload, useTime = true) => {
    const data = payload?.data;
    if (useTime && data?.current_time) setElapsed(data.current_time);
    if (data?.np) updateNowPlaying(data.np);
  };

  const connectSSE = () => {
    sseRef.current?.close();
    const sse = new EventSource(sseUri);
    sseRef.current = sse;

    sse.onopen = () => {
      setConnected(true);
      setError('');
    };

    sse.onmessage = (e) => {
      if (e.data.trim() === '.') return;
      try {
        const json = JSON.parse(e.data);
        if (json.connect?.data) json.connect.data.forEach((row) => handleSseData(row));
        else if (json.connect?.subs) Object.values(json.connect.subs).forEach((sub) => sub.publications?.forEach((row) => handleSseData(row, false)));
        else if (json.pub) handleSseData(json.pub);
      } catch (err) {
        console.error("Erreur SSE:", err);
      }
    };

    sse.onerror = () => {
      setError("Erreur de connexion SSE. Reconnexion dans 5s...");
      setConnected(false);
      sse.close();
      reconnectRef.current = setTimeout(() => navigator.onLine && connectSSE(), 5000);
    };
  };

  useEffect(() => {
    connectSSE();
    window.addEventListener('online', () => !connected && connectSSE());
    return () => {
      window.removeEventListener('online', () => {});
      sseRef.current?.close();
      clearTimeout(reconnectRef.current);
    };
  }, []);

  useEffect(() => {
    if (elapsed < duration) {
      const interval = setInterval(() => setElapsed((prev) => (prev < duration ? prev + 1 : prev)), 1000);
      return () => clearInterval(interval);
    }
  }, [elapsed, duration]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const station = nowPlaying?.station || { name: "Radio", listen_url: null };
  const currentSong = nowPlaying?.now_playing?.song || null;

  const handlePlay = () => {
    if (!audioRef.current || !station.listen_url) return;
    if (!audioRef.current.src) audioRef.current.src = station.listen_url;
    audioRef.current.load();
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      setIsPlaying(false);
    }
  };

  if (!nowPlaying) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="w-12 h-12 border-8 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto my-6 max-w-3xl px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">{station.name}</h2>

      {currentSong && (
        <div className="mb-4">
          <p className="text-lg font-semibold break-words">🎵 {currentSong.artist} - {currentSong.title}</p>
          {currentSong.art && (
            <img src={currentSong.art} alt={`${currentSong.artist} - ${currentSong.title}`} className="w-48 mx-auto rounded shadow my-3" />
          )}
          <TrackLikeButton track={currentSong} likedTracks={likedTracks} setLikedTracks={setLikedTracks} />
        </div>
      )}

      {station.listen_url && <audio ref={audioRef} preload="auto" />}

      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          disabled={!station.listen_url}
          className={`px-6 py-2 text-white rounded transition-colors ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
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
            onChange={(e) => setVolume(Number(e.target.value))}
            className="ml-2 align-middle"
          />
        </label>
      </div>

      <div className="mt-4 text-sm">
        {Math.floor(elapsed / 60)}:{('0' + (elapsed % 60)).slice(-2)} / {Math.floor(duration / 60)}:{('0' + (duration % 60)).slice(-2)}
      </div>

      {nowPlaying?.song_history?.length > 0 && (
        <div className="mt-6 text-left">
          <h3 className="text-xl font-semibold mb-2">Historique des 5 derniers morceaux :</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {nowPlaying.song_history.slice(0, 5).map((item) => (
              <li key={item.sh_id}>{item.song.artist} - {item.song.title}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default AzuracastPlayer;