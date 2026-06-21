'use client';

import React, { useState, useEffect } from 'react';
import { useApp, OffsetProject } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

interface UserContribution {
  id: number;
  project_title: string;
  category: string;
  amount: number;
  co2_offset: number;
  created_at: string;
}

export default function MarketplacePage() {
  const { fetchMarketplaceProjects, contributeOffset, token, apiUrl } = useApp();
  const [projects, setProjects] = useState<OffsetProject[]>([]);
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sponsoring/Contribution overlay state
  const [selectedProject, setSelectedProject] = useState<OffsetProject | null>(null);
  const [amount, setAmount] = useState('50');
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    loadMarketplace();
  }, [token]);

  const loadMarketplace = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const projData = await fetchMarketplaceProjects();
      setProjects(projData);
      
      // Fetch user's own contributions
      const res = await fetch(`${apiUrl}/marketplace/my-contributions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const contribData = await res.json();
        setContributions(contribData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !amount || buying) return;

    setBuying(true);
    try {
      const parsedAmount = Number(amount);
      const data = await contributeOffset(selectedProject.id, parsedAmount);
      
      // Successfully contributed! Append to list
      const newContrib: UserContribution = {
        id: data.id,
        project_title: selectedProject.title,
        category: selectedProject.category,
        amount: parsedAmount,
        co2_offset: data.co2_offset,
        created_at: data.created_at || new Date().toISOString()
      };
      
      setContributions((prev) => [newContrib, ...prev]);
      setSelectedProject(null);
      alert(`Successfully contributed $${parsedAmount} to "${selectedProject.title}"! Earned ${data.earned_xp} XP and offset ${data.co2_offset} tons of CO2.`);
    } catch (e) {
      alert('Handshake contribution failed. Verify payment values.');
    } finally {
      setBuying(false);
    }
  };

  const totalCO2Offset = contributions.reduce((acc, curr) => acc + curr.co2_offset, 0);

  return (
    <DashboardShell>
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h1 className="font-display-xl text-3xl font-bold text-primary mb-2">Carbon Offset Marketplace</h1>
            <p className="text-on-surface-variant text-sm max-w-xl">
              Blockchain-certified carbon capture and clean energy offsets. Every dollar contributed awards system experience points (XP) to unlock higher climate status.
            </p>
          </div>
          <div className="glass-card px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
            <span className="font-mono text-[10px] text-primary-fixed-dim uppercase tracking-wider block">
              Your Cumulative Offsets
            </span>
            <span className="text-xl font-bold text-white">
              {totalCO2Offset.toFixed(2)} tons / CO2
            </span>
          </div>
        </header>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex-grow flex items-center justify-center min-h-[300px]">
            <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">eco</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="glass-card rounded-3xl overflow-hidden border border-white/10 group flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden shrink-0">
                  <img 
                    src={project.image_url || 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-black/60 border border-white/10 text-primary-fixed-dim px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest">
                    {project.category}
                  </span>
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline-lg text-lg text-white font-bold mb-2">
                      {project.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4 text-xs font-mono">
                      <div>
                        <span className="text-on-surface-variant/50 block text-[9px] uppercase">Price / Ton</span>
                        <span className="text-white font-semibold">${project.price_per_ton.toFixed(2)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-on-surface-variant/50 block text-[9px] uppercase">CO2 Reduction</span>
                        <span className="text-primary-container font-semibold">{project.co2_reduction.toFixed(1)}x</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setAmount('50');
                      }}
                      className="w-full py-2.5 bg-primary-container text-on-primary-container font-label-caps text-[10px] font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                    >
                      Sponsor Project
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Contributions List */}
        <section className="mt-4">
          <h2 className="font-label-caps text-xs text-on-surface-variant mb-4 flex items-center gap-2 uppercase tracking-widest font-semibold">
            <span className="material-symbols-outlined text-sm">history</span>
            Offset Contribution Ledger
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
            <table className="w-full text-left font-body-md text-xs">
              <thead className="bg-white/5 font-mono text-on-surface-variant/70 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 uppercase tracking-wider">Amount Paid</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-right">CO2 Sequestered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contributions.length > 0 ? (
                  contributions.map((c) => (
                    <tr key={c.id} className="liquid-fill-hover group transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-on-surface-variant/60">
                        {new Date(c.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">{c.project_title}</div>
                        <div className="text-[9px] text-on-surface-variant/50 font-mono uppercase mt-0.5">{c.category}</div>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        ${Number(c.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-primary-container font-mono font-bold">
                        +{Number(c.co2_offset).toFixed(3)} tons
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant/40">
                      No carbon offsets sponsored yet. Select a project above to contribute.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sponsoring Modal Overlay */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/15 relative">
              <h3 className="font-display-xl text-lg font-bold text-white mb-2">
                Sponsor: {selectedProject.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                Enter your investment support. Each dollar contributed directly funds the carbon capture initiatives of this offset vector.
              </p>

              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold mb-1.5">
                    Funding Amount (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                  />
                  <div className="mt-2 flex justify-between text-[9px] font-mono text-primary-container">
                    <span>Rate: ${selectedProject.price_per_ton}/ton</span>
                    <span>Est. CO2 offset: {((Number(amount) || 0) / selectedProject.price_per_ton * selectedProject.co2_reduction).toFixed(3)} tons</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 font-label-caps text-[10px] font-bold rounded-xl text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={buying || !amount}
                    className="flex-1 py-2.5 bg-primary-container text-on-primary-container font-label-caps text-[10px] font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    {buying ? 'Processing Payment...' : 'Confirm Funding'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
