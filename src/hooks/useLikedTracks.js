import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';

export const useLikedTracks = () => {
  const queryClient = useQueryClient();

  const fetchTracks = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('Utilisateur non connecté');
    const data = await apiFetch('https://ourmusic-api.ovh/api/track/like');
    console.log('✅ Tracks récupérés:', data);
    return data.likedTracks;
  };

  const { data: likedTracks = [], isLoading, refetch } = useQuery({
    queryKey: ['likedTracks'],
    queryFn: fetchTracks,
    enabled: !!getAccessToken(),
  });

  const deleteTrack = useMutation({
    mutationFn: async (id) => {
      console.log('🚨 Suppression track ID envoyé:', id);
      if (!id || typeof id !== 'number') throw new Error('ID de suppression invalide');
      await apiFetch(`https://ourmusic-api.ovh/api/track/like/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: (deletedId) => {
      console.log('✅ Track supprimé:', deletedId);
      queryClient.setQueryData(['likedTracks'], (prev) =>
        prev?.filter((track) => track.id !== deletedId)
      );
    },
    onError: (error) => {
      console.error('❌ Erreur suppression track:', error.message);
    }
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
      console.log('✅ Nouveau track liké:', newTrack);
      queryClient.setQueryData(['likedTracks'], (prev) => [...(prev || []), newTrack]);
    },
    onError: (error) => {
      console.error('❌ Erreur like track:', error.message);
    }
  });

  const confirmAndDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce morceau ?")) return;
    try {
      await deleteTrack.mutateAsync(id);
      toast.success("Morceau supprimé.");
    } catch (err) {
      console.error('Erreur suppression :', err);
      toast.error(err.message || 'Erreur lors de la suppression.');
    }
  };

  return {
    likedTracks,
    isLoading,
    refetch,
    deleteTrack,
    likeTrack,
    confirmAndDelete,
  };
};
