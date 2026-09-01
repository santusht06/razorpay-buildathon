import logging
import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.config import settings
from app.db.mongodb import db_col
from app.rag.adaptive_retriever import adaptive_policy_retriever
from app.services.recovery_service import RecoveryService
from app.models.recovery import RecoveryStatus

logger = logging.getLogger(__name__)

ASSISTANT_SYSTEM_PROMPT = """You are Razorpay Recovery Copilot — an expert AI assistant embedded in the Merchant Admin Portal.
Your purpose is to help merchants understand, monitor, and manage their autonomous revenue recovery pipeline.

YOU HAVE ACCESS TO:
1. Live Database Context: Real-time recovery metrics, financial amounts at risk, and recovery cases.
2. Merchant Recovery Playbooks & RAG Policies: Guardrail limits (e.g. ₹50,000 auto limit), dunning schedules, stopping rules, and optimal channels.
3. Case Details: Customer history, AI diagnosis, confidence scores, and action audit logs.

GUIDELINES:
- Provide direct, highly relevant, executive-ready responses formatted with clean Markdown (bolding, bullet points, rupee symbols ₹).
- Answer the EXACT question the merchant asked. Do not repeat case details unless asked specifically about that case.
- When answering policy questions (e.g. ₹50,000 threshold, retry limits), quote the exact merchant rules from the RAG playbooks.
"""

