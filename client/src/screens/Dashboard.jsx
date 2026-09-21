import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router';

const Dashboard = observer(() => {
  const { authStore, blogStore } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all posts when dashboard loads
    blogStore.fetchPosts();
  }, [blogStore]);

  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-palette-lightest font-sans flex flex-col">
      {/* Dashboard Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-palette-light shadow-xs">
        <Link to="/" className="text-2xl font-serif font-bold text-palette-dark">
          ProBlog <span className="text-xs font-sans font-normal uppercase tracking-widest bg-palette-light px-2 py-0.5 rounded-full ml-2">Dashboard</span>
        </Link>
        <div className="flex items-center space-x-6">
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
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-palette-dark">Published Stories</h1>
          <span className="text-sm text-gray-500 font-medium">{blogStore.posts.length} Stories Total</span>
        </div>

        {/* Loading and Error States */}
        {blogStore.loading && (
          <div className="text-center py-12 text-gray-500">Loading stories...</div>
        )}

        {blogStore.error && (
          <div className="p-4 bg-red-50 text-palette-dark border border-palette-medium rounded-xl text-sm mb-6">
            {typeof blogStore.error === 'string' ? blogStore.error : JSON.stringify(blogStore.error)}
          </div>
        )}

        {/* Blog Post List */}
        {!blogStore.loading && blogStore.posts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-palette-light text-center shadow-sm">
            <h3 className="text-xl font-serif font-semibold text-palette-dark mb-2">No stories yet</h3>
            <p className="text-gray-600 mb-6 text-sm">Be the first writer to share an idea with the community.</p>
            <Link
              to="/write"
              className="px-6 py-3 bg-palette-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition shadow-md"
            >
              Write your first story
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {blogStore.posts.map((post) => (
              <div 
                key={post.id || post.slug} 
                className="bg-white p-6 rounded-2xl border border-palette-light shadow-xs hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1 flex-1">
                  <h2 className="text-xl font-serif font-bold text-palette-dark hover:underline cursor-pointer">
                    {post.title}
                  </h2>
                  {post.subtitle && (
                    <p className="text-gray-600 text-sm line-clamp-1">{post.subtitle}</p>
                  )}
                  <div className="flex items-center space-x-3 text-xs text-gray-400 pt-2">
                    <span>By {post.author_username || 'Author'}</span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${post.is_published ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
});

export default Dashboard;