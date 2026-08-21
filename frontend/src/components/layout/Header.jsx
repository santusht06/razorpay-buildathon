import React, { useState } from 'react';
import { Zap, ShieldCheck, Search, Play, CheckCircle2 } from 'lucide-react';
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
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case ID, customer, payment ID..."
              className="bg-slate-50 text-slate-900 text-xs rounded-lg pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white w-64 font-medium transition-colors"
            />
          </div>
        </div>

        {/* Top Demo Scenarios Bar */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider px-2 flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1 fill-current text-amber-500" /> Hackathon Demo Scenarios:
          </span>
          
          <button
            onClick={() => handleRunDemoScenario('scenario-1')}
            disabled={loadingScenario === 'scenario-1'}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 hover:border-blue-300 transition-all shadow-xs disabled:opacity-50"
            title="₹2,499 Subscription Temporary Failure -> Email -> Recovered"
          >
            {loadingScenario === 'scenario-1' ? 'Running...' : 'Scenario 1 (₹2.4k Sub)'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-2')}
            disabled={loadingScenario === 'scenario-2'}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 hover:border-blue-300 transition-all shadow-xs disabled:opacity-50"
            title="₹999 Subscription Expired Card -> Payment Update -> Recovered"
          >
            {loadingScenario === 'scenario-2' ? 'Running...' : 'Scenario 2 (Expired Card)'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-3')}
            disabled={loadingScenario === 'scenario-3'}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 hover:border-blue-300 transition-all shadow-xs disabled:opacity-50"
            title="₹75,000 High Value -> Guardrail Limit Block -> Escalated"
          >
            {loadingScenario === 'scenario-3' ? 'Running...' : 'Scenario 3 (₹75k VIP Block)'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-4')}
            disabled={loadingScenario === 'scenario-4'}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 hover:border-blue-300 transition-all shadow-xs disabled:opacity-50"
            title="₹25,000 Abandoned Checkout -> Recovery Email -> Recovered"
          >
            {loadingScenario === 'scenario-4' ? 'Running...' : 'Scenario 4 (Checkout Cart)'}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Razorpay Sandbox</span>
          </div>

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md shadow-blue-600/20 transition-all"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>Custom Webhook</span>
          </button>
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
