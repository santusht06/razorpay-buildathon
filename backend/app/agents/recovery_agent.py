import logging
import json
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import uuid

from app.config import settings
from app.models.recovery import ActionType
from app.rag.adaptive_retriever import adaptive_policy_retriever
from app.services.customer_intelligence import CustomerIntelligenceEngine
from app.agents.model_router import ModelRouter
from app.agents.prompts import RECOVERY_AGENT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class RecoveryAgent:
    """
    Intelligent Adaptive AI Recovery Agent.
    Orchestrates Customer Behavioral Intelligence, Hybrid Adaptive RAG,
    Multi-Model LLM Routing, and Bayesian Probability Calibration.
    """

    @classmethod
    async def analyze_and_decide(
        cls,
        payment: Dict[str, Any],
        customer: Dict[str, Any],
        case: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes AI diagnosis loop:
        1. Dynamic Customer Intelligence & Churn Analysis
        2. Hybrid Semantic RAG Policy Retrieval
        3. Multi-Model LLM Routing with Circuit Breaker & Calibration
        4. High-Precision Heuristic Adaptation Fallback
        """
        failure_reason = payment.get("failure_reason", "unknown")
        amount = payment.get("amount", 0.0)
        payment_method = payment.get("payment_method", "card")

        # 1. Customer Intelligence & Behavioral Segmentation
        customer_intel = CustomerIntelligenceEngine.analyze_customer(
            customer=customer,
            payment=payment,
            case=case
        )

        # 2. Hybrid Adaptive RAG Policy Context Retrieval
        query = f"{failure_reason} {payment_method} amount {amount} tier {customer_intel['customer_tier']}"
        rag_policies = adaptive_policy_retriever.retrieve_relevant_policies(query, top_k=2)

        # 3. Try Multi-Model LLM Routing with Groq/OpenAI Cascading
        llm_decision = await ModelRouter.invoke_best_llm(
            payment=payment,
            customer=customer,
            customer_intel=customer_intel,
            policies=rag_policies
        )
        if llm_decision:
            llm_decision["rag_policies_used"] = rag_policies
            llm_decision["customer_intelligence"] = customer_intel
            return llm_decision

        # 4. Dynamic Heuristic Adaptation Engine Fallback (Zero external dependency required)
        heuristic_decision = cls._heuristic_reasoning(
            failure_reason=failure_reason,
            amount=amount,
            payment_method=payment_method,
            customer_intel=customer_intel,
            ltv=customer.get("ltv", 0.0),
            retry_count=case.get("attempt_count", 0),
            rag_policies=rag_policies
        )
        heuristic_decision["customer_intelligence"] = customer_intel
        return heuristic_decision

    @classmethod
    async def _invoke_llm_groq(cls, payment: Dict[str, Any], customer: Dict[str, Any], case: Dict[str, Any], policies: list) -> Optional[Dict[str, Any]]:
        """
        Executes Groq AI LLM inference using AsyncGroq SDK.
        """
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            
            user_prompt = f"""
            Payment ID: {payment.get('payment_id')}
            Amount: ₹{payment.get('amount')}
            Failure Reason: {payment.get('failure_reason')}
            Error Description: {payment.get('error_description')}
            Payment Method: {payment.get('payment_method')}
            
            Customer: {customer.get('name')} (LTV: ₹{customer.get('ltv')})
            Customer History: {json.dumps(customer.get('history_summary', {}))}
            
            Relevant RAG Merchant Policies:
            {json.dumps(policies, indent=2)}
            """
            
            res = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": RECOVERY_AGENT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            content = res.choices[0].message.content.strip()
            if "```" in content:
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            parsed = json.loads(content.strip())
            rec_action = parsed.get("recommended_action", ActionType.SEND_RECOVERY_EMAIL.value).upper()
            if rec_action not in ActionType.__members__:
                rec_action = ActionType.SEND_RECOVERY_EMAIL.value

            return {
                "diagnosis": parsed.get("diagnosis", "temporary_payment_failure"),
                "recovery_probability": float(parsed.get("recovery_probability", 0.85)),
                "recommended_action": rec_action,
                "reasoning_summary": parsed.get("reasoning_summary", "Groq AI diagnosed payment failure based on merchant policy."),
                "confidence": float(parsed.get("confidence", 0.94)),
                "source": f"groq_llm ({settings.GROQ_MODEL})"
            }
        except Exception as e:
            logger.warning(f"Groq AI execution failed: {e}. Falling back to next AI provider or heuristic engine.")
            return None

    @classmethod
    async def _invoke_llm_openai(cls, payment: Dict[str, Any], customer: Dict[str, Any], case: Dict[str, Any], policies: list) -> Optional[Dict[str, Any]]:
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model=settings.DEFAULT_LLM_MODEL, openai_api_key=settings.OPENAI_API_KEY, temperature=0.2)
            
            user_prompt = f"""
            Payment ID: {payment.get('payment_id')}
            Amount: ₹{payment.get('amount')}
            Failure Reason: {payment.get('failure_reason')}
            Error Description: {payment.get('error_description')}
            Payment Method: {payment.get('payment_method')}
            
            Customer: {customer.get('name')} (LTV: ₹{customer.get('ltv')})
            Customer History: {json.dumps(customer.get('history_summary', {}))}
            
            Relevant RAG Merchant Policies:
            {json.dumps(policies, indent=2)}
            """
            
            response = await llm.ainvoke([
                {"role": "system", "content": RECOVERY_AGENT_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ])
            
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            parsed = json.loads(content.strip())
            return {
                "diagnosis": parsed.get("diagnosis", "temporary_payment_failure"),
                "recovery_probability": float(parsed.get("recovery_probability", 0.85)),
                "recommended_action": parsed.get("recommended_action", ActionType.SEND_RECOVERY_EMAIL.value),
                "reasoning_summary": parsed.get("reasoning_summary", "AI diagnosed payment failure based on merchant policy."),
                "confidence": float(parsed.get("confidence", 0.90)),
                "source": "openai_llm"
            }
        except Exception as e:
            logger.warning(f"LLM OpenAI execution failed: {e}. Falling back to heuristic reasoning engine.")
            return None

    @classmethod
    def _heuristic_reasoning(
        cls,
        failure_reason: str,
        amount: float,
        payment_method: str,
        customer_intel: Dict[str, Any],
        ltv: float,
        retry_count: int,
        rag_policies: list
    ) -> Dict[str, Any]:
        """
        Deterministic, policy-aligned heuristic decision maker matching merchant RAG playbooks
        and dynamically adapting to customer intelligence signals.
        """
        reason_lower = failure_reason.lower()
        reliability_score = customer_intel.get("reliability_score", 0.85)
        churn_risk = customer_intel.get("churn_risk_score", 0.15)
        tier = customer_intel.get("customer_tier", "STANDARD")
        timing = customer_intel.get("timing_recommendation", {})

        # Terminal security / fraud block
        if any(term in reason_lower for term in ["stolen", "fraud", "blacklisted", "illegal"]):
            return {
                "diagnosis": "terminal_security_failure",
                "recovery_probability": 0.02,
                "recommended_action": ActionType.STOP.value,
                "reasoning_summary": "Security risk identified. Automated retries halted in accordance with merchant risk policy.",
                "confidence": 0.98,
                "source": "agent_rag_engine",
                "rag_policies_used": rag_policies
            }

        # Hard guardrail ceiling: ₹50,000+ requires merchant escalation
        if amount >= 50000.0:
            return {
                "diagnosis": "high_value_transaction_failure",
                "recovery_probability": 0.82,
                "recommended_action": ActionType.ESCALATE.value,
                "reasoning_summary": f"High-value transaction (₹{amount:,.2f}) exceeds ₹50,000 auto-recovery threshold. Escalated for merchant approval.",
                "confidence": 0.95,
                "source": "agent_rag_engine",
                "rag_policies_used": rag_policies
            }

        # Checkout Abandonment
        if "abandon" in reason_lower:
            return {
                "diagnosis": "checkout_abandonment",
                "recovery_probability": 0.84,
                "recommended_action": ActionType.SEND_RECOVERY_EMAIL.value,
                "reasoning_summary": f"Customer reached checkout but dropped off. Cart recovery link prepared for {tier} customer.",
                "confidence": 0.92,
                "source": "agent_rag_engine",
                "rag_policies_used": rag_policies
            }

        # Expired card / Bad auth
        if "expired" in reason_lower or "card_details" in reason_lower:
            return {
                "diagnosis": "expired_payment_method",
                "recovery_probability": 0.78,
                "recommended_action": ActionType.REQUEST_PAYMENT_METHOD_UPDATE.value,
                "reasoning_summary": "Payment method expired or details invalid. Requesting customer update card on file via Razorpay checkout.",
                "confidence": 0.92,
                "source": "agent_rag_engine",
                "rag_policies_used": rag_policies
            }

        # Bank network outage / Gateway error
        if any(term in reason_lower for term in ["outage", "gateway", "timeout", "bank"]):
            return {
                "diagnosis": "transient_bank_network_outage",
                "recovery_probability": 0.91,
                "recommended_action": ActionType.SCHEDULE_RETRY.value,
                "reasoning_summary": f"Transient bank network issue detected. {timing.get('reasoning', 'Scheduled automated retry in 4 hours.')}",
                "confidence": 0.89,
                "source": "agent_rag_engine",
                "rag_policies_used": rag_policies
            }

        # Insufficient funds / Soft failure with dynamic churn awareness
        if reliability_score >= 0.7 or ltv > 1000:
            prob = round(min(0.96, max(0.65, 0.80 + (reliability_score * 0.15) - (churn_risk * 0.10))), 2)
            return {
                "diagnosis": "temporary_insufficient_funds",
                "recovery_probability": prob,
                "recommended_action": ActionType.SEND_RECOVERY_EMAIL.value,
                "reasoning_summary": f"Customer in {tier} tier with reliability score {reliability_score:.2f}. {timing.get('reasoning', 'Sending personalized payment retry link.')}",
                "confidence": 0.91,
                "source": "agent_rag_engine",
                "rag_policies_used": rag_policies
            }

        # Fallback standard failure
        return {
            "diagnosis": "standard_payment_failure",
            "recovery_probability": 0.70,
            "recommended_action": ActionType.SEND_RECOVERY_EMAIL.value,
            "reasoning_summary": "Standard soft failure detected. Initiating personalized recovery workflow.",
            "confidence": 0.85,
            "source": "agent_rag_engine",
            "rag_policies_used": rag_policies
        }
