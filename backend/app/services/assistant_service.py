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
- Provide concise, executive-ready, professional responses formatted with clean Markdown (bolding, bullet points, rupee symbols ₹).
- Ground your answers in the provided Live Context and RAG Policies. Never hallucinate numbers.
- When referencing a case ID (e.g., rc_1234567890), clearly state its status, amount, failure reason, and recommended strategy.
- If the merchant asks to approve, retry, or investigate a case, provide direct assistance and note the action taken.
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
        target_case_id = case_id_match.group(1) if case_id_match else context_case_id

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
                # Trigger approve
                await db_col("recovery_cases").update_one(
                    {"case_id": target_case_id},
                    {"$set": {"recovery_status": RecoveryStatus.RECOVERING.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                action_taken = {
                    "type": "APPROVED",
                    "case_id": target_case_id,
                    "message": f"Successfully approved case {target_case_id}. Autonomous recovery action initiated."
                }
            else:
                action_taken = {
                    "type": "INFO",
                    "case_id": target_case_id,
                    "message": f"Case {target_case_id} is already in status '{specific_case.get('recovery_status')}'."
                }

        # Fetch recent 5 cases for general context
        recent_cases = await db_col("recovery_cases").find({}).sort("created_at", -1).limit(5).to_list(5)
        
        # 2. RAG Semantic Policy Retrieval
        retrieval_query = f"{msg_clean} {specific_case.get('failure_reason', '') if specific_case else ''}"
        rag_policies = adaptive_policy_retriever.retrieve_relevant_policies(retrieval_query, top_k=3)

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
            "recent_cases_summary": [
                {
                    "case_id": c.get("case_id"),
                    "amount": f"₹{c.get('amount_at_risk', 0):,.2f}",
                    "failure_reason": c.get("failure_reason"),
                    "status": c.get("recovery_status"),
                    "strategy": c.get("selected_strategy")
                }
                for c in recent_cases
            ]
        }

        if specific_case:
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

        # 4. Generate AI Response via Groq / Heuristic LLM Router
        reply_text = await cls._generate_reply(msg_clean, context_payload, conversation_history)

        # 5. Suggested follow-up prompts
        suggested_prompts = cls._generate_suggested_prompts(metrics, specific_case)

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
        history: List[Dict[str, str]]
    ) -> str:
        """
        Generates assistant response using Groq / Multi-Model router or high-precision domain synthesizer.
        """
        # Try Groq LLM if configured
        if settings.GROQ_API_KEY:
            try:
                from groq import AsyncGroq
                client = AsyncGroq(api_key=settings.GROQ_API_KEY)

                messages = [{"role": "system", "content": ASSISTANT_SYSTEM_PROMPT}]
                
                # Add past 4 messages for conversational continuity
                for h in history[-4:]:
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})

                prompt_content = f"""
LIVE REAL-TIME CONTEXT:
{json.dumps(context, indent=2)}

MERCHANT QUESTION:
{user_message}
"""
                messages.append({"role": "user", "content": prompt_content})

                res = await client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    temperature=0.2,
                    max_tokens=600
                )
                return res.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"Assistant Groq LLM failed: {e}. Falling back to domain RAG synthesizer.")

        # High-precision domain RAG synthesizer fallback
        return cls._synthesize_fallback_reply(user_message, context)

    @classmethod
    def _synthesize_fallback_reply(cls, message: str, context: Dict[str, Any]) -> str:
        msg_lower = message.lower()
        metrics = context.get("live_metrics", {})
        policies = context.get("retrieved_merchant_policies", [])
        focused = context.get("focused_case")

        # Specific Case Query
        if focused:
            return f"""### 📋 Case Details: `{focused['case_id']}`

- **Customer:** {focused['customer_name']} ({focused['customer_email']}) | **LTV:** {focused['customer_ltv']}
- **Amount at Risk:** **{focused['amount']}**
- **Failure Reason:** `{focused['failure_reason']}`
- **Current Status:** **`{focused['status']}`**
- **AI Diagnosis:** {focused['ai_diagnosis'].replace('_', ' ').title()}
- **Recommended Action:** `{focused['ai_recommended_action']}` (Recovery Probability: **{focused['recovery_probability']}**)

**AI Business Rationale:**  
_{focused['ai_reasoning']}_

{"💡 **Action Available:** You can approve this case by typing `Approve " + focused['case_id'] + "`." if focused['status'] == 'ESCALATED' else ""}
"""

        # Metrics / Revenue Summary
        if any(term in msg_lower for term in ["revenue", "summary", "stats", "metrics", "rate", "kpi", "performance", "recovered"]):
            return f"""### 📊 Live Revenue Recovery Performance

Here is your real-time recovery dashboard summary:

- 💰 **Total Revenue Recovered:** **{metrics.get('revenue_recovered')}**
- ⚠️ **Revenue at Risk:** **{metrics.get('revenue_at_risk')}**
- 📈 **Recovery Conversion Rate:** **{metrics.get('recovery_rate')}**
- 🔄 **Active Recoveries in Progress:** **{metrics.get('active_recoveries')}**
- 🚨 **Escalated Cases (Awaiting Approval):** **{metrics.get('escalated_cases_needing_approval')}**

Our autonomous recovery pipeline has successfully mitigated subscriber churn by automatically deploying personalized retry links and card update portals."""

        # Policy & Guardrail Questions
        if any(term in msg_lower for term in ["policy", "guardrail", "limit", "rule", "outage", "fraud", "50000", "50k"]):
            policy_snippets = "\n\n".join([
                f"**{p['title']}** ({p['category']}):\n{p['content']}"
                for p in policies[:2]
            ])
            return f"""### 🛡️ Merchant Recovery Policy Grounding

Based on our active merchant RAG playbooks:

{policy_snippets}

**Key Guardrails:**
- **₹50,000 Limit:** Any transaction $\ge ₹50,000$ requires manual merchant authorization (Level 3 bounded autonomy).
- **Fraud Halts:** Terminal fraud or stolen cards immediately stop all retries to protect gateway health.
- **Max Retries:** Capped at 3 automatic attempts."""

        # Default Helpful Copilot Response
        return f"""### 🤖 Razorpay Recovery Copilot

I can assist you with your autonomous revenue recovery operations:

- **Financial Analytics:** Total recovered: **{metrics.get('revenue_recovered')}** ({metrics.get('recovery_rate')} conversion rate).
- **Approvals & Escalations:** **{metrics.get('escalated_cases_needing_approval')}** cases currently require merchant review.
- **Case Diagnostics:** Give me any case ID (e.g. `rc_...`) to inspect AI reasoning, customer reliability, and audit logs.
- **Policy Inquiries:** Ask about merchant guardrails, retry limits, or UPI mandate rules.

How can I help you optimize recovery today?"""

    @classmethod
    def _generate_suggested_prompts(
        cls,
        metrics: Dict[str, Any],
        specific_case: Optional[Dict[str, Any]]
    ) -> List[str]:
        prompts = [
            "Summarize our revenue recovery performance",
            "What cases currently require merchant approval?",
            "What is our policy for ₹50,000+ high-value transactions?",
            "Explain how the AI handles expired cards vs soft declines"
        ]
        if specific_case:
            prompts.insert(0, f"Explain the AI diagnosis for {specific_case.get('case_id')}")
            if specific_case.get("recovery_status") == "ESCALATED":
                prompts.insert(1, f"Approve case {specific_case.get('case_id')}")
        return prompts[:4]
