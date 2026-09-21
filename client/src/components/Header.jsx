import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router';

const Header = observer(({ isDashboard = false }) => {
  const { authStore } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-palette-light shadow-xs">
      <Link to="/" className="text-2xl font-serif font-bold text-palette-dark flex items-center">
        Pro Blog 
        {isDashboard && (
          <span className="text-xs font-sans font-normal uppercase tracking-widest bg-palette-light px-2 py-0.5 rounded-full ml-2">
            Dashboard
          </span>
        )}
      </Link>

      <div className="flex items-center space-x-6">
        {authStore.isAuthenticated ? (
          <>
            <span className="text-sm font-medium text-gray-700">
              Welcome, <strong className="text-palette-dark">{authStore.user?.username || authStore.user?.email}</strong>
            </span>
            <Link
              to="/write"
              className="px-5 py-2 text-sm bg-palette-dark text-white rounded-full font-medium hover:opacity-90 transition shadow-sm flex items-center space-x-1"
            >
              <span>Write Story</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-palette-dark hover:opacity-85 transition"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2 text-sm bg-palette-dark text-white rounded-full font-medium hover:opacity-90 transition shadow-sm"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
});

export default Header;