'use client';

import React, { useState, useEffect } from 'react';
import { useApp, AgentTaskResponse } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

export default function AgentsPage() {
  const { dispatchAgentTask } = useApp();
  const [taskDescription, setTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentTaskResponse | null>(null);
  const [logs, setLogs] = useState<{ time: string; text: string }[]>([
    { time: '14:02:11', text: 'Predictive AI shared "Flooding Risk Matrix" with Sustainability Advisor. Impact analysis initiated.' },
    { time: '14:02:45', text: 'Carbon Analyst requested "Supply Chain Delta" from Green Shopping. Data retrieval in progress...' },
    { time: '14:03:02', text: 'Energy Optimization updated grid priority based on Climate Research weather forecast.' },
    { time: '14:03:55', text: 'ESG Intelligence cross-verified 1.2k transactions with Carbon Analyst. Score updated to 0.88.' },
  ]);

  const [agentProgress, setAgentProgress] = useState<Record<string, number>>({
    'Carbon Analyst': 88,
    'Sustainability Advisor': 45,
    'Energy Optimization': 94,
    'Green Shopping': 0,
    'Smart Travel': 32,
    'Climate Research': 71,
    'Predictive AI': 60,
    'ESG Intelligence': 12,
  });

  // Dynamic progress bar fluctuations just like the HTML template
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentProgress((prev) => {
        const next = { ...prev };
        const keys = Object.keys(next);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        // Fluctuating by a small delta
        const delta = (Math.random() - 0.5) * 8;
        next[randomKey] = Math.min(100, Math.max(0, Math.round(next[randomKey] + delta)));
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim()) return;

    try {
      setLoading(true);
      setResult(null);
      
      // Add dispatch log
      const timeStr = new Date().toLocaleTimeString().slice(0, 8);
      setLogs((prev) => [
        { time: timeStr, text: `Dispatching core directive: "${taskDescription}"` },
        ...prev,
      ]);

      const response = await dispatchAgentTask(taskDescription);
      setResult(response);

      // Append completed logs
      setLogs((prev) => [
        { time: timeStr, text: `Final recommendation compiled for task: ${response.task_id}` },
        { time: timeStr, text: `Core coordination results status: ${response.status.toUpperCase()}` },
        ...prev,
      ]);
    } catch (e) {
      alert('Error coordinating agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const agentIcons: Record<string, string> = {
    'Carbon Analyst': 'query_stats',
    'Sustainability Advisor': 'psychology',
    'Energy Optimization': 'bolt',
    'Green Shopping': 'shopping_cart',
    'Smart Travel': 'flight',
    'Climate Research': 'science',
    'Predictive AI': 'timeline',
    'ESG Intelligence': 'verified_user',
  };

  const agentColors: Record<string, string> = {
    'Carbon Analyst': 'text-primary-container',
    'Sustainability Advisor': 'text-secondary-fixed',
    'Energy Optimization': 'text-primary-container',
    'Green Shopping': 'text-on-surface-variant/50',
    'Smart Travel': 'text-secondary-fixed',
    'Climate Research': 'text-primary-container',
    'Predictive AI': 'text-primary-container',
    'ESG Intelligence': 'text-secondary-fixed',
  };

  return (
    <DashboardShell>
      <div className="flex-1 flex flex-col gap-6">
        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h1 className="font-display-xl text-3xl font-bold text-primary mb-2">Multi-Agent Control</h1>
            <p className="text-on-surface-variant text-sm max-w-xl">
              Synchronizing 8 high-fidelity planetary intelligence agents. Global vitals are currently within stable parameters. Commencing neural mesh synchronization.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-3 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-primary active-glow"></div>
              <span className="font-mono text-[10px] uppercase">System: Online</span>
            </div>
            <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-3 border border-white/10">
              <span className="font-mono text-[10px] text-secondary">Mesh Load: 42%</span>
            </div>
          </div>
        </header>

        {/* Input / Control Directive Form */}
        <section className="glass-card p-6 rounded-3xl border border-white/10 shadow-lg">
          <h2 className="font-label-caps text-xs text-primary-fixed-dim uppercase tracking-widest font-semibold mb-4">
            Coordinate Agents Directive
          </h2>
          <form onSubmit={handleDispatch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Enter a sustainability challenge e.g., 'Optimize transatlantic shipping carbon emissions'..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-container text-on-primary-container font-label-caps text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">eco</span>
                  Coordinating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Dispatch Directives
                </>
              )}
            </button>
          </form>

          {/* Reasoning outputs if dispatched */}
          {result && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="font-label-caps text-[11px] text-secondary font-bold uppercase tracking-wider mb-4">
                Mesh Result Output ({result.task_id.slice(0, 8)})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {result.agent_outputs.map((out, idx) => (
                  <div key={idx} className="glass-card bg-white/2 p-4 rounded-xl border border-white/5">
                    <span className="font-mono text-[9px] text-primary-container uppercase font-bold tracking-widest">
                      {out.agent} output
                    </span>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-2">
                      {out.output}
                    </p>
                  </div>
                ))}
              </div>

              <div className="glass-card bg-secondary/5 border-l-4 border-l-secondary p-5 rounded-r-xl">
                <span className="font-mono text-[10px] text-secondary uppercase font-bold tracking-wider mb-1 block">
                  Final Recommendation
                </span>
                <p className="text-sm text-white leading-relaxed">
                  {result.final_recommendation}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Multi-Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(agentProgress).map(([name, progress]) => {
            const icon = agentIcons[name] || 'psychology';
            const color = agentColors[name] || 'text-white';
            const isActive = progress > 0;
            return (
              <div
                key={name}
                className="glass-card p-6 rounded-3xl flex flex-col justify-between gap-4 border border-white/10 group transition-all duration-300 hover:-translate-y-1 relative"
              >
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${color}`}>
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full ${isActive ? 'bg-primary-container active-glow' : 'bg-white/10'}`}></div>
                </div>

                <div>
                  <h3 className="font-headline-lg text-lg text-white font-bold">{name}</h3>
                  <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-label-caps mt-0.5">
                    {progress > 80 ? 'Optimal Load' : progress > 30 ? 'Processing Stream' : progress > 0 ? 'Waking Up' : 'Sleep Mode'}
                  </p>
                </div>

                <div className="h-16 bg-black/40 rounded-xl p-3 overflow-hidden select-none">
                  <div className="animate-pulse flex flex-col gap-1 font-mono text-[9px] text-primary-fixed-dim">
                    {isActive ? (
                      <>
                        <span>&gt; DIRECTIVE SYNCHRONIZED</span>
                        <span>&gt; DELTA INDEX: 0.124</span>
                        <span>&gt; TELEMETRY: ACTIVE</span>
                      </>
                    ) : (
                      <span className="text-on-surface-variant/40">&gt; SLEEP MODE ACTIVE</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-on-surface-variant">
                    <span>WORKFLOW PROGRESS</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isActive ? 'bg-primary-container shadow-[0_0_8px_#10b981]' : 'bg-white/20'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Log / Collaboration Stream */}
        <section className="mt-4">
          <div className="glass-card rounded-3xl p-6 overflow-hidden border border-white/10 relative shadow-lg">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">hub</span>
                <h2 className="font-headline-lg text-xl text-primary font-bold">Inter-Agent Collaboration Stream</h2>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-[9px] font-mono text-primary uppercase border border-primary/20">
                  Real-Time Sync
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-[9px] font-mono text-secondary-fixed uppercase border border-secondary-container/20">
                  Encrypted
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs max-h-56 overflow-y-auto pr-4 custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-4 items-start py-2 border-b border-white/5 text-on-surface-variant">
                  <span className="text-primary-fixed-dim shrink-0">[{log.time}]</span>
                  <p className="leading-relaxed">
                    {log.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
