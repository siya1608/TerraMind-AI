'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, CalculationResult } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

export default function CalculatorPage() {
  const { calculateCarbon } = useApp();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Form states matching backend schemas
  const [carKm, setCarKm] = useState(120);
  const [bikeKm, setBikeKm] = useState(15);
  const [publicTransportKm, setPublicTransportKm] = useState(50);
  const [flightKm, setFlightKm] = useState(0);

  const [electricityKwh, setElectricityKwh] = useState(180);
  const [lpgKg, setLpgKg] = useState(12);
  const [renewableKwh, setRenewableKwh] = useState(50);

  const [dietType, setDietType] = useState('mixed'); // vegan, vegetarian, mixed, meat_heavy

  const [clothingSpend, setClothingSpend] = useState(50);
  const [electronicsSpend, setElectronicsSpend] = useState(0);
  const [householdSpend, setHouseholdSpend] = useState(80);

  const [disposalKg, setDisposalKg] = useState(15);
  const [recyclingKg, setRecyclingKg] = useState(10);
  const [waterLiters, setWaterLiters] = useState(250);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        transport: {
          car_km: Number(carKm),
          bike_km: Number(bikeKm),
          public_transport_km: Number(publicTransportKm),
          flight_km: Number(flightKm),
        },
        energy: {
          electricity_kwh: Number(electricityKwh),
          lpg_kg: Number(lpgKg),
          renewable_kwh: Number(renewableKwh),
        },
        food: {
          diet_type: dietType,
        },
        shopping: {
          clothing_spend: Number(clothingSpend),
          electronics_spend: Number(electronicsSpend),
          household_spend: Number(householdSpend),
        },
        waste: {
          disposal_kg: Number(disposalKg),
          recycling_kg: Number(recyclingKg),
        },
        water_liters: Number(waterLiters),
      };

      const res = await calculateCarbon(payload);
      setResult(res);
      setStep(5); // Show results step
    } catch (e) {
      alert('Failed to log carbon calculations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <DashboardShell>
      <div className="flex-grow flex flex-col justify-center items-center py-6">
        <div className="glass-card max-w-2xl w-full p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="font-display-xl text-2xl font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
              <span className="material-symbols-outlined text-primary-container">calculate</span>
              Carbon Calculator Wizard
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Track carbon vectors across transportation, household energy, dietary behaviors, and consumption streams.
            </p>
          </div>

          {/* Steps Progress Header */}
          {step <= 4 && (
            <div className="flex items-center gap-2 mb-8 bg-white/5 p-2 rounded-xl border border-white/5">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex-1 flex flex-col items-center gap-1.5">
                  <div 
                    className={`h-1.5 w-full rounded-full transition-all ${
                      step >= num ? 'bg-primary-container shadow-[0_0_8px_#10b981]' : 'bg-white/10'
                    }`}
                  ></div>
                  <span className={`text-[9px] font-mono uppercase tracking-wider font-semibold ${step === num ? 'text-white' : 'text-on-surface-variant/40'}`}>
                    {num === 1 ? 'Transport' : num === 2 ? 'Energy' : num === 3 ? 'Diet & Shop' : 'Water & Waste'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleCalculate}>
            {step === 1 && (
              /* Step 1: Transportation */
              <div className="space-y-4 animate-pulse-glow">
                <h3 className="text-sm font-semibold text-secondary uppercase font-mono tracking-wider mb-4">
                  Step 1: Transport Log (Weekly)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Car Distance (km)
                    </label>
                    <input
                      type="number"
                      value={carKm}
                      onChange={(e) => setCarKm(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Public Transit (km)
                    </label>
                    <input
                      type="number"
                      value={publicTransportKm}
                      onChange={(e) => setPublicTransportKm(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Bicycle / Walk (km)
                    </label>
                    <input
                      type="number"
                      value={bikeKm}
                      onChange={(e) => setBikeKm(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Aviation Flights (km / month)
                    </label>
                    <input
                      type="number"
                      value={flightKm}
                      onChange={(e) => setFlightKm(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              /* Step 2: Household Energy */
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-secondary uppercase font-mono tracking-wider mb-4">
                  Step 2: Household Utilities (Monthly)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Electricity (kWh)
                    </label>
                    <input
                      type="number"
                      value={electricityKwh}
                      onChange={(e) => setElectricityKwh(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      LPG / Cooking Gas (kg)
                    </label>
                    <input
                      type="number"
                      value={lpgKg}
                      onChange={(e) => setLpgKg(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Renewable Energy Offset (kWh)
                    </label>
                    <input
                      type="number"
                      value={renewableKwh}
                      onChange={(e) => setRenewableKwh(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              /* Step 3: Diet & Shopping */
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-secondary uppercase font-mono tracking-wider mb-4">
                  Step 3: Dietary Types & Shopping Spends
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Primary Dietary Standard
                    </label>
                    <select
                      value={dietType}
                      onChange={(e) => setDietType(e.target.value)}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1"
                    >
                      <option value="mixed">Mixed/Average Diet</option>
                      <option value="vegan">Fully Vegan</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="meat_heavy">Meat Heavy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Clothing/Fashion ($ / month)
                    </label>
                    <input
                      type="number"
                      value={clothingSpend}
                      onChange={(e) => setClothingSpend(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Electronics Spends ($ / month)
                    </label>
                    <input
                      type="number"
                      value={electronicsSpend}
                      onChange={(e) => setElectronicsSpend(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Household Purchase ($ / month)
                    </label>
                    <input
                      type="number"
                      value={householdSpend}
                      onChange={(e) => setHouseholdSpend(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              /* Step 4: Water & Waste */
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-secondary uppercase font-mono tracking-wider mb-4">
                  Step 4: Hydro Consumption & Discards
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Daily Water Intake (Liters)
                    </label>
                    <input
                      type="number"
                      value={waterLiters}
                      onChange={(e) => setWaterLiters(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Disposal Trash (kg / week)
                    </label>
                    <input
                      type="number"
                      value={disposalKg}
                      onChange={(e) => setDisposalKg(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                      Recycled Waste (kg / week)
                    </label>
                    <input
                      type="number"
                      value={recyclingKg}
                      onChange={(e) => setRecyclingKg(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && result && (
              /* Step 5: Carbon Calculation Results */
              <div className="space-y-6 animate-pulse-glow">
                <div className="text-center p-4 bg-primary-container/10 border border-primary-container/30 rounded-2xl">
                  <span className="font-mono text-[10px] text-primary-container uppercase font-bold tracking-widest block mb-1">
                    Telemetry Computation Complete
                  </span>
                  <div className="font-display-xl text-5xl font-bold text-white mb-2">
                    {result.total_co2.toFixed(2)} <span className="text-sm font-normal text-on-surface-variant">Tons CO2e / Year</span>
                  </div>
                  <div className="text-xs text-white font-semibold">
                    Sustainability Grade: <span className="text-primary-container uppercase">{result.environmental_impact_rating} ({result.sustainability_score.toFixed(0)}/100)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-3.5 rounded-xl border border-white/5">
                    <span className="font-mono text-[9px] text-on-surface-variant/70 uppercase font-semibold block mb-1">Transport</span>
                    <span className="text-sm text-white font-bold">{result.transport_emissions.toFixed(1)} kg</span>
                  </div>
                  <div className="glass-panel p-3.5 rounded-xl border border-white/5">
                    <span className="font-mono text-[9px] text-on-surface-variant/70 uppercase font-semibold block mb-1">Energy usage</span>
                    <span className="text-sm text-white font-bold">{result.energy_emissions.toFixed(1)} kg</span>
                  </div>
                  <div className="glass-panel p-3.5 rounded-xl border border-white/5">
                    <span className="font-mono text-[9px] text-on-surface-variant/70 uppercase font-semibold block mb-1">Dietary standard</span>
                    <span className="text-sm text-white font-bold">{result.food_emissions.toFixed(1)} kg</span>
                  </div>
                  <div className="glass-panel p-3.5 rounded-xl border border-white/5">
                    <span className="font-mono text-[9px] text-on-surface-variant/70 uppercase font-semibold block mb-1">Shopping Disbursals</span>
                    <span className="text-sm text-white font-bold">{result.shopping_emissions.toFixed(1)} kg</span>
                  </div>
                  <div className="glass-panel p-3.5 rounded-xl border border-white/5">
                    <span className="font-mono text-[9px] text-on-surface-variant/70 uppercase font-semibold block mb-1">Waste Discards</span>
                    <span className="text-sm text-white font-bold">{result.waste_emissions.toFixed(1)} kg</span>
                  </div>
                  <div className="glass-panel p-3.5 rounded-xl border border-white/5">
                    <span className="font-mono text-[9px] text-on-surface-variant/70 uppercase font-semibold block mb-1">Water standard</span>
                    <span className="text-sm text-white font-bold">{result.water_emissions.toFixed(1)} kg</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 py-3 bg-primary-container text-on-primary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] text-center cursor-pointer"
                  >
                    Go To Command Center
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setStep(1);
                    }}
                    className="flex-1 py-3 border border-white/10 hover:bg-white/5 font-label-caps text-xs text-white rounded-xl text-center transition-all cursor-pointer font-bold"
                  >
                    Recalculate
                  </button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {step <= 4 && (
              <div className="flex gap-4 mt-8 pt-4 border-t border-white/5">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="py-3 px-6 border border-white/10 hover:bg-white/5 font-label-caps text-xs text-white rounded-xl transition-all cursor-pointer font-bold"
                  >
                    Back
                  </button>
                )}
                
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto py-3 px-6 bg-secondary-container text-on-secondary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto py-3 px-6 bg-primary-container text-on-primary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">eco</span>
                        Logging data...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        Compute Vitals
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
