'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  reasoningSteps?: string[];
  visualData?: {
    label: string;
    ecoValue: number;
    avgValue: number;
  };
}

export default function CoachPage() {
  const { sendMessageToCoach } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'user',
      text: "I need to travel from San Francisco to Copenhagen next month. What's the most sustainable route that keeps travel time under 15 hours?",
      timestamp: '11:45 AM',
    },
    {
      sender: 'ai',
      text: "I've isolated three viable corridors. The optimal balance involves a non-stop to Amsterdam using SAF (Sustainable Aviation Fuel), followed by a high-speed Eurostar rail connection. This reduces carbon emissions by 42% compared to a standard layover flight, while staying within your 15-hour window.",
      timestamp: '11:46 AM',
      reasoningSteps: [
        'Scanning transatlantic corridor for carbon-offset verified carriers and SAF availability...',
        'Predictive AI: Analyzing high-altitude wind patterns for fuel optimization.',
        'Smart Travel Agent: Cross-referencing rail connections for the final leg in Europe.',
      ],
      visualData: {
        label: 'Carbon Footprint (kg CO2e)',
        ecoValue: 340,
        avgValue: 585,
      },
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: userText, timestamp: timeStr }]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await sendMessageToCoach(userText);
      
      // Dynamic reasoning steps matching user prompts
      const reasoning = [
        'Analyzing query syntax for environmental context keywords...',
        'Parsing personal climate score database history...',
        'Compiling real-time ESG advisor recommendations...',
      ];

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reasoningSteps: reasoning,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm sorry, I'm having trouble accessing my climate advisor engines right now. Please verify your connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceListen = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate speech detection
      setTimeout(() => {
        setInput('Show me carbon offset projects near me');
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <DashboardShell>
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
        {/* Left Column: AI Reasoning Chat */}
        <section className="flex-[2] glass-panel rounded-3xl overflow-hidden flex flex-col shadow-2xl relative border border-white/10 h-full">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <h2 className="font-headline-lg text-lg text-primary tracking-tight font-bold">
                Eco-Coach Advisory Core
              </h2>
            </div>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-primary/20">
              High Efficiency
            </span>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-hide bg-black/10">
            {messages.map((msg, index) => (
              <div key={index} className="space-y-4">
                {msg.sender === 'user' ? (
                  /* User Message */
                  <div className="flex justify-end">
                    <div className="max-w-[80%] glass-panel rounded-2xl rounded-tr-none p-4 bg-white/5 border border-white/15">
                      <p className="text-on-surface/90 text-sm leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </p>
                      <span className="text-[9px] text-on-surface-variant/40 mt-1.5 block text-right font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* AI Message */
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-container/20 flex-shrink-0 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Reasoning Box */}
                      {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                        <div className="glass-panel rounded-2xl rounded-tl-none p-5 bg-gradient-to-br from-primary-container/5 to-secondary-container/5 border border-primary/10">
                          <h3 className="text-primary-fixed-dim font-bold text-[10px] uppercase tracking-widest mb-3 font-mono">
                            Reasoning Engine
                          </h3>
                          <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                            {msg.reasoningSteps.map((step, sIdx) => (
                              <p key={sIdx} className="flex gap-2.5 items-start">
                                <span className="material-symbols-outlined text-secondary text-sm mt-0.5">search</span>
                                <span>{step}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Main reply text */}
                      <div className="glass-card rounded-2xl p-5 border border-white/10 leading-relaxed text-sm bg-surface/30">
                        <p className="whitespace-pre-line text-white">
                          {msg.text}
                        </p>
                        <span className="text-[9px] text-on-surface-variant/40 mt-2 block font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Visual Data in Chat */}
                      {msg.visualData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/2">
                            <p className="text-[9px] font-label-caps text-on-surface-variant opacity-60 mb-2 uppercase tracking-wider font-semibold">
                              {msg.visualData.label}
                            </p>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-container shadow-[0_0_10px_#10b981]"
                                style={{ width: `${(msg.visualData.ecoValue / msg.visualData.avgValue) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[9px] font-mono">
                              <span>Eco-Route: {msg.visualData.ecoValue}kg</span>
                              <span className="text-error">Avg: {msg.visualData.avgValue}kg</span>
                            </div>
                          </div>

                          <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-label-caps text-on-surface-variant opacity-60 mb-1 uppercase tracking-wider font-semibold">
                                SAF Availability
                              </p>
                              <span className="text-xs text-primary font-bold">KLM High-Cert Blend</span>
                            </div>
                            <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI thinking/loading bubble */}
            {loading && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex-shrink-0 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-xl animate-spin">eco</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="glass-panel rounded-2xl rounded-tl-none p-5 bg-white/5 border border-white/5">
                    <span className="font-mono text-[9px] text-on-surface-variant">AI ENGINE COMPUTING OPTIMAL VITALS...</span>
                    <div className="flex gap-1.5 mt-2">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-6 bg-surface-container-highest/50 backdrop-blur-md border-t border-white/10">
            <div className="flex items-end gap-4">
              <div className="flex-1 glass-panel rounded-2xl flex flex-col p-3 border border-white/15 focus-within:ring-1 focus-within:ring-secondary/50 transition-all bg-black/20">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none h-12 scroll-hide px-2 w-full"
                  placeholder="Ask about carbon offsets, transport routing, or green lifestyle optimization..."
                  disabled={loading}
                />
                
                <div className="flex justify-between items-center mt-2 px-1">
                  <div className="flex items-center gap-2">
                    {isListening ? (
                      <div className="voice-wave-container flex items-center gap-1 h-6">
                        <div className="wave-bar h-3" style={{ animationDelay: '0.1s' }}></div>
                        <div className="wave-bar h-4" style={{ animationDelay: '0.3s' }}></div>
                        <div className="wave-bar h-3" style={{ animationDelay: '0.2s' }}></div>
                        <div className="wave-bar h-5" style={{ animationDelay: '0.4s' }}></div>
                        <span className="text-[9px] font-mono ml-2 text-primary tracking-widest uppercase">LISTENING...</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleVoiceListen}
                        className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors text-[10px] font-mono cursor-pointer border border-white/5"
                      >
                        <span className="material-symbols-outlined text-xs">mic</span>
                        Vocal Command
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 rounded-xl hover:bg-white/10 text-on-surface-variant hover:text-white transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">attach_file</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="bg-primary text-surface-dim p-2 rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined font-bold text-sm">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* Right Column: Agent Collaboration & Insights */}
        <section className="flex-1 flex flex-col gap-6 h-full min-w-[280px]">
          {/* Agent Collaboration Card */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden border border-white/10 shadow-lg">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/10 blur-3xl rounded-full"></div>
            <h3 className="font-label-caps text-xs text-primary/70 tracking-[0.2em] uppercase font-bold">
              Agent Collaboration
            </h3>
            
            <div className="space-y-4 relative">
              {/* Agent Card 1 */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 border border-secondary/30 flex items-center justify-center relative shrink-0">
                  <span className="material-symbols-outlined text-secondary text-lg">query_stats</span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-lg shadow-green-500/50"></div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary">Predictive AI</p>
                  <p className="text-[9px] text-on-surface-variant font-mono">Status: Routing Winds</p>
                </div>
              </div>
              
              {/* Connection Line */}
              <div className="ml-5 w-0.5 h-6 bg-gradient-to-b from-secondary/50 to-primary/50"></div>
              
              {/* Agent Card 2 */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center relative shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">flight_takeoff</span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-lg shadow-green-500/50"></div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">Smart Travel</p>
                  <p className="text-[9px] text-on-surface-variant font-mono">Status: Booking API Link</p>
                </div>
              </div>
            </div>
          </div>

          {/* Climate Coaching Tips */}
          <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col gap-4 border border-white/10 shadow-lg justify-between overflow-y-auto">
            <div className="space-y-4">
              <h3 className="font-label-caps text-xs text-tertiary-fixed-dim tracking-[0.2em] uppercase font-bold">
                Personalized Coaching
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-primary-container/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-primary text-sm">tips_and_updates</span>
                    <span className="text-xs font-bold text-primary">Pro Tip: Luggage weight</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Reducing your checked bag by 5kg can save approximately 12kg of CO2 on this route. Every gram counts at 30,000 feet.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary-container/5 border border-secondary/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-secondary text-sm">nest_multi_room</span>
                    <span className="text-xs font-bold text-secondary">Smart Accommodation</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Copenhagen’s &apos;Hotel Bella Sky&apos; has a Platinum LEED rating. I can sync your itinerary with their HVAC automation system.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 shrink-0">
              <div className="relative w-full h-28 rounded-2xl overflow-hidden shadow-inner group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGpv6zCeTH2tY-GD5kbYYmXNL0P8ttME-eSeGluQRnfUXmVUWswc_OUpBpd3tDqj2ZwHb01HpoNQtMWan268Su-JzT1egfQb3nNGPZzNEqMujo2r8wahIpPT9cYyYS34Hwty7p5H9Sxsl2Chfn4efXxIpsc0Mh8ed7oczKKN4_Iy3PTvxkKqVqQvxYDzImWuUvFxyF8ruzxsKfLuF9qtQibv1VJ6-JLIULW66uf69x8IORZSIi6hFH"
                  alt="City of Copenhagen green initiative"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[9px] font-mono text-primary/80 uppercase tracking-wider font-semibold">Destination Impact</span>
                  <span className="text-xs font-bold text-white">Copenhagen Eco-Hub</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
