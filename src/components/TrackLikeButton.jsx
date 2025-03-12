import React, { useEffect, useState } from 'react';
import { apiFetch, getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';

const TrackLikeButton = ({ track, likedTracks = [], setLikedTracks }) => {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likedTrackId, setLikedTrackId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const youtubeUrl = track?.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(track?.artist + ' ' + track?.title)}`;

  useEffect(() => {
    const token = getAccessToken();
    const loggedIn = Boolean(token);
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      setLiked(false);
      setLikedTrackId(null);
      return;
    }

    if (track && likedTracks.length > 0) {
      const match = likedTracks.find(
        (item) => item.title?.toLowerCase() === track.title?.toLowerCase() &&
                  item.artist?.toLowerCase() === track.artist?.toLowerCase()
      );
      if (match) {
        setLiked(true);
        setLikedTrackId(match.id);
      } else {
        setLiked(false);
        setLikedTrackId(null);
      }
    } else {
      setLiked(false);
      setLikedTrackId(null);
    }
  }, [track, likedTracks]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Veuillez vous connecter pour liker un morceau.");
      const loginButton = document.querySelector("button[data-login-button]");
      if (loginButton) loginButton.click();
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: track.title,
        artist: track.artist,
        artwork: track.art || '',
        youtubeUrl,
      };
      const data = await apiFetch('https://ourmusic-api.ovh/api/track/like', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.likedTrack && typeof setLikedTracks === 'function') {
        setLikedTracks((prev) => [...prev, data.likedTrack]);
        setLiked(true);
        setLikedTrackId(data.likedTrack.id);
        toast.success('Morceau liké');
      }
    } catch (err) {
      toast.error('Erreur lors du like');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async () => {
    if (!likedTrackId) return;
    setLoading(true);
    try {
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${likedTrackId}`, {
        method: 'DELETE',
      });
      if (typeof setLikedTracks === 'function') {
        setLikedTracks((prev) =>
          prev.filter((t) => t.id !== likedTrackId && !(t.title?.toLowerCase() === track.title?.toLowerCase() && t.artist?.toLowerCase() === track.artist?.toLowerCase()))
        );
      }
      setLiked(false);
      setLikedTrackId(null);
      toast.success('Morceau retiré des likes');
    } catch (err) {
      toast.error("Erreur lors du unlike");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {liked && isLoggedIn ? (
        <Button
          onClick={handleUnlike}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {loading ? 'Traitement...' : 'Unlike'}
        </Button>
      ) : (
        <Button
          onClick={handleLike}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? 'Traitement...' : 'Like'}
        </Button>
      )}
    </div>
  );
};

export default TrackLikeButton;