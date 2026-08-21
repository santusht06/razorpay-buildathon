# Autonomous AI Revenue Recovery Platform

> **Razorpay AI Innovation Hackathon — Track 3: AI Revenue Recovery**

An autonomous, production-oriented full-stack revenue recovery platform built for Razorpay merchants. The platform identifies revenue at risk, diagnoses root causes using a LangChain RAG AI Agent, enforces security guardrails via a deterministic policy engine, safely executes recovery actions, strictly verifies captured payment outcomes, and measures total ₹ revenue recovered.

---

## Core Value Proposition

> **Detect Revenue at Risk → Understand Why → Determine Strategy (AI RAG) → Validate Policy Guardrails → Safely Act → Verify Payment State → Measure Money Recovered → Maintain Audit Trail**

---

## Tech Stack

- **Frontend**: React (Vite), JavaScript (JSX), Tailwind CSS, Lucide React icons
- **Backend**: Python 3.12, FastAPI, Pydantic v2, Motor (MongoDB), Async Architecture
- **Database**: MongoDB (with fallback in-memory document store) + Redis (Idempotency & Locks)
- **AI & RAG Engine**: LangChain, TF-IDF Vector Embeddings & Similarity Search, OpenAI/Gemini support with intelligent zero-dependency heuristic fallback
- **Payment & Security Integration**: Razorpay Webhooks (`X-Razorpay-Signature` HMAC verification), Razorpay Sandbox API integration, Deterministic Policy Guardrails

---

## Key Features

1. **4 Revenue Risk Types**:
   - `FAILED_PAYMENT`: Credit card / UPI payment failure
   - `FAILED_SUBSCRIPTION`: Recurring monthly / annual subscription failure
   - `CHECKOUT_ABANDONMENT`: Customer abandoned payment stage during checkout
   - `OVERDUE_RECEIVABLE`: B2B invoice receivables overdue

2. **LangChain AI Recovery Agent & Vector RAG**:
   - Semantic policy retrieval across merchant playbooks (`temporary_failure_policy`, `expired_payment_method_policy`, `subscription_recovery_policy`, `checkout_recovery_policy`, `high_value_payment_policy`, `stopping_rules`).
   - Generates structured JSON output (`diagnosis`, `recovery_probability`, `recommended_action`, `reasoning_summary`, `confidence`).

3. **Deterministic Policy & Guardrail Security Engine**:
   - Enforces max 3 retries limit
   - Enforces max automatic recovery limit (₹50,000)
   - Strict block on terminal card failures (`stolen_card`, `fraud_blocked`, `card_blacklisted`)
   - High-value VIP escalation threshold (>= ₹10,000)
   - Redis idempotency key validation on all payment actions

4. **Strict Verification Service**:
   - Enforces post-action payment state checking against Razorpay before marking revenue as recovered.

5. **1,000-Case Empirical Benchmark**:
   - Compares **Baseline Naive Rules Engine vs. Autonomous AI Recovery Agent** (measuring incremental ₹ recovered, recovery rate %, and zero wasteful retries).

6. **Interactive Hackathon Demo Scenarios**:
   - **Scenario 1**: ₹2,499 Subscription Temporary Failure -> Email -> Recovered
   - **Scenario 2**: ₹999 Subscription Expired Card -> Payment Method Update Email -> Recovered
   - **Scenario 3**: ₹75,000 High-Value Payment -> Guardrail Limit Block -> Escalated to Merchant
   - **Scenario 4**: ₹25,000 Checkout Abandonment -> Context Evaluation -> Recovered

---

## Quick Start

### 1. Clone & Setup Backend
```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
cp .env.example .env
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Endpoints

- `GET /api/v1/health` - API health check
- `GET /api/v1/dashboard/summary` - Metrics & KPI summary
- `GET /api/v1/recoveries` - Searchable recovery cases list
- `GET /api/v1/recoveries/{id}` - Full lifecycle detail & audit trail
- `POST /api/v1/demo/scenarios/{scenario}` - Trigger demo scenarios (`scenario-1`, `scenario-2`, `scenario-3`, `scenario-4`)
- `POST /api/v1/webhooks/razorpay` - Razorpay webhook ingestion endpoint
- `POST /api/v1/recovery/evaluation/run` - Run 1,000-case synthetic benchmark
