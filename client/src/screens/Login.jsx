import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router';

const Login = observer(() => {
  const { authStore } = useStore();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await authStore.login({ email, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-palette-lightest flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-palette-light">
        <h2 className="text-3xl font-serif font-bold text-palette-dark mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-600 text-center mb-6 text-sm">Sign in to continue to your stories</p>
        
        {authStore.error && (
          <div className="mb-4 p-3 bg-red-50 text-palette-dark border border-palette-medium rounded-xl text-sm">
            {typeof authStore.error === 'string' ? authStore.error : JSON.stringify(authStore.error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-palette-dark"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-palette-dark"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={authStore.loading}
            className="w-full py-3 bg-palette-dark text-white rounded-xl font-medium hover:opacity-90 transition shadow-md"
          >
            {authStore.loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-palette-dark font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
});

export default Login;