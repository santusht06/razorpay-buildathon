import logging
from typing import Dict, Any, Tuple
from app.config import settings
from app.models.recovery import ActionType, RecoveryCaseModel

logger = logging.getLogger(__name__)

class PolicyEngine:
    """
    Deterministic Policy and Guardrail Engine enforcing security and business safety rules.
    """

    TERMINAL_FAILURES = {
        "stolen_card", "fraud_blocked", "account_closed",
        "do_not_honor_terminal", "card_blacklisted", "illegal_transaction"
    }

    # Strict maximum automatic limit as per hackathon specification
    MAX_AUTO_RECOVERY_LIMIT = 50000.0  # ₹50,000

    @classmethod
    def validate_action(
        cls,
        case: RecoveryCaseModel,
        recommended_action: ActionType,
        action_params: Dict[str, Any]
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates recommended action against deterministic policy rules.
        Returns: (allowed: bool, reason: str, metadata: dict)
        """
        amount = case.amount_at_risk
        failure_reason = (case.failure_reason or "").lower()
        retry_count = case.attempt_count

        metadata = {
            "max_retries": case.max_retries_allowed,
            "attempt_count": retry_count,
            "amount": amount,
            "max_auto_recovery_limit": cls.MAX_AUTO_RECOVERY_LIMIT,
            "failure_reason": failure_reason,
            "is_terminal": failure_reason in cls.TERMINAL_FAILURES
        }

        # 1. Stop if case is already recovered or stopped
        if case.recovery_status in ["RECOVERED", "STOPPED"]:
            return False, f"Policy Check Failed: Recovery case is already in status '{case.recovery_status}'.", metadata

        # 2. Terminal Failures Cannot Be Retried
        if failure_reason in cls.TERMINAL_FAILURES:
            if recommended_action in [ActionType.RETRY_PAYMENT, ActionType.SCHEDULE_RETRY, ActionType.SEND_RECOVERY_EMAIL]:
                return False, f"Policy Guardrail Triggered: Failure reason '{failure_reason}' is a terminal card failure. Retries strictly prohibited.", metadata

        # 3. Maximum Automatic Recovery Amount = ₹50,000
        if amount > cls.MAX_AUTO_RECOVERY_LIMIT:
            if recommended_action in [ActionType.RETRY_PAYMENT, ActionType.SCHEDULE_RETRY, ActionType.SEND_RECOVERY_EMAIL]:
                return False, f"Policy Guardrail Triggered: Amount ₹{amount:,.2f} exceeds automatic recovery limit (₹{cls.MAX_AUTO_RECOVERY_LIMIT:,.2f}). Requires merchant approval.", metadata

        # 4. Maximum Retries Limit = 3
        if recommended_action in [ActionType.RETRY_PAYMENT, ActionType.SCHEDULE_RETRY]:
            if retry_count >= case.max_retries_allowed:
                return False, f"Policy Guardrail Triggered: Maximum automatic retry limit ({case.max_retries_allowed}) reached. Escalating to merchant.", metadata

        # 5. High-Value Escalation Threshold (>= ₹10,000)
        if amount >= settings.HIGH_VALUE_THRESHOLD:
            metadata["high_value_flag"] = True
            if recommended_action == ActionType.STOP:
                return False, f"Policy Guardrail Triggered: High-value transaction (₹{amount:,.2f}) cannot be abandoned automatically.", metadata

        return True, f"Automatic recovery permitted under policy '{recommended_action.value}'.", metadata
