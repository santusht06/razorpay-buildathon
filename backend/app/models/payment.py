from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone

class PaymentModel(BaseModel):
    payment_id: str  # Razorpay payment ID (pay_...)
    order_id: Optional[str] = None
    subscription_id: Optional[str] = None
    customer_id: str
    amount: float  # in INR
    currency: str = "INR"
    status: str  # captured, failed, refunded, authorized
    failure_reason: Optional[str] = None  # e.g., insufficient_funds, card_expired, bank_outage, authentication_failed, fraud_risk
    error_code: Optional[str] = None  # BAD_REQUEST_ERROR, GATEWAY_ERROR, PAYMENT_FAILED
    error_description: Optional[str] = None
    payment_method: str = "card"  # card, upi, netbanking, wallet, emi
    issuer: Optional[str] = None
    last4: Optional[str] = None
    vpa: Optional[str] = None  # for UPI
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
