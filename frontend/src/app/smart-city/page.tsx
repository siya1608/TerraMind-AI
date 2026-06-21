'use client';

import React, { useState, useEffect } from 'react';
import { useApp, CityStat } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

export default function SmartCityPage() {
  const { fetchSmartCityStats } = useApp();
  const [cities, setCities] = useState<CityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchSmartCityStats();
      setCities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter((c) =>
    c.city_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="flex-grow flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h1 className="font-display-xl text-3xl font-bold text-primary mb-2">Smart City Dashboard</h1>
            <p className="text-on-surface-variant text-sm max-w-xl">
              Real-time monitoring of planetary metropolitan clusters. Sync and analyze grid transitions, particulate matter tracking, and renewable power ratios.
            </p>
          </div>
          
          {/* Search bar */}
          <div className="w-full md:w-64 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search metropolitan vectors..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-all font-mono"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex-grow flex items-center justify-center min-h-[300px]">
            <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">eco</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => {
              // AQI Status
              const aqi = city.air_quality_index;
              const aqiColor = aqi < 50 ? 'text-primary-container' : aqi < 100 ? 'text-secondary-fixed' : 'text-error';
              const aqiStatus = aqi < 50 ? 'Healthy' : aqi < 100 ? 'Moderate' : 'Unhealthy';

              return (
                <div 
                  key={city.city_name}
                  className="glass-card p-6 rounded-3xl border border-white/10 hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-headline-lg text-lg text-white font-bold">{city.city_name}</h3>
                      <span className="text-[10px] font-mono text-on-surface-variant/50 uppercase">
                        Global Ranking: #{city.sustainability_ranking || 'N/A'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-2xl">location_city</span>
                  </div>

                  {/* Meters Grid */}
                  <div className="space-y-4 pt-2">
                    {/* Air Quality Index */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                        <span className="text-on-surface-variant/70 uppercase text-[9px]">Air Quality Index (AQI)</span>
                        <span className={`font-bold ${aqiColor}`}>{aqi} ({aqiStatus})</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            aqi < 50 ? 'bg-primary-container shadow-[0_0_8px_#10b981]' : aqi < 100 ? 'bg-secondary-fixed shadow-[0_0_8px_#47d6ff]' : 'bg-error'
                          }`}
                          style={{ width: `${Math.min(100, (aqi / 150) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Renewable Energy Usage */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                        <span className="text-on-surface-variant/70 uppercase text-[9px]">Renewable Grid Share</span>
                        <span className="text-white font-bold">{city.renewable_energy_usage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-container rounded-full shadow-[0_0_8px_#10b981] transition-all duration-1000"
                          style={{ width: `${city.renewable_energy_usage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Carbon Concentration Level */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-on-surface-variant/70 uppercase text-[9px]">Particulate Pollution (PM2.5)</span>
                        <span className="text-white font-bold">{city.pollution_level.toFixed(1)} µg/m³</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
