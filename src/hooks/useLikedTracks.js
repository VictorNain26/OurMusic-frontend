import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export const useLikedTracks = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore.getState().user;

  const fetchLikedTracks = async () => {
    if (!user) {
      console.warn('[useLikedTracks] Pas d’utilisateur connecté. Skip API.');
      return [];
    }

    const data = await apiFetch('/api/track/like');
    return data?.likedTracks || [];
  };

  const {
    data: likedTracks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['likedTracks'],
    queryFn: fetchLikedTracks,
    enabled: !!user,
    retry: 1,
    onError: (err) => {
      console.error('[useLikedTracks → Query error]', err);
      toast.error(err.message || 'Erreur chargement morceaux likés');
    },
  });

  const likeTrack = useMutation({
    mutationFn: async ({ title, artist, artwork, youtubeUrl }) => {
      if (!title || !artist) throw new Error('Titre ou artiste manquant');
      const res = await apiFetch('/api/track/like', {
        method: 'POST',
        body: JSON.stringify({ title, artist, artwork, youtubeUrl }),
      });
      return res?.likedTrack;
    },
    onSuccess: (newTrack) => {
      queryClient.setQueryData(['likedTracks'], (prev = []) => [...prev, newTrack]);
      toast.success('🎶 Morceau liké !');
    },
    onError: (err) => {
      console.error('[likeTrack → Error]', err);
      toast.error(err.message || 'Erreur lors du like');
    },
  });

  const deleteTrack = useMutation({
    mutationFn: async (id) => {
      if (!id || isNaN(id)) throw new Error('ID de suppression invalide');
      await apiFetch(`/api/track/like/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['likedTracks'], (prev = []) =>
        prev?.filter((track) => track.id !== deletedId)
      );
      toast.success('🗑️ Morceau supprimé');
    },
    onError: (err) => {
      console.error('[deleteTrack → Error]', err);
      toast.error(err.message || 'Erreur lors de la suppression');
    },
  });

  const handleDelete = async (id) => {
    if (!id || isNaN(id)) {
      toast.error('ID invalide');
      return;
    }

    try {
      await deleteTrack.mutateAsync(id);
    } catch (err) {
      console.error('[handleDelete]', err);
    }
  };

  return {
    likedTracks,
    isLoading,
    isError,
    refetch,
    likeTrack,
    deleteTrack,
    handleDelete,
  };
};
