'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

export default function ReportsPage() {
  const { calculations, triggerReportDownload, profile, token, apiUrl } = useApp();
  const [downloading, setDownloading] = useState<'pdf' | 'csv' | null>(null);

  const handleDownload = async (format: 'pdf' | 'csv') => {
    setDownloading(format);
    try {
      await triggerReportDownload(format);
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(null);
    }
  };

  const latest = calculations[0] ?? null;
  const avg = calculations.length > 0
    ? calculations.reduce((a, c) => a + c.total_co2, 0) / calculations.length
    : 0;

  return (
    <DashboardShell>
      <div className="flex-grow flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h1 className="font-display-xl text-3xl font-bold text-primary mb-2">Reports & Analytics</h1>
            <p className="text-on-surface-variant text-sm max-w-xl">
              Export your full carbon audit history, AI coaching transcripts, and sustainability performance data in multiple formats.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleDownload('csv')}
              disabled={!!downloading || !token}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {downloading === 'csv' ? (
                <span className="material-symbols-outlined text-sm animate-spin">eco</span>
              ) : (
                <span className="material-symbols-outlined text-sm">download</span>
              )}
              Export CSV
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={!!downloading || !token}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {downloading === 'pdf' ? (
                <span className="material-symbols-outlined text-sm animate-spin">eco</span>
              ) : (
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              )}
              Export PDF
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Calculations', value: calculations.length.toString(), icon: 'calculate', color: 'text-primary-container' },
            { label: 'Avg Monthly CO2', value: `${avg.toFixed(1)} kg`, icon: 'cloud', color: 'text-error' },
            { label: 'Latest Score', value: latest ? `${latest.sustainability_score}/100` : 'N/A', icon: 'shield_with_heart', color: 'text-secondary-fixed' },
            { label: 'Impact Rating', value: latest?.environmental_impact_rating || 'N/A', icon: 'eco', color: 'text-tertiary-fixed' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
              <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
              <div>
                <div className="font-mono text-[9px] text-on-surface-variant/50 uppercase tracking-wider">{stat.label}</div>
                <div className={`text-xl font-bold ${stat.color} mt-0.5`}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Calculations History Table */}
        <div className="glass-card rounded-3xl overflow-hidden border border-white/10 flex-grow">
          <div className="p-5 bg-white/5 border-b border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">history</span>
            <h2 className="font-label-caps text-xs font-bold uppercase tracking-widest text-white">Carbon Footprint Audit History</h2>
          </div>
          {calculations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-white/2 font-mono text-on-surface-variant/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right uppercase tracking-wider">Transport</th>
                    <th className="px-6 py-3 text-right uppercase tracking-wider">Energy</th>
                    <th className="px-6 py-3 text-right uppercase tracking-wider">Food</th>
                    <th className="px-6 py-3 text-right uppercase tracking-wider">Total CO2</th>
                    <th className="px-6 py-3 text-right uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-right uppercase tracking-wider">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {calculations.map((calc) => {
                    const ratingColor =
                      calc.environmental_impact_rating === 'Excellent' ? 'text-primary-container' :
                      calc.environmental_impact_rating === 'Good' ? 'text-secondary-fixed' :
                      calc.environmental_impact_rating === 'Average' ? 'text-tertiary-fixed' : 'text-error';
                    return (
                      <tr key={calc.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3 text-white">
                          {new Date(calc.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-3 text-right text-on-surface-variant">{calc.transport_emissions.toFixed(1)} kg</td>
                        <td className="px-6 py-3 text-right text-on-surface-variant">{calc.energy_emissions.toFixed(1)} kg</td>
                        <td className="px-6 py-3 text-right text-on-surface-variant">{calc.food_emissions.toFixed(1)} kg</td>
                        <td className="px-6 py-3 text-right font-bold text-white">{calc.total_co2.toFixed(1)} kg</td>
                        <td className="px-6 py-3 text-right font-bold text-secondary-fixed">{calc.sustainability_score}/100</td>
                        <td className={`px-6 py-3 text-right font-bold ${ratingColor}`}>
                          {calc.environmental_impact_rating}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <span className="material-symbols-outlined text-on-surface-variant/20 text-6xl">bar_chart</span>
              <div>
                <div className="text-sm text-on-surface-variant/50">No calculations recorded yet.</div>
                <div className="text-xs text-on-surface-variant/30 mt-1">Complete your first carbon footprint calculation to populate this report.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
