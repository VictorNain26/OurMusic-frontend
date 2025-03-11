// src/components/LikedTracksList.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const LikedTracksList = () => {
  const [likedTracks, setLikedTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLikedTracks = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/track/like');
      setLikedTracks(data.likedTracks || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des morceaux likés :", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLikedTracks();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Morceaux likés</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : likedTracks.length === 0 ? (
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LikedTracksList;
