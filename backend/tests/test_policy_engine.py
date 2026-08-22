import pytest
from app.services.policy_engine import PolicyEngine
from app.models.recovery import RecoveryCaseModel, ActionType, RecoveryStatus, RiskType

@pytest.mark.asyncio
async def test_policy_engine_permits_standard_safe_action():
    """Verify standard soft failure within limits is permitted."""
    case = RecoveryCaseModel(
        case_id="rc_test_001",
        customer_id="cust_001",
        payment_id="pay_001",
        amount_at_risk=2499.0,
        failure_reason="insufficient_funds",
        attempt_count=1,
        max_retries_allowed=3,
        recovery_status=RecoveryStatus.AT_RISK
    )
    
    allowed, reason, meta = PolicyEngine.validate_action(
        case=case,
        recommended_action=ActionType.SEND_RECOVERY_EMAIL,
        action_params={"amount": 2499.0}
    )
    assert allowed is True
    assert "permitted" in reason.lower()
    assert meta["amount"] == 2499.0
    assert meta["is_terminal"] is False

@pytest.mark.asyncio
async def test_policy_engine_blocks_terminal_fraud():
    """Verify security guardrail stops retries on fraud or stolen card."""
    for terminal_reason in ["fraud_blocked", "stolen_card", "card_blacklisted", "account_closed"]:
        case = RecoveryCaseModel(
            case_id="rc_test_fraud",
            customer_id="cust_fraud",
            payment_id="pay_fraud",
            amount_at_risk=1500.0,
            failure_reason=terminal_reason,
            attempt_count=0,
            recovery_status=RecoveryStatus.AT_RISK
        )
        
        allowed, reason, meta = PolicyEngine.validate_action(
            case=case,
            recommended_action=ActionType.RETRY_PAYMENT,
            action_params={"amount": 1500.0}
        )
        assert allowed is False
        assert "terminal" in reason.lower() or "guardrail" in reason.lower()
        assert meta["is_terminal"] is True

@pytest.mark.asyncio
async def test_policy_engine_blocks_exceeding_auto_limit():
    """Verify ₹50,000 threshold blocks automatic recovery and requires merchant approval (Level 3)."""
    case = RecoveryCaseModel(
        case_id="rc_test_high_val",
        customer_id="cust_vip",
        payment_id="pay_high_val",
        amount_at_risk=75000.0,  # > ₹50,000
        failure_reason="insufficient_funds",
        attempt_count=0,
        recovery_status=RecoveryStatus.AT_RISK
    )
    
    allowed, reason, meta = PolicyEngine.validate_action(
        case=case,
        recommended_action=ActionType.SEND_RECOVERY_EMAIL,
        action_params={"amount": 75000.0}
    )
    assert allowed is False
    assert "exceeds automatic recovery limit" in reason.lower()
    assert "merchant approval" in reason.lower()

@pytest.mark.asyncio
async def test_policy_engine_enforces_max_retry_limit():
    """Verify automatic retries are blocked when max retry limit (3) is exceeded."""
    case = RecoveryCaseModel(
        case_id="rc_test_retry_limit",
        customer_id="cust_retry",
        payment_id="pay_retry",
        amount_at_risk=1999.0,
        failure_reason="temporary_network_error",
        attempt_count=3,  # Already attempted 3 times
        max_retries_allowed=3,
        recovery_status=RecoveryStatus.RECOVERING
    )
    
    allowed, reason, meta = PolicyEngine.validate_action(
        case=case,
        recommended_action=ActionType.RETRY_PAYMENT,
        action_params={"amount": 1999.0}
    )
    assert allowed is False
    assert "maximum automatic retry limit" in reason.lower()

@pytest.mark.asyncio
async def test_policy_engine_prevents_action_on_recovered_case():
    """Verify already recovered case cannot have new actions executed."""
    case = RecoveryCaseModel(
        case_id="rc_test_already_done",
        customer_id="cust_done",
        payment_id="pay_done",
        amount_at_risk=2499.0,
        failure_reason="insufficient_funds",
        attempt_count=1,
        recovery_status=RecoveryStatus.RECOVERED
    )
    
    allowed, reason, _ = PolicyEngine.validate_action(
        case=case,
        recommended_action=ActionType.RETRY_PAYMENT,
        action_params={}
    )
    assert allowed is False
    assert "already in status" in reason.lower()
