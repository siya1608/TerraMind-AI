'use client';

import React, { useState, useEffect } from 'react';
import { useApp, EcoChallenge, EcoBadge, LeaderboardEntry } from '../context/AppContext';
import DashboardShell from '../components/DashboardShell';

export default function GamificationPage() {
  const { profile, fetchChallenges, fetchBadges, fetchLeaderboard, completeChallenge } = useApp();

  const [challenges, setChallenges] = useState<EcoChallenge[]>([]);
  const [badges, setBadges] = useState<EcoBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'badges' | 'leaderboard'>('challenges');

  useEffect(() => {
    loadGamification();
  }, []);

  const loadGamification = async () => {
    try {
      setLoading(true);
      const [ch, ba, lb] = await Promise.all([
        fetchChallenges(),
        fetchBadges(),
        fetchLeaderboard(),
      ]);
      setChallenges(ch);
      setBadges(ba);
      setLeaderboard(lb);
    } catch (e) {
      console.error('Gamification load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimChallenge = async (id: string) => {
    const success = await completeChallenge(id);
    if (success) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_completed: true } : c))
      );
    }
  };

  const xpPercent = profile ? Math.min(100, (profile.xp % 1000) / 10) : 0;
  const pointsToNext = profile ? 1000 - (profile.xp % 1000) : 1000;

  const badgeIcons: Record<string, string> = {
    first_calculation: 'calculate',
    eco_streak_7: 'local_fire_department',
    carbon_reducer: 'trending_down',
    offset_contributor: 'forest',
    sustainability_champion: 'workspace_premium',
    smart_city_analyst: 'location_city',
    agent_coordinator: 'psychology',
    leaderboard_top10: 'leaderboard',
  };

  return (
    <DashboardShell>
      <div className="flex-grow flex flex-col gap-6">
        {/* Header with XP Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* XP / Level Card */}
          <div className="md:col-span-2 glass-card rounded-3xl p-6 border border-white/10 neon-glow-emerald relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none"></div>
            
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7g-RhrkZEKPYDJppythYM4MCto2-IVmhUK3U1m5_xsKSCgMtAsQsq5ImEWCRXZAdEpVFtNwnJsPfOZCxU-KG0zcSCwdw3aOo8X7G49Ycw7ioeGm35f-cK6jkmnJ0A9MA5zA8zjmWmm9r1pN2bmGwj8V1qPKYYtbOdXV1jjGgcy7qhZmherHAIpDiQqWDmiJzWwygaSHhGjFeqS3QeCaCfaftKr1IbfsekukbYfB8zsr7nZowiCIlG'}
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-primary-container/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-secondary-container rounded-full flex items-center justify-center border-2 border-background text-xs font-bold text-on-secondary-container">
                {Math.floor((profile?.xp || 0) / 1000) + 1}
              </div>
            </div>

            <div className="flex-grow text-center sm:text-left">
              <div className="font-label-caps text-[10px] text-primary-fixed-dim uppercase tracking-widest mb-1">Active Eco Analyst</div>
              <h2 className="font-headline-lg text-2xl font-bold text-white mb-0.5">
                {profile?.full_name || 'Climate Guardian'}
              </h2>
              <div className="text-xs text-secondary font-mono font-semibold mb-3">
                {profile?.current_level || 'Eco Explorer'} • 🔥 {profile?.streak || 0} Day Streak
              </div>
              
              {/* XP Progress Bar */}
              <div>
                <div className="flex justify-between text-[9px] font-mono text-on-surface-variant mb-1.5">
                  <span>{profile?.xp || 0} XP</span>
                  <span>{pointsToNext} XP to next level</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-primary-container rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                    style={{ width: `${xpPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total XP', value: (profile?.xp || 0).toLocaleString(), icon: 'stars', color: 'text-primary-container' },
              { label: 'Day Streak', value: `${profile?.streak || 0}🔥`, icon: 'local_fire_department', color: 'text-orange-400' },
              { label: 'Badges Earned', value: badges.filter(b => b.is_earned).length.toString(), icon: 'military_tech', color: 'text-secondary-fixed' },
              { label: 'Challenges Done', value: challenges.filter(c => c.is_completed).length.toString(), icon: 'task_alt', color: 'text-tertiary-fixed' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
                <span className={`material-symbols-outlined ${stat.color} text-xl`}>{stat.icon}</span>
                <div>
                  <div className="font-mono text-[9px] text-on-surface-variant/50 uppercase">{stat.label}</div>
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {(['challenges', 'badges', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-label-caps text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-primary-container text-on-primary-container shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center min-h-48">
            <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">eco</span>
          </div>
        ) : (
          <>
            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`glass-card p-5 rounded-2xl border transition-all ${
                      challenge.is_completed
                        ? 'border-primary-container/30 bg-primary-container/5'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-lg ${challenge.is_completed ? 'text-primary-container' : 'text-on-surface-variant/50'}`}>
                          {challenge.is_completed ? 'task_alt' : 'radio_button_unchecked'}
                        </span>
                        <span className="font-mono text-[9px] text-secondary-fixed uppercase tracking-wider font-bold">
                          +{challenge.xp_reward} XP
                        </span>
                      </div>
                      {challenge.is_completed && (
                        <span className="bg-primary-container/20 text-primary-container text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-primary-container/30">
                          Claimed
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-bold mb-1 ${challenge.is_completed ? 'text-white/60 line-through' : 'text-white'}`}>
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant/60 leading-relaxed mb-3">{challenge.description}</p>
                    
                    {!challenge.is_completed && (
                      <button
                        onClick={() => handleClaimChallenge(challenge.id)}
                        className="w-full py-2 bg-primary-container/10 border border-primary-container/20 text-primary-container font-label-caps text-[9px] font-bold uppercase tracking-wider rounded-xl hover:bg-primary-container/20 transition-all cursor-pointer"
                      >
                        Claim Reward
                      </button>
                    )}
                  </div>
                ))}
                {challenges.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-on-surface-variant/40 text-sm">
                    No challenges available. Complete calculations to unlock new challenges.
                  </div>
                )}
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => {
                  const iconName = badgeIcons[badge.icon_name] || badge.icon_name || 'military_tech';
                  return (
                    <div
                      key={badge.id}
                      className={`glass-card p-5 rounded-2xl border text-center flex flex-col items-center gap-3 transition-all ${
                        badge.is_earned
                          ? 'border-secondary/30 bg-secondary/5 hover:scale-105'
                          : 'border-white/5 opacity-40'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                        badge.is_earned ? 'bg-secondary-container/20 border-secondary/40 shadow-[0_0_15px_rgba(0,210,255,0.2)]' : 'bg-white/5 border-white/10'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${badge.is_earned ? 'text-secondary-fixed' : 'text-on-surface-variant/30'}`} style={{ fontVariationSettings: badge.is_earned ? "'FILL' 1" : "'FILL' 0" }}>
                          {iconName}
                        </span>
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${badge.is_earned ? 'text-white' : 'text-on-surface-variant/30'}`}>
                          {badge.name}
                        </div>
                        <div className="text-[9px] text-on-surface-variant/40 mt-0.5 leading-relaxed">
                          {badge.description}
                        </div>
                      </div>
                      {badge.is_earned && (
                        <span className="text-[9px] font-mono text-secondary-fixed uppercase tracking-widest font-bold">
                          ✦ EARNED
                        </span>
                      )}
                    </div>
                  );
                })}
                {badges.length === 0 && (
                  <div className="col-span-4 text-center py-12 text-on-surface-variant/40 text-sm">
                    No badges seeded. Run the backend and complete actions to earn badges.
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                <div className="p-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container">leaderboard</span>
                    <h3 className="font-label-caps text-xs font-bold uppercase tracking-widest text-white">Monthly XP Rankings</h3>
                  </div>
                  <span className="font-mono text-[9px] text-on-surface-variant/40 uppercase">Live Sync</span>
                </div>
                <div className="divide-y divide-white/5">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = profile?.id === entry.id;
                    const rankColor = entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-amber-600' : 'text-on-surface-variant/50';
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 px-6 py-4 transition-all ${isCurrentUser ? 'bg-primary-container/10 border-l-2 border-l-primary-container' : 'hover:bg-white/5'}`}
                      >
                        <span className={`w-8 text-center font-mono font-bold text-sm shrink-0 ${rankColor}`}>
                          {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                        </span>
                        <img
                          src={entry.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7g-RhrkZEKPYDJppythYM4MCto2-IVmhUK3U1m5_xsKSCgMtAsQsq5ImEWCRXZAdEpVFtNwnJsPfOZCxU-KG0zcSCwdw3aOo8X7G49Ycw7ioeGm35f-cK6jkmnJ0A9MA5zA8zjmWmm9r1pN2bmGwj8V1qPKYYtbOdXV1jjGgcy7qhZmherHAIpDiQqWDmiJzWwygaSHhGjFeqS3QeCaCfaftKr1IbfsekukbYfB8zsr7nZowiCIlG'}
                          alt={entry.full_name}
                          className="w-9 h-9 rounded-full border border-white/10 shrink-0"
                        />
                        <div className="flex-grow">
                          <div className={`text-sm font-semibold ${isCurrentUser ? 'text-primary-container' : 'text-white'}`}>
                            {entry.full_name} {isCurrentUser && <span className="text-[9px] font-mono text-primary-container/70 ml-1">(You)</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold font-mono text-secondary-fixed">{entry.xp.toLocaleString()} XP</div>
                        </div>
                      </div>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <div className="py-12 text-center text-on-surface-variant/40 text-sm">
                      Leaderboard empty. Complete calculations to appear on the ranking.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
