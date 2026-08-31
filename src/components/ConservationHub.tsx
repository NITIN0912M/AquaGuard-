import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Trophy, Target, Sparkles, CheckCircle2, ShieldCheck, Calculator, Droplets, Leaf, ArrowRight } from 'lucide-react';
import { ConservationChallenge, CommunityLeaderboardEntry } from '../types';
import { sampleChallenges, sampleLeaderboard, waterSavingFacts } from '../data/initialData';

interface ConservationHubProps {
  ecoScore: number;
  currency: string;
}

export const ConservationHub: React.FC<ConservationHubProps> = ({ ecoScore, currency }) => {
  const [challenges, setChallenges] = useState<ConservationChallenge[]>(sampleChallenges);
  const [userXp, setUserXp] = useState(410);

  // Impact Calculator States
  const [showerMinutes, setShowerMinutes] = useState(6);
  const [turnOffTap, setTurnOffTap] = useState(true);
  const [aeratorFitted, setAeratorFitted] = useState(true);
  const [rainwaterCollectedLiters, setRainwaterCollectedLiters] = useState(80);

  // Calculator Math:
  // Standard shower = 10L/min. Saving compared to 10 min shower: (10 - showerMinutes) * 10 Litres
  const showerSavingsDaily = Math.max(0, (10 - showerMinutes) * 10);
  const tapSavingsDaily = turnOffTap ? 24 : 0; // 2x brushing per day * 12L
  const aeratorSavingsDaily = aeratorFitted ? 35 : 0;
  const rainwaterSavingsDaily = rainwaterCollectedLiters / 7; // Average daily offset

  const totalDailySaved = Math.round(showerSavingsDaily + tapSavingsDaily + aeratorSavingsDaily + rainwaterSavingsDaily);
  const totalAnnualSavedLitres = totalDailySaved * 365;

  const ratePerLiter = currency === '₹' ? 0.35 : currency === '€' ? 0.0038 : 0.0035;
  const annualMoneySaved = (totalAnnualSavedLitres * ratePerLiter).toFixed(0);

  const handleCompleteChallenge = (id: string, xpGain: number) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'completed' as const, currentLitersSaved: c.litersSavedGoal } : c))
    );
    setUserXp((prev) => prev + xpGain);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // Ignore if in restricted context
    }
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md border border-blue-200 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Gamified Conservation & Community Action Hub
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Complete conservation quests, earn XP, and compete on the sustainability leaderboard.
            </p>
          </div>
        </div>

        {/* User Level & XP Badge */}
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Award className="w-4 h-4 text-amber-500" />
          <div className="text-xs">
            <span className="text-slate-500 font-medium">Rank: </span>
            <span className="font-bold text-slate-800">Level 4 Water Warden</span>
          </div>
          <span className="text-xs font-mono font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
            {userXp} XP
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Quests & Challenges (6 cols) */}
        <div className="lg:col-span-6 bg-slate-50/70 p-4 md:p-5 rounded-lg border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Conservation Quests & Badges
            </h3>
            <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {challenges.filter((c) => c.status === 'completed').length} / {challenges.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {challenges.map((c) => {
              const isCompleted = c.status === 'completed';
              const percent = Math.min(100, Math.round((c.currentLitersSaved / c.litersSavedGoal) * 100));

              return (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-green-50/40 border-green-200'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{c.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                          +{c.xp} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-green-800 bg-green-100 px-2 py-1 rounded border border-green-300 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteChallenge(c.id, c.xp)}
                        className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        Claim Quest
                      </button>
                    )}
                  </div>

                  {/* Mini Progress */}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-700">{c.currentLitersSaved} / {c.litersSavedGoal} L</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Community Leaderboard & Impact Calculator (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Community Leaderboard */}
          <div className="bg-slate-50/70 p-4 md:p-5 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Neighborhood & Campus Leaderboard
              </h3>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                Monthly Cycle
              </span>
            </div>

            <div className="space-y-2">
              {sampleLeaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all ${
                    entry.isCurrentUser
                      ? 'bg-blue-50 border border-blue-300 shadow-xs'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-slate-900'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <div>
                      <span className={`font-semibold block ${entry.isCurrentUser ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                        {entry.name}
                      </span>
                      <span className="text-[10px] text-slate-500">{entry.badge} • {entry.type}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-green-700 block">
                      +{entry.savedLitresThisMonth} L
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Eco: {entry.ecoScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Water Savings Impact Calculator */}
          <div className="bg-slate-50/70 p-4 md:p-5 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Personal Habit Savings Calculator
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Slider 1: Shower Time */}
              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Daily Shower Length: <strong className="text-blue-700">{showerMinutes} mins</strong></span>
                  <span className="text-green-700 font-mono font-bold">+{showerSavingsDaily} L/day saved</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={showerMinutes}
                  onChange={(e) => setShowerMinutes(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 cursor-pointer hover:border-blue-400">
                  <input
                    type="checkbox"
                    checked={turnOffTap}
                    onChange={(e) => setTurnOffTap(e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <span className="text-[11px] text-slate-700 font-medium">Off Tap while Brushing (+24L)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 cursor-pointer hover:border-blue-400">
                  <input
                    type="checkbox"
                    checked={aeratorFitted}
                    onChange={(e) => setAeratorFitted(e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <span className="text-[11px] text-slate-700 font-medium">1.5 GPM Aerators (+35L)</span>
                </label>
              </div>

              {/* Calculation Summary Box */}
              <div className="bg-blue-50 p-3 rounded border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Annual Savings</span>
                  <span className="text-base font-extrabold text-blue-900 font-mono">
                    {totalAnnualSavedLitres.toLocaleString()} Litres / year
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Financial Value</span>
                  <span className="text-base font-extrabold text-green-700 font-mono">
                    {currency} {annualMoneySaved} / year
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
