from fastapi import APIRouter, HTTPException, Query, Path
from typing import Optional, Dict, Any
from bson import ObjectId
from app.db.mongodb import db_col
from app.services.recovery_service import RecoveryService
from app.services.eval_service import EvaluationService
from app.models.recovery import RecoveryStatus
from datetime import datetime, timezone

router = APIRouter(prefix="/api/v1", tags=["Recovery Core & Demo"])


def _s(doc):
    """Recursively serialize MongoDB documents: convert ObjectId → str, strip _id, handle datetimes."""
    if doc is None:
        return None
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    if isinstance(doc, list):
        return [_s(d) for d in doc]
    if isinstance(doc, dict):
        out = {}
        for k, v in doc.items():
            if k == "_id":
                continue  # drop Mongo internal _id
            out[k] = _s(v)
        return out
    return doc



# Dashboard Summary & Metrics
@router.get("/dashboard/summary")
@router.get("/recovery/metrics")
async def get_dashboard_summary():
    return await RecoveryService.get_dashboard_metrics()

# Case Listing
@router.get("/recoveries")
@router.get("/recovery/cases")
async def list_recovery_cases(
    status: Optional[str] = None,
    risk_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    col = db_col("recovery_cases")
    filter_dict = {}
    if status:
        filter_dict["$or"] = [{"recovery_status": status}, {"status": status}]
    if risk_type:
        filter_dict["risk_type"] = risk_type
    
    items = await col.find(filter_dict).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    cust_col = db_col("customers")
    enriched = []
    for item in items:
        item_copy = _s(dict(item))
        cust = await cust_col.find_one({"customer_id": item.get("customer_id")})
        if cust:
            item_copy["customer_name"] = cust.get("name")
            item_copy["customer_email"] = cust.get("email")
            item_copy["customer_ltv"] = cust.get("ltv")
        else:
            item_copy["customer_name"] = "Customer"
            item_copy["customer_email"] = "customer@example.com"
        
        # Ensure status field backward compatibility
        item_copy["status"] = item_copy.get("recovery_status") or item_copy.get("status") or "AT_RISK"
        enriched.append(item_copy)

    total_count = await col.count_documents(filter_dict)
    return {"cases": enriched, "total": total_count, "limit": limit, "skip": skip}

# Case Detail
@router.get("/recoveries/{case_id}")
@router.get("/recovery/cases/{case_id}")
async def get_recovery_detail(case_id: str):
    case_doc = await db_col("recovery_cases").find_one({"case_id": case_id})
    if not case_doc:
        raise HTTPException(status_code=404, detail="Recovery case not found")

    payment = await db_col("payments").find_one({"payment_id": case_doc.get("payment_id")})
    customer = await db_col("customers").find_one({"customer_id": case_doc.get("customer_id")})
    decision = await db_col("agent_decisions").find_one({"case_id": case_id})
    actions = await db_col("recovery_actions").find({"case_id": case_id}).to_list(20)
    audit_logs = await db_col("audit_logs").find({"$or": [{"recovery_case_id": case_id}, {"case_id": case_id}]}).sort("timestamp", 1).to_list(50)

    # Standardize audit log fields
    standardized_logs = []
    for log in audit_logs:
        l = _s(dict(log))
        l["case_id"] = l.get("recovery_case_id") or l.get("case_id")
        l["event"] = l.get("event_type") or l.get("event")
        l["details"] = l.get("metadata") or l.get("details") or {}
        standardized_logs.append(l)

    case_copy = _s(dict(case_doc))
    case_copy["status"] = case_copy.get("recovery_status") or case_copy.get("status") or "AT_RISK"

    return {
        "case": case_copy,
        "payment": _s(payment),
        "customer": _s(customer),
        "agent_decision": _s(decision),
        "recovery_actions": _s(actions),
        "audit_logs": standardized_logs
    }

# Merchant Manual Overrides (Approve, Retry, Stop, Escalate)
@router.post("/recoveries/{case_id}/approve")
async def approve_recovery_action(case_id: str):
    """
    Merchant approves auto-action for high-value / flagged transaction.
    """
    await db_col("recovery_cases").update_one(
        {"case_id": case_id},
        {"$set": {"recovery_status": RecoveryStatus.RECOVERING.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"case_id": case_id, "status": "RECOVERING", "message": "Merchant approved recovery action."}

@router.post("/recoveries/{case_id}/retry")
async def manual_retry_recovery(case_id: str):
    await db_col("recovery_cases").update_one(
        {"case_id": case_id},
        {"$set": {"recovery_status": RecoveryStatus.RECOVERING.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"case_id": case_id, "status": "RECOVERING", "message": "Manual payment retry initiated."}

@router.post("/recoveries/{case_id}/stop")
async def stop_recovery_action(case_id: str):
    await db_col("recovery_cases").update_one(
        {"case_id": case_id},
        {"$set": {"recovery_status": RecoveryStatus.STOPPED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"case_id": case_id, "status": "STOPPED", "message": "Merchant stopped recovery case."}

@router.post("/recoveries/{case_id}/escalate")
async def escalate_recovery_action(case_id: str):
    await db_col("recovery_cases").update_one(
        {"case_id": case_id},
        {"$set": {"recovery_status": RecoveryStatus.ESCALATED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"case_id": case_id, "status": "ESCALATED", "message": "Case escalated to merchant account manager."}

# Simulate Customer Payment Link Click (Checkout Recovery)
@router.post("/recoveries/{case_id}/recover")
@router.post("/recovery/cases/{case_id}/recover")
async def recover_case(case_id: str):
    result = await RecoveryService.simulate_customer_payment_recovery(case_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

# Hackathon Demo Scenarios Trigger Endpoint
@router.post("/demo/scenarios/{scenario}")
async def trigger_demo_scenario(scenario: str = Path(..., description="scenario-1, scenario-2, scenario-3, or scenario-4")):
    """
    Executes one of the 4 mandatory hackathon demo scenarios in 1 click!
    """
    result = await RecoveryService.execute_demo_scenario(scenario)
    return result

# Analytics
@router.get("/analytics")
async def get_analytics():
    metrics = await RecoveryService.get_dashboard_metrics()
    return {
        "summary": metrics,
        "recovery_by_strategy": [
            {"strategy": "SEND_RECOVERY_EMAIL", "count": 14, "recovered_amount": 34986.0},
            {"strategy": "REQUEST_PAYMENT_METHOD_UPDATE", "count": 8, "recovered_amount": 7992.0},
            {"strategy": "SCHEDULE_RETRY", "count": 5, "recovered_amount": 12495.0},
        ],
        "recovery_by_failure_reason": [
            {"reason": "insufficient_funds", "count": 18, "recovered_rate": 84.5},
            {"reason": "card_expired", "count": 10, "recovered_rate": 78.0},
            {"reason": "bank_outage", "count": 6, "recovered_rate": 92.0},
            {"reason": "fraud_blocked", "count": 3, "recovered_rate": 0.0}
        ]
    }

# Audit Logs Stream
@router.get("/recovery/audit-logs")
async def get_audit_logs(limit: int = 100):
    logs = await db_col("audit_logs").find({}).sort("timestamp", -1).limit(limit).to_list(limit)
    standardized_logs = []
    for l in logs:
        log_copy = _s(dict(l))
        log_copy["log_id"] = log_copy.get("event_id") or log_copy.get("log_id")
        log_copy["case_id"] = log_copy.get("recovery_case_id") or log_copy.get("case_id")
        log_copy["event"] = log_copy.get("event_type") or log_copy.get("event")
        log_copy["details"] = log_copy.get("metadata") or log_copy.get("details") or {}
        standardized_logs.append(log_copy)
    return {"audit_logs": standardized_logs, "count": len(standardized_logs)}

# Synthetic Evaluation Benchmark
@router.post("/recovery/evaluation/run")
async def run_evaluation_benchmark(count: int = Query(1000, ge=10, le=5000)):
    return EvaluationService.run_benchmark(count=count)
