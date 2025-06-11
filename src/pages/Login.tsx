import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) setError(error.message);
    else navigate('/home');
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl mb-4">Giriş Yap</h1>
      <input
        type="email"
        placeholder="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-2"
      />
      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-2"
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white w-full p-2 disabled:opacity-50"
        disabled={!email || !password || loading}
      >
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
    </div>
  );
}
