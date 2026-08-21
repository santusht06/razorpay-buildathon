import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  // Health
  getHealth: () => axios.get(`${API_BASE_URL}/health`),

  // Metrics & Dashboard Summary
  getMetrics: () => axios.get(`${API_BASE_URL}/dashboard/summary`),

  // Cases & Details
  getCases: (params) => axios.get(`${API_BASE_URL}/recoveries`, { params }),
  getCaseDetail: (id) => axios.get(`${API_BASE_URL}/recoveries/${id}`),
  simulateCustomerRecovery: (id) => axios.post(`${API_BASE_URL}/recoveries/${id}/recover`),

  // Manual Overrides
  approveCase: (id) => axios.post(`${API_BASE_URL}/recoveries/${id}/approve`),
  retryCase: (id) => axios.post(`${API_BASE_URL}/recoveries/${id}/retry`),
  stopCase: (id) => axios.post(`${API_BASE_URL}/recoveries/${id}/stop`),
  escalateCase: (id) => axios.post(`${API_BASE_URL}/recoveries/${id}/escalate`),

  // Hackathon Demo Scenarios Trigger
  triggerDemoScenario: (scenario) => axios.post(`${API_BASE_URL}/demo/scenarios/${scenario}`),

  // Payments & Simulator
  getPayments: (params) => axios.get(`${API_BASE_URL}/payments`, { params }),
  simulatePaymentFailure: (payload) => axios.post(`${API_BASE_URL}/payments/simulate-failure`, payload),

  // Analytics
  getAnalytics: () => axios.get(`${API_BASE_URL}/analytics`),

  // Audit Logs
  getAuditLogs: (limit = 100) => axios.get(`${API_BASE_URL}/recovery/audit-logs?limit=${limit}`),

  // Benchmark Evaluation
  runEvaluation: (count = 1000) => axios.post(`${API_BASE_URL}/recovery/evaluation/run?count=${count}`),
};
