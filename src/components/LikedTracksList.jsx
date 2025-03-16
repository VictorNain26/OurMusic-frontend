import React from 'react';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikedTracks } from '../hooks/useLikedTracks';

const LikedTracksList = () => {
  const { likedTracks, isLoading, isError, handleDelete } = useLikedTracks();

  const handleDeleteClick = async (id) => {
    if (!id || isNaN(id)) return;
    await handleDelete(id);
  };

  const renderHeader = () => (
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      💖 Morceaux likés
      <AnimatePresence mode="wait">
        <motion.span
          key={likedTracks.length}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-blue-100 text-blue-700 text-sm font-semibold px-2 py-0.5 rounded-full"
        >
          {likedTracks.length}
        </motion.span>
      </AnimatePresence>
    </h2>
  );

  const renderContent = () => {
    if (isLoading) return <p className="text-gray-500">Chargement des morceaux...</p>;
    if (isError) return <p className="text-red-500">Erreur lors du chargement des morceaux.</p>;
    if (likedTracks.length === 0) return <p className="text-gray-500">Aucun morceau liké pour le moment.</p>;

    return (
      <ul className="space-y-4">
        <AnimatePresence>
          {likedTracks.map((track) => (
            <motion.li
              key={track.id}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
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
              <div className="flex-1 w-full min-w-0">
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
                onClick={() => handleDeleteClick(track.id)}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm self-start"
              >
                Supprimer
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mt-8 max-w-3xl mx-auto px-4"
    >
      {renderHeader()}
      {renderContent()}
    </motion.div>
  );
};

export default LikedTracksList;
