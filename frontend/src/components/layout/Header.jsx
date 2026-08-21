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
      <header className="bg-white border-b border-slate-200 text-slate-900 h-14 px-6 flex items-center justify-between sticky top-0 z-50 select-none shadow-xs">
        
        {/* Left Section: Razorpay Logo & Main Top Nav Links */}
        <div className="flex items-center space-x-8">
          {/* Official Razorpay Logo */}
          <div className="flex items-center space-x-1.5 cursor-pointer">
            <span className="font-black text-xl italic tracking-tighter text-slate-900 flex items-center">
              <span className="text-blue-600 font-extrabold mr-0.5">/</span>Razorpay
            </span>
          </div>

          {/* Top Navigation Bar Tabs */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <button className="flex items-center space-x-1.5 hover:text-slate-900 transition-colors py-4">
              <span>Razorpay Home</span>
            </button>

            {/* Active Payments Tab */}
            <button className="flex items-center space-x-1.5 text-blue-600 font-extrabold border-b-2 border-blue-600 py-4 px-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Payments</span>
            </button>

            <button className="flex items-center space-x-1.5 hover:text-slate-900 transition-colors py-4">
              <span>Company Registration</span>
            </button>

            <button className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 transition-colors py-4">
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </nav>
        </div>

        {/* Center: Hackathon Interactive Scenarios Bar */}
        <div className="hidden xl:flex items-center space-x-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center mr-1">
            <Zap className="w-3 h-3 mr-1 fill-current text-amber-500" /> Demo Scenarios:
          </span>
          <button
            onClick={() => handleRunDemoScenario('scenario-1')}
            disabled={loadingScenario === 'scenario-1'}
            className="px-2.5 py-0.5 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded border border-slate-200 transition-colors disabled:opacity-50 shadow-xs"
          >
            {loadingScenario === 'scenario-1' ? '...' : '1: ₹2.4k Sub'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-2')}
            disabled={loadingScenario === 'scenario-2'}
            className="px-2.5 py-0.5 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded border border-slate-200 transition-colors disabled:opacity-50 shadow-xs"
          >
            {loadingScenario === 'scenario-2' ? '...' : '2: Card Expired'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-3')}
            disabled={loadingScenario === 'scenario-3'}
            className="px-2.5 py-0.5 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded border border-slate-200 transition-colors disabled:opacity-50 shadow-xs"
          >
            {loadingScenario === 'scenario-3' ? '...' : '3: ₹75k VIP Block'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-4')}
            disabled={loadingScenario === 'scenario-4'}
            className="px-2.5 py-0.5 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded border border-slate-200 transition-colors disabled:opacity-50 shadow-xs"
          >
            {loadingScenario === 'scenario-4' ? '...' : '4: Cart Abandon'}
          </button>
        </div>

        {/* Right Section: Search & Webhook Trigger & Avatar */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payment products, settings..."
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg pl-8 pr-4 py-1.5 w-60 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
            />
          </div>

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            title="Custom Webhook Event"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Webhook</span>
          </button>

          {/* User Avatar Pill */}
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-[11px] text-slate-700 cursor-pointer">
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
