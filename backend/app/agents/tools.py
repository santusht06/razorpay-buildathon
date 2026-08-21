import logging
from typing import Dict, Any, Optional, List
from app.db.mongodb import db_col
from app.rag.retriever import policy_retriever
from app.services.email_service import EmailService
from app.services.verification_service import VerificationService

logger = logging.getLogger(__name__)

class AgentTools:

    @staticmethod
    async def get_payment(payment_id: str) -> Optional[Dict[str, Any]]:
        return await db_col("payments").find_one({"payment_id": payment_id})

    @staticmethod
    async def get_customer(customer_id: str) -> Optional[Dict[str, Any]]:
        return await db_col("customers").find_one({"customer_id": customer_id})

    @staticmethod
    async def get_customer_payment_history(customer_id: str) -> Dict[str, Any]:
        cust = await db_col("customers").find_one({"customer_id": customer_id})
        if cust and "history_summary" in cust:
            return cust["history_summary"]
        return {"total_transactions": 1, "successful_payments": 1, "failed_payments": 1}

    @staticmethod
    async def get_subscription(subscription_id: str) -> Optional[Dict[str, Any]]:
        cust = await db_col("customers").find_one({"subscription_info.subscription_id": subscription_id})
        if cust and "subscription_info" in cust:
            return cust["subscription_info"]
        return None

    @staticmethod
    async def get_recovery_history(case_id: str) -> List[Dict[str, Any]]:
        return await db_col("recovery_actions").find({"case_id": case_id}).to_list(20)

    @staticmethod
    def retrieve_recovery_policy(query: str) -> List[Dict[str, Any]]:
        return policy_retriever.retrieve_relevant_policies(query=query, top_k=2)

    @staticmethod
    def calculate_recovery_probability(reliability_score: float, amount: float, failure_reason: str) -> float:
        reason_lower = failure_reason.lower()
        if any(term in reason_lower for term in ["stolen", "fraud", "blacklisted"]):
            return 0.02
        if "expired" in reason_lower:
            return 0.78
        if "outage" in reason_lower or "bank" in reason_lower:
            return 0.92
        base = 0.85 if reliability_score > 0.8 else 0.65
        return round(base, 2)

    @staticmethod
    async def send_recovery_email(
        case_id: str,
        customer_name: str,
        customer_email: str,
        amount: float,
        failure_reason: str,
        reasoning: str
    ) -> Dict[str, Any]:
        return await EmailService.send_recovery_email(
            case_id=case_id,
            customer_name=customer_name,
            customer_email=customer_email,
            amount=amount,
            failure_reason=failure_reason,
            custom_reasoning=reasoning
        )

    @staticmethod
    async def schedule_retry(case_id: str, delay_hours: int = 4) -> Dict[str, Any]:
        return {"status": "scheduled", "retry_in_hours": delay_hours}

    @staticmethod
    async def retry_payment(payment_id: str, amount: float) -> Dict[str, Any]:
        return {"status": "executed", "payment_id": payment_id, "amount": amount}

    @staticmethod
    async def request_payment_method_update(case_id: str, customer_email: str) -> Dict[str, Any]:
        return {"status": "requested", "email": customer_email, "action": "update_card_on_file"}

    @staticmethod
    async def escalate_recovery(case_id: str, reason: str) -> Dict[str, Any]:
        return {"status": "escalated", "assigned_to": "Merchant Account Manager", "reason": reason}

    @staticmethod
    async def stop_recovery(case_id: str, reason: str) -> Dict[str, Any]:
        return {"status": "stopped", "reason": reason}

    @staticmethod
    async def verify_payment(payment_id: str, case_id: str) -> Dict[str, Any]:
        is_verified, details = await VerificationService.verify_payment_outcome(payment_id, case_id)
        return details
