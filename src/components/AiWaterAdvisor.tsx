import React, { useState } from 'react';
import { Sparkles, Bot, Send, RefreshCw, CheckCircle2, TrendingDown, DollarSign, Leaf, Lightbulb, HelpCircle, MessageSquare } from 'lucide-react';
import { TelemetryState } from '../types';

interface AiWaterAdvisorProps {
  telemetry: TelemetryState;
  propertyType: string;
  currency: string;
}

export const AiWaterAdvisor: React.FC<AiWaterAdvisorProps> = ({
  telemetry,
  propertyType,
  currency,
}) => {
  // Audit State
  const [householdSize, setHouseholdSize] = useState(4);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Chat State
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `Hello! I'm your AquaGuard AI Conservation Advisor. Ask me anything about acoustic leak detection, reducing water consumption, fixture aerators, or sustainable rainwater harvesting.`,
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const quickPrompts = [
    'How do I test my toilet flapper for silent leaks?',
    'What aerators cut kitchen tap flow by 50%?',
    'How much water can a 4-person home save monthly?',
    'Explain greywater recycling for garden lawn care',
  ];

  const handleGenerateAudit = async () => {
    setIsAuditing(true);
    try {
      const response = await fetch('/api/gemini/water-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType,
          householdSize,
          dailyUsageLiters: telemetry.todayCumulativeLiters,
          budgetLiters: telemetry.dailyBudgetLiters,
          topConsumerZone: 'Showers & Bathrooms (44% of daily usage)',
        }),
      });

      const resJson = await response.json();
      if (resJson.data) {
        setAuditResult(resJson.data);
      } else if (resJson.fallback?.data) {
        setAuditResult(resJson.fallback.data);
      }
    } catch (err) {
      console.error('Failed to run AI audit:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            propertyType,
            householdSize,
            todayUsage: telemetry.todayCumulativeLiters,
            flowRate: telemetry.totalFlowRate,
            activeLeaksCount: telemetry.activeLeaks.length,
          },
        }),
      });

      const resData = await response.json();
      const botReply = resData.reply || 'Here is an expert recommendation on water management...';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: 'I could not connect to the cloud AI service at the moment, but here is a quick tip: installing low-flow 1.5 GPM aerators on standard taps reduces flow volume by ~40% without compromising water velocity.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md border border-blue-200 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
                AquaGuard AI Water Conservation Intelligence
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 font-bold">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Personalized conservation audits, payback period calculations, and technical plumbing triage.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Automated AI Water Audit Generator (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/70 p-5 rounded-lg border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Comprehensive Water Efficiency Audit & Roadmap
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">Targeting Net-Zero Wastage</span>
            </div>

            {/* Profile Config Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Property Type</span>
                <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                  {propertyType}
                </span>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Occupants / Users</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-extrabold text-blue-600 font-mono">{householdSize}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Current Telemetry</span>
                <span className="text-xs font-extrabold text-slate-800 font-mono mt-0.5 block">
                  {telemetry.todayCumulativeLiters.toFixed(0)} L / day
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerateAudit}
              disabled={isAuditing}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Water Audit Models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Customized Conservation Action Plan</span>
                </>
              )}
            </button>
          </div>

          {/* Audit Results View */}
          {auditResult && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              {/* Highlights Ribbon */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Potential Savings</span>
                  <span className="font-extrabold text-blue-600 font-mono text-sm block mt-0.5">
                    {auditResult.potentialMonthlySavingsLitres} L/mo
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Bill Reduction</span>
                  <span className="font-extrabold text-green-700 font-mono text-sm block mt-0.5">
                    {auditResult.potentialAnnualCostSavings}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Carbon Offset</span>
                  <span className="font-extrabold text-teal-700 font-mono text-sm block mt-0.5">
                    {auditResult.carbonFootprintOffsetKg} kg CO₂/yr
                  </span>
                </div>
              </div>

              {/* Action Strategies */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {auditResult.actionPlan?.map((plan: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        {plan.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-mono">
                        +{plan.litersSavedPerDay} L / day
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {plan.description}
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Payback: <strong className="text-slate-800">{plan.paybackPeriod}</strong></span>
                      <span>Difficulty: <strong className="text-blue-600">{plan.difficulty}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {auditResult.smartRecommendation && (
                <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-xs text-slate-700">
                  💡 <strong className="text-blue-700">Automation Rule:</strong> {auditResult.smartRecommendation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant Chat (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-lg border border-slate-200 flex flex-col justify-between h-[450px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">AquaGuard Advisor Chat</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[90%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{msg.time}</span>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-white rounded border border-slate-200 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Advisor thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="py-2 flex flex-wrap gap-1.5 border-t border-slate-200">
            {quickPrompts.slice(0, 2).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 truncate transition-colors max-w-full text-left cursor-pointer font-medium"
              >
                💬 {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-200"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about water saving, greywater, DIY repairs..."
              className="flex-1 bg-white text-slate-800 text-xs rounded px-3 py-2 border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
