'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from './context/AppContext';
import BackgroundShaders from './components/BackgroundShaders';
import ThreeGlobe from './components/ThreeGlobe';

export default function LandingPage() {
  const { isLoggedIn, profile } = useApp();

  return (
    <div className="bg-background text-on-surface min-h-screen relative overflow-hidden flex flex-col font-sans">
      {/* WebGL liquid backdrop */}
      <BackgroundShaders />

      {/* Background orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 max-w-container-max mx-auto bg-surface/60 backdrop-blur-xl rounded-full mt-4 mx-margin-desktop border border-white/10 shadow-2xl transition-transform hover:scale-[1.01]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <span className="font-display-xl text-lg font-bold tracking-tighter text-white">TerraMind AI</span>
        </div>
        
        <nav className="hidden md:flex gap-8">
          <Link href="/dashboard" className="text-on-surface-variant font-medium text-xs uppercase tracking-widest hover:text-primary-fixed-dim transition-colors">
            Command Center
          </Link>
          <Link href="/marketplace" className="text-on-surface-variant font-medium text-xs uppercase tracking-widest hover:text-primary-fixed-dim transition-colors">
            Marketplace
          </Link>
          <Link href="/smart-city" className="text-on-surface-variant font-medium text-xs uppercase tracking-widest hover:text-primary-fixed-dim transition-colors">
            Smart City
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-primary-container text-on-primary-container font-label-caps text-xs tracking-wider rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              COMMAND CENTER ({profile?.full_name || 'USER'})
            </Link>
          ) : (
            <Link
              href="/auth"
              className="px-5 py-2.5 border border-white/10 hover:bg-white/5 font-label-caps text-xs text-white rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer font-bold"
            >
              SIGN IN
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col pt-32 pb-16 px-6 max-w-container-max mx-auto w-full">
        <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[75vh]">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left relative z-10 pointer-events-auto">
            <div className="mb-6 inline-flex items-center px-4 py-1.5 rounded-full glass-card border-primary/20 backdrop-blur-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary-container mr-3"></span>
              <span className="font-data-mono text-[10px] text-primary-fixed-dim uppercase tracking-widest font-semibold">
                Planetary Intelligence Live
              </span>
            </div>
            
            <h1 className="font-display-xl text-4xl sm:text-6xl lg:text-7xl mb-6 leading-[1.05] tracking-tight text-white">
              Engineering a <br />
              <span className="text-primary-container font-bold">Sustainable</span> Epoch.
            </h1>
            
            <p className="text-on-surface-variant max-w-lg mb-8 text-base leading-relaxed">
              Autonomous multi-agent sustainability coordinator combining carbon analysis, quantum forecasting models, smart-city analytics, and gamified local initiatives.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/calculator"
                className="group relative overflow-hidden px-8 py-4 rounded-full bg-primary-container text-on-primary-container font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                Calculate Impact
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link
                href="/coach"
                className="px-8 py-4 rounded-full border border-white/20 glass-card text-white text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all hover:scale-105 active:scale-95 text-center cursor-pointer"
              >
                Launch AI Coach
              </Link>
            </div>
          </div>

          {/* 3D Earth Globe Visual */}
          <div className="lg:col-span-5 relative w-full h-[400px] lg:h-[600px] flex items-center justify-center pointer-events-none">
            <ThreeGlobe />
          </div>
        </section>

        {/* Floating Glass Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Metric 1 */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-white/10 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="font-data-mono text-[10px] text-on-surface-variant/70 uppercase tracking-widest font-semibold">Global CO2</span>
              <span className="material-symbols-outlined text-error text-sm">trending_up</span>
            </div>
            <div className="font-display-xl text-3xl font-bold text-white mb-1">
              421.5 <span className="text-sm font-normal text-on-surface-variant">ppm</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-error w-[85%]"></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-white/10 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="font-data-mono text-[10px] text-on-surface-variant/70 uppercase tracking-widest font-semibold">Trees Saved</span>
              <span className="material-symbols-outlined text-primary-container text-sm">eco</span>
            </div>
            <div className="font-display-xl text-3xl font-bold text-white mb-1">
              8.4<span className="text-sm font-normal text-on-surface-variant">M</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary-container w-[72%]"></div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-white/10 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="font-data-mono text-[10px] text-on-surface-variant/70 uppercase tracking-widest font-semibold">Sustainability Index</span>
              <span className="material-symbols-outlined text-secondary-fixed text-sm">verified</span>
            </div>
            <div className="font-display-xl text-3xl font-bold text-primary-container mb-1">98%</div>
            <div className="text-xs font-mono text-on-surface-variant/50">Optimal operational efficiency</div>
          </div>
        </section>

        {/* Bento Grid Insights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="md:col-span-2 glass-card rounded-3xl p-8 flex flex-col justify-end min-h-[350px] group cursor-pointer relative overflow-hidden border border-white/10">
            <div
              className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform duration-700 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBG7Rqz61fGpPquJxzIe2kaNjY1N3yf1BojgZpdeKkdtasI7n7rQyz0dkmthbpLjuhaHgq5UKaMhlw6S8ASd-HQ14YsMgeqXBmbMP9tPCyCi9qD0SzyTHmKdrtxwQyYi2dfczjN3gDHek7W0QSt2nd_C4GafzhGcZRza7qnp2XOsocH49i9o8Jc6ZRv2EvyUNEo9puH02PIL4pKUdOYnV_sEIoG7fLR5xFJgMdmKIOw80Y46pedWDDP')`,
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/40 to-transparent"></div>
            <div className="relative z-10">
              <span className="font-data-mono text-[10px] text-primary-container mb-3 block uppercase tracking-wider font-semibold">Ecosystem Health</span>
              <h3 className="font-headline-lg text-2xl sm:text-3xl text-white mb-2 font-bold">Regenerative Urbanism Agents</h3>
              <p className="text-on-surface-variant text-sm max-w-md">
                Our multi-agent system autonomously manages city infrastructure to maximize carbon sequestration and thermal efficiency in real-time.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col gap-6 hover:bg-white/[0.03] transition-all cursor-pointer group border border-white/10 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-secondary-container/20 flex items-center justify-center group-hover:scale-110 transition-transform border border-secondary/20">
              <span className="material-symbols-outlined text-secondary-fixed text-3xl">analytics</span>
            </div>
            <h3 className="font-headline-lg text-xl text-white font-bold">Quantum Forecasts</h3>
            <p className="text-on-surface-variant text-sm">
              Predicting climate anomalies with 99.8% accuracy using planetary-scale quantum modeling and deep neural networks.
            </p>
            <Link href="/simulator" className="mt-auto flex items-center text-primary-container font-medium text-xs gap-2">
              Explore Models <span className="material-symbols-outlined text-xs">open_in_new</span>
            </Link>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col gap-6 hover:bg-white/[0.03] transition-all cursor-pointer group border border-white/10 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-tertiary-container/20 flex items-center justify-center group-hover:scale-110 transition-transform border border-tertiary/20">
              <span className="material-symbols-outlined text-tertiary-fixed text-3xl">payments</span>
            </div>
            <h3 className="font-headline-lg text-xl text-white font-bold">Carbon Marketplace</h3>
            <p className="text-on-surface-variant text-sm">
              Transparent, blockchain-verified carbon credits trading with zero fees for individual regenerators.
            </p>
            <Link href="/marketplace" className="mt-auto flex items-center text-primary-container font-medium text-xs gap-2">
              Visit Offset Market <span className="material-symbols-outlined text-xs">open_in_new</span>
            </Link>
          </div>

          <div className="md:col-span-2 glass-card rounded-3xl overflow-hidden group cursor-pointer border border-white/10 relative h-[250px]">
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDMAShLY71LkrHW9kiqPmkqTVPzP-7UX3eDTUEl4dIOwvk41KvGBhC0U3WLDfYGzc8l5YED5sSxrQQ78pg3GUl_Aj62b9akJ6-1f_gGVOc9LkdCzIYOEQTimXexrZ1Tb2vFnm7KVe8FDNiyd1rL_aJ5riHl7I8fu0BeNpkTKC79Rypww_UVsiOoKMaMYdAxh87YwsNuUMBo0aJejZPwdQIbMnm5jh-_KJbR2UMPWhMIHK9xdGm1QjRb')`,
              }}
            ></div>
            <div className="absolute inset-0 bg-surface-dim/40 group-hover:bg-transparent transition-colors duration-500"></div>
            <div className="absolute bottom-8 left-8 relative z-10">
              <h3 className="font-headline-lg text-2xl text-white font-bold">Bio-Digital Synchronization</h3>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-16 bg-surface-container-lowest/30 border-t border-white/10 backdrop-blur-md z-10">
        <div className="max-w-container-max mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-tertiary-fixed-dim">
          <span>© 2026 TerraMind AI • Planetary Vitals: STABLE</span>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span> Connectivity: 99.9%
            </span>
            <span>Latency: 12ms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
