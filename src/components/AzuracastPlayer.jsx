// ✅ Refactored AzuracastPlayer.jsx — Fix undefined likedTracks + Clean & DRY principles
import { useState, useEffect, useRef } from 'react';
import TrackLikeButton from './TrackLikeButton';

const AzuracastPlayer = ({ onLikeChange, likedTracks = [], setLikedTracks }) => {
  const sseBaseUri = "https://ourmusic-azuracast.ovh/api/live/nowplaying/sse";
  const sseUriParams = new URLSearchParams({
    cf_connect: JSON.stringify({
      subs: { "station:ourmusic": { recover: true } },
    }),
  });
  const sseUri = `${sseBaseUri}?${sseUriParams.toString()}`;

  const [nowPlaying, setNowPlaying] = useState(null);
  const [error, setError] = useState('');
  const [trackElapsed, setTrackElapsed] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isConnected, setIsConnected] = useState(false);

  const audioRef = useRef(null);
  const sseRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const updateNowPlaying = (npData) => {
    setNowPlaying(npData);
    const np = npData?.now_playing;
    setTrackElapsed(np?.elapsed || 0);
    setTrackDuration(np?.duration || 0);
  };

  const handleSseData = (payload, useTime = true) => {
    const data = payload?.data;
    if (useTime && data?.current_time) setTrackElapsed(data.current_time);
    if (data?.np) updateNowPlaying(data.np);
  };

  const connectSSE = () => {
    if (sseRef.current) sseRef.current.close();
    const sse = new EventSource(sseUri);
    sseRef.current = sse;

    sse.onopen = () => {
      setIsConnected(true);
      setError('');
    };

    sse.onmessage = (e) => {
      if (e.data.trim() === '.') return;
      try {
        const jsonData = JSON.parse(e.data);
        if (jsonData.connect?.data) {
          jsonData.connect.data.forEach((row) => handleSseData(row));
        } else if (jsonData.connect?.subs) {
          Object.values(jsonData.connect.subs).forEach((sub) => {
            sub.publications?.forEach((row) => handleSseData(row, false));
          });
        } else if (jsonData.pub) {
          handleSseData(jsonData.pub);
        }
      } catch (err) {
        console.error("Erreur SSE:", err);
      }
    };

    sse.onerror = () => {
      setError("Erreur de connexion SSE. Reconnexion dans 5s...");
      setIsConnected(false);
      sse.close();
      reconnectTimeoutRef.current = setTimeout(() => {
        if (navigator.onLine) connectSSE();
      }, 5000);
    };
  };

  useEffect(() => {
    connectSSE();
    const handleOnline = () => !isConnected && connectSSE();
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      sseRef.current?.close();
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [sseUri, isConnected]);

  useEffect(() => {
    if (trackElapsed < trackDuration) {
      const intervalId = setInterval(() => {
        setTrackElapsed((prev) => (prev < trackDuration ? prev + 1 : prev));
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [trackElapsed, trackDuration]);

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
    <div className="mx-auto my-5 max-w-2xl text-center">
      <h2 className="text-2xl font-bold mb-4">{station.name}</h2>

      {currentSong && (
        <div className="mb-4">
          <p className="text-lg font-semibold">En cours : {currentSong.artist} - {currentSong.title}</p>
          {currentSong.art && (
            <img src={currentSong.art} alt={`${currentSong.artist} - ${currentSong.title}`} className="w-48 rounded-md mx-auto" />
          )}
          <TrackLikeButton track={currentSong} likedTracks={likedTracks} setLikedTracks={setLikedTracks} />
        </div>
      )}

      {station.listen_url && <audio ref={audioRef} preload="auto" />}

      <div className="mt-4">
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          disabled={!station.listen_url}
          className={`px-6 py-2 text-lg text-white rounded transition-colors disabled:opacity-50 ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
      </div>

      <div className="mt-3">
        <label className="text-lg font-medium">
          Volume: <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-48" />
        </label>
      </div>

      <div className="mt-4 text-sm">
        {Math.floor(trackElapsed / 60)}:{('0' + (trackElapsed % 60)).slice(-2)} / {Math.floor(trackDuration / 60)}:{('0' + (trackDuration % 60)).slice(-2)}
      </div>

      {nowPlaying?.song_history?.length > 0 && (
        <div className="mt-6 text-left">
          <h3 className="text-xl font-semibold mb-2">Historique des 5 derniers morceaux :</h3>
          <ul className="list-disc list-inside">
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
