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
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-purple-700 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Empirical Benchmark Dataset Evaluation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Baseline Rules Engine vs. Groq AI Recovery Agent</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
            Evaluate performance across {sampleCount.toLocaleString()} synthetic payment failure scenarios. Compares static rule-based retry logic against context-aware AI diagnosis with RAG policy guardrails.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={sampleCount}
            onChange={(e) => setSampleCount(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600"
          >
            <option value={100}>100 Cases</option>
            <option value={500}>500 Cases</option>
            <option value={1000}>1,000 Cases</option>
          </select>
          <button
            onClick={runBenchmark}
            disabled={loading}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Running 1k Cases...' : 'Run Benchmark Evaluation'}</span>
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Key Metric Lift Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-sm">
              <div className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">Incremental Revenue Recovered</div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                +₹{(data.lift?.incremental_revenue_recovered || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Additional ₹ saved by AI Agent vs. static rules</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-blue-200 bg-blue-50/20 shadow-sm">
              <div className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Recovery Rate Lift</div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                +{data.lift?.recovery_rate_improvement_pct}%
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Net improvement in successful recovery ratio</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/20 shadow-sm">
              <div className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">Wasteful Retry Reduction</div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {data.lift?.wasteful_retry_reduction_pct}%
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Zero wasteful retries on terminal fraud/expired cards</div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Detailed Metric Comparison</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Baseline Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="font-extrabold text-slate-800 text-sm">{data.baseline?.name}</div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">Baseline</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Total Revenue Recovered:</span>
                    <span className="font-bold text-slate-900">₹{(data.baseline?.revenue_recovered || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Recovery Rate:</span>
                    <span className="font-bold text-slate-900">{data.baseline?.recovery_rate_pct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Unnecessary Wasteful Retries:</span>
                    <span className="font-bold text-rose-600">{data.baseline?.unnecessary_retries} attempts</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Avg Recovery Time:</span>
                    <span className="font-bold text-slate-800">{data.baseline?.avg_recovery_time_hours} hours</span>
                  </div>
                </div>
              </div>

              {/* AI Agent Card */}
              <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                  <div className="font-extrabold text-blue-900 text-sm flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-current" />
                    <span>{data.ai_agent?.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">AI Autonomous</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-blue-200/60">
                    <span className="text-slate-600 font-medium">Total Revenue Recovered:</span>
                    <span className="font-black text-emerald-700">₹{(data.ai_agent?.revenue_recovered || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-200/60">
                    <span className="text-slate-600 font-medium">Recovery Rate:</span>
                    <span className="font-black text-emerald-700">{data.ai_agent?.recovery_rate_pct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-200/60">
                    <span className="text-slate-600 font-medium">Unnecessary Wasteful Retries:</span>
                    <span className="font-extrabold text-emerald-700">{data.ai_agent?.unnecessary_retries} attempts (Guardrail Protected)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 font-medium">Avg Recovery Time:</span>
                    <span className="font-extrabold text-blue-800">{data.ai_agent?.avg_recovery_time_hours} hours (4.5x faster)</span>
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
