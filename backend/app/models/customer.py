from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

class SubscriptionInfo(BaseModel):
    subscription_id: str
    plan_name: str
    amount: float
    status: str = "active"  # active, past_due, canceled
    billing_cycle: str = "monthly"
    next_billing_date: Optional[str] = None

class CustomerHistorySummary(BaseModel):
    total_transactions: int = 0
    successful_payments: int = 0
    failed_payments: int = 0
    previous_recoveries: int = 0
    payment_reliability_score: float = 0.95  # 0.0 to 1.0

class CustomerModel(BaseModel):
    customer_id: str
    name: str
    email: str
    phone: Optional[str] = None
    ltv: float = 0.0  # Lifetime Value in INR
    history_summary: CustomerHistorySummary = Field(default_factory=CustomerHistorySummary)
    subscription_info: Optional[SubscriptionInfo] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
