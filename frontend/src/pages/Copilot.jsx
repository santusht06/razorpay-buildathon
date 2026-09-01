import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, Sparkles, RefreshCw, CheckCircle2, ShieldCheck,
  ChevronRight, Trash2, BookOpen, BarChart3, RotateCcw, AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

export const Copilot = ({ onSelectCase }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `### 🤖 Razorpay Recovery Copilot (RAG Admin AI)

I am your **Autonomous Revenue Recovery Copilot**, grounded in your live MongoDB transactions and merchant playbooks.

You can ask me to:
1. 📊 **Financial KPIs:** *"Summarize our recovered revenue and win-rate today."*
2. 🔍 **Case Audits:** *"Why was case rc_... escalated?"* or *"Analyze Priya Sharma's payment failure."*
3. 🛡️ **Policy Inquiries:** *"What are our guardrails for ₹50,000+ payments and expired cards?"*
4. ⚡ **Direct Actions:** *"Approve case rc_..."* to authorize high-value transactions.`,
      sources: ['Merchant Recovery Playbook', 'Live DB Ledger'],
      suggested_prompts: [
        'Summarize our revenue recovery performance',
        'What cases currently require merchant approval?',
        'What is our policy for ₹50,000+ high-value transactions?',
        'Explain how the AI handles expired cards vs soft declines'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getMetrics();
        setMetrics(res.data);
      } catch (err) {
        console.error('Metrics fetch error:', err);
      }
    };
    fetchMetrics();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const historyForApi = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.chatWithAssistant({
        message: query.trim(),
        conversation_history: historyForApi
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.data.reply,
        sources: res.data.sources || [],
        action_taken: res.data.action_taken,
        suggested_prompts: res.data.suggested_prompts || [],
        metrics_snapshot: res.data.metrics_snapshot
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chatbot API error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **Error:** Unable to connect to Recovery Copilot engine. Please check backend server status.',
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#EDF5FF] border border-blue-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0C54EA] text-white flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-[#02042B]">Recovery Copilot AI</h1>
              <span className="bg-blue-100 text-[#0C54EA] border border-blue-300/60 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                RAG Grounded
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Conversational intelligence interface grounded in live ledger state and merchant recovery policies.
            </p>
          </div>
        </div>

        {/* Live KPIs Snapshot */}
        {metrics && (
          <div className="flex items-center gap-4 text-xs bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Recovered</div>
              <div className="font-extrabold text-emerald-700 font-mono">₹{metrics.revenue_recovered?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Win Rate</div>
              <div className="font-extrabold text-[#0C54EA]">{metrics.recovery_rate_pct}%</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Escalations</div>
              <div className="font-extrabold text-rose-600">{metrics.escalated_cases || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[680px]">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/40 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#0C54EA] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#0C54EA] text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-3'
                }`}
              >
                <div className="prose prose-xs max-w-none font-sans leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {msg.action_taken && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-emerald-800 font-bold text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{msg.action_taken.message}</span>
                  </div>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Policy Grounding:</span>
                    {msg.sources.map((src, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-slate-200 flex items-center"
                      >
                        <ShieldCheck className="w-3 h-3 text-blue-600 mr-1" />
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {msg.suggested_prompts && msg.suggested_prompts.length > 0 && idx === messages.length - 1 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Suggested Quick Actions:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {msg.suggested_prompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          className="text-left text-xs text-[#0C54EA] hover:text-[#0A47C4] hover:bg-blue-50/70 p-2 rounded-xl border border-blue-100 transition-colors flex items-center justify-between font-bold bg-white shadow-2xs"
                        >
                          <span className="truncate">{prompt}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
                  SK
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs p-3 bg-white rounded-xl border border-slate-200 w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0C54EA]" />
              <span className="font-bold">Retrieving merchant policies & querying MongoDB ledger...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type any question about recovery cases, financial rates, or merchant playbooks..."
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0C54EA] focus:bg-white transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="bg-[#0C54EA] hover:bg-[#0A47C4] text-white px-5 py-3 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-sm transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Query</span>
          </button>
        </form>
      </div>
    </div>
  );
};
