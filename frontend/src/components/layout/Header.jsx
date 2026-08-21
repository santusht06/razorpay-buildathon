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
      <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cases, customers, payment IDs..."
              className="bg-slate-950 text-slate-200 text-xs rounded-lg pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-sky-500 w-64"
            />
          </div>
        </div>

        {/* Top Demo Scenarios Bar */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-2 flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1 fill-current" /> Demo Scenarios:
          </span>
          
          <button
            onClick={() => handleRunDemoScenario('scenario-1')}
            disabled={loadingScenario === 'scenario-1'}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 hover:border-sky-500 transition-colors disabled:opacity-50"
            title="₹2,499 Subscription Temporary Failure -> Email -> Recovered"
          >
            {loadingScenario === 'scenario-1' ? 'Running...' : 'Scenario 1 (₹2.4k Sub)'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-2')}
            disabled={loadingScenario === 'scenario-2'}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 hover:border-sky-500 transition-colors disabled:opacity-50"
            title="₹999 Subscription Expired Card -> Payment Update -> Recovered"
          >
            {loadingScenario === 'scenario-2' ? 'Running...' : 'Scenario 2 (Expired Card)'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-3')}
            disabled={loadingScenario === 'scenario-3'}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 hover:border-sky-500 transition-colors disabled:opacity-50"
            title="₹75,000 High Value -> Guardrail Limit Block -> Escalated"
          >
            {loadingScenario === 'scenario-3' ? 'Running...' : 'Scenario 3 (₹75k VIP Block)'}
          </button>

          <button
            onClick={() => handleRunDemoScenario('scenario-4')}
            disabled={loadingScenario === 'scenario-4'}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 hover:border-sky-500 transition-colors disabled:opacity-50"
            title="₹25,000 Abandoned Checkout -> Recovery Email -> Recovered"
          >
            {loadingScenario === 'scenario-4' ? 'Running...' : 'Scenario 4 (Checkout Cart)'}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-sky-600/20 transition-colors"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>Custom Webhook Event</span>
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