class AssistantService:
    """
    RAG-Powered AI Copilot for Merchant Admin Portal.
    Synthesizes live DB state, merchant policies, and multi-model LLM reasoning.
    """

    @classmethod
    async def chat(
        cls,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context_case_id: Optional[str] = None
    ) -> Dict[str, Any]:
        conversation_history = conversation_history or []
        msg_clean = message.strip()
        msg_lower = msg_clean.lower()

        # 1. Fetch Live DB Context
        metrics = await RecoveryService.get_dashboard_metrics()
        
        # Check if a specific case ID was mentioned in message or context
        case_id_match = re.search(r'\b(rc_[a-zA-Z0-9_-]+)\b', msg_clean)
        explicit_case_id = case_id_match.group(1) if case_id_match else None
        target_case_id = explicit_case_id or context_case_id

        specific_case = None
        case_decision = None
        case_customer = None
        action_taken = None

        if target_case_id:
            specific_case = await db_col("recovery_cases").find_one({"case_id": target_case_id})
            if specific_case:
                case_decision = await db_col("agent_decisions").find_one({"case_id": target_case_id})
                case_customer = await db_col("customers").find_one({"customer_id": specific_case.get("customer_id")})

        # Check for direct action intents (e.g., "approve rc_...", "retry rc_...")
        if "approve" in msg_lower and specific_case:
            if specific_case.get("recovery_status") == RecoveryStatus.ESCALATED.value:
                # Trigger approve via RecoveryService / DB
                await RecoveryService.process_merchant_approval(target_case_id)
                action_taken = {
                    "type": "APPROVED",
                    "case_id": target_case_id,
                    "message": f"Successfully approved case {target_case_id}. Autonomous VIP recovery action initiated."
                }
            else:
                action_taken = {
                    "type": "INFO",
                    "case_id": target_case_id,
                    "message": f"Case {target_case_id} is in status '{specific_case.get('recovery_status')}'."
                }

        # Fetch recent cases and escalated cases
        escalated_cases = await db_col("recovery_cases").find({"recovery_status": RecoveryStatus.ESCALATED.value}).sort("created_at", -1).limit(5).to_list(5)
        recent_cases = await db_col("recovery_cases").find({}).sort("created_at", -1).limit(5).to_list(5)
        
        # 2. RAG Semantic Policy Retrieval based on query
        rag_policies = adaptive_policy_retriever.retrieve_relevant_policies(msg_clean, top_k=3)

        # 3. Build Augmented Context for LLM
        context_payload = {
            "live_metrics": {
                "total_cases": metrics.get("total_cases"),
                "revenue_at_risk": f"₹{metrics.get('revenue_at_risk', 0):,.2f}",
                "revenue_recovered": f"₹{metrics.get('revenue_recovered', 0):,.2f}",
                "recovery_rate": f"{metrics.get('recovery_rate_pct', 0)}%",
                "active_recoveries": metrics.get("active_cases"),
                "escalated_cases_needing_approval": metrics.get("escalated_cases")
            },
            "retrieved_merchant_policies": [
                {"title": p["title"], "category": p["category"], "content": p["content"]}
                for p in rag_policies
            ],
            "escalated_cases": [
                {
                    "case_id": c.get("case_id"),
                    "amount": f"₹{c.get('amount_at_risk', 0):,.2f}",
                    "failure_reason": c.get("failure_reason")
                }
                for c in escalated_cases
            ]
        }

        if specific_case and (explicit_case_id or any(t in msg_lower for t in ["this case", "diagnosis", "customer", "why was", "details"])):
            context_payload["focused_case"] = {
                "case_id": specific_case.get("case_id"),
                "amount": f"₹{specific_case.get('amount_at_risk', 0):,.2f}",
                "failure_reason": specific_case.get("failure_reason"),
                "status": specific_case.get("recovery_status"),
                "customer_name": case_customer.get("name") if case_customer else "Customer",
                "customer_email": case_customer.get("email") if case_customer else "",
                "customer_ltv": f"₹{case_customer.get('ltv', 0):,.2f}" if case_customer else "—",
                "ai_diagnosis": case_decision.get("diagnosis") if case_decision else "—",
                "ai_recommended_action": case_decision.get("recommended_action") if case_decision else "—",
                "ai_reasoning": case_decision.get("reasoning_summary") if case_decision else "—",
                "recovery_probability": f"{int((case_decision.get('recovery_probability', 0) * 100))}%" if case_decision else "—"
            }

        # 4. Generate AI Response
        reply_text = await cls._generate_reply(msg_clean, context_payload, conversation_history, explicit_case_id is not None)

        # 5. Suggested follow-up prompts
        suggested_prompts = cls._generate_suggested_prompts(metrics, specific_case, msg_lower)

        return {
            "reply": reply_text,
            "sources": [p["title"] for p in rag_policies],
            "action_taken": action_taken,
            "suggested_prompts": suggested_prompts,
            "metrics_snapshot": {
                "revenue_recovered": metrics.get("revenue_recovered", 0),
                "recovery_rate_pct": metrics.get("recovery_rate_pct", 0),
                "escalated_cases": metrics.get("escalated_cases", 0)
            }
        }

    @classmethod
    async def _generate_reply(
        cls,
        user_message: str,
        context: Dict[str, Any],
        history: List[Dict[str, str]],
        explicit_case_requested: bool
    ) -> str:
        """
        Generates assistant response using Groq / Multi-Model router with rich dynamic domain RAG fallback.
        """
        # Try Groq LLM if configured
        if settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 10:
            for model_name in ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"]:
                try:
                    from groq import AsyncGroq
                    client = AsyncGroq(api_key=settings.GROQ_API_KEY)

                    messages = [{"role": "system", "content": ASSISTANT_SYSTEM_PROMPT}]
                    for h in history[-4:]:
                        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})

                    prompt_content = f"CONTEXT:\n{json.dumps(context, indent=2)}\n\nUSER QUESTION:\n{user_message}"
                    messages.append({"role": "user", "content": prompt_content})

                    res = await client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=0.1,
                        max_tokens=600
                    )
                    reply = res.choices[0].message.content.strip()
                    if reply:
                        return reply
                except Exception as e:
                    logger.warning(f"Groq {model_name} failed: {e}. Trying next or domain fallback.")

        # Deep domain RAG synthesizer with intent analysis
        return cls._synthesize_fallback_reply(user_message, context, explicit_case_requested)

    @classmethod
    def _synthesize_fallback_reply(cls, message: str, context: Dict[str, Any], explicit_case_requested: bool) -> str:
        msg_lower = message.lower()
        metrics = context.get("live_metrics", {})
        policies = context.get("retrieved_merchant_policies", [])
        focused = context.get("focused_case")
        escalated = context.get("escalated_cases", [])

        # 1. Policy & Guardrail Questions (e.g. ₹50,000 limit, retry count, fraud stops)
        if any(term in msg_lower for term in ["policy", "guardrail", "limit", "rule", "50000", "50k", "threshold", "ceiling", "safety", "rules"]):
            policy_snippets = "\n\n".join([
                f"📌 **{p['title']}** ({p['category']}):\n{p['content']}"
                for p in policies
            ])
            return f"""### 🛡️ Merchant Recovery Policy & Guardrails

Here is the exact merchant policy configuration retrieved from our RAG knowledge base:

{policy_snippets}

---
### 🔒 Key Deterministic Guardrails Enforced:
1. **₹50,000 Value Ceiling (Level 3 Bounded Autonomy):** Any transaction $\ge ₹50,000$ is **strictly blocked** from automatic retries and escalated for manual merchant authorization.
2. **Maximum 3 Retries:** Automatic retries are capped at 3 attempts per invoice to safeguard merchant reputation and prevent gateway penalties.
3. **Instant Security Halts:** Terminal stolen cards or fraud flags halt the recovery loop immediately (0 retries).
4. **Smart Channel Selection:** Soft insufficient funds receive 1-click payment links, while expired cards trigger payment method update portals."""

        # 2. Escalations & Approvals Questions
        if any(term in msg_lower for term in ["require approval", "requiring approval", "escalat", "pending approval", "manual approval", "approval needed"]):
            if escalated:
                cases_list = "\n".join([f"- **Case `{c['case_id']}`**: **{c['amount']}** — Reason: `{c['failure_reason']}` (Action: type `Approve {c['case_id']}`)" for c in escalated])
                return f"""### 🚨 Cases Requiring Merchant Approval

There are currently **{len(escalated)} escalated transactions** exceeding the ₹50,000 safety threshold:

{cases_list}

**To approve any case:** Type `Approve <case_id>` or click the **Approve** button on the recovery timeline."""
            else:
                return f"""### ✅ No Pending Escalations

There are currently **0 escalated cases** requiring merchant approval. All transactions under ₹50,000 are being handled autonomously by Level 1 and Level 2 recovery agents."""

        # 3. Strategy & Mechanism Questions (e.g. Expired Cards vs Soft Declines, UPI, Backoff)
        if any(term in msg_lower for term in ["expired card", "soft decline", "how does the ai handle", "difference", "backoff", "mandate", "upi", "3ds", "strategy"]):
            return f"""### 🧠 AI Strategy Breakdown: Failure Modes & Recovery Paths

The Recovery Agent adapts its strategy dynamically based on failure categorization:

| Failure Category | Root Cause | AI Action | Why This Strategy? |
| :--- | :--- | :--- | :--- |
| **Soft Decline** | Temporary balance / limit | `SEND_RECOVERY_EMAIL` | 1-click Razorpay payment link sent at payday window |
| **Expired Card** | Expired card credentials | `REQUEST_PAYMENT_METHOD_UPDATE` | Directs customer to update card details without blind retries |
| **UPI Mandate** | Daily limit / PSP timeout | `SEND_RECOVERY_EMAIL` | Triggers 1-click UPI Intent link bypassing mandate limit |
| **Bank Outage** | Gateway network timeout | `SCHEDULE_RETRY` | 4-hour exponential backoff once bank recovers |
| **High-Value (>₹50k)** | Enterprise transaction | `ESCALATE` | Guardrail block for VIP concierge review |
| **Fraud / Stolen** | Security blacklist | `STOP` | Immediate halt to protect merchant chargeback ratio |"""

        # 4. Metrics & Performance Queries
        if any(term in msg_lower for term in ["revenue", "summary", "stats", "metrics", "rate", "kpi", "performance", "recovered", "how much"]):
            return f"""### 📊 Real-Time Recovery Ledger Summary

Here is your live revenue recovery performance across all monitored transactions:

- 💰 **Total Revenue Recovered:** **{metrics.get('revenue_recovered')}**
- ⚠️ **Revenue at Risk:** **{metrics.get('revenue_at_risk')}**
- 📈 **Conversion Win-Rate:** **{metrics.get('recovery_rate')}**
- 🔄 **Active Recoveries in Flight:** **{metrics.get('active_recoveries')}**
- 🚨 **Cases Requiring Merchant Approval:** **{metrics.get('escalated_cases_needing_approval')}**

Our bounded autonomous pipeline eliminates wasteful retries while capturing recoverable revenue across card, UPI, and netbanking channels."""

        # 5. Specific Case Diagnosis Query (Only when asked or explicitly referenced)
        if focused and (explicit_case_requested or any(t in msg_lower for t in ["this case", "diagnosis", "customer", "why was", "details", "explain"])):
            return f"""### 📋 Case Details: `{focused['case_id']}`

- **Customer:** {focused['customer_name']} ({focused['customer_email']}) | **LTV:** {focused['customer_ltv']}
- **Amount at Risk:** **{focused['amount']}**
- **Failure Reason:** `{focused['failure_reason']}`
- **Current Status:** **`{focused['status']}`**
- **AI Diagnosis:** {focused['ai_diagnosis'].replace('_', ' ').title()}
- **Recommended Action:** `{focused['ai_recommended_action']}` (Recovery Probability: **{focused['recovery_probability']}**)

**AI Business Rationale:**  
_{focused['ai_reasoning']}_

{"💡 **Action Available:** You can approve this case by typing `Approve " + focused['case_id'] + "`." if focused['status'] == 'ESCALATED' else ""}"""

        # 6. General Conversational / Helpful Answer
        return f"""### 🤖 Razorpay Recovery Copilot

I can help you monitor and operate your autonomous recovery pipeline:

- 📊 **Revenue Analytics:** Total recovered: **{metrics.get('revenue_recovered')}** ({metrics.get('recovery_rate')} win rate).
- 🚨 **Escalations:** **{metrics.get('escalated_cases_needing_approval')}** transactions awaiting merchant review.
- 🛡️ **Policies:** Ask about the ₹50,000 limit, 3-retry maximum, or security rules.
- ⚡ **Direct Actions:** Type `Approve <case_id>` to authorize high-value transactions.

How would you like to proceed?"""

    @classmethod
    def _generate_suggested_prompts(
        cls,
        metrics: Dict[str, Any],
        specific_case: Optional[Dict[str, Any]],
        msg_lower: str
    ) -> List[str]:
        if "policy" in msg_lower or "guardrail" in msg_lower:
            return [
                "What cases currently require merchant approval?",
                "Explain how the AI handles expired cards vs soft declines",
                "Summarize our revenue recovery performance",
                "What is our policy for bank gateway outages?"
            ]
        elif "revenue" in msg_lower or "metrics" in msg_lower:
            return [
                "What cases currently require merchant approval?",
                "What is our policy for ₹50,000+ high-value transactions?",
                "Explain how the AI handles expired cards vs soft declines"
            ]
        elif specific_case:
            return [
                f"Explain the AI diagnosis for {specific_case.get('case_id')}",
                "What is our policy for ₹50,000+ high-value transactions?",
                "Summarize our revenue recovery performance"
            ]
        return [
            "Summarize our revenue recovery performance",
            "What cases currently require merchant approval?",
            "What is our policy for ₹50,000+ high-value transactions?",
            "Explain how the AI handles expired cards vs soft declines"
        ]
