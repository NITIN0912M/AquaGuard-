import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, Bell, Clock, Zap, Check } from 'lucide-react';

interface SmartAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyBudget: number;
  onUpdateDailyBudget: (b: number) => void;
}

export const SmartAutomationModal: React.FC<SmartAutomationModalProps> = ({
  isOpen,
  onClose,
  dailyBudget,
  onUpdateDailyBudget,
}) => {
  const [budget, setBudget] = useState(dailyBudget);
  const [maxContinuousFlowMin, setMaxContinuousFlowMin] = useState(25);
  const [nightGuardEnabled, setNightGuardEnabled] = useState(true);
  const [burstCutoffThresholdLpm, setBurstCutoffThresholdLpm] = useState(25);
  const [autoSolenoidCutoff, setAutoSolenoidCutoff] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateDailyBudget(budget);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 md:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md border border-blue-200 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Smart Water Automation Rules</h3>
              <p className="text-xs text-slate-500 font-medium">Configure IoT thresholds and automated solenoid safety cutoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Config Form */}
        <div className="space-y-4 text-xs">
          {/* Daily Budget */}
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Daily Consumption Quota Budget:</span>
              <span className="font-mono text-blue-700 font-bold">{budget} Litres / day</span>
            </div>
            <input
              type="range"
              min="150"
              max="1000"
              step="10"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-500 block font-medium">
              Recommended for 4-person household: 300 - 350 Litres / day.
            </span>
          </div>

          {/* Continuous Flow Max Duration */}
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Max Uninterrupted Flow Timer:</span>
              <span className="font-mono text-amber-700 font-bold">{maxContinuousFlowMin} mins</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={maxContinuousFlowMin}
              onChange={(e) => setMaxContinuousFlowMin(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[10px] text-slate-500 block font-medium">
              Flags potential toilet flapper leaks or garden hose runaways.
            </span>
          </div>

          {/* Burst Cutoff Threshold */}
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Catastrophic Burst Cutoff Trigger:</span>
              <span className="font-mono text-red-600 font-bold">&gt; {burstCutoffThresholdLpm} L/min</span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              value={burstCutoffThresholdLpm}
              onChange={(e) => setBurstCutoffThresholdLpm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
              <div>
                <span className="font-bold text-slate-800 block">Night-Guard Mode (01:00 AM - 05:00 AM)</span>
                <span className="text-[10px] text-slate-500">Instantly alerts if flow &gt; 0.5 L/min is detected during sleep hours</span>
              </div>
              <input
                type="checkbox"
                checked={nightGuardEnabled}
                onChange={(e) => setNightGuardEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
              <div>
                <span className="font-bold text-slate-800 block">Auto-Solenoid Shutoff on Critical Alarm</span>
                <span className="text-[10px] text-slate-500">Closes main ingress valve within 15 seconds of detected pipe rupture</span>
              </div>
              <input
                type="checkbox"
                checked={autoSolenoidCutoff}
                onChange={(e) => setAutoSolenoidCutoff(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Rules Saved!</span>
              </>
            ) : (
              <span>Save Automation Profile</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
