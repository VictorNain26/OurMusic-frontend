// src/components/LikedTracksList.jsx
import React from 'react';
import { apiFetch } from '../utils/api';

const LikedTracksList = ({ likedTracks, refreshLikedTracks }) => {
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous supprimer ce morceau ?")) return;
    setDeleting(true);
    try {
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${id}`, {
        method: 'DELETE',
      });
      if (refreshLikedTracks) {
        refreshLikedTracks();
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
    setDeleting(false);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Morceaux likés</h2>
      {likedTracks.length === 0 ? (
        <p>Aucun morceau liké pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {likedTracks.map(track => (
            <li key={track.id} className="flex items-center gap-4">
              {track.artwork && (
                <img
                  src={track.artwork}
                  alt={`${track.artist} - ${track.title}`}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <p className="font-semibold">{track.artist} - {track.title}</p>
                <a
                  href={track.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Voir sur YouTube
                </a>
              </div>
              <button
                onClick={() => handleDelete(track.id)}
                disabled={deleting}
                className="ml-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LikedTracksList;
