import { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { signInWithEmail } from '../../services/supabase.ts';
import { useTheme } from '../../contexts/ThemeContext';

interface AdminLoginProps {
  onLogin: () => void;
}

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from login');
      
      // Login successful
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md p-6 space-y-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <ShieldAlert size={32} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </div>
        <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admin Access</h1>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Sign in with your admin credentials
        </p>
      </div>
      
      {error && (
        <div className={`p-3 rounded-lg text-sm ${
          theme === 'dark' 
            ? 'bg-red-900/50 text-red-200 border border-red-800' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`} role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`block w-full p-3 ${
              theme === 'dark' 
                ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
            } border rounded-xl focus:ring-2 focus:border-transparent transition-all`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@civicgo.org"
          />
        </div>
        
        <div>
          <label htmlFor="password" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`block w-full p-3 ${
              theme === 'dark' 
                ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
            } border rounded-xl focus:ring-2 focus:border-transparent transition-all`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              theme === 'dark'
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} text-white py-3 rounded-xl font-medium transition-colors shadow flex items-center justify-center gap-2`}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? 'Verifying...' : 'Sign in to Admin'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
