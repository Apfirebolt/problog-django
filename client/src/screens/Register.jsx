import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router';

const Register = observer(() => {
  const { authStore } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await authStore.register(formData);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-palette-lightest flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-palette-light">
        <h2 className="text-3xl font-serif font-bold text-palette-dark mb-2 text-center">Join the Community</h2>
        <p className="text-gray-600 text-center mb-6 text-sm">Create an account to start writing and sharing</p>
        
        {authStore.error && (
          <div className="mb-4 p-3 bg-red-50 text-palette-dark border border-palette-medium rounded-xl text-sm">
            {typeof authStore.error === 'string' ? authStore.error : JSON.stringify(authStore.error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName} 
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-palette-dark text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName} 
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-palette-dark text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              name="username"
              value={formData.username} 
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-palette-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-palette-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange}
              required
              minLength={8}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-palette-dark"
              placeholder="Min 8 characters"
            />
          </div>

          <button 
            type="submit" 
            disabled={authStore.loading}
            className="w-full py-3 bg-palette-dark text-white rounded-xl font-medium hover:opacity-90 transition shadow-md"
          >
            {authStore.loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-palette-dark font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
});

export default Register;