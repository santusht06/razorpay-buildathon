import logging
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.db.mongodb import db_col
from app.db.redis import RedisManager
from app.models.payment import PaymentModel
from app.models.customer import CustomerModel
from app.models.recovery import (
    RecoveryCaseModel, RecoveryStatus, RiskType, ActionType,
    AgentDecisionModel, RecoveryActionModel, AuditLogModel
)
from app.agents.recovery_agent import RecoveryAgent
from app.services.policy_engine import PolicyEngine
from app.services.email_service import EmailService
from app.services.razorpay_service import RazorpayService
from app.services.verification_service import VerificationService

logger = logging.getLogger(__name__)

class RecoveryService:
    """
    Main Orchestrator for Revenue Recovery Lifecycle:
    Detect -> Diagnose -> Decide -> Guard -> Act -> Verify -> Measure -> Audit
    """

    @classmethod
    async def process_failed_payment_event(cls, payload: Dict[str, Any], risk_type: RiskType = RiskType.FAILED_PAYMENT) -> Dict[str, Any]:
        """
        Ingests Razorpay failed payment event and executes autonomous recovery loop.
        """
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        if not payment_entity:
            payment_entity = payload

        payment_id = payment_entity.get("id") or f"pay_{uuid.uuid4().hex[:10]}"
        customer_id = payment_entity.get("customer_id") or payment_entity.get("email") or f"cust_{uuid.uuid4().hex[:8]}"
        
        raw_amount = payment_entity.get("amount", 249900)
        # Razorpay entity.amount is integer paise (e.g., 249900 = ₹2499.0, 7500000 = ₹75000.0)
        if isinstance(raw_amount, int) and raw_amount >= 100:
            amount_inr = round(float(raw_amount) / 100.0, 2)
        else:
            amount_inr = round(float(raw_amount), 2)
        
        # Prioritize specific failure reason over generic error_code (e.g., "card_expired" over "PAYMENT_FAILED")
        failure_reason = payment_entity.get("error_reason") or payment_entity.get("reason") or payment_entity.get("error_code") or "insufficient_funds"
        customer_email = payment_entity.get("email") or "customer@example.com"
        customer_name = payment_entity.get("notes", {}).get("customer_name") or customer_email.split("@")[0].title()

        # Idempotency Check via Redis
        idempotency_key = f"ik_webhook_{payment_id}"
        if await RedisManager.is_duplicate(idempotency_key):
            logger.warning(f"Duplicate webhook delivery detected for payment {payment_id}. Skipping.")
            return {"status": "duplicate_ignored", "payment_id": payment_id}
        await RedisManager.set_idempotency_key(idempotency_key, expire_seconds=900)

        # 1. DETECT & PERSIST CUSTOMER / PAYMENT
        cust_col = db_col("customers")
        cust_doc = await cust_col.find_one({"customer_id": customer_id})
        if not cust_doc:
            new_cust = CustomerModel(
                customer_id=customer_id,
                name=customer_name,
                email=customer_email,
                ltv=round(amount_inr * 4.0, 2),
                subscription_info={
                    "subscription_id": f"sub_{uuid.uuid4().hex[:8]}",
                    "plan_name": "Pro Growth Plan",
                    "amount": amount_inr,
                    "status": "past_due"
                }
            )
            cust_data = new_cust.model_dump()
            await cust_col.insert_one(cust_data)
            cust_doc = cust_data

        pay_col = db_col("payments")
        new_pay = PaymentModel(
            payment_id=payment_id,
            customer_id=customer_id,
            amount=amount_inr,
            status="failed",
            failure_reason=failure_reason,
            error_code=payment_entity.get("error_code", "PAYMENT_FAILED"),
            error_description=payment_entity.get("error_description", "Payment failed"),
            payment_method=payment_entity.get("method", "card")
        )
        await pay_col.insert_one(new_pay.model_dump())

        # Create Recovery Case
        case_col = db_col("recovery_cases")
        case_id = f"rc_{uuid.uuid4().hex[:10]}"
        case_obj = RecoveryCaseModel(
            case_id=case_id,
            merchant_id="mch_default",
            customer_id=customer_id,
            payment_id=payment_id,
            risk_type=risk_type,
            amount_at_risk=amount_inr,
            risk_status=RecoveryStatus.AT_RISK,
            recovery_status=RecoveryStatus.AT_RISK,
            failure_reason=failure_reason
        )
        await case_col.insert_one(case_obj.model_dump())

        await cls._log_audit(case_id, "REVENUE_RISK_DETECTED", "webhook", "create_recovery_case", "AT_RISK", {
            "risk_type": risk_type.value,
            "amount_at_risk": amount_inr,
            "payment_id": payment_id
        })

        # 2. DIAGNOSE & DECIDE (AI AGENT)
        await cls._update_case_status(case_id, RecoveryStatus.ANALYZING)
        
        agent_decision = await RecoveryAgent.analyze_and_decide(
            payment=new_pay.model_dump(),
            customer=cust_doc,
            case=case_obj.model_dump()
        )

        recommended_action_str = agent_decision.get("recommended_action", "SEND_RECOVERY_EMAIL").upper()
        if recommended_action_str not in ActionType.__members__:
            recommended_action_enum = ActionType.SEND_RECOVERY_EMAIL
        else:
            recommended_action_enum = ActionType[recommended_action_str]

        decision_obj = AgentDecisionModel(
            decision_id=f"dec_{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            diagnosis=agent_decision["diagnosis"],
            recovery_probability=agent_decision["recovery_probability"],
            recommended_action=recommended_action_enum,
            confidence=agent_decision["confidence"],
            reasoning_summary=agent_decision["reasoning_summary"],
            context_used={"source": agent_decision.get("source"), "policies": agent_decision.get("rag_policies_used")}
        )
        await db_col("agent_decisions").insert_one(decision_obj.model_dump())

        await case_col.update_one(
            {"case_id": case_id},
            {"$set": {
                "recovery_probability": agent_decision["recovery_probability"],
                "selected_strategy": agent_decision["diagnosis"],
                "current_step": recommended_action_enum.value,
                "recovery_status": RecoveryStatus.RECOVERY_PLANNED.value
            }}
        )

        await cls._log_audit(case_id, "AI_DIAGNOSIS_COMPLETED", "ai_agent", "analyze_failure", "RECOVERY_PLANNED", {
            "diagnosis": agent_decision["diagnosis"],
            "recommended_action": recommended_action_enum.value,
            "recovery_probability": agent_decision["recovery_probability"]
        })

        # 3. GUARD (POLICY ENGINE)
        is_allowed, policy_reason, policy_meta = PolicyEngine.validate_action(
            case=case_obj,
            recommended_action=recommended_action_enum,
            action_params={"amount": amount_inr}
        )

        await db_col("agent_decisions").update_one(
            {"decision_id": decision_obj.decision_id},
            {"$set": {"policy_result": {"allowed": is_allowed, "reason": policy_reason, "metadata": policy_meta}}}
        )

        if not is_allowed:
            final_status = RecoveryStatus.STOPPED if "terminal" in policy_reason.lower() else RecoveryStatus.ESCALATED
            await cls._update_case_status(case_id, final_status)
            await cls._log_audit(case_id, "POLICY_GUARDRAIL_BLOCKED", "policy_engine", "validate_action", final_status.value, {
                "reason": policy_reason,
                "metadata": policy_meta
            })
            return {
                "case_id": case_id,
                "status": final_status.value,
                "policy_allowed": False,
                "message": policy_reason,
                "ai_decision": agent_decision
            }

        # 4. ACT & VERIFY (ACTION EXECUTION)
        action_record = RecoveryActionModel(
            action_id=f"act_{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            action_type=recommended_action_enum,
            status="pending",
            idempotency_key=f"ik_act_{case_id}_{recommended_action_enum.value}",
            parameters={"amount": amount_inr, "customer_email": customer_email}
        )
        await db_col("recovery_actions").insert_one(action_record.model_dump())

        execution_result = {}
        if recommended_action_enum in [ActionType.SEND_RECOVERY_EMAIL, ActionType.REQUEST_PAYMENT_METHOD_UPDATE]:
            email_res = await EmailService.send_recovery_email(
                case_id=case_id,
                customer_name=customer_name,
                customer_email=customer_email,
                amount=amount_inr,
                failure_reason=failure_reason,
                custom_reasoning=agent_decision["reasoning_summary"]
            )
            execution_result = email_res
        elif recommended_action_enum == ActionType.RETRY_PAYMENT:
            execution_result = RazorpayService.simulate_retry_payment(payment_id, amount_inr)
        elif recommended_action_enum == ActionType.SCHEDULE_RETRY:
            execution_result = {"status": "scheduled", "retry_at": "In 4 hours"}
        elif recommended_action_enum == ActionType.ESCALATE:
            execution_result = {"status": "escalated_to_merchant", "assigned_to": "VIP Support"}

        await db_col("recovery_actions").update_one(
            {"action_id": action_record.action_id},
            {"$set": {"status": "executed", "execution_result": execution_result}}
        )

        # Increment attempt counter so PolicyEngine retry limit works correctly
        await case_col.update_one(
            {"case_id": case_id},
            {"$inc": {"attempt_count": 1}}
        )

        # Determine correct post-action status
        if recommended_action_enum == ActionType.ESCALATE:
            final_status = RecoveryStatus.ESCALATED
        elif recommended_action_enum == ActionType.STOP:
            final_status = RecoveryStatus.STOPPED
        else:
            final_status = RecoveryStatus.RECOVERING

        await cls._update_case_status(case_id, final_status)
        await cls._log_audit(case_id, "RECOVERY_ACTION_EXECUTED", "recovery_service", recommended_action_enum.value, final_status.value, execution_result)

        return {
            "case_id": case_id,
            "status": final_status.value,
            "policy_allowed": True,
            "ai_decision": agent_decision,
            "action_executed": recommended_action_enum.value,
            "result": execution_result
        }

    @classmethod
    async def simulate_customer_payment_recovery(cls, case_id: str) -> Dict[str, Any]:
        """
        Simulates customer completing checkout or updating payment method.
        Updates payment state to 'captured' and verifies state via VerificationService.
        """
        case_col = db_col("recovery_cases")
        case_doc = await case_col.find_one({"case_id": case_id})
        if not case_doc:
            return {"error": "Recovery case not found"}

        payment_id = case_doc.get("payment_id")
        if payment_id:
            await db_col("payments").update_one(
                {"payment_id": payment_id},
                {"$set": {"status": "captured"}}
            )

        # Strict Verification Check
        is_verified, verification_details = await VerificationService.verify_payment_outcome(payment_id, case_id)
        return verification_details

    @classmethod
    async def execute_demo_scenario(cls, scenario: str) -> Dict[str, Any]:
        """
        Executes one of the 4 mandatory hackathon demo scenarios.
        """
        if scenario == "scenario-1":
            # ₹2,499 Subscription temporary payment failure
            payload = {
                "event": "payment.failed",
                "payload": {
                    "payment": {
                        "entity": {
                            "id": f"pay_sc1_{uuid.uuid4().hex[:6]}",
                            "amount": 249900,
                            "method": "card",
                            "error_code": "PAYMENT_FAILED",
                            "error_reason": "insufficient_funds",
                            "email": "priya.sharma@example.com",
                            "notes": {"customer_name": "Priya Sharma"}
                        }
                    }
                }
            }
            res = await cls.process_failed_payment_event(payload, risk_type=RiskType.FAILED_SUBSCRIPTION)
            # Auto simulate recovery for instant demo delight
            await cls.simulate_customer_payment_recovery(res["case_id"])
            return {"scenario": "Scenario 1 (₹2,499 Subscription Payment Failure)", "result": res, "outcome": "RECOVERED"}

        elif scenario == "scenario-2":
            # ₹999 Subscription expired card
            payload = {
                "event": "payment.failed",
                "payload": {
                    "payment": {
                        "entity": {
                            "id": f"pay_sc2_{uuid.uuid4().hex[:6]}",
                            "amount": 99900,
                            "method": "card",
                            "error_code": "CARD_EXPIRED",
                            "error_reason": "card_expired",
                            "email": "rohan.mehta@example.com",
                            "notes": {"customer_name": "Rohan Mehta"}
                        }
                    }
                }
            }
            res = await cls.process_failed_payment_event(payload, risk_type=RiskType.FAILED_SUBSCRIPTION)
            await cls.simulate_customer_payment_recovery(res["case_id"])
            return {"scenario": "Scenario 2 (₹999 Subscription Card Expired)", "result": res, "outcome": "RECOVERED"}

        elif scenario == "scenario-3":
            # ₹75,000 High-value payment (Exceeds ₹50,000 auto limit -> Guardrail Block -> Escalated)
            payload = {
                "event": "payment.failed",
                "payload": {
                    "payment": {
                        "entity": {
                            "id": f"pay_sc3_{uuid.uuid4().hex[:6]}",
                            "amount": 7500000,
                            "method": "netbanking",
                            "error_code": "PAYMENT_FAILED",
                            "error_reason": "insufficient_funds",
                            "email": "vip.client@enterprise.com",
                            "notes": {"customer_name": "Enterprise VIP Client"}
                        }
                    }
                }
            }
            res = await cls.process_failed_payment_event(payload, risk_type=RiskType.FAILED_PAYMENT)
            return {"scenario": "Scenario 3 (₹75,000 High Value Guardrail Block)", "result": res, "outcome": "ESCALATED"}

        elif scenario == "scenario-4":
            # ₹25,000 Checkout Abandonment
            payload = {
                "event": "checkout.abandoned",
                "payload": {
                    "payment": {
                        "entity": {
                            "id": f"pay_sc4_{uuid.uuid4().hex[:6]}",
                            "amount": 2500000,
                            "method": "upi",
                            "error_code": "CHECKOUT_ABANDONED",
                            "error_reason": "checkout_abandonment",
                            "email": "ananya.roy@example.com",
                            "notes": {"customer_name": "Ananya Roy"}
                        }
                    }
                }
            }
            res = await cls.process_failed_payment_event(payload, risk_type=RiskType.CHECKOUT_ABANDONMENT)
            await cls.simulate_customer_payment_recovery(res["case_id"])
            return {"scenario": "Scenario 4 (₹25,000 Checkout Abandonment)", "result": res, "outcome": "RECOVERED"}

        return {"error": f"Unknown scenario: {scenario}"}

    @classmethod
    async def get_dashboard_metrics(cls) -> Dict[str, Any]:
        case_col = db_col("recovery_cases")
        cases = await case_col.find({}).to_list(1000)

        total_cases = len(cases)
        revenue_at_risk = sum(c.get("amount_at_risk", 0.0) for c in cases)
        
        recovered_cases = [c for c in cases if c.get("recovery_status") == RecoveryStatus.RECOVERED.value]
        revenue_recovered = sum(c.get("amount_at_risk", 0.0) for c in recovered_cases)
        
        active_cases = len([c for c in cases if c.get("recovery_status") not in [RecoveryStatus.RECOVERED.value, RecoveryStatus.FAILED.value, RecoveryStatus.STOPPED.value]])
        escalated_cases = len([c for c in cases if c.get("recovery_status") == RecoveryStatus.ESCALATED.value])
        stopped_cases = len([c for c in cases if c.get("recovery_status") == RecoveryStatus.STOPPED.value])
        
        recovery_rate = round((len(recovered_cases) / max(1, total_cases) * 100), 2) if total_cases > 0 else 0.0

        return {
            "revenue_at_risk": round(revenue_at_risk, 2),
            "revenue_recovered": round(revenue_recovered, 2),
            "recovery_rate_pct": recovery_rate,
            "total_cases": total_cases,
            "active_recoveries": active_cases,
            "recovered_count": len(recovered_cases),
            "escalated_count": escalated_cases,
            "stopped_count": stopped_cases
        }

    @classmethod
    async def _update_case_status(cls, case_id: str, status: RecoveryStatus):
        await db_col("recovery_cases").update_one(
            {"case_id": case_id},
            {"$set": {
                "recovery_status": status.value,
                "risk_status": status.value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

    @classmethod
    async def _log_audit(cls, case_id: str, event_type: str, actor: str, action: str, result: str, metadata: Dict[str, Any]):
        audit_doc = AuditLogModel(
            event_id=f"evt_{uuid.uuid4().hex[:8]}",
            recovery_case_id=case_id,
            event_type=event_type,
            actor=actor,
            action=action,
            result=result,
            metadata=metadata
        )
        await db_col("audit_logs").insert_one(audit_doc.model_dump())
