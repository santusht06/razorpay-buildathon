from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from pydantic import BaseModel
from bson import ObjectId
import uuid
from app.db.mongodb import db_col
from app.services.recovery_service import RecoveryService

router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])


def _s(doc):
    """Recursively serialize MongoDB documents: drop _id, convert ObjectId → str."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [_s(d) for d in doc]
    if isinstance(doc, dict):
        return {k: (_s(v) if isinstance(v, (dict, list, ObjectId)) else v)
                for k, v in doc.items() if k != "_id"}
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc


class SimulateFailureRequest(BaseModel):
    amount: float = 2499.0
    failure_reason: str = "insufficient_funds"
    customer_name: str = "Priya Sharma"
    customer_email: str = "priya.sharma@example.com"
    payment_method: str = "card"
    risk_type: str = "FAILED_SUBSCRIPTION"
    auto_recover: bool = True
    notes: Optional[Dict[str, Any]] = None

@router.get("")
async def list_payments(limit: int = 50, skip: int = 0):
    col = db_col("payments")
    items = await col.find({}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"payments": _s(items), "count": len(items)}

@router.post("/simulate-failure")
async def simulate_payment_failure(req: SimulateFailureRequest):
    """
    Simulator endpoint to trigger synthetic Razorpay payment failures directly from Dashboard!
    """
    from app.models.recovery import RiskType
    
    risk_enum = RiskType.FAILED_PAYMENT
    if req.risk_type in RiskType.__members__:
        risk_enum = RiskType[req.risk_type]

    result = await RecoveryService.create_dynamic_payment_failure(
        amount=req.amount,
        failure_reason=req.failure_reason,
        customer_name=req.customer_name,
        customer_email=req.customer_email,
        payment_method=req.payment_method,
        risk_type=risk_enum,
        auto_recover=req.auto_recover
    )

    return {
        "status": "success",
        "recovery_pipeline_result": result
    }
