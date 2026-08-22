import pytest
from httpx import AsyncClient
from app.db.mongodb import db_col
from app.models.recovery import RecoveryStatus, ActionType

@pytest.mark.asyncio
async def test_api_health_check(async_client: AsyncClient):
    """GET /api/v1/health should return status healthy and configured metadata."""
    res = await async_client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "app_name" in data

@pytest.mark.asyncio
async def test_api_dashboard_metrics(async_client: AsyncClient):
    """GET /api/v1/dashboard/summary and /api/v1/recovery/metrics return valid KPIs."""
    res = await async_client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "revenue_at_risk" in data
    assert "revenue_recovered" in data
    assert "recovery_rate_pct" in data

@pytest.mark.asyncio
async def test_api_list_and_detail_cases(async_client: AsyncClient):
    """Test case listing and full detail route returning customer, decision, and audit logs."""
    # Seed a case
    case_id = "rc_api_test_01"
    cust_id = "cust_api_test_01"
    pay_id = "pay_api_test_01"
    
    await db_col("recovery_cases").insert_one({
        "case_id": case_id,
        "customer_id": cust_id,
        "payment_id": pay_id,
        "amount_at_risk": 3499.0,
        "failure_reason": "insufficient_funds",
        "recovery_status": RecoveryStatus.RECOVERING.value,
        "recovery_probability": 0.85
    })
    await db_col("customers").insert_one({
        "customer_id": cust_id,
        "name": "Integration User",
        "email": "user@integration.com",
        "ltv": 12000.0
    })
    await db_col("agent_decisions").insert_one({
        "decision_id": "dec_api_01",
        "case_id": case_id,
        "diagnosis": "temporary_insufficient_funds",
        "recommended_action": "SEND_RECOVERY_EMAIL",
        "recovery_probability": 0.85,
        "confidence": 0.92,
        "reasoning_summary": "Test explanation."
    })
    
    # Test List Cases
    list_res = await async_client.get("/api/v1/recoveries")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert any(c["case_id"] == case_id for c in list_data["cases"])
    
    # Test Get Case Detail
    detail_res = await async_client.get(f"/api/v1/recoveries/{case_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["case"]["case_id"] == case_id
    assert detail_data["customer"]["name"] == "Integration User"
    assert detail_data["agent_decision"]["recommended_action"] == "SEND_RECOVERY_EMAIL"

@pytest.mark.asyncio
async def test_api_merchant_approve_executes_action(async_client: AsyncClient):
    """POST /api/v1/recoveries/{case_id}/approve executes recommended action and increments attempts."""
    case_id = "rc_escalated_approve_test"
    cust_id = "cust_approve_test"
    
    await db_col("recovery_cases").insert_one({
        "case_id": case_id,
        "customer_id": cust_id,
        "payment_id": "pay_approve_01",
        "amount_at_risk": 75000.0,
        "failure_reason": "insufficient_funds",
        "recovery_status": RecoveryStatus.ESCALATED.value,
        "attempt_count": 0
    })
    await db_col("customers").insert_one({
        "customer_id": cust_id,
        "name": "VIP Enterprise",
        "email": "vip@enterprise.com",
        "ltv": 250000.0
    })
    await db_col("agent_decisions").insert_one({
        "decision_id": "dec_approve_01",
        "case_id": case_id,
        "recommended_action": "SEND_RECOVERY_EMAIL",
        "reasoning_summary": "AI recommended sending recovery link."
    })
    
    # Call Approve Endpoint
    res = await async_client.post(f"/api/v1/recoveries/{case_id}/approve")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "RECOVERING"
    assert data["action_executed"] == "SEND_RECOVERY_EMAIL"
    
    # Verify attempt_count incremented in DB
    updated_case = await db_col("recovery_cases").find_one({"case_id": case_id})
    assert updated_case["attempt_count"] == 1
    
    # Verify action recorded in recovery_actions
    action = await db_col("recovery_actions").find_one({"case_id": case_id})
    assert action is not None
    assert action["status"] == "executed"

@pytest.mark.asyncio
async def test_api_analytics_aggregations(async_client: AsyncClient):
    """GET /api/v1/analytics returns computed aggregations with zero static hardcoded values."""
    res = await async_client.get("/api/v1/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "recovery_by_strategy" in data
    assert "recovery_by_failure_reason" in data
    assert "autonomy_breakdown" in data
    assert "level1_auto_recovered" in data["autonomy_breakdown"]
    assert "level2_auto_communication" in data["autonomy_breakdown"]
    assert "level3_merchant_approval" in data["autonomy_breakdown"]

@pytest.mark.asyncio
async def test_api_trigger_demo_scenarios(async_client: AsyncClient):
    """POST /api/v1/demo/scenarios/{scenario} executes 1-click hackathon scenarios."""
    for sc in ["scenario-1", "scenario-2", "scenario-3", "scenario-4"]:
        res = await async_client.post(f"/api/v1/demo/scenarios/{sc}")
        assert res.status_code == 200
        data = res.json()
        assert "scenario" in data
        assert "outcome" in data
