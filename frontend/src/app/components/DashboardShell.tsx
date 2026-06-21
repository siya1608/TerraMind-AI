'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import BackgroundShaders from './BackgroundShaders';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { profile, isLoggedIn, loading, logout, triggerReportDownload } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const handleDownloadReport = async (format: 'pdf' | 'csv') => {
    try {
      setReportLoading(true);
      await triggerReportDownload(format);
    } catch (e) {
      alert('Failed to export report. Please complete a calculation first.');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <BackgroundShaders />
        <div className="glass-card p-10 rounded-3xl flex flex-col items-center gap-6 border-primary/20">
          <div className="w-16 h-16 rounded-full border-4 border-dashed border-primary-container flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-primary-container text-2xl">eco</span>
          </div>
          <div className="font-data-mono text-sm text-primary tracking-widest animate-pulse">
            LOADING PLATFORM MODULES...
          </div>
        </div>
      </div>
    );
  }

  // Redirect to Auth page if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <BackgroundShaders />
        <div className="glass-card max-w-md w-full p-8 rounded-3xl text-center border-l-4 border-l-primary-container">
          <span className="material-symbols-outlined text-primary-container text-6xl mb-4 animate-pulse">lock</span>
          <h2 className="text-3xl font-display-xl text-white mb-2">Access Restrained</h2>
          <p className="text-on-surface-variant mb-6 text-sm">
            Please authenticate to access TerraMind AI Planetary Command Center.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/auth')}
              className="py-3 px-6 bg-primary-container text-on-primary-container font-label-caps text-xs tracking-wider rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              LOG IN / REGISTER
            </button>
            <button
              onClick={() => router.push('/')}
              className="py-3 px-6 border border-white/10 hover:bg-white/5 font-label-caps text-xs text-white rounded-xl transition-all cursor-pointer"
            >
              RETURN TO VITAL MAP
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Multi-Agent', path: '/agents' },
    { name: 'Coach Chat', path: '/coach' },
    { name: 'Calculator', path: '/calculator' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Reports', path: '/reports' },
  ];

  const sidebarLinks = [
    { name: 'Smart City', path: '/smart-city', icon: 'location_city' },
    { name: 'Climate Map', path: '/map', icon: 'public' },
    { name: 'Carbon Simulator', path: '/simulator', icon: 'timeline' },
    { name: 'Eco Challenges', path: '/gamification', icon: 'workspace_premium' },
    { name: 'Analytics', path: '/reports', icon: 'bar_chart' },
    { name: 'Diagnostics', path: '/admin', icon: 'admin_panel_settings', adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface relative font-sans flex flex-col overflow-hidden">
      {/* GL shader backdrop */}
      <BackgroundShaders />

      {/* Atmospheric lighting blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-container/5 blur-[120px] rounded-full animate-pulse-glow"></div>
        <div className="absolute bottom-[-5%] left-[5%] w-[400px] h-[400px] bg-secondary-container/5 blur-[100px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 max-w-container-max mx-auto mt-4 px-6 py-3 bg-surface/60 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.05)] flex justify-between items-center md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="font-display-xl text-lg font-bold tracking-tighter text-white">TerraMind AI</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-8">
            {navLinks.map((link) => {
              const active = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`font-body-md text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    active
                      ? 'text-primary-container border-b-2 border-primary-container pb-1'
                      : 'text-on-surface-variant hover:text-primary-fixed-dim'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* XP & Level Summary in Header */}
          {profile && (
            <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs">
              <span className="text-primary-container font-bold">{profile.current_level}</span>
              <span className="text-on-surface-variant/40">|</span>
              <span className="text-secondary font-semibold">{profile.xp} XP</span>
              <span className="text-on-surface-variant/40">|</span>
              <span className="text-orange-400 font-bold">🔥 {profile.streak} Days</span>
            </div>
          )}

          <Link href="/admin" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-transform hover:scale-105">
            settings
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full border border-primary/20 bg-surface-container overflow-hidden hover:border-primary-container transition-all"
            >
              <img
                className="w-full h-full object-cover"
                src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7g-RhrkZEKPYDJppythYM4MCto2-IVmhUK3U1m5_xsKSCgMtAsQsq5ImEWCRXZAdEpVFtNwnJsPfOZCxU-KG0zcSCwdw3aOo8X7G49Ycw7ioeGm35f-cK6jkmnJ0A9MA5zA8zjmWmm9r1pN2bmGwj8V1qPKYYtbOdXV1jjGgcy7qhZmherHAIpDiQqWDmiJzWwygaSHhGjFeqS3QeCaCfaftKr1IbfsekukbYfB8zsr7nZowiCIlG'}
                alt={profile?.full_name || 'User Profile'}
              />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 glass-card rounded-2xl p-4 border border-white/15 shadow-2xl z-50">
                <div className="font-semibold text-white mb-0.5 truncate text-sm">
                  {profile?.full_name}
                </div>
                <div className="text-xs text-on-surface-variant/70 truncate mb-3">
                  {profile?.email}
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 text-xs text-secondary-fixed hover:text-white py-2"
                  >
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left flex items-center gap-2 text-xs text-error hover:text-white py-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Side Navigation Sidebar */}
      <aside className="fixed left-0 top-24 bottom-24 w-16 hover:w-64 z-40 flex flex-col p-3 transition-all duration-300 bg-surface-container-low/40 backdrop-blur-2xl rounded-xl ml-6 border-r border-white/5 shadow-xl group overflow-hidden">
        <div className="flex flex-col gap-6 flex-grow">
          {/* Active indicator */}
          <div className="flex items-center gap-4 px-1.5 py-3 mb-2 border-b border-white/5 overflow-hidden">
            <div className="min-w-[36px] flex justify-center">
              <span className="material-symbols-outlined text-secondary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <div className="font-label-caps text-[10px] text-secondary tracking-wider uppercase font-semibold">Mesh Core Active</div>
              <div className="text-[9px] text-primary-container font-mono">LATENCY: 12ms</div>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {sidebarLinks
              .filter(link => !link.adminOnly || profile?.role === 'admin')
              .map((link) => {
                const active = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`flex items-center gap-4 p-2.5 rounded-xl transition-all duration-300 group/item ${
                      active
                        ? 'text-primary-fixed-dim bg-primary-container/10 border border-primary-container/20'
                        : 'text-on-surface-variant/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined min-w-[24px] text-xl">{link.icon}</span>
                    <span className="font-label-caps text-[10px] opacity-0 group-hover:opacity-100 uppercase tracking-widest font-semibold transition-opacity whitespace-nowrap">
                      {link.name}
                    </span>
                  </Link>
                );
              })}
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
          {/* Quick Stats */}
          <div className="opacity-0 group-hover:opacity-80 transition-opacity px-2 mb-4 font-mono text-[9px] text-on-surface-variant/60">
            <div>GRID_SYNC: 100%</div>
            <div>SHIELD: SECURE</div>
          </div>
        </div>
      </aside>

      {/* Main Content Layout */}
      <main className="flex-1 ml-28 mr-6 pt-24 pb-24 min-h-screen relative z-10 flex flex-col">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 py-2 bg-surface-container-lowest/30 backdrop-blur-md border-t border-white/10 font-mono text-[10px] text-tertiary-fixed-dim">
        <span className="opacity-50">© 2026 TerraMind AI • Planetary Vitals: SECURED</span>
        <div className="flex gap-6">
          <span className="hover:text-tertiary transition-opacity cursor-default hidden sm:inline">Uptime: 99.99%</span>
          <span className="hover:text-tertiary transition-opacity cursor-default flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            Agent Coordination: Enabled
          </span>
        </div>
      </footer>

      {/* Floating Action Button: Generate Report */}
      <div className="fixed bottom-16 right-8 z-[60] flex flex-col items-end gap-2 group/fab">
        <div className="hidden group-hover/fab:flex flex-col gap-2 bg-surface-container-highest/90 border border-white/10 backdrop-blur-xl p-3 rounded-2xl mb-1 shadow-2xl transition-all">
          <button
            onClick={() => handleDownloadReport('pdf')}
            disabled={reportLoading}
            className="flex items-center gap-2 text-xs hover:text-primary-container text-white py-1 px-3 w-full rounded hover:bg-white/5 text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Export PDF Report
          </button>
          <button
            onClick={() => handleDownloadReport('csv')}
            disabled={reportLoading}
            className="flex items-center gap-2 text-xs hover:text-secondary-fixed text-white py-1 px-3 w-full rounded hover:bg-white/5 text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">csv</span> Export CSV Data
          </button>
        </div>
        <button
          className="bg-primary-container text-on-primary-container px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs font-label-caps uppercase tracking-wider relative overflow-hidden"
        >
          <span className="material-symbols-outlined">description</span>
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  );
}
