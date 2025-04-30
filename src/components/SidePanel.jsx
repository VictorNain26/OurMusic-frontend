import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikedTracks } from '../hooks/useLikedTracks';
import TrackLikeButton from './TrackLikeButton';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStore } from '../lib/playerService';

const SidePanel = ({ isOpen, onClose }) => {
  const { likedTracks, isLoading, isError, handleDelete } = useLikedTracks();
  const { user } = useAuth();
  const nowPlaying = usePlayerStore((s) => s.nowPlaying);
  const lastPlayed = nowPlaying?.song_history?.[0]?.song;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed top-[64px] right-0 w-full sm:w-[400px] h-[calc(100%-64px)] bg-white shadow-xl z-40 overflow-y-auto p-6"
          >
            <div className="flex justify-end mb-6">
              <Button variant="danger" size="sm" onClick={onClose}>
                Fermer
              </Button>
            </div>

            <h2 className="text-xl font-bold mb-4">Dernier morceau joué</h2>

            {lastPlayed && (
              <div className="mb-6">
                <p className="font-medium">{lastPlayed.artist} – {lastPlayed.title}</p>
                {lastPlayed.art && (
                  <img
                    src={lastPlayed.art}
                    alt={`${lastPlayed.artist} – ${lastPlayed.title}`}
                    className="w-full mt-3 rounded shadow"
                  />
                )}
                <TrackLikeButton track={lastPlayed} />
              </div>
            )}

            {user && (
              <>
                <hr className="my-6 border-t border-gray-300" />
                <h3 className="text-lg font-semibold mb-3">Morceaux aimés</h3>

                {isLoading ? (
                  <p className="text-gray-500">Chargement en cours...</p>
                ) : isError ? (
                  <p className="text-red-500">Erreur lors du chargement.</p>
                ) : likedTracks.length === 0 ? (
                  <p className="text-gray-500">Aucun morceau aimé pour le moment.</p>
                ) : (
                  <ul className="space-y-4">
                    {[...likedTracks].reverse().map((track) => (
                      <li key={track.id} className="flex items-start gap-3">
                        {track.artwork && (
                          <img
                            src={track.artwork}
                            alt={`${track.artist} – ${track.title}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{track.artist} – {track.title}</p>
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

          {/* Overlay semi-transparent cliquable */}
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
