import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/auth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      loginUser(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Welcome Back</h2>
      {error && <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Email</label>
          <input 
            type="email" 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Password</label>
          <input 
            type="password" 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition flex justify-center items-center gap-2">
          <LogIn size={18} /> Login
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-400">
        Don't have an account? <Link to="/signup" className="text-blue-400 hover:underline">Sign up</Link>
      </div>
      <div className="mt-8 pt-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        <p>Demo Admin: admin@mymanga.com / password</p>
      </div>
    </div>
  );
};