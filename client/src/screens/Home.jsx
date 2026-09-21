import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = observer(() => {
  const { authStore } = useStore();

  return (
    <div className="min-h-screen bg-palette-lightest font-sans flex flex-col">
      {/* Reusable Header Component */}
      <Header />

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
      <Footer />
    </div>
  );
});

export default Home;