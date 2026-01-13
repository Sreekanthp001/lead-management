import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Supabase Auth call
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError("Invalid credentials. Try again!");
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] p-4 font-['Inter',sans-serif]">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#00a389] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Venturemond</h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Secure Admin Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="email" placeholder="Admin Email" required
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="password" placeholder="Password" required
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#00a389] hover:bg-[#008f78] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}