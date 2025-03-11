// src/components/TrackLikeButton.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const TrackLikeButton = ({ track }) => {
  const [liked, setLiked] = useState(false);
  const [likedTrackId, setLikedTrackId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Déduire l'URL YouTube par défaut si non fournie
  const youtubeUrl = track.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(track.artist + " " + track.title)}`;

  // Vérifier si le morceau est déjà liké pour l'utilisateur connecté
  const checkIfLiked = async () => {
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/track/like');
      const found = data.likedTracks.find(item =>
        item.title.toLowerCase() === track.title.toLowerCase() &&
        item.artist.toLowerCase() === track.artist.toLowerCase()
      );
      if (found) {
        setLiked(true);
        setLikedTrackId(found.id);
      } else {
        setLiked(false);
        setLikedTrackId(null);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des likes :", err);
    }
  };

  useEffect(() => {
    if (track && track.title && track.artist) {
      checkIfLiked();
    }
  }, [track]);

  const handleLike = async () => {
    setLoading(true);
    try {
      const payload = {
        title: track.title,
        artist: track.artist,
        artwork: track.art || '', // On utilise la propriété "art" comme artwork
        youtubeUrl,
      };
      const data = await apiFetch('https://ourmusic-api.ovh/api/track/like', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.likedTrack) {
        setLiked(true);
        setLikedTrackId(data.likedTrack.id);
      }
    } catch (err) {
      console.error("Erreur lors du like :", err);
    }
    setLoading(false);
  };

  const handleUnlike = async () => {
    if (!likedTrackId) return;
    setLoading(true);
    try {
      // Appeler DELETE sur l'URL avec l'ID du morceau à retirer
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${likedTrackId}`, {
        method: 'DELETE',
      });
      setLiked(false);
      setLikedTrackId(null);
    } catch (err) {
      console.error("Erreur lors du unlike :", err);
    }
    setLoading(false);
  };


  return (
    <div className="mt-4">
      {liked ? (
        <button
          onClick={handleUnlike}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Traitement...' : 'Unlike'}
        </button>
      ) : (
        <button
          onClick={handleLike}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Traitement...' : 'Like'}
        </button>
      )}
    </div>
  );
};

export default TrackLikeButton;
