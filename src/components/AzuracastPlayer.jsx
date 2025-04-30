import React, { useEffect, useRef, useState } from 'react';
import TrackLikeButton from './TrackLikeButton';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerService, usePlayerStore } from '../lib/playerService';
import { AZURACAST_URL } from '../utils/config';
import { toast } from 'react-hot-toast';
import VolumeSlider from './ui/VolumeSlider';

const AzuracastPlayer = () => {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolume, setShowVolume] = useState(false);
  const volumeTimer = useRef(null);

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
    usePlayerStore.getState().setNowPlaying(data);
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
      toast.error("Perte de connexion à la radio. Nouvelle tentative...");
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

  const handleVolumeHover = () => {
    clearTimeout(volumeTimer.current);
    setShowVolume(true);
  };

  const handleVolumeLeave = () => {
    volumeTimer.current = setTimeout(() => {
      setShowVolume(false);
    }, 500); // ⏱️ délai plus court
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
      className="w-full max-w-md mx-auto text-center px-4"
    >
      {currentSong && (
        <div className="flex flex-col items-center gap-5">
          {/* Image */}
          {currentSong.art && (
            <img
              src={currentSong.art}
              alt={`${currentSong.artist} - ${currentSong.title}`}
              className="w-60 h-60 object-cover rounded-xl shadow-lg"
            />
          )}

          {/* Infos */}
          <div>
            <p className="text-xl font-semibold">{currentSong.artist} – {currentSong.title}</p>
            <p className="text-sm text-gray-500 mt-1">
              {Math.floor(elapsed / 60)}:{('0' + (elapsed % 60)).slice(-2)} /{' '}
              {Math.floor(duration / 60)}:{('0' + (duration % 60)).slice(-2)}
            </p>
          </div>

          {/* Boutons & volume */}
          <div className="flex gap-6 justify-center items-center">
            <button
              onClick={isPlaying ? handleStop : handlePlay}
              disabled={!station.listen_url}
              className={`px-6 py-2 text-white rounded transition ${
                isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isPlaying ? '⏹️ Arrêter' : '▶️ Écouter'}
            </button>

            <div
              className="relative flex flex-col items-center"
              onMouseEnter={handleVolumeHover}
              onMouseLeave={handleVolumeLeave}
            >
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
                🔊 Volume
              </button>

              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-3 p-2 bg-white rounded shadow z-10 flex justify-center"
                  >
                    <VolumeSlider volume={volume} onChange={PlayerService.setVolume} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <TrackLikeButton track={currentSong} />
        </div>
      )}
    </motion.div>
  );
};

export default AzuracastPlayer;
