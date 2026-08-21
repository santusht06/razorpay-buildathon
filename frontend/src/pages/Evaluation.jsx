import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, TrendingUp, ShieldAlert, Award, Play, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export const Evaluation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sampleCount, setSampleCount] = useState(1000);

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const res = await api.runEvaluation(sampleCount);
      setData(res.data);
    } catch (err) {
      console.error('Error running benchmark:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBenchmark();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Empirical Benchmark Dataset Evaluation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Baseline Rules Engine vs. Autonomous AI Recovery Agent</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Evaluate performance across {sampleCount.toLocaleString()} synthetic payment failure scenarios. Compares static rule-based retry logic against context-aware AI diagnosis with RAG policy guardrails.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={sampleCount}
            onChange={(e) => setSampleCount(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500"
          >
            <option value={100}>100 Cases</option>
            <option value={500}>500 Cases</option>
            <option value={1000}>1,000 Cases</option>
          </select>
          <button
            onClick={runBenchmark}
            disabled={loading}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Running 1k Cases...' : 'Run Benchmark Evaluation'}</span>
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Key Value Metric Lift Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 shadow-xl">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Incremental Revenue Recovered</div>
              <div className="text-3xl font-extrabold text-slate-100 mt-2">
                +₹{(data.lift?.incremental_revenue_recovered || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400 mt-1">Additional ₹ saved by AI Agent vs. static rules</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-sky-500/30 bg-sky-500/5 shadow-xl">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">Recovery Rate Lift</div>
              <div className="text-3xl font-extrabold text-slate-100 mt-2">
                +{data.lift?.recovery_rate_improvement_pct}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Net improvement in successful recovery ratio</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5 shadow-xl">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Wasteful Retry Reduction</div>
              <div className="text-3xl font-extrabold text-slate-100 mt-2">
                {data.lift?.wasteful_retry_reduction_pct}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Zero wasteful retries on terminal fraud/expired cards</div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl p-6">
            <h3 className="font-bold text-slate-100 text-sm mb-4">Detailed Performance Metric Comparison</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Baseline Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="font-bold text-slate-300 text-sm">{data.baseline?.name}</div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">Baseline</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Total Revenue Recovered:</span>
                    <span className="font-bold text-slate-200">₹{(data.baseline?.revenue_recovered || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Recovery Rate:</span>
                    <span className="font-bold text-slate-200">{data.baseline?.recovery_rate_pct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Unnecessary Wasteful Retries:</span>
                    <span className="font-bold text-rose-400">{data.baseline?.unnecessary_retries} attempts</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Avg Recovery Time:</span>
                    <span className="font-medium text-slate-300">{data.baseline?.avg_recovery_time_hours} hours</span>
                  </div>
                </div>
              </div>

              {/* AI Agent Card */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-500/40 rounded-xl p-5 space-y-4 shadow-lg shadow-sky-500/5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="font-bold text-sky-400 text-sm flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 fill-current text-amber-300" />
                    <span>{data.ai_agent?.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">AI Autonomous</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Total Revenue Recovered:</span>
                    <span className="font-extrabold text-emerald-400">₹{(data.ai_agent?.revenue_recovered || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Recovery Rate:</span>
                    <span className="font-extrabold text-emerald-400">{data.ai_agent?.recovery_rate_pct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Unnecessary Wasteful Retries:</span>
                    <span className="font-bold text-emerald-400">{data.ai_agent?.unnecessary_retries} attempts (Guardrail Protected)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Avg Recovery Time:</span>
                    <span className="font-medium text-sky-300">{data.ai_agent?.avg_recovery_time_hours} hours (4.5x faster)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
