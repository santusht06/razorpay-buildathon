import pytest
from app.services.recovery_service import RecoveryService
from app.db.mongodb import db_col
from app.models.recovery import RecoveryStatus, RiskType

@pytest.mark.asyncio
async def test_e2e_scenario_1_subscription_insufficient_funds(sample_payment_payload):
    """
    Scenario 1: ₹2,499 Subscription temporary payment failure.
    Level 1: AI diagnoses soft failure -> Policy approves -> Email dispatched -> Payment captured -> RECOVERED.
    """
    payload = sample_payment_payload(amount=2499.0, reason="insufficient_funds", email="priya.sharma@example.com", name="Priya Sharma")
    res = await RecoveryService.process_failed_payment_event(payload, risk_type=RiskType.FAILED_SUBSCRIPTION)
    
    assert res["status"] == RecoveryStatus.RECOVERING.value
    assert res["policy_allowed"] is True
    assert res["action_executed"] == "SEND_RECOVERY_EMAIL"
    case_id = res["case_id"]
    
    # Verify attempt_count incremented
    case = await db_col("recovery_cases").find_one({"case_id": case_id})
    assert case["attempt_count"] == 1
    
    # Simulate payment capture
    verify_res = await RecoveryService.simulate_customer_payment_recovery(case_id)
    assert verify_res["verified"] is True
    assert verify_res["amount_recovered"] == 2499.0
    
    # Verify case final state
    case_after = await db_col("recovery_cases").find_one({"case_id": case_id})
    assert case_after["recovery_status"] == RecoveryStatus.RECOVERED.value

@pytest.mark.asyncio
async def test_e2e_scenario_2_expired_card(sample_payment_payload):
    """
    Scenario 2: ₹999 Subscription expired card.
    Level 2: AI diagnoses expired card -> Dispatches payment update link -> Simulates recovery.
    """
    payload = sample_payment_payload(amount=999.0, reason="card_expired", email="rohan.mehta@example.com", name="Rohan Mehta")
    res = await RecoveryService.process_failed_payment_event(payload, risk_type=RiskType.FAILED_SUBSCRIPTION)
    
    assert res["status"] == RecoveryStatus.RECOVERING.value
    assert res["action_executed"] == "REQUEST_PAYMENT_METHOD_UPDATE"
    
    # Verify action recorded in recovery_actions
    action = await db_col("recovery_actions").find_one({"case_id": res["case_id"]})
    assert action is not None
    assert action["action_type"] == "REQUEST_PAYMENT_METHOD_UPDATE"

@pytest.mark.asyncio
async def test_e2e_scenario_3_high_value_guardrail_escalation(sample_payment_payload):
    """
    Scenario 3: ₹75,000 High-Value transaction.
    Level 3: Case escalates to merchant approval (either through AI ESCALATE recommendation or Policy guardrail block).
    """
    payload = sample_payment_payload(amount=75000.0, reason="insufficient_funds", email="vip@enterprise.com", name="VIP Client")
    res = await RecoveryService.process_failed_payment_event(payload, risk_type=RiskType.FAILED_PAYMENT)
    
    assert res["status"] == RecoveryStatus.ESCALATED.value
    
    # Verify case is in ESCALATED status in database
    case = await db_col("recovery_cases").find_one({"case_id": res["case_id"]})
    assert case["recovery_status"] == RecoveryStatus.ESCALATED.value

@pytest.mark.asyncio
async def test_e2e_scenario_4_checkout_abandonment(sample_payment_payload):
    """
    Scenario 4: ₹25,000 Checkout abandonment.
    AI creates recovery strategy -> dispatches recovery notification -> verifies capture.
    """
    payload = sample_payment_payload(amount=25000.0, reason="checkout_abandonment", email="ananya.roy@example.com", name="Ananya Roy")
    res = await RecoveryService.process_failed_payment_event(payload, risk_type=RiskType.CHECKOUT_ABANDONMENT)
    
    assert res["status"] == RecoveryStatus.RECOVERING.value
    assert res["policy_allowed"] is True
    
    # Verify audit trail logs all steps
    audit_logs = await db_col("audit_logs").find({"recovery_case_id": res["case_id"]}).to_list(10)
    events = [log["event_type"] for log in audit_logs]
    assert "REVENUE_RISK_DETECTED" in events
    assert "AI_DIAGNOSIS_COMPLETED" in events
    assert "RECOVERY_ACTION_EXECUTED" in events
