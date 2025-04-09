// src/components/TrackLikeButton.jsx
import React from 'react';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';
import { useLikedTracks } from '../hooks/useLikedTracks';
import { motion } from 'framer-motion';
import { authClient } from '../lib/authClient.jsx';

const TrackLikeButton = ({ track }) => {
  const { likedTracks, likeTrack, handleDelete } = useLikedTracks();
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const youtubeUrl =
    track?.youtubeUrl ||
    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artist} ${track.title}`)}`;

  const matchedTrack = likedTracks.find(
    (item) =>
      item.title?.toLowerCase() === track.title?.toLowerCase() &&
      item.artist?.toLowerCase() === track.artist?.toLowerCase()
  );

  const isLiked = !!matchedTrack;
  const likedTrackId = matchedTrack?.id;

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error('Veuillez vous connecter pour liker.');
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
      console.error('[TrackLikeButton → Like]', err);
      toast.error(err.message || 'Erreur lors du like');
    }
  };

  const handleUnlike = async () => {
    if (!likedTrackId) return;

    try {
      await handleDelete(likedTrackId);
    } catch (err) {
      console.error('[TrackLikeButton → Unlike]', err);
      toast.error(err.message || 'Erreur lors du unlike');
    }
  };

  const handleClick = () => {
    if (likeTrack.isPending) return;
    if (isLiked) return handleUnlike();
    return handleLike();
  };

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="mt-4"
    >
      <Button
        onClick={handleClick}
        disabled={likeTrack.isPending}
        className={`w-full sm:w-auto ${
          isLiked
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {likeTrack.isPending
          ? isLiked
            ? 'Retrait...'
            : 'Ajout...'
          : isLiked
          ? 'Unlike'
          : 'Like'}
      </Button>
    </motion.div>
  );
};

export default TrackLikeButton;
