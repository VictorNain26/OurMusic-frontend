import React from 'react';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikedTracks } from '../hooks/useLikedTracks';

const LikedTracksList = () => {
  const { likedTracks, isLoading, deleteTrack } = useLikedTracks();
  const { confirmAndDelete } = useLikedTracks();


  const handleDelete = async (id) => {
    await confirmAndDelete(id);
  };

  return (
    <div className="mt-8 max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Morceaux likés</h2>

      {isLoading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : likedTracks.length === 0 ? (
        <p className="text-gray-500">Aucun morceau liké pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {likedTracks.map((track) => (
              <motion.li
                key={track.id}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
                layout
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gray-100 rounded shadow"
              >
                {track.artwork && (
                  <img
                    src={track.artwork}
                    alt={`${track.artist} - ${track.title}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1 w-full">
                  <p className="font-semibold break-words">
                    {track.artist} - {track.title}
                  </p>
                  <a
                    href={track.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline text-sm"
                  >
                    Voir sur YouTube
                  </a>
                </div>
                <Button
                  onClick={() => handleDelete(track.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm self-start"
                >
                  Supprimer
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default LikedTracksList;
