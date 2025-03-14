import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';

const LikedTracksList = ({ likedTracks = [], setLikedTracks }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous supprimer ce morceau ?")) return;
    setDeleting(true);
    try {
      console.log('Unliking track ID:', likedTrackId);
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${id}`, {
        method: 'DELETE',
      });

      if (typeof setLikedTracks === 'function') {
        setLikedTracks((prev) => prev.filter((t) => t.id !== id));
        toast.success('Morceau supprimé');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du morceau :', err);
      toast.error('Impossible de supprimer le morceau. Veuillez réessayer.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-8 max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Morceaux likés</h2>
      {likedTracks.length === 0 ? (
        <p className="text-gray-500">Aucun morceau liké pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {likedTracks.map((track) => (
            <li
              key={track.id}
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
                <p className="font-semibold break-words">{track.artist} - {track.title}</p>
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
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm self-start"
              >
                Supprimer
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LikedTracksList;
