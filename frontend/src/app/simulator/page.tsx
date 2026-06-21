'use client';

import React, { useState } from 'react';
import DashboardShell from '../components/DashboardShell';

interface SimulationResult {
  year: number;
  baseline_co2: number;
  scenario_co2: number;
  reduction_percent: number;
  temperature_delta: number;
}

export default function SimulatorPage() {
  const [baselineEmissions, setBaselineEmissions] = useState(4.2);
  const [renewableAdoption, setRenewableAdoption] = useState(30);
  const [evAdoption, setEvAdoption] = useState(20);
  const [dietShift, setDietShift] = useState(0); // 0=none, 25=partial, 50=vegetarian, 75=vegan
  const [reforestation, setReforestation] = useState(10);
  const [years, setYears] = useState(30);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [simulating, setSimulating] = useState(false);

  const runSimulation = () => {
    setSimulating(true);
    setTimeout(() => {
      const simResults: SimulationResult[] = [];
      let currentBaseline = baselineEmissions;
      let currentScenario = baselineEmissions;

      for (let y = 1; y <= years; y++) {
        // Baseline grows at 1.5% per year
        currentBaseline *= 1.015;

        // Scenario factors reduce emissions
        const renewableReduction = (renewableAdoption / 100) * 0.35 * currentScenario;
        const evReduction = (evAdoption / 100) * 0.25 * currentScenario;
        const dietReduction = (dietShift / 100) * 0.20 * currentScenario;
        const forestReduction = (reforestation / 100) * 0.10 * currentScenario;

        currentScenario = currentScenario - (renewableReduction + evReduction + dietReduction + forestReduction) / years;
        currentScenario = Math.max(0.2, currentScenario); // Floor

        const reductionPct = ((currentBaseline - currentScenario) / currentBaseline) * 100;
        // Simplified temperature model: each 100 Gt reduction = 0.1°C less warming
        const tempDelta = 1.5 - (reductionPct / 100) * 1.5;

        simResults.push({
          year: new Date().getFullYear() + y,
          baseline_co2: parseFloat(currentBaseline.toFixed(3)),
          scenario_co2: parseFloat(currentScenario.toFixed(3)),
          reduction_percent: parseFloat(reductionPct.toFixed(1)),
          temperature_delta: parseFloat(Math.max(0.2, tempDelta).toFixed(2)),
        });
      }

      setResults(simResults);
      setSimulating(false);
    }, 1200);
  };

  const lastResult = results[results.length - 1];
  const midResult = results[Math.floor(results.length / 2)];

  return (
    <DashboardShell>
      <div className="flex-grow flex flex-col gap-6">
        {/* Header */}
        <header className="mb-2">
          <h1 className="font-display-xl text-3xl font-bold text-primary mb-2">Future Carbon Simulator</h1>
          <p className="text-on-surface-variant text-sm max-w-2xl">
            Project your personal and systemic carbon trajectory across configurable planetary transformation scenarios. Adjust intervention levers and forecast climate equilibrium dates.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-4 glass-card rounded-3xl p-6 border border-white/10 flex flex-col gap-6">
            <h2 className="font-label-caps text-xs text-secondary uppercase tracking-widest font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">tune</span>
              Scenario Parameters
            </h2>

            <div className="space-y-5">
              {/* Baseline */}
              <div>
                <div className="flex justify-between mb-2 font-mono text-[10px] text-on-surface-variant uppercase">
                  <span>Baseline Emissions (tons/yr)</span>
                  <span className="text-white font-bold">{baselineEmissions.toFixed(1)}</span>
                </div>
                <input
                  type="range" min="1" max="20" step="0.1"
                  value={baselineEmissions}
                  onChange={(e) => setBaselineEmissions(Number(e.target.value))}
                  className="w-full accent-primary-container h-1.5 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              {/* Renewable Energy */}
              <div>
                <div className="flex justify-between mb-2 font-mono text-[10px] text-on-surface-variant uppercase">
                  <span>Renewable Energy Adoption</span>
                  <span className="text-primary-container font-bold">{renewableAdoption}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={renewableAdoption}
                  onChange={(e) => setRenewableAdoption(Number(e.target.value))}
                  className="w-full accent-primary-container h-1.5 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              {/* EV Adoption */}
              <div>
                <div className="flex justify-between mb-2 font-mono text-[10px] text-on-surface-variant uppercase">
                  <span>EV Fleet Adoption</span>
                  <span className="text-secondary-fixed font-bold">{evAdoption}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={evAdoption}
                  onChange={(e) => setEvAdoption(Number(e.target.value))}
                  className="w-full accent-secondary-container h-1.5 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              {/* Diet Shift */}
              <div>
                <div className="flex justify-between mb-2 font-mono text-[10px] text-on-surface-variant uppercase">
                  <span>Dietary Transition (Plant-Based)</span>
                  <span className="text-tertiary-fixed font-bold">{dietShift}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={dietShift}
                  onChange={(e) => setDietShift(Number(e.target.value))}
                  className="w-full accent-tertiary-container h-1.5 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              {/* Reforestation */}
              <div>
                <div className="flex justify-between mb-2 font-mono text-[10px] text-on-surface-variant uppercase">
                  <span>Reforestation Coverage</span>
                  <span className="text-primary-container font-bold">{reforestation}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={reforestation}
                  onChange={(e) => setReforestation(Number(e.target.value))}
                  className="w-full accent-primary-container h-1.5 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              {/* Simulation Horizon */}
              <div>
                <div className="flex justify-between mb-2 font-mono text-[10px] text-on-surface-variant uppercase">
                  <span>Projection Horizon</span>
                  <span className="text-white font-bold">{years} years</span>
                </div>
                <input
                  type="range" min="5" max="50" step="5"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-primary-container h-1.5 bg-white/10 rounded-full cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={runSimulation}
              disabled={simulating}
              className="mt-auto w-full py-3 bg-primary-container text-on-primary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {simulating ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">eco</span>
                  Simulating Trajectory...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Run Projection
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {results.length > 0 ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: `${years}-Year Emissions`, 
                      value: `${lastResult.scenario_co2.toFixed(2)} tons`, 
                      subtext: `Baseline: ${lastResult.baseline_co2.toFixed(2)} tons`,
                      color: 'text-primary-container'
                    },
                    {
                      label: 'Total CO2 Reduction', 
                      value: `${lastResult.reduction_percent.toFixed(1)}%`, 
                      subtext: 'vs. business-as-usual',
                      color: 'text-secondary-fixed'
                    },
                    {
                      label: 'Temperature Delta', 
                      value: `+${lastResult.temperature_delta.toFixed(2)}°C`, 
                      subtext: 'projected warming',
                      color: lastResult.temperature_delta < 1.5 ? 'text-primary-container' : 'text-error'
                    },
                  ].map((card) => (
                    <div key={card.label} className="glass-card p-4 rounded-2xl border border-white/10">
                      <div className="font-mono text-[9px] text-on-surface-variant/60 uppercase mb-1">{card.label}</div>
                      <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                      <div className="font-mono text-[9px] text-on-surface-variant/40 mt-0.5">{card.subtext}</div>
                    </div>
                  ))}
                </div>

                {/* Visual Chart */}
                <div className="glass-card p-6 rounded-3xl border border-white/10 flex-grow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-label-caps text-xs font-bold uppercase tracking-widest text-white">
                      Emission Trajectory Projection
                    </h3>
                    <div className="flex items-center gap-4 text-[9px] font-mono">
                      <span className="flex items-center gap-1"><span className="w-3 h-1 bg-error inline-block rounded-full"></span> Baseline</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-1 bg-primary-container inline-block rounded-full"></span> Scenario</span>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="relative h-48 flex items-end gap-1 mt-4">
                    {results.filter((_, i) => i % Math.ceil(results.length / 20) === 0).map((r) => (
                      <div key={r.year} className="flex-1 flex flex-col items-center gap-0.5">
                        {/* Stacked bars */}
                        <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '160px', justifyContent: 'flex-end' }}>
                          <div
                            className="w-full bg-primary-container/70 rounded-t-sm shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                            style={{ height: `${Math.min(100, (r.scenario_co2 / 20) * 100)}%` }}
                          ></div>
                          <div
                            className="w-full bg-error/30 rounded-t-sm"
                            style={{ height: `${Math.max(0, ((r.baseline_co2 - r.scenario_co2) / 20) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="font-mono text-[7px] text-on-surface-variant/30 rotate-45 mt-1">{r.year}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Table */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                  <div className="p-4 bg-white/5 border-b border-white/5">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                      Decadal Projection Milestones
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-white/2 font-mono text-on-surface-variant/50 border-b border-white/5">
                        <tr>
                          <th className="px-5 py-3 text-left uppercase tracking-wider">Year</th>
                          <th className="px-5 py-3 text-right uppercase tracking-wider">Baseline</th>
                          <th className="px-5 py-3 text-right uppercase tracking-wider">Scenario</th>
                          <th className="px-5 py-3 text-right uppercase tracking-wider">Reduction</th>
                          <th className="px-5 py-3 text-right uppercase tracking-wider">Temp Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {[results[4], results[9], results[14], results[19], results[results.length - 1]]
                          .filter(Boolean)
                          .map((r) => (
                            <tr key={r.year} className="hover:bg-white/5 transition-colors">
                              <td className="px-5 py-3 font-bold text-white">{r.year}</td>
                              <td className="px-5 py-3 text-right text-error">{r.baseline_co2.toFixed(2)} t</td>
                              <td className="px-5 py-3 text-right text-primary-container font-bold">{r.scenario_co2.toFixed(2)} t</td>
                              <td className="px-5 py-3 text-right text-secondary-fixed font-bold">{r.reduction_percent.toFixed(1)}%</td>
                              <td className={`px-5 py-3 text-right font-bold ${r.temperature_delta < 1.5 ? 'text-primary-container' : 'text-error'}`}>
                                +{r.temperature_delta.toFixed(2)}°C
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-3xl border border-white/10 flex-grow flex flex-col items-center justify-center gap-6 py-16 text-center min-h-[400px]">
                <span className="material-symbols-outlined text-on-surface-variant/20 text-7xl">timeline</span>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Configure Parameters & Run Simulation</h3>
                  <p className="text-xs text-on-surface-variant/50 max-w-sm">
                    Adjust the intervention levers on the left panel, then click "Run Projection" to generate your climate scenario trajectory.
                  </p>
                </div>
                <button
                  onClick={runSimulation}
                  className="px-6 py-3 bg-primary-container text-on-primary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  Launch Default Simulation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
