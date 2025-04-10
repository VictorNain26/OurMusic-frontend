import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { toast } from 'react-hot-toast';
import { authClient } from '../lib/authClient.jsx';

export const useLikedTracks = () => {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const fetchLikedTracks = async () => {
    if (!user) return [];
    try {
      const data = await apiFetch('/api/track/like');
      return data || [];
    } catch (err) {
      if (import.meta.env.DEV) console.error('[fetchLikedTracks]', err);
      return [];
    }
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
    staleTime: 1000 * 60,
    retry: 1,
    keepPreviousData: true,
    onError: (err) => {
      console.error('[useLikedTracks → Query]', err);
      toast.error(err.message || 'Erreur lors du chargement des morceaux likés');
    },
  });

  const likeTrack = useMutation({
    mutationFn: async ({ title, artist, artwork = '', youtubeUrl = '' }) => {
      if (!title || !artist) throw new Error('Titre ou artiste manquant');
      const res = await apiFetch('/api/track/like', {
        method: 'POST',
        body: JSON.stringify({ title, artist, artwork, youtubeUrl }),
      });
      return res?.likedTrack;
    },
    onMutate: async (newTrack) => {
      await queryClient.cancelQueries(['likedTracks']);
      const previousTracks = queryClient.getQueryData(['likedTracks']) || [];
      const optimisticTrack = { ...newTrack, id: 'optimistic-' + Date.now() };
      queryClient.setQueryData(['likedTracks'], old => [...old, optimisticTrack]);
      return { previousTracks };
    },
    onError: (err, newTrack, context) => {
      queryClient.setQueryData(['likedTracks'], context.previousTracks);
      toast.error(err.message || 'Erreur lors du like');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['likedTracks']);
      toast.success('🎶 Morceau liké !');
    },
  });

  const deleteTrack = useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('ID invalide');
      await apiFetch(`/api/track/like/${id}`, { method: 'DELETE' });
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['likedTracks']);
      const previousTracks = queryClient.getQueryData(['likedTracks']) || [];
      queryClient.setQueryData(['likedTracks'], old => old.filter(track => track.id !== id));
      return { previousTracks };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['likedTracks'], context.previousTracks);
      toast.error(err.message || 'Erreur lors de la suppression');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['likedTracks']);
      toast.success('🗑️ Morceau supprimé');
    },
  });

  const handleDelete = async (id) => {
    if (!id) {
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
