import React, { useState } from 'react';
import { Search, Zap, ExternalLink, Bell, ChevronDown, Activity, Globe, HelpCircle, ArrowRight } from 'lucide-react';
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
      {/* Official Razorpay Announcement Top Banner (Matching Screenshot) */}
      <div className="bg-[#EDF5FF] border-b border-blue-100 text-slate-800 text-xs py-1.5 px-6 flex items-center justify-between font-medium select-none">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="font-extrabold text-[#0C54EA] bg-white px-2 py-0.5 rounded-full border border-blue-200 text-[10px] uppercase tracking-wider">
            Autonomous Recovery Active
          </span>
          <span className="text-slate-700">Accept & Recover Failed International Payments — Apple Pay, Cards, Google Pay.</span>
        </div>

        {/* Demo Scenario Trigger Chips integrated cleanly */}
        <div className="hidden lg:flex items-center space-x-1.5">
          <span className="text-[11px] font-extrabold text-[#0C54EA] flex items-center mr-1">
            <Zap className="w-3 h-3 mr-1 fill-current text-amber-500" /> Scenarios:
          </span>
          <button
            onClick={() => handleRunDemoScenario('scenario-1')}
            disabled={loadingScenario === 'scenario-1'}
            className="px-2.5 py-0.5 text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0C54EA] rounded-md border border-blue-200 transition-colors shadow-2xs disabled:opacity-50"
          >
            {loadingScenario === 'scenario-1' ? '...' : '₹2.4k Sub'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-2')}
            disabled={loadingScenario === 'scenario-2'}
            className="px-2.5 py-0.5 text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0C54EA] rounded-md border border-blue-200 transition-colors shadow-2xs disabled:opacity-50"
          >
            {loadingScenario === 'scenario-2' ? '...' : 'Card Expired'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-3')}
            disabled={loadingScenario === 'scenario-3'}
            className="px-2.5 py-0.5 text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0C54EA] rounded-md border border-blue-200 transition-colors shadow-2xs disabled:opacity-50"
          >
            {loadingScenario === 'scenario-3' ? '...' : '₹75k VIP'}
          </button>
          <button
            onClick={() => handleRunDemoScenario('scenario-4')}
            disabled={loadingScenario === 'scenario-4'}
            className="px-2.5 py-0.5 text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0C54EA] rounded-md border border-blue-200 transition-colors shadow-2xs disabled:opacity-50"
          >
            {loadingScenario === 'scenario-4' ? '...' : 'Cart Abandon'}
          </button>
        </div>
      </div>

      {/* Main Official Razorpay Header Bar */}
      <header className="bg-white border-b border-slate-200 text-slate-900 h-16 px-6 flex items-center justify-between sticky top-0 z-50 select-none shadow-xs">
        
        {/* Left Section: Official Razorpay Brand Logo & Nav */}
        <div className="flex items-center space-x-8">
          {/* Razorpay Brand Mark */}
          <div className="flex items-center space-x-1 cursor-pointer">
            <span className="font-black text-2xl italic tracking-tighter text-[#02042B] flex items-center">
              <span className="text-[#0C54EA] font-black mr-0.5 font-sans">/</span>Razorpay
            </span>
          </div>

          {/* Navigation Links from Screenshot */}
          <nav className="hidden xl:flex items-center space-x-6 text-xs font-bold text-slate-600">
            <button className="text-[#0C54EA] font-extrabold flex items-center space-x-1">
              <span>Agentic Stack</span>
              <span className="bg-blue-100 text-[#0C54EA] text-[9px] px-1.5 py-0.2 rounded-full">New</span>
            </button>

            <button className="hover:text-[#0C54EA] transition-colors py-4">
              <span>Payments</span>
            </button>

            <button className="hover:text-[#0C54EA] transition-colors py-4">
              <span>Banking+</span>
            </button>

            <button className="hover:text-[#0C54EA] transition-colors py-4">
              <span>Payroll</span>
            </button>

            <button className="hover:text-[#0C54EA] transition-colors py-4">
              <span>Engage</span>
            </button>

            <button className="hover:text-[#0C54EA] transition-colors py-4">
              <span>Partners</span>
            </button>

            <button className="hover:text-[#0C54EA] transition-colors py-4">
              <span>Pricing</span>
            </button>
          </nav>
        </div>

        {/* Right Section: Search & Actions */}
        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payments, customers, recovery..."
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-8 pr-4 py-2 w-56 focus:outline-none focus:border-[#0C54EA] focus:bg-white font-medium transition-colors"
            />
          </div>

          {/* Webhook Simulator Launcher */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-3.5 py-2 bg-[#0C54EA] hover:bg-[#0A47C4] text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all transform hover:scale-105"
            title="Custom Webhook Simulator"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Webhook Simulator</span>
          </button>

          {/* Secondary Outline Button */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="hidden sm:flex px-3.5 py-2 border border-[#0C54EA] text-[#0C54EA] hover:bg-blue-50 rounded-xl text-xs font-extrabold transition-colors items-center space-x-1"
          >
            <span>Live Feed</span>
          </button>

          {/* Profile Pill */}
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-extrabold text-xs text-[#0C54EA] cursor-pointer hover:bg-blue-100 transition-colors">
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

