import React, { useEffect, useState } from 'react';
import { apiFetch, getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';

const TrackLikeButton = ({ track, likedTracks = [], setLikedTracks }) => {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likedTrackId, setLikedTrackId] = useState(null);

  const youtubeUrl = track.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(track.artist + " " + track.title)}`;

  useEffect(() => {
    if (!getAccessToken()) return;
    const match = likedTracks.find(item =>
      item.title.toLowerCase() === track.title.toLowerCase() &&
      item.artist.toLowerCase() === track.artist.toLowerCase()
    );
    if (match) {
      setLiked(true);
      setLikedTrackId(match.id);
    } else {
      setLiked(false);
      setLikedTrackId(null);
    }
  }, [track, likedTracks]);

  const handleLike = async () => {
    setLoading(true);
    try {
      const payload = { title: track.title, artist: track.artist, artwork: track.art || '', youtubeUrl };
      const data = await apiFetch('https://ourmusic-api.ovh/api/track/like', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.likedTrack && setLikedTracks) {
        setLikedTracks((prev) => [...prev, data.likedTrack]);
        toast.success('Morceau liké');
      }
    } catch (err) {
      toast.error('Erreur lors du like');
    }
    setLoading(false);
  };

  const handleUnlike = async () => {
    if (!likedTrackId) return;
    setLoading(true);
    try {
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${likedTrackId}`, {
        method: 'DELETE',
      });
      if (setLikedTracks) {
        setLikedTracks((prev) => prev.filter((t) =>
          !(t.id === likedTrackId ||
            (t.title.toLowerCase() === track.title.toLowerCase() &&
            t.artist.toLowerCase() === track.artist.toLowerCase())
          )
        ));
      }
      setLiked(false);
      setLikedTrackId(null);
      toast.success('Morceau retiré des likes');
    } catch (err) {
      toast.error('Erreur lors du unlike');
    }
    setLoading(false);
  };

  return (
    <div className="mt-4">
      {liked ? (
        <button onClick={handleUnlike} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          {loading ? 'Traitement...' : 'Unlike'}
        </button>
      ) : (
        <button onClick={handleLike} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Traitement...' : 'Like'}
        </button>
      )}
    </div>
  );
};

export default TrackLikeButton;