import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, X, Send, Sparkles, Bot, User, CheckCircle2,
  ChevronRight, RefreshCw, AlertCircle, ShieldCheck, ArrowUpRight,
  Maximize2, Minimize2, Trash2, Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../../api';

export const AdminCopilotWidget = ({ currentCaseId, onNavigateToCase }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFocusCaseId, setActiveFocusCaseId] = useState(currentCaseId);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `### 🤖 Razorpay Recovery Copilot (RAG Admin AI)

I am your **Autonomous Revenue Recovery Copilot**, grounded in your live MongoDB transactions and merchant playbooks.

You can ask me to:
- 📊 **Revenue Analytics:** *"Summarize our recovered revenue and win-rate today."*
- 🔍 **Case Audits:** *"Why was case rc_... escalated?"* or *"Analyze this failure."*
- 🛡️ **Policy Inquiries:** *"What is our policy for ₹50,000+ high-value transactions?"*
- 🚨 **Pending Actions:** *"What cases currently require merchant approval?"*
- ⚡ **Direct Actions:** *"Approve case rc_..."* to authorize high-value transactions.`,
      sources: ['Merchant Recovery Playbook', 'Live DB Ledger'],
      suggested_prompts: [
        'What is our policy for ₹50,000+ high-value transactions?',
        'Summarize our revenue recovery performance',
        'What cases currently require merchant approval?',
        'Explain how the AI handles expired cards vs soft declines'
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setActiveFocusCaseId(currentCaseId);
  }, [currentCaseId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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
        conversation_history: historyForApi,
        context_case_id: activeFocusCaseId
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

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: '🧹 Conversation reset. How can I assist you with your recovery operations?',
        sources: ['Merchant Playbook'],
        suggested_prompts: [
          'What is our policy for ₹50,000+ high-value transactions?',
          'Summarize our revenue recovery performance',
          'What cases currently require merchant approval?'
        ]
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#0C54EA] hover:bg-[#0A47C4] text-white p-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2 border-2 border-white/20 select-none group"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="font-black text-xs tracking-tight pr-1">Recovery Copilot</span>
          <span className="bg-white/20 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">RAG</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
            isExpanded
              ? 'inset-6 sm:inset-12'
              : 'bottom-6 right-6 w-[92vw] sm:w-[500px] h-[660px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#02042B] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0C54EA] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300 fill-current" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-sm text-white">Razorpay Recovery Copilot</h3>
                  <span className="bg-blue-500/30 text-blue-300 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border border-blue-400/30">
                    RAG Grounded
                  </span>
                </div>
                {activeFocusCaseId ? (
                  <div className="flex items-center space-x-1.5 text-[10px] text-blue-300 font-medium">
                    <Tag className="w-2.5 h-2.5" />
                    <span>Focus: {activeFocusCaseId}</span>
                    <button
                      onClick={() => setActiveFocusCaseId(null)}
                      className="text-slate-400 hover:text-white underline ml-1"
                    >
                      (Clear focus)
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium">
                    Connected to live database & merchant policies
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-400">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Copilot"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#0C54EA] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-4 shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#0C54EA] text-white font-medium rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-3'
                  }`}
                >
                  {/* Message Content with ReactMarkdown */}
                  <div className="prose prose-xs max-w-none font-sans leading-relaxed text-slate-800 space-y-2 [&_h3]:font-black [&_h3]:text-[#02042B] [&_h3]:text-sm [&_h3]:mb-1 [&_strong]:text-[#02042B] [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_th]:bg-slate-100 [&_th]:p-1.5 [&_th]:border [&_td]:p-1.5 [&_td]:border [&_td]:text-[11px] [&_code]:bg-slate-100 [&_code]:text-[#0C54EA] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Action Taken Banner */}
                  {msg.action_taken && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-emerald-800 font-bold text-[11px] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{msg.action_taken.message}</span>
                    </div>
                  )}

                  {/* RAG Sources Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Policy Grounding:</span>
                      {msg.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-slate-200 flex items-center"
                        >
                          <ShieldCheck className="w-2.5 h-2.5 text-blue-600 mr-1" />
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Prompts Chips inside message */}
                  {msg.suggested_prompts && msg.suggested_prompts.length > 0 && idx === messages.length - 1 && (
                    <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Suggested Inquiries:</div>
                      <div className="flex flex-col gap-1">
                        {msg.suggested_prompts.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            className="text-left text-[11px] text-[#0C54EA] hover:text-[#0A47C4] hover:bg-blue-50/70 p-2 rounded-lg border border-blue-100 transition-colors flex items-center justify-between font-bold bg-white"
                          >
                            <span>{prompt}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-[10px]">
                    SK
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs p-2.5 bg-white rounded-xl border border-slate-200 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0C54EA]" />
                <span className="font-bold">Retrieving merchant policies & synthesizing live ledger...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about ₹50k policy, cases needing approval, revenue stats..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0C54EA] focus:bg-white transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="bg-[#0C54EA] hover:bg-[#0A47C4] text-white p-2.5 rounded-xl disabled:opacity-40 transition-colors shadow-xs shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
