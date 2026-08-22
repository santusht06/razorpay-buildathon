import pytest
import json
from app.agents.recovery_agent import RecoveryAgent
from app.agents.prompts import RECOVERY_AGENT_SYSTEM_PROMPT
from app.models.recovery import ActionType

@pytest.mark.asyncio
async def test_recovery_agent_system_prompt_specifies_exact_enum_actions():
    """Verify prompt instructs LLM to produce exact enum actions matching ActionType."""
    for action in ["SEND_RECOVERY_EMAIL", "REQUEST_PAYMENT_METHOD_UPDATE", "SCHEDULE_RETRY", "RETRY_PAYMENT", "ESCALATE", "STOP"]:
        assert action in RECOVERY_AGENT_SYSTEM_PROMPT

@pytest.mark.asyncio
async def test_recovery_agent_diagnoses_insufficient_funds():
    """Verify agent recommends SEND_RECOVERY_EMAIL with high probability for reliable customer."""
    payment = {
        "payment_id": "pay_test_01",
        "amount": 2499.0,
        "failure_reason": "insufficient_funds",
        "payment_method": "card"
    }
    customer = {
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "ltv": 10000.0,
        "history_summary": {"payment_reliability_score": 0.90, "successful_payments": 6}
    }
    case = {"attempt_count": 0}

    decision = await RecoveryAgent.analyze_and_decide(payment, customer, case)
    
    assert decision["recommended_action"] == ActionType.SEND_RECOVERY_EMAIL.value
    assert decision["recovery_probability"] >= 0.75
    assert "temporary_insufficient_funds" in decision["diagnosis"]
    assert "rag_policies_used" in decision

@pytest.mark.asyncio
async def test_recovery_agent_diagnoses_expired_card():
    """Verify agent recommends REQUEST_PAYMENT_METHOD_UPDATE for expired cards."""
    payment = {
        "payment_id": "pay_test_02",
        "amount": 999.0,
        "failure_reason": "card_expired",
        "payment_method": "card"
    }
    customer = {
        "name": "Rohan Mehta",
        "email": "rohan@example.com",
        "ltv": 4000.0,
        "history_summary": {"payment_reliability_score": 0.85, "successful_payments": 3}
    }
    case = {"attempt_count": 0}

    decision = await RecoveryAgent.analyze_and_decide(payment, customer, case)
    
    assert decision["recommended_action"] == ActionType.REQUEST_PAYMENT_METHOD_UPDATE.value
    assert "expired" in decision["diagnosis"]

@pytest.mark.asyncio
async def test_recovery_agent_diagnoses_high_value_escalation():
    """Verify agent flags high-value amounts (e.g. ₹75,000) for ESCALATE."""
    payment = {
        "payment_id": "pay_test_03",
        "amount": 75000.0,
        "failure_reason": "insufficient_funds",
        "payment_method": "netbanking"
    }
    customer = {
        "name": "Enterprise Client",
        "email": "vip@enterprise.com",
        "ltv": 300000.0,
        "history_summary": {"payment_reliability_score": 0.95, "successful_payments": 12}
    }
    case = {"attempt_count": 0}

    decision = await RecoveryAgent.analyze_and_decide(payment, customer, case)
    
    assert decision["recommended_action"] == ActionType.ESCALATE.value
    assert "high_value" in decision["diagnosis"]

@pytest.mark.asyncio
async def test_recovery_agent_halts_on_fraud():
    """Verify agent immediately recommends STOP for security/fraud blocks."""
    payment = {
        "payment_id": "pay_test_04",
        "amount": 1200.0,
        "failure_reason": "fraud_blocked",
        "payment_method": "card"
    }
    customer = {
        "name": "Suspicious User",
        "email": "suspicious@example.com",
        "ltv": 0.0,
        "history_summary": {"payment_reliability_score": 0.10, "successful_payments": 0}
    }
    case = {"attempt_count": 0}

    decision = await RecoveryAgent.analyze_and_decide(payment, customer, case)
    
    assert decision["recommended_action"] == ActionType.STOP.value
    assert decision["recovery_probability"] < 0.10
    assert any(term in decision["diagnosis"].lower() for term in ["fraud", "security", "terminal", "blocked"])
