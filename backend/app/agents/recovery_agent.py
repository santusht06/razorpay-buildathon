import logging
import json
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import uuid

from app.config import settings
from app.models.recovery import ActionType
from app.rag.retriever import policy_retriever
from app.agents.prompts import RECOVERY_AGENT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class RecoveryAgent:
    """
    LangChain AI Recovery Agent with Groq AI integration, RAG vector retrieval, and fallback.
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
        1. Context Retrieval (Payment, Customer, RAG Policies)
        2. Diagnosis & Strategy Reasoning (Groq AI / OpenAI / Gemini / Heuristic)
        3. Structured Output Generation
        """
        failure_reason = payment.get("failure_reason", "unknown")
        amount = payment.get("amount", 0.0)
        payment_method = payment.get("payment_method", "card")
        
        customer_name = customer.get("name", "Valued Customer")
        customer_email = customer.get("email", "")
        ltv = customer.get("ltv", 0.0)
        
        history = customer.get("history_summary", {})
        reliability_score = history.get("payment_reliability_score", 0.85)
        successful_payments = history.get("successful_payments", 1)

        # 1. RAG Policy Context Retrieval
        query = f"{failure_reason} {payment_method} amount {amount}"
        rag_policies = policy_retriever.retrieve_relevant_policies(query, top_k=2)

        # 2. Try Groq AI Execution if GROQ_API_KEY is configured
        if settings.GROQ_API_KEY:
            groq_decision = await cls._invoke_llm_groq(payment, customer, case, rag_policies)
            if groq_decision:
                groq_decision["rag_policies_used"] = rag_policies
                return groq_decision

        # 3. Try OpenAI Execution if OPENAI_API_KEY is configured
        if settings.OPENAI_API_KEY:
            openai_decision = await cls._invoke_llm_openai(payment, customer, case, rag_policies)
            if openai_decision:
                openai_decision["rag_policies_used"] = rag_policies
                return openai_decision

        # 4. High-Precision Heuristic AI Engine Fallback (Zero external dependency required)
        heuristic_decision = cls._heuristic_reasoning(
            failure_reason=failure_reason,
            amount=amount,
            payment_method=payment_method,
            ltv=ltv,
            reliability_score=reliability_score,
            successful_payments=successful_payments,
            retry_count=case.get("attempt_count", 0),
            rag_policies=rag_policies
        )
        
        return heuristic_decision

    @classmethod
    async def _invoke_llm_groq(cls, payment: Dict[str, Any], customer: Dict[str, Any], case: Dict[str, Any], policies: list) -> Optional[Dict[str, Any]]:
        """
        Executes Groq AI LLM inference using ChatGroq / Groq API.
        """
        try:
            from langchain_groq import ChatGroq
            llm = ChatGroq(
                groq_api_key=settings.GROQ_API_KEY,
                model_name=settings.GROQ_MODEL,
                temperature=0.1
            )
            
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
        ltv: float,
        reliability_score: float,
        successful_payments: int,
        retry_count: int,
        rag_policies: list
    ) -> Dict[str, Any]:
        """
        Deterministic, policy-aligned heuristic decision maker matching merchant RAG playbooks.
        """
        reason_lower = failure_reason.lower()

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

        # High value payment (₹50,000+ or ₹10,000+ VIP)
        if amount >= 50000.0 or amount >= settings.HIGH_VALUE_THRESHOLD:
            return {
                "diagnosis": "high_value_transaction_failure",
                "recovery_probability": 0.82,
                "recommended_action": ActionType.ESCALATE.value,
                "reasoning_summary": f"High-value transaction (₹{amount:,.2f}) detected. Escalated for merchant VIP outreach under guardrail policy.",
                "confidence": 0.94,
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
                "reasoning_summary": "Transient bank network issue detected. Scheduled automated retry in 4 hours.",
                "confidence": 0.89,
                "source": "agent_rag_engine",
                "rag_policies_used": rag_policies
            }

        # Insufficient funds / Soft failure
        if reliability_score >= 0.7 or ltv > 1000:
            prob = 0.88 if successful_payments > 2 else 0.75
            return {
                "diagnosis": "temporary_insufficient_funds",
                "recovery_probability": prob,
                "recommended_action": ActionType.SEND_RECOVERY_EMAIL.value,
                "reasoning_summary": f"Customer has strong payment reliability score ({reliability_score:.2f}) and active LTV of ₹{ltv:,.2f}. Sending personalized payment retry link.",
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
