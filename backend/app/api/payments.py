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
    payment_id = f"pay_sim_{uuid.uuid4().hex[:8]}"
    payload = {
        "event": "payment.failed",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "amount": req.amount,
                    "currency": "INR",
                    "status": "failed",
                    "order_id": f"order_{uuid.uuid4().hex[:8]}",
                    "method": req.payment_method,
                    "error_code": "PAYMENT_FAILED",
                    "error_reason": req.failure_reason,
                    "error_description": f"Simulated failure: {req.failure_reason}",
                    "email": req.customer_email,
                    "notes": {"customer_name": req.customer_name}
                }
            }
        }
    }
    
    result = await RecoveryService.process_failed_payment_event(payload)
    return {
        "status": "success",
        "simulated_payment_id": payment_id,
        "recovery_pipeline_result": result
    }
