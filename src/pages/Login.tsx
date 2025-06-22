import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Sparkles, Shield, Edit, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };
  
  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password');
  };
  
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"></div>
      </div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PLN Knowledge
              </h1>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-slate-300 font-medium">CosmosDB Style</span>
              </div>
            </div>
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-bold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          Access your knowledge management system
        </p>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-2xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400 focus:ring-offset-0"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-transparent px-2 text-slate-300">Quick login as</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => quickLogin('admin@pln.com')}
                className="flex flex-col items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm py-3 px-2 text-xs font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
              >
                <Shield className="h-5 w-5 text-purple-400 mb-1" />
                Admin
              </button>
              <button
                onClick={() => quickLogin('editor@pln.com')}
                className="flex flex-col items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm py-3 px-2 text-xs font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
              >
                <Edit className="h-5 w-5 text-blue-400 mb-1" />
                Editor
              </button>
              <button
                onClick={() => quickLogin('viewer@pln.com')}
                className="flex flex-col items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm py-3 px-2 text-xs font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
              >
                <Eye className="h-5 w-5 text-green-400 mb-1" />
                Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;