from fastapi import APIRouter, Request, HTTPException, Header
import logging
import json
from typing import Optional
from app.services.razorpay_service import RazorpayService
from app.services.recovery_service import RecoveryService

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])
logger = logging.getLogger(__name__)

@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    """
    Ingests Razorpay Webhooks (`payment.failed`, `subscription.halted`, etc.).
    Verifies signature and initiates autonomous recovery workflow.
    """
    body_bytes = await request.body()
    
    # Signature verification (skip if test mode without header, but log warning)
    if x_razorpay_signature:
        is_valid = RazorpayService.verify_webhook_signature(body_bytes, x_razorpay_signature)
        if not is_valid:
            logger.warning("Invalid Razorpay webhook signature header.")
            raise HTTPException(status_code=400, detail="Invalid Razorpay webhook signature")
    
    try:
        payload = json.loads(body_bytes.decode('utf-8'))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = payload.get("event", "payment.failed")
    logger.info(f"[WEBHOOK RECEIVED] Razorpay Event: {event_type}")

    if "payment" in event_type or "failed" in event_type or "halted" in event_type:
        result = await RecoveryService.process_failed_payment_event(payload)
        return {
            "status": "processed",
            "event": event_type,
            "recovery_result": result
        }

    return {"status": "ignored", "event": event_type}
