import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';
import { useLikedTracks } from '../hooks/useLikedTracks';

const TrackLikeButton = ({ track }) => {
  const { likedTracks, likeTrack, deleteImmediately } = useLikedTracks();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const youtubeUrl =
    track?.youtubeUrl ||
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      track?.artist + ' ' + track?.title
    )}`;

  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(Boolean(token));
  }, []);

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
      const loginButton = document.querySelector("button[data-login-button]");
      if (loginButton) loginButton.click();
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
      console.error('Erreur lors du like :', err);
      toast.error('Impossible de liker le morceau.');
    }
  };

  const handleUnlike = async () => {
    if (!likedTrackId) return;
    await deleteImmediately(likedTrackId);
  };

  return (
    <div className="mt-4">
      {isLiked ? (
        <Button
          onClick={handleUnlike}
          disabled={likeTrack.isPending}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {likeTrack.isPending ? 'Traitement...' : 'Unlike'}
        </Button>
      ) : (
        <Button
          onClick={handleLike}
          disabled={likeTrack.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {likeTrack.isPending ? 'Traitement...' : 'Like'}
        </Button>
      )}
    </div>
  );
};

export default TrackLikeButton;
