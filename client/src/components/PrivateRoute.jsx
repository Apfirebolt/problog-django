import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router';
import { useStore } from '../context/StoreContext';

const PrivateRoute = observer(({ children }) => {
  const { authStore } = useStore();

  // If user is not authenticated, redirect to login page
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if passed, otherwise render nested routes via Outlet
  return children ? children : <Outlet />;
});

export default PrivateRoute;