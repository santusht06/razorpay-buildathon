import logging
from typing import Dict, Any, Tuple
from app.db.mongodb import db_col
from app.models.recovery import RecoveryStatus, AuditLogModel
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)

class VerificationService:
    """
    Strict payment state verification service.
    Verifies actual payment status against Razorpay/Database BEFORE marking revenue as recovered.
    """

    @classmethod
    async def verify_payment_outcome(cls, payment_id: str, case_id: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Queries actual payment state. Only returns (True, details) if status is verified as 'captured'.
        """
        pay_col = db_col("payments")
        payment = await pay_col.find_one({"payment_id": payment_id})
        
        if not payment:
            return False, {"verified": False, "reason": "Payment record not found"}

        current_status = payment.get("status", "").lower()
        amount = payment.get("amount", 0.0)

        if current_status == "captured":
            # State strictly verified captured!
            case_col = db_col("recovery_cases")
            now_iso = datetime.now(timezone.utc).isoformat()
            
            await case_col.update_one(
                {"case_id": case_id},
                {"$set": {
                    "recovery_status": RecoveryStatus.RECOVERED.value,
                    "risk_status": RecoveryStatus.RECOVERED.value,
                    "resolved_at": now_iso,
                    "recovery_result": {
                        "verified": True,
                        "verified_at": now_iso,
                        "amount_recovered": amount,
                        "status": "captured"
                    },
                    "updated_at": now_iso
                }}
            )

            # Audit log verification event
            audit_doc = AuditLogModel(
                event_id=f"evt_{uuid.uuid4().hex[:8]}",
                recovery_case_id=case_id,
                event_type="PAYMENT_VERIFIED_CAPTURED",
                actor="verification_service",
                action="verify_payment_status",
                result="RECOVERED",
                metadata={"payment_id": payment_id, "status": "captured", "amount_recovered": amount}
            )
            await db_col("audit_logs").insert_one(audit_doc.model_dump())

            # Real-time Continuous Learning Feedback Loop
            from app.services.learning_service import ContinuousLearningEngine
            case_record = await case_col.find_one({"case_id": case_id})
            if case_record:
                await ContinuousLearningEngine.record_recovery_outcome(
                    case_id=case_id,
                    failure_reason=case_record.get("failure_reason", "unknown"),
                    strategy=case_record.get("selected_strategy", "SEND_RECOVERY_EMAIL"),
                    amount=amount,
                    outcome="RECOVERED"
                )

            return True, {
                "verified": True,
                "status": "captured",
                "amount_recovered": amount,
                "message": f"Payment {payment_id} verified captured. Revenue of ₹{amount:,.2f} successfully recovered!"
            }

        return False, {
            "verified": False,
            "status": current_status,
            "amount_recovered": 0.0,
            "message": f"Payment {payment_id} is in status '{current_status}'. Revenue not yet recovered."
        }
