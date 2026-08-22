import logging
import json
import asyncio
from typing import Dict, Any, Optional, List
from app.config import settings
from app.models.recovery import ActionType
from app.agents.prompts import RECOVERY_AGENT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class ModelRouter:
    """
    Intelligent Multi-Model Router and Circuit Breaker.
    Routes between Groq Compound, Llama 3.3 70B, Mixtral, and OpenAI models.
    Performs dynamic probability calibration and self-grounding against merchant policies.
    """

    GROQ_MODEL_CASCADE = [
        settings.GROQ_MODEL,
        "llama-3.3-70b-versatile",
        "mixtral-8x7b-32768",
        "gemma2-9b-it"
    ]

    @classmethod
    async def invoke_best_llm(
        cls,
        payment: Dict[str, Any],
        customer: Dict[str, Any],
        customer_intel: Dict[str, Any],
        policies: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Attempts execution across available LLM providers with automatic fallback.
        """
        if not settings.GROQ_API_KEY and not settings.OPENAI_API_KEY:
            return None

        # 1. Try Groq with model cascading
        if settings.GROQ_API_KEY:
            for model_name in cls.GROQ_MODEL_CASCADE:
                decision = await cls._execute_groq(model_name, payment, customer, customer_intel, policies)
                if decision:
                    return decision

        # 2. Try OpenAI if configured
        if settings.OPENAI_API_KEY:
            decision = await cls._execute_openai(payment, customer, customer_intel, policies)
            if decision:
                return decision

        return None

    @classmethod
    async def _execute_groq(
        cls,
        model_name: str,
        payment: Dict[str, Any],
        customer: Dict[str, Any],
        customer_intel: Dict[str, Any],
        policies: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=settings.GROQ_API_KEY)

            prompt = cls._build_enriched_prompt(payment, customer, customer_intel, policies)

            res = await client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": RECOVERY_AGENT_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=400
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

            raw_prob = float(parsed.get("recovery_probability", 0.85))
            calibrated_prob = cls.calibrate_probability(raw_prob, customer_intel, payment.get("failure_reason", ""))

            return {
                "diagnosis": parsed.get("diagnosis", "temporary_payment_failure"),
                "recovery_probability": calibrated_prob,
                "recommended_action": rec_action,
                "reasoning_summary": parsed.get("reasoning_summary", "AI diagnosed payment failure with dynamic policy grounding."),
                "confidence": float(parsed.get("confidence", 0.94)),
                "source": f"groq_llm ({model_name})",
                "customer_intelligence": customer_intel
            }
        except Exception as e:
            logger.warning(f"Groq execution on {model_name} failed: {e}. Cascading to next model.")
            return None

    @classmethod
    async def _execute_openai(
        cls,
        payment: Dict[str, Any],
        customer: Dict[str, Any],
        customer_intel: Dict[str, Any],
        policies: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model=settings.DEFAULT_LLM_MODEL, openai_api_key=settings.OPENAI_API_KEY, temperature=0.1)
            prompt = cls._build_enriched_prompt(payment, customer, customer_intel, policies)

            response = await llm.ainvoke([
                {"role": "system", "content": RECOVERY_AGENT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ])
            content = response.content.strip()
            if content.startswith("```"):
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
                "reasoning_summary": parsed.get("reasoning_summary", "AI diagnosed payment failure."),
                "confidence": float(parsed.get("confidence", 0.90)),
                "source": "openai_llm",
                "customer_intelligence": customer_intel
            }
        except Exception as e:
            logger.warning(f"OpenAI execution failed: {e}")
            return None

    @classmethod
    def calibrate_probability(cls, raw_prob: float, customer_intel: Dict[str, Any], failure_reason: str) -> float:
        """
        Dynamically adjusts raw LLM probability using customer reliability,
        churn risk, and failure recoverability index.
        """
        reliability = customer_intel.get("reliability_score", 0.85)
        churn_risk = customer_intel.get("churn_risk_score", 0.15)
        
        # Weighted Bayesian calibration
        calibrated = (raw_prob * 0.50) + (reliability * 0.40) - (churn_risk * 0.10)
        
        reason_lower = failure_reason.lower()
        if any(term in reason_lower for term in ["fraud", "stolen", "blacklisted"]):
            return 0.02
        if "outage" in reason_lower:
            calibrated = max(calibrated, 0.90)

        return round(min(0.98, max(0.05, calibrated)), 2)

    @classmethod
    def _build_enriched_prompt(
        cls,
        payment: Dict[str, Any],
        customer: Dict[str, Any],
        customer_intel: Dict[str, Any],
        policies: List[Dict[str, Any]]
    ) -> str:
        return f"""
Payment Information:
- Payment ID: {payment.get('payment_id')}
- Amount: ₹{payment.get('amount'):,.2f}
- Failure Reason: {payment.get('failure_reason')}
- Payment Method: {payment.get('payment_method')}

Customer Profile:
- Name: {customer.get('name')}
- Lifetime Value (LTV): ₹{customer.get('ltv', 0):,.2f}
- Customer Tier: {customer_intel.get('customer_tier')}
- Payment Reliability Score: {customer_intel.get('reliability_score')}
- Churn Risk Score: {customer_intel.get('churn_risk_score')}
- Recommended Channel: {customer_intel.get('optimal_channel')}

Timing Recommendation:
- Suggested Delay: {customer_intel.get('timing_recommendation', {}).get('delay_hours')} hours
- Payday Window Active: {customer_intel.get('timing_recommendation', {}).get('is_payday_window')}

Retrieved Merchant Policy Documents (RAG Grounding):
{json.dumps(policies, indent=2)}
"""
