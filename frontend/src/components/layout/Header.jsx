import React, { useState } from 'react';
import { Search, Zap, ExternalLink, Bell, ChevronDown, Activity, ShieldCheck } from 'lucide-react';
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
      <header className="bg-[#050e1e] text-white h-14 px-5 flex items-center justify-between sticky top-0 z-50 select-none shadow-md">
        
        {/* Left Section: Razorpay Logo & Main Top Nav Links */}
        <div className="flex items-center space-x-8">
          {/* Official Razorpay Logo */}
          <div className="flex items-center space-x-1.5 cursor-pointer">
            <span className="font-black text-xl italic tracking-tighter text-white flex items-center">
              <span className="text-sky-400 font-extrabold mr-0.5">/</span>Razorpay
            </span>
          </div>

          {/* Top Navigation Bar Tabs */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <button className="flex items-center space-x-1.5 hover:text-white transition-colors py-4">
              <span>Razorpay Home</span>
            </button>

            {/* Active Payments Tab */}
            <button className="flex items-center space-x-1.5 text-white font-bold border-b-2 border-sky-400 py-4 px-1">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Payments</span>
            </button>

            <button className="flex items-center space-x-1.5 hover:text-white transition-colors py-4">
              <span>Company Registration</span>
            </button>

            <button className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors py-4">
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </nav>
        </div>

        {/* Center: Hackathon Interactive Scenarios Bar */}
        <div className="hidden xl:flex items-center space-x-2 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center mr-1">
            <Zap className="w-3 h-3 mr-1 fill-current" /> Demo Scenarios:
          </span>
          <button
            onClick={() => handleRunDemoScenario('scenario-1')}
            disabled={loadingScenario === 'scenario-1'}
            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors disabled:opacity-50"
          >
            {loadingScenario === 'scenario-1' ? '...' : '1: ₹2.4k Sub'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-2')}
            disabled={loadingScenario === 'scenario-2'}
            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors disabled:opacity-50"
          >
            {loadingScenario === 'scenario-2' ? '...' : '2: Card Expired'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-3')}
            disabled={loadingScenario === 'scenario-3'}
            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors disabled:opacity-50"
          >
            {loadingScenario === 'scenario-3' ? '...' : '3: ₹75k VIP Block'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-4')}
            disabled={loadingScenario === 'scenario-4'}
            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors disabled:opacity-50"
          >
            {loadingScenario === 'scenario-4' ? '...' : '4: Cart Abandon'}
          </button>
        </div>

        {/* Right Section: Search & Profile Avatar */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payment products, settings, and more"
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-4 py-1.5 w-64 focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg border border-slate-700 text-xs font-semibold flex items-center space-x-1"
            title="Custom Webhook Event"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
          </button>

          {/* User Avatar Pill (SK from screenshot) */}
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-[11px] text-slate-200 cursor-pointer">
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
