'use client';

import React, { useState, useEffect } from 'react';
import { useApp, CountryStat } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

export default function ClimateMapPage() {
  const { fetchClimateMapStats } = useApp();
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryStat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClimateMapStats().then((data) => {
      setCountries(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredCountries = countries
    .filter((c) => c.country_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.emissions_tons - a.emissions_tons);

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-primary-container';
    if (score < 60) return 'text-secondary-fixed';
    return 'text-error';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <DashboardShell>
      <div className="flex-grow flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h1 className="font-display-xl text-3xl font-bold text-primary mb-2">Climate Intelligence Map</h1>
            <p className="text-on-surface-variant text-sm max-w-xl">
              Planetary emissions monitoring and climate risk scoring across all global vectors. Real-time analysis from integrated atmospheric sensors and satellite feeds.
            </p>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country vector..."
            className="w-full md:w-60 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-all font-mono"
          />
        </header>

        {/* Two-column layout: Table + Detail Card */}
        <div className="flex flex-col lg:flex-row gap-6 flex-grow">
          {/* Country Emissions Table */}
          <div className="flex-[2] glass-card rounded-3xl overflow-hidden border border-white/10 flex flex-col">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-lg">public</span>
              <h2 className="font-label-caps text-xs text-white uppercase tracking-widest font-bold">
                Global Emissions Rankings
              </h2>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">eco</span>
                </div>
              ) : (
                filteredCountries.map((country, idx) => (
                  <button
                    key={country.country_code}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full flex items-center px-5 py-4 border-b border-white/5 text-left transition-all cursor-pointer hover:bg-white/5 ${
                      selectedCountry?.country_code === country.country_code ? 'bg-primary-container/10 border-l-2 border-l-primary-container' : ''
                    }`}
                  >
                    <span className="font-mono text-[10px] text-on-surface-variant/40 w-8 shrink-0">#{idx + 1}</span>
                    <div className="flex-grow">
                      <div className="text-sm text-white font-semibold">{country.country_name}</div>
                      <div className="text-[9px] font-mono text-on-surface-variant/50 uppercase mt-0.5">{country.country_code}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-white font-bold">{country.emissions_tons.toFixed(1)}Gt CO2</div>
                      <div className={`text-[9px] font-mono ${getRiskColor(country.climate_risk_score)}`}>
                        {getRiskLabel(country.climate_risk_score)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Country Detail Panel */}
          <div className="flex-1 glass-card rounded-3xl border border-white/10 p-6 flex flex-col min-h-[400px]">
            {selectedCountry ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-display-xl text-2xl font-bold text-white">{selectedCountry.country_name}</h3>
                    <span className="font-mono text-[10px] text-on-surface-variant/50 uppercase">{selectedCountry.country_code} • Rank #{selectedCountry.sustainability_rank || 'N/A'}</span>
                  </div>
                  <span className="material-symbols-outlined text-primary-container text-3xl">travel_explore</span>
                </div>

                <div className="space-y-6 flex-grow">
                  {/* Total Emissions */}
                  <div>
                    <div className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-wider mb-2">Annual CO2 Emissions</div>
                    <div className="font-display-xl text-3xl font-bold text-white">
                      {selectedCountry.emissions_tons.toFixed(2)}<span className="text-sm font-normal text-on-surface-variant ml-2">Gt CO2e</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-error rounded-full"
                        style={{ width: `${Math.min(100, (selectedCountry.emissions_tons / 40000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Climate Risk Score */}
                  <div>
                    <div className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-wider mb-2">Climate Vulnerability Score</div>
                    <div className={`font-display-xl text-3xl font-bold ${getRiskColor(selectedCountry.climate_risk_score)}`}>
                      {selectedCountry.climate_risk_score.toFixed(1)}<span className="text-sm font-normal text-on-surface-variant ml-2">/ 100</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${selectedCountry.climate_risk_score < 30 ? 'bg-primary-container shadow-[0_0_8px_#10b981]' : selectedCountry.climate_risk_score < 60 ? 'bg-secondary-fixed shadow-[0_0_8px_#47d6ff]' : 'bg-error'}`}
                        style={{ width: `${selectedCountry.climate_risk_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`p-4 rounded-2xl border ${
                    selectedCountry.climate_risk_score < 30
                      ? 'bg-primary-container/10 border-primary-container/20'
                      : selectedCountry.climate_risk_score < 60
                      ? 'bg-secondary-container/10 border-secondary/20'
                      : 'bg-error-container/10 border-error-container/30'
                  }`}>
                    <span className={`font-mono text-[10px] uppercase font-bold tracking-widest block ${getRiskColor(selectedCountry.climate_risk_score)}`}>
                      Status: {getRiskLabel(selectedCountry.climate_risk_score)}
                    </span>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {selectedCountry.climate_risk_score < 30
                        ? 'This nation has effective climate adaptation strategies and maintains lower vulnerability levels.'
                        : selectedCountry.climate_risk_score < 60
                        ? 'Moderate exposure to climate hazards. Proactive policies recommended.'
                        : 'High vulnerability. Immediate intervention and climate resilience measures required.'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant/20 text-6xl">travel_explore</span>
                <div>
                  <div className="text-sm text-on-surface-variant/50">Select a country to view climate intelligence data</div>
                  <div className="font-mono text-[10px] text-on-surface-variant/30 mt-1">Global climate scan active</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Countries Monitored', value: countries.length.toString(), icon: 'public', color: 'text-secondary-fixed' },
            { label: 'Global CO2', value: '421.5 ppm', icon: 'cloud', color: 'text-error' },
            { label: 'High Risk Nations', value: countries.filter(c => c.climate_risk_score >= 60).length.toString(), icon: 'warning', color: 'text-error' },
            { label: 'Avg Vulnerability', value: countries.length > 0 ? `${(countries.reduce((a, b) => a + b.climate_risk_score, 0) / countries.length).toFixed(0)}/100` : 'N/A', icon: 'sensors', color: 'text-primary-container' }
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
              <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
              <div>
                <div className="font-mono text-[9px] text-on-surface-variant/50 uppercase">{stat.label}</div>
                <div className="text-base font-bold text-white">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
