import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { WebhookSimulatorModal } from '../simulator/WebhookSimulatorModal';
import { api } from '../../api';

export const Header = ({ onSimulatorSuccess }) => {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState(null);

  const handleRunDemoScenario = async (scenarioKey) => {
    setLoadingScenario(scenarioKey);
    try {
      const res = await api.triggerDemoScenario(scenarioKey);
      if (onSimulatorSuccess) onSimulatorSuccess(res.data);
    } catch (err) {
      console.error('Scenario error:', err);
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 text-slate-900 h-16 w-full px-6 md:px-8 flex items-center justify-between sticky top-0 z-50 select-none shadow-xs">
        
        {/* Left Section: Razorpay Official Logo & App Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1 cursor-pointer">
            <span className="font-black text-2xl italic tracking-tighter text-[#02042B] flex items-center">
              <span className="text-[#0C54EA] font-black mr-0.5 font-sans">/</span>Razorpay
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-black text-slate-900 tracking-tight">AI Revenue Recovery</span>
            <span className="bg-blue-50 text-[#0C54EA] border border-blue-200/80 text-[10px] font-black px-2 py-0.5 rounded-full">
              Autonomous
            </span>
          </div>
        </div>

        {/* Center: Live Test Scenarios Bar */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-black text-[#0C54EA] uppercase tracking-wider flex items-center px-1.5">
            <Zap className="w-3.5 h-3.5 mr-1 fill-current text-amber-500" /> Test Scenarios:
          </span>

          <button
            onClick={() => handleRunDemoScenario('scenario-1')}
            disabled={loadingScenario === 'scenario-1'}
            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0C54EA] rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs disabled:opacity-50"
            title="₹2,499 Subscription Temporary Failure -> AI Email Recovery"
          >
            {loadingScenario === 'scenario-1' ? 'Executing...' : '1: ₹2.5k Sub'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-2')}
            disabled={loadingScenario === 'scenario-2'}
            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0C54EA] rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs disabled:opacity-50"
            title="₹999 Expired Card -> Payment Method Update Link"
          >
            {loadingScenario === 'scenario-2' ? 'Executing...' : '2: Expired Card'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-3')}
            disabled={loadingScenario === 'scenario-3'}
            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0C54EA] rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs disabled:opacity-50"
            title="₹75,000 High-Value Payment -> Safety Guardrail Block & VIP Escalation"
          >
            {loadingScenario === 'scenario-3' ? 'Executing...' : '3: ₹75k VIP Block'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-4')}
            disabled={loadingScenario === 'scenario-4'}
            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0C54EA] rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs disabled:opacity-50"
            title="₹25,000 Abandoned Checkout -> Contextual Email Recovery"
          >
            {loadingScenario === 'scenario-4' ? 'Executing...' : '4: Abandoned Cart'}
          </button>
        </div>

        {/* Right Section: AI Status & Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Groq AI Live Status Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-black shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Groq AI Online</span>
          </div>

          {/* Simulate Payment Failure Primary Button */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-4 py-2 bg-[#0C54EA] hover:bg-[#0A47C4] text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-sm transition-all transform hover:scale-102"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Simulate Failure</span>
          </button>

          {/* Merchant Profile Avatar */}
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors shadow-2xs" title="Santusht Kotai (Merchant Admin)">
            SK
          </div>
        </div>

      </header>

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSuccess={(data) => {
          if (onSimulatorSuccess) onSimulatorSuccess(data);
        }}
      />
    </>
  );
};
