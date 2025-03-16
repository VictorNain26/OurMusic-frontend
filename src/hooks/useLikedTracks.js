import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';

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
      if (!id || typeof id !== 'number') throw new Error('ID de suppression invalide');
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['likedTracks'], (prev) => prev?.filter((track) => track.id !== deletedId));
      toast.success('Morceau supprimé.');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la suppression.');
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
      toast.success('Morceau liké.');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors du like.');
    },
  });

  // 👉 Suppression sans confirmation
  const deleteImmediately = async (id) => {
    try {
      await deleteTrack.mutateAsync(id);
    } catch (err) {
      console.error('Erreur suppression :', err);
    }
  };

  return {
    likedTracks,
    isLoading,
    refetch,
    deleteTrack,
    likeTrack,
    deleteImmediately, // nouveau nom clair
  };
};
