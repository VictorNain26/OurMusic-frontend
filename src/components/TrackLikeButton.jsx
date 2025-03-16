import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';
import { useLikedTracks } from '../hooks/useLikedTracks';

const TrackLikeButton = ({ track }) => {
  const { likedTracks, likeTrack, deleteImmediately } = useLikedTracks();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Génère l’URL YouTube si absente
  const youtubeUrl =
    track?.youtubeUrl ||
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      track?.artist + ' ' + track?.title
    )}`;

  useEffect(() => {
    setIsLoggedIn(Boolean(getAccessToken()));
  }, []);

  // Vérifie si le morceau est déjà liké
  const match = likedTracks.find(
    (item) =>
      item.title?.toLowerCase() === track.title?.toLowerCase() &&
      item.artist?.toLowerCase() === track.artist?.toLowerCase()
  );

  const isLiked = Boolean(match);
  const likedTrackId = match?.id;

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Veuillez vous connecter pour liker.");
      const loginBtn = document.querySelector('[data-login-button]');
      if (loginBtn) loginBtn.click();
      return;
    }

    try {
      await likeTrack.mutateAsync({
        title: track.title,
        artist: track.artist,
        artwork: track.art || '',
        youtubeUrl,
      });
    } catch (err) {
      console.error('[TrackLikeButton → Like Error]', err);
      toast.error(err.message || 'Erreur lors du like');
    }
  };

  const handleUnlike = async () => {
    if (!likedTrackId) return;
    try {
      await deleteImmediately(likedTrackId);
    } catch (err) {
      console.error('[TrackLikeButton → Unlike Error]', err);
      toast.error('Erreur lors du unlike');
    }
  };

  return (
    <div className="mt-4">
      {isLiked ? (
        <Button
          onClick={handleUnlike}
          disabled={likeTrack.isPending}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {likeTrack.isPending ? 'Retrait...' : 'Unlike'}
        </Button>
      ) : (
        <Button
          onClick={handleLike}
          disabled={likeTrack.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {likeTrack.isPending ? 'Ajout...' : 'Like'}
        </Button>
      )}
    </div>
  );
};

export default TrackLikeButton;
