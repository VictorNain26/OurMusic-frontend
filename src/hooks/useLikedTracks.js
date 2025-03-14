import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAccessToken } from '../utils/api';

export const useLikedTracks = () => {
  const queryClient = useQueryClient();

  const fetchTracks = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('Utilisateur non connecté');
    const data = await apiFetch('https://ourmusic-api.ovh/api/track/like');
    return data.likedTracks;
  };

  const { data: likedTracks = [], isLoading, refetch } = useQuery({
    queryKey: ['likedTracks'],
    queryFn: fetchTracks,
    enabled: !!getAccessToken(),
  });

  const deleteTrack = useMutation({
    mutationFn: async (id) => {
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['likedTracks'], (prev) =>
        prev?.filter((track) => track.id !== deletedId)
      );
    },
  });

  const likeTrack = useMutation({
    mutationFn: async (trackData) => {
      const res = await apiFetch('https://ourmusic-api.ovh/api/track/like', {
        method: 'POST',
        body: JSON.stringify(trackData),
      });
      return res.likedTrack;
    },
    onSuccess: (newTrack) => {
      queryClient.setQueryData(['likedTracks'], (prev) => [...(prev || []), newTrack]);
    },
  });

  return {
    likedTracks,
    isLoading,
    refetch,
    deleteTrack,
    likeTrack,
  };
};
