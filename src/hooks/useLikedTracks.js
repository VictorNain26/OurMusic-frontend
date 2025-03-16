import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';

export const useLikedTracks = () => {
  const queryClient = useQueryClient();

  const fetchTracks = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('Utilisateur non connecté');
    const data = await apiFetch('https://ourmusic-api.ovh/api/track/like');
    return data?.likedTracks || [];
  };

  const {
    data: likedTracks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['likedTracks'],
    queryFn: fetchTracks,
    enabled: !!getAccessToken(),
    retry: 1,
    onError: (err) => {
      console.error('[LikedTracks] Échec récupération :', err);
      toast.error(err.message || 'Erreur chargement morceaux likés');
    },
  });

  const likeTrack = useMutation({
    mutationFn: async (trackData) => {
      if (!trackData.title || !trackData.artist) {
        throw new Error('Données track invalides');
      }
      const res = await apiFetch('https://ourmusic-api.ovh/api/track/like', {
        method: 'POST',
        body: JSON.stringify(trackData),
      });
      return res.likedTrack;
    },
    onSuccess: (newTrack) => {
      queryClient.setQueryData(['likedTracks'], (prev = []) => [...prev, newTrack]);
      toast.success('🎶 Morceau liké !');
    },
    onError: (err) => {
      console.error('[LikeTrack Error]', err);
      toast.error(err.message || 'Erreur lors du like');
    },
  });

  const deleteTrack = useMutation({
    mutationFn: async (id) => {
      if (!id || typeof id !== 'number' || isNaN(id)) {
        throw new Error('ID de suppression invalide');
      }
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['likedTracks'], (prev = []) =>
        prev.filter((track) => track.id !== deletedId)
      );
      toast.success('🗑️ Morceau supprimé');
    },
    onError: (err) => {
      console.log(id);
      console.error('[DeleteTrack Error]', err);
      toast.error(err.message || 'Erreur lors de la suppression');
    },
  });

  const handleDelete = async (id) => {
    if (!id || typeof id !== 'number' || isNaN(id)) {
      console.warn('[handleDelete] ID non valide côté front :', id);
      toast.error('ID de suppression invalide');
      return;
    }
    try {
      await deleteTrack.mutateAsync(id);
    } catch (err) {
      console.error('[handleDelete Error]', err);
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
