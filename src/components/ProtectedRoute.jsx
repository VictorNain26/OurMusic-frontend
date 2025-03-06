import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const AdminRoute = ({ isAdmin }) => isAdmin ? <Outlet /> : <Navigate to="/login" />;
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
