// src/components/SidePanel.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikedTracks } from '../hooks/useLikedTracks';
import TrackLikeButton from './TrackLikeButton';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStore } from '../lib/playerService';
import { toast } from 'react-hot-toast';
import { apiFetch } from '../utils/api';
import { authClient } from '../lib/authClient.jsx';

const SidePanel = ({ isOpen, onClose }) => {
  /* ─── stores & états ─────────────────────── */
  const { likedTracks, isLoading, isError, handleDelete } = useLikedTracks();
  const { user } = useAuth();
  const nowPlaying = usePlayerStore((s) => s.nowPlaying);
  const lastPlayed = nowPlaying?.song_history?.[0]?.song;

  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const isSpotifyLinked = linkedAccounts.some((a) => a.provider === 'spotify');

  /* ─── charger les comptes liés à l’ouverture ─────────────────────── */
  useEffect(() => {
    if (!isOpen || !user) return;

    (async () => {
      try {
        const { data, error } = await authClient.listAccounts();
        if (error) throw new Error(error.message);
        setLinkedAccounts(data || []);
      } catch (err) {
        console.error('[SidePanel] listAccounts', err);
      }
    })();
  }, [isOpen, user]);

  /* ─── actions Spotify ─────────────────────── */
  const handleLinkSpotify = async () => {
    try {
      await authClient.linkSocial({
        provider: 'spotify',
        scopes: [
          'user-read-email',
          'playlist-modify-private',
          'playlist-modify-public',
        ],
        callbackURL: `${window.location.origin}?spotify_linked=success`,
      });
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la liaison Spotify.');
    }
  };

  const handleUnlinkSpotify = async () => {
    try {
      await authClient.unlinkAccount({ providerId: 'spotify' });
      toast.success('Compte Spotify délié.');
      setLinkedAccounts((prev) => prev.filter((a) => a.provider !== 'spotify'));
    } catch (err) {
      toast.error(err.message || 'Erreur lors du unlink Spotify');
    }
  };

  const handleSyncSpotify = async () => {
    try {
      const res = await apiFetch('/api/spotify/sync-liked', { method: 'POST' });
      toast.success(res.message || 'Morceaux synchronisés sur Spotify 🎵');
    } catch (err) {
      toast.error(err.message || 'Erreur de synchronisation');
    }
  };

  /* ─── rendu ─────────────────────── */
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* panneau latéral */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed top-[64px] right-0 w-full sm:w-[400px] h-[calc(100%-64px)] bg-white shadow-xl z-40 overflow-y-auto p-6"
          >
            {/* bouton fermer */}
            <div className="flex justify-end mb-6">
              <Button variant="danger" size="sm" onClick={onClose}>
                Fermer
              </Button>
            </div>

            {/* dernier morceau joué */}
            <h2 className="text-xl font-bold mb-4">Dernier morceau joué</h2>
            {lastPlayed && (
              <div className="mb-6">
                <p className="font-medium">
                  {lastPlayed.artist} – {lastPlayed.title}
                </p>
                {lastPlayed.art && (
                  <img
                    src={lastPlayed.art}
                    alt=""
                    className="w-full mt-3 rounded shadow"
                  />
                )}
                <TrackLikeButton track={lastPlayed} />
              </div>
            )}

            {/* section morceaux aimés */}
            {user && (
              <>
                <hr className="my-6 border-t border-gray-300" />
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Morceaux aimés</h3>

                  {isSpotifyLinked ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={handleSyncSpotify}>
                        🔄 Sync
                      </Button>
                      <Button size="sm" variant="danger" onClick={handleUnlinkSpotify}>
                        ✖️
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="primary" onClick={handleLinkSpotify}>
                      🔗 Lier
                    </Button>
                  )}
                </div>

                {/* liste des tracks */}
                {isLoading ? (
                  <p className="text-gray-500">Chargement…</p>
                ) : isError ? (
                  <p className="text-red-500">Erreur de chargement.</p>
                ) : likedTracks.length === 0 ? (
                  <p className="text-gray-500">Aucun morceau aimé.</p>
                ) : (
                  <ul className="space-y-4">
                    {[...likedTracks].reverse().map((track) => (
                      <li key={track.id} className="flex items-start gap-3">
                        {track.artwork && (
                          <img
                            src={track.artwork}
                            alt=""
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {track.artist} – {track.title}
                          </p>
                          {track.youtubeUrl && (
                            <a
                              href={track.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm"
                            >
                              Voir sur YouTube
                            </a>
                          )}
                          <Button
                            onClick={() => handleDelete(track.id)}
                            variant="danger"
                            size="sm"
                            className="mt-2"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </motion.div>

          {/* overlay sombre */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed top-[64px] left-0 right-0 bottom-0 bg-black z-30"
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default SidePanel;
