import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router';

const Dashboard = observer(() => {
  const { authStore, blogStore } = useStore();
  const navigate = useNavigate();
  
  // State to manage the full content modal view
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch all posts when dashboard loads
    blogStore.fetchPosts();
  }, [blogStore]);

  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  const handleViewPost = async (slug) => {
    await blogStore.fetchPostBySlug(slug);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-palette-lightest font-sans flex flex-col relative">
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
        {blogStore.loading && !isModalOpen && (
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
                  <h2 
                    onClick={() => handleViewPost(post.slug)}
                    className="text-xl font-serif font-bold text-palette-dark hover:underline cursor-pointer"
                  >
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

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${post.is_published ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                  
                  {/* View Full Content Button */}
                  <button
                    onClick={() => handleViewPost(post.slug)}
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition border border-gray-200"
                    title="View Full Post"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Full Content Modal Viewer */}
      {isModalOpen && blogStore.currentPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-palette-light animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Story Preview</span>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-8 overflow-y-auto space-y-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-palette-dark mb-2">{blogStore.currentPost.title}</h1>
                {blogStore.currentPost.subtitle && (
                  <p className="text-lg text-gray-600 font-sans">{blogStore.currentPost.subtitle}</p>
                )}
                <div className="flex items-center space-x-3 text-xs text-gray-400 mt-4 border-b border-gray-100 pb-4">
                  <span>By {blogStore.currentPost.author_username}</span>
                  <span>•</span>
                  <span>{new Date(blogStore.currentPost.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Render Editor.js JSON Blocks */}
              <div className="space-y-4 font-sans text-gray-800">
                {Array.isArray(blogStore.currentPost.content) && blogStore.currentPost.content.map((block, index) => {
                  if (block.type === 'header') {
                    const Tag = `h${block.data.level || 2}`;
                    return (
                      <Tag key={index} className="font-serif font-bold text-palette-dark mt-6 mb-2 text-2xl">
                        {block.data.text}
                      </Tag>
                    );
                  }
                  if (block.type === 'paragraph') {
                    return (
                      <p key={index} className="leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: block.data.text }} />
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-palette-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Dashboard;