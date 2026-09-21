import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router';

const Home = observer(() => {
  const { authStore } = useStore();

  return (
    <div className="min-h-screen bg-palette-lightest font-sans flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-palette-light">
        <Link to="/" className="text-2xl font-serif font-bold text-palette-dark">
          ProBlog
        </Link>
        <div className="flex items-center space-x-4">
          {authStore.isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-gray-700">
                Hello, {authStore.user?.username || authStore.user?.email}
              </span>
              <button 
                onClick={() => authStore.logout()}
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

      {/* Hero / Main Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-palette-dark mb-6 leading-tight">
            Human stories & ideas
          </h1>
          <p className="text-lg text-gray-700 mb-8 font-sans">
            A place to read, write, and deepen your understanding with a modern, block-based publishing experience.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to={authStore.isAuthenticated ? "/write" : "/register"}
              className="px-8 py-3.5 bg-palette-dark text-white rounded-full font-medium hover:opacity-90 transition shadow-md text-lg"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
});

export default Home;