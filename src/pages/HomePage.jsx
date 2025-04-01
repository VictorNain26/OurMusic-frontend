import React from 'react';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LikedTracksList from '../components/LikedTracksList';
import PageWrapper from '../layout/PageWrapper';
import { authClient } from '../lib/authClient';

const HomePage = () => {
  const { data: session, isLoading } = authClient.useSession();
  const user = session?.user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper className="bg-white">
      <AzuracastPlayer />
      {user && <LikedTracksList />}
    </PageWrapper>
  );
};

export default HomePage;
