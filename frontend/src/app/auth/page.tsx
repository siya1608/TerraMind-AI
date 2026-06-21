'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { login, signup, googleLogin } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let ok: boolean;
      if (mode === 'login') {
        ok = await login(email, password);
      } else {
        ok = await signup(email, password);
      }
      if (ok) {
        router.push('/dashboard');
      } else {
        setError(mode === 'login' ? 'Invalid credentials. Please try again.' : 'Signup failed. Email may already be registered.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const ok = await login('demo@terramind_ai.ai', 'demo1234');
      if (ok) router.push('/dashboard');
      else setError('Demo account not available. Please sign up.');
    } catch {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary-container/30 to-transparent"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(106,233,8,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(106,233,8,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <span className="material-symbols-outlined text-on-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <span className="font-display-xl text-2xl font-bold text-white tracking-tight">TerraMind AI</span>
          </div>
          <p className="text-on-surface-variant text-xs font-mono uppercase tracking-widest">AI-Powered Climate Intelligence</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {/* Mode Toggle */}
          <div className="flex gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/5 mb-7">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-xl font-label-caps text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                mode === 'login' ? 'bg-primary-container text-on-primary-container shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-xl font-label-caps text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-primary-container text-on-primary-container shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div>
                <label className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-wider block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container/50 transition-all"
                />
              </div>
            )}

            <div>
              <label className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-wider block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container/50 transition-all"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-primary-container/50 transition-all"
              />
            </div>

            {error && (
              <div className="text-error text-xs font-mono text-center py-2 bg-error-container/10 border border-error/20 rounded-xl px-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-container text-on-primary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="material-symbols-outlined text-sm animate-spin">eco</span> Processing...</>
              ) : mode === 'login' ? (
                <><span className="material-symbols-outlined text-sm">login</span> Sign In</>
              ) : (
                <><span className="material-symbols-outlined text-sm">person_add</span> Create Account</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-on-surface-variant/30 text-[10px] font-mono uppercase">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-white/5 border border-white/10 text-white font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm text-secondary-fixed">bolt</span>
            Quick Demo Access
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-on-surface-variant/30 text-[9px] font-mono mt-6 uppercase tracking-wider">
          Protected by Supabase Auth & JWT Security
        </p>
      </div>
    </div>
  );
}
