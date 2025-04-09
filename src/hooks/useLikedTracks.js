// src/hooks/useLikedTracks.js
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { toast } from 'react-hot-toast';
import { authClient } from '../lib/authClient.jsx';

export const useLikedTracks = () => {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Récupérer les morceaux likés
  const fetchLikedTracks = async () => {
    if (!user) return [];
    const data = await apiFetch('/api/track/like');
    // Si l'API renvoie directement un tableau, on retourne data, sinon data.likedTracks
    return data || [];
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

  useEffect(() => {
    if (user) {
      refetch(); // Requête manuelle si l'utilisateur change
    }
  }, [user, refetch]);

  // Mutation avec mise à jour optimiste pour aimer un morceau
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
      // Annuler toute requête en cours pour la query "likedTracks"
      await queryClient.cancelQueries(['likedTracks']);
      const previousTracks = queryClient.getQueryData(['likedTracks']) || [];
      // Ajout d'un identifiant optimiste
      const optimisticTrack = { ...newTrack, id: 'optimistic-' + Date.now() };
      queryClient.setQueryData(['likedTracks'], old => [...old, optimisticTrack]);
      return { previousTracks };
    },
    onError: (err, newTrack, context) => {
      // Rollback en cas d'erreur
      queryClient.setQueryData(['likedTracks'], context.previousTracks);
      toast.error(err.message || 'Erreur lors du like');
    },
    onSuccess: () => {
      // Invalider pour récupérer les données à jour du backend
      queryClient.invalidateQueries(['likedTracks']);
      toast.success('🎶 Morceau liké !');
    },
  });

  // Mutation avec mise à jour optimiste pour supprimer un like
  const deleteTrack = useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error('ID invalide'); // Suppression du test isNaN puisque l'id est une chaîne
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
