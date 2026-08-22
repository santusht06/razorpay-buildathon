import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, ShieldCheck, Zap } from 'lucide-react';

export const AskRayWidget = ({ onOpenSimulator }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ray',
      text: 'Hi, I am RAY — Razorpay’s Autonomous AI Assistant. How can I help you recover lost revenue today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "I am monitoring active failed webhooks. Over ₹11,730 has been automatically recovered with a 63.4% recovery rate.";
      if (userText.toLowerCase().includes('recovery') || userText.toLowerCase().includes('rate')) {
        botReply = "Our Groq AI Autonomous Agent is achieving a 63.4% recovery rate across payment retries, compared to 32% on baseline rules.";
      } else if (userText.toLowerCase().includes('simulate') || userText.toLowerCase().includes('webhook') || userText.toLowerCase().includes('test')) {
        botReply = "You can test live failed payments using the Webhook Simulator button in the top bar!";
      } else if (userText.toLowerCase().includes('guardrail') || userText.toLowerCase().includes('policy')) {
        botReply = "Policy guardrails enforce a ₹50,000 max automated limit and automatically halt retries on terminal card failure or fraud risk.";
      }

      setMessages(prev => [...prev, { sender: 'ray', text: botReply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Ask RAY Button matching Razorpay official UI in bottom right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 rounded-full px-4 py-2.5 shadow-lg flex items-center space-x-2 text-xs font-extrabold transition-all transform hover:scale-105"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-4 h-4 text-emerald-600 fill-current" />
          <span>Ask RAY</span>
        </button>
      </div>

      {/* RAY Assistant Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col h-[480px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0C54EA] to-[#0052A3] p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-amber-300 fill-current" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  Ask RAY <span className="text-[10px] bg-emerald-400/30 text-emerald-200 px-1.5 py-0.2 rounded font-semibold border border-emerald-300/40">AI Copilot</span>
                </h3>
                <p className="text-[11px] text-blue-100 font-medium">Razorpay Autonomous Revenue Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-xl px-3.5 py-2.5 leading-relaxed font-medium ${
                    m.sender === 'user'
                      ? 'bg-[#0C54EA] text-white rounded-br-none shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-400 font-mono text-[11px] flex items-center space-x-1">
                  <span>RAY is thinking</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => setInput('What is current recovery rate?')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg whitespace-nowrap font-medium transition-colors"
            >
              📊 Recovery Rate
            </button>
            <button
              onClick={() => setInput('Explain policy guardrails')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg whitespace-nowrap font-medium transition-colors"
            >
              🛡️ Guardrails
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask RAY about failed transactions, recovery..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <button
              type="submit"
              className="p-2 bg-[#0C54EA] hover:bg-[#0A47C4] text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
