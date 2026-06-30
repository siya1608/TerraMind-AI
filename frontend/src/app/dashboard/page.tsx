'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';
import GlassCard from '../components/GlassCard';

export default function DashboardPage() {
  const { profile, calculations } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'energy' | 'water'>('energy');

  // Use calculations from context or mock fallback
  const latestCalculation = calculations && calculations.length > 0 ? calculations[0] : null;

  // Real or mock values
  const score = latestCalculation ? Math.round(latestCalculation.sustainability_score) : 89;
  const carbonFootprint = latestCalculation
    ? latestCalculation.total_co2.toFixed(2)
    : '4.20';

  const regionalDiff = latestCalculation
    ? (latestCalculation.total_co2 < 4.8 ? '12% lower' : '5% higher')
    : '12% lower';

  const xpPercent = profile ? Math.min(100, (profile.xp % 1000) / 10) : 60;
  const pointsLeft = profile ? 1000 - (profile.xp % 1000) : 1200;

  // Interactive Graph Data
  const energyData = [40, 60, 55, 80, 45, 30, 40, 20, 35, 50, 65, 75];
  const waterData = [65, 50, 45, 60, 75, 80, 55, 40, 30, 45, 55, 60];
  const activeChartData = activeTab === 'energy' ? energyData : waterData;

  return (
    <DashboardShell>
      <div className="flex-1 flex flex-col gap-6">
        {/* Hero Section: Personal Carbon Score */}
        <section className="mb-2">
          <GlassCard glowColor="emerald" className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-l-4 border-l-primary-container relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex-1">
              <h1 className="font-label-caps text-xs text-primary-fixed-dim mb-2 uppercase tracking-widest font-semibold">
                Planetary Footprint Metric
              </h1>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="font-display-xl text-5xl sm:text-7xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {carbonFootprint}
                </span>
                <span className="font-headline-lg text-lg text-on-surface-variant font-medium">
                  tons / CO2e
                </span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant max-w-lg mt-4 leading-relaxed">
                Your personal carbon score is <span className="text-primary-fixed font-bold">{regionalDiff}</span> than the regional average. 
                {latestCalculation 
                  ? ` Your transport contribution is ${latestCalculation.transport_emissions.toFixed(1)}kg CO2.` 
                  : ' Your recent shift to circular consumption has offset approximately 0.5 tons this quarter.'}
              </p>
              
              <div className="flex gap-4 mt-6 flex-wrap">
                <button
                  onClick={() => router.push('/calculator')}
                  className="px-5 py-3 bg-primary-container text-on-primary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
                >
                  Recalculate Vital
                </button>
                <button
                  onClick={() => router.push('/reports')}
                  className="px-5 py-3 border border-white/10 hover:bg-white/5 font-label-caps text-xs text-white rounded-full transition-colors cursor-pointer"
                >
                  Download Report
                </button>
              </div>
            </div>

            {/* Circular Telemetry Visual */}
            <GlassCard className="w-full md:w-[320px] h-[200px] relative flex items-center justify-center p-4 rounded-2xl" tiltEnabled={false}>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-primary-container/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                  <div className="w-18 h-18 rounded-full border-4 border-primary-container flex items-center justify-center animate-[spin_10s_linear_infinite_reverse]">
                    <span className="material-symbols-outlined text-primary-container text-2xl">eco</span>
                  </div>
                </div>
                <div className="mt-4 font-mono text-[10px] text-primary-container/80 tracking-widest">
                  REAL-TIME TELEMETRY ACTIVE
                </div>
              </div>
            </GlassCard>
          </GlassCard>
        </section>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[180px]">
          {/* Sustainability Score */}
          <GlassCard glowColor="emerald" className="md:col-span-1 rounded-2xl p-6 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary-container">shield_with_heart</span>
              <span className="font-mono text-[10px] text-on-surface-variant/50">MTD-01</span>
            </div>
            <div>
              <div className="font-label-caps text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">
                Sustainability Score
              </div>
              <div className="font-headline-lg text-3xl font-bold text-white group-hover:text-primary-fixed transition-colors">
                {score}%
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-primary-container h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          </GlassCard>

          {/* Eco Impact Status */}
          <GlassCard glowColor="cyan" className="md:col-span-1 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[100px] text-secondary">workspace_premium</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary">verified</span>
              <span className="font-mono text-[10px] text-secondary/60 uppercase tracking-widest">
                LVL. {profile?.current_level ? profile.current_level.toUpperCase() : 'EXPLORER'}
              </span>
            </div>
            <div>
              <div className="font-label-caps text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">
                Eco Impact Tier
              </div>
              <div className="font-headline-lg text-2xl font-bold text-white">
                {profile?.current_level || 'Eco Explorer'}
              </div>
              <p className="text-[9px] font-mono text-secondary mt-2">
                Next level: {pointsLeft} points left ({Math.round(xpPercent)}%)
              </p>
            </div>
          </GlassCard>

          {/* Usage Trend Chart */}
          <GlassCard className="md:col-span-2 md:row-span-2 rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="font-headline-lg text-lg text-white font-bold">Usage Trends</div>
                <div className="font-mono text-[10px] text-on-surface-variant">Net consumption index over 12 months</div>
              </div>
              <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => setActiveTab('energy')}
                  className={`px-3 py-1 text-[9px] font-mono rounded-md transition-all cursor-pointer ${
                    activeTab === 'energy' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  ENERGY
                </button>
                <button 
                  onClick={() => setActiveTab('water')}
                  className={`px-3 py-1 text-[9px] font-mono rounded-md transition-all cursor-pointer ${
                    activeTab === 'water' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  WATER
                </button>
              </div>
            </div>

            <div className="flex-grow relative h-[140px] flex items-end justify-between gap-1.5 mt-2">
              {activeChartData.map((val, idx) => (
                <div 
                  key={idx} 
                  className={`w-full rounded-t-sm relative group/bar transition-all duration-500 ${
                    idx === 11 
                      ? 'bg-primary-container/80 hover:bg-primary-container shadow-[0_0_15px_rgba(106,233,8,0.3)]' 
                      : 'bg-primary-container/20 hover:bg-primary-container/40'
                  }`}
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 font-mono text-[9px] text-primary-container bg-surface/90 border border-white/10 px-1 rounded pointer-events-none transition-opacity whitespace-nowrap">
                    {val * 5} index
                  </div>
                  {idx === 11 && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-primary-container font-bold">
                      NOW
                    </div>
                  )}
                </div>
              ))}
              <div className="absolute inset-0 border-b border-white/5 flex flex-col justify-between pointer-events-none -z-10">
                <div className="border-t border-white/5 w-full"></div>
                <div className="border-t border-white/5 w-full"></div>
                <div className="border-t border-white/5 w-full"></div>
              </div>
            </div>
            <div className="flex justify-between mt-6 font-mono text-[9px] text-on-surface-variant/40">
              <span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span>
            </div>
          </GlassCard>

          {/* AI Prediction Card */}
          <GlassCard className="md:col-span-2 rounded-2xl p-6 overflow-hidden relative group flex flex-col justify-between" glowColor="cyan">
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity -z-10">
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCoHCOK7Om7W-csrSTxRX914qISspKA7oGBhQWwYF8QGw_SmvuuzVvEd4Ttqvy_SdhV7gvXdoG7VGCoIcuuMl1Hb1-yMHOObisyBsODCo6WebbnXArOfzPIh0dmistsxnewg9qEE5_j2ki7phIfQn52YibtTeIXC1UuS1lDakF5X5mNMtu5PbRjxJOkcg7HD34ZnKF2ALK_yt5XMBxqjHVANIGI0ZeLpQcUN7p9nxpf27dDaD3R0F3o')" }}
              ></div>
            </div>
            
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary-container text-lg animate-pulse">psychology</span>
                </div>
                <span className="font-label-caps text-[10px] text-primary-container tracking-widest font-bold">
                  AI PREDICTOR ENGINE
                </span>
              </div>
              <h3 className="font-headline-lg text-lg text-white font-bold mb-1">
                Equilibrium reached by Q3 2027
              </h3>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                Based on your current optimization trajectory, planetary neutral balance is projected within 28 months. Maintaining current parameters is essential.
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] font-mono text-primary-container">TRAINING: STABLE</span>
              <span className="material-symbols-outlined text-white/20 text-4xl">query_stats</span>
            </div>
          </GlassCard>
        </div>

        {/* Recent Logs Section */}
        <section className="mt-4">
          <h2 className="font-label-caps text-xs text-on-surface-variant mb-4 flex items-center gap-2 uppercase tracking-widest font-semibold">
            <span className="material-symbols-outlined text-sm">history</span>
            Event Horizon Logs
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-md text-xs">
                <thead className="bg-white/5 font-mono text-on-surface-variant/70 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 uppercase tracking-wider">Vector</th>
                    <th className="px-6 py-4 uppercase tracking-wider">Action / Log Details</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-right">Impact Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {calculations && calculations.length > 0 ? (
                    calculations.slice(0, 5).map((log, idx) => (
                      <tr key={log.id} className="liquid-fill-hover group transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] text-on-surface-variant/60">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${idx % 2 === 0 ? 'bg-primary-container shadow-[0_0_5px_#10b981]' : 'bg-secondary-container shadow-[0_0_5px_#00d2ff]'}`}></span>
                          <span className="text-white font-semibold">Calculated Footprint</span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          Carbon calculations saved. Rating: <span className="text-primary-container font-semibold">{log.environmental_impact_rating}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-primary-container font-mono font-bold">
                          {log.sustainability_score.toFixed(1)}/100
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="liquid-fill-hover group transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] text-on-surface-variant/60">2026.06.20 14:22:01</td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_5px_#10b981]"></span>
                          <span className="text-white font-semibold">Biosphere-7</span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">Automated Reforestation Protocol Alpha</td>
                        <td className="px-6 py-4 text-right text-primary-container font-mono font-bold">+12.4</td>
                      </tr>
                      <tr className="liquid-fill-hover group transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] text-on-surface-variant/60">2026.06.20 13:05:44</td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_5px_#00d2ff]"></span>
                          <span className="text-white font-semibold">Hydrosphere-3</span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">Oceanic Acidification Neutralization</td>
                        <td className="px-6 py-4 text-right text-primary-container font-mono font-bold">+08.1</td>
                      </tr>
                      <tr className="liquid-fill-hover group transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] text-on-surface-variant/60">2026.06.20 09:12:12</td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_5px_#10b981]"></span>
                          <span className="text-white font-semibold">Biosphere-2</span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">Biodiversity Corridor Connectivity established</td>
                        <td className="px-6 py-4 text-right text-primary-container font-mono font-bold">+24.9</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
