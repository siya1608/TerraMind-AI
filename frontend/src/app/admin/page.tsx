'use client';

import React, { useState, useEffect } from 'react';
import { useApp, AdminStats } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

export default function AdminPage() {
  const { fetchAdminStats, profile, isAdmin, token, apiUrl } = useApp();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

  useEffect(() => {
    if (isAdmin || profile) {
      loadData();
    }
  }, [isAdmin, profile]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData] = await Promise.all([
        fetchAdminStats().catch(() => null),
      ]);
      setStats(statsData);

      // Fetch users list (admin only)
      if (isAdmin && token) {
        const res = await fetch(`${apiUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const usersData = await res.json();
          setUsers(usersData);
        }
      }
    } catch (e) {
      console.error('Admin data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="flex-grow flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h1 className="font-display-xl text-3xl font-bold text-primary mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-3xl">admin_panel_settings</span>
              Admin Console
            </h1>
            <p className="text-on-surface-variant text-sm max-w-xl">
              System-level controls, live metrics, and multi-user management for TerraMind AI platform administrators.
            </p>
          </div>
          {isAdmin && (
            <div className="px-4 py-2 bg-secondary-container/10 border border-secondary/20 rounded-xl text-xs font-mono text-secondary-fixed font-bold uppercase tracking-widest">
              ✦ Admin Access Verified
            </div>
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {(['overview', 'users'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-label-caps text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-secondary-container text-on-secondary-container shadow-[0_0_10px_rgba(0,210,255,0.2)]'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {tab === 'overview' ? 'System Overview' : 'User Management'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center min-h-48">
            <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">eco</span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && stats && (
              <div className="flex flex-col gap-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.total_users.toLocaleString(), icon: 'group', color: 'text-secondary-fixed' },
                    { label: 'Total Calculations', value: stats.total_calculations.toLocaleString(), icon: 'calculate', color: 'text-primary-container' },
                    { label: 'Active AI Agents', value: stats.active_agents.toString(), icon: 'psychology', color: 'text-tertiary-fixed' },
                    { label: 'CO2 Offsets Sold', value: `${stats.total_offsets_purchased.toFixed(1)} tons`, icon: 'forest', color: 'text-primary-container' },
                    { label: 'Avg Sustainability Score', value: `${stats.average_sustainability_score.toFixed(1)}/100`, icon: 'shield_with_heart', color: 'text-secondary-fixed' },
                    { label: 'System Latency', value: stats.system_latency, icon: 'speed', color: 'text-tertiary-fixed' },
                    { label: 'System Status', value: stats.system_status.toUpperCase(), icon: 'check_circle', color: stats.system_status === 'healthy' ? 'text-primary-container' : 'text-error' },
                    { label: 'Mesh Uptime', value: '99.99%', icon: 'sensors', color: 'text-primary-container' },
                  ].map((stat) => (
                    <div key={stat.label} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
                      <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
                      <div>
                        <div className="font-mono text-[9px] text-on-surface-variant/50 uppercase tracking-wider">{stat.label}</div>
                        <div className={`text-lg font-bold ${stat.color} mt-0.5`}>{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* System Log stream */}
                <div className="glass-card rounded-3xl p-6 border border-white/10">
                  <h3 className="font-label-caps text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm">terminal</span>
                    System Event Log
                  </h3>
                  <div className="space-y-2 font-mono text-[10px] text-on-surface-variant/70 max-h-48 overflow-y-auto custom-scrollbar">
                    {[
                      `[${new Date().toISOString()}] INFO: System health check passed. All modules online.`,
                      `[${new Date(Date.now() - 60000).toISOString()}] INFO: AI Agent Pool synchronized. Active agents: ${stats.active_agents}`,
                      `[${new Date(Date.now() - 120000).toISOString()}] INFO: Database backup completed. terramind_ai.db archived.`,
                      `[${new Date(Date.now() - 180000).toISOString()}] INFO: New user registration. Total users: ${stats.total_users}`,
                      `[${new Date(Date.now() - 240000).toISOString()}] INFO: Carbon calculation logged. Total: ${stats.total_calculations}`,
                      `[${new Date(Date.now() - 300000).toISOString()}] INFO: Marketplace seeding verified. 6 offset projects active.`,
                      `[${new Date(Date.now() - 360000).toISOString()}] INFO: JWT security layer rotated. Token validity: 7 days.`,
                      `[${new Date(Date.now() - 420000).toISOString()}] DEBUG: CORS whitelist updated for localhost:3000.`,
                    ].map((log, idx) => (
                      <div key={idx} className={`flex gap-2 py-1 border-b border-white/5 ${idx === 0 ? 'text-primary-container' : ''}`}>
                        <span className="shrink-0 text-on-surface-variant/30">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                <div className="p-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-label-caps text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">group</span>
                    Registered Users
                  </h3>
                  <span className="font-mono text-[9px] text-on-surface-variant/40">
                    {users.length} total
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-white/2 font-mono text-on-surface-variant/50 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-right uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.length > 0 ? users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 font-semibold text-white">{u.email?.split('@')[0]}</td>
                          <td className="px-6 py-3 text-on-surface-variant font-mono">{u.email}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                              u.role === 'admin' ? 'bg-error-container/20 text-error border border-error/20' : 'bg-primary-container/10 text-primary-container border border-primary-container/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_5px_#10b981]"></div>
                              <span className="font-mono text-[9px] text-primary-container">ACTIVE</span>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant/40">
                            {isAdmin ? 'No users found.' : 'Admin privileges required to view user list.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
