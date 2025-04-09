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
    enabled: !!user, // Démarre la query seulement si un utilisateur est connecté
    staleTime: 1000 * 60, // Temps pour garder les données en cache avant de les rafraîchir
    retry: 1,
    keepPreviousData: true, // Garde les anciennes données pendant le chargement
    onError: (err) => {
      console.error('[useLikedTracks → Query]', err);
      toast.error(err.message || 'Erreur lors du chargement des morceaux likés');
    },
  });

  useEffect(() => {
    if (user) {
      refetch();  // Requête manuelle si l'utilisateur change
    }
  }, [user, refetch]);

  // Mutation pour aimer un morceau
  const likeTrack = useMutation({
    mutationFn: async ({ title, artist, artwork = '', youtubeUrl = '' }) => {
      if (!title || !artist) throw new Error('Titre ou artiste manquant');
      const res = await apiFetch('/api/track/like', {
        method: 'POST',
        body: JSON.stringify({ title, artist, artwork, youtubeUrl }),
      });
      return res?.likedTrack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['likedTracks']); // Rafraîchir les données après un like
      toast.success('🎶 Morceau liké !');
    },
    onError: (err) => {
      console.error('[likeTrack]', err);
      toast.error(err.message || 'Erreur lors du like');
    },
  });

  // Mutation pour supprimer un morceau liké
  const deleteTrack = useMutation({
    mutationFn: async (id) => {
      if (!id || isNaN(id)) throw new Error('ID invalide');
      await apiFetch(`/api/track/like/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['likedTracks']); // Rafraîchir les données après une suppression
      toast.success('🗑️ Morceau supprimé');
    },
    onError: (err) => {
      console.error('[deleteTrack]', err);
      toast.error(err.message || 'Erreur lors de la suppression');
    },
  });

  const handleDelete = async (id) => {
    if (!id || isNaN(id)) {
      toast.error('ID invalide');
      return;
    }
    try {
      await deleteTrack.mutateAsync(id);  // Suppression
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
