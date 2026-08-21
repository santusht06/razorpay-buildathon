from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from enum import Enum

class RiskType(str, Enum):
    FAILED_PAYMENT = "FAILED_PAYMENT"
    FAILED_SUBSCRIPTION = "FAILED_SUBSCRIPTION"
    CHECKOUT_ABANDONMENT = "CHECKOUT_ABANDONMENT"
    OVERDUE_RECEIVABLE = "OVERDUE_RECEIVABLE"

class RecoveryStatus(str, Enum):
    AT_RISK = "AT_RISK"
    ANALYZING = "ANALYZING"
    RECOVERY_PLANNED = "RECOVERY_PLANNED"
    ACTION_PENDING = "ACTION_PENDING"
    RECOVERING = "RECOVERING"
    RECOVERED = "RECOVERED"
    ESCALATED = "ESCALATED"
    STOPPED = "STOPPED"
    FAILED = "FAILED"

class ActionType(str, Enum):
    SEND_RECOVERY_EMAIL = "SEND_RECOVERY_EMAIL"
    REQUEST_PAYMENT_METHOD_UPDATE = "REQUEST_PAYMENT_METHOD_UPDATE"
    SCHEDULE_RETRY = "SCHEDULE_RETRY"
    RETRY_PAYMENT = "RETRY_PAYMENT"
    ESCALATE = "ESCALATE"
    STOP = "STOP"

class RecoveryCaseModel(BaseModel):
    case_id: str
    merchant_id: str = "mch_default"
    customer_id: str
    payment_id: Optional[str] = None
    subscription_id: Optional[str] = None
    invoice_id: Optional[str] = None
    risk_type: RiskType = RiskType.FAILED_PAYMENT
    amount_at_risk: float  # INR
    currency: str = "INR"
    failure_reason: str
    risk_status: RecoveryStatus = RecoveryStatus.AT_RISK
    recovery_status: RecoveryStatus = RecoveryStatus.AT_RISK
    recovery_probability: float = 0.0  # 0.0 to 1.0
    selected_strategy: Optional[str] = None
    current_step: Optional[str] = None
    attempt_count: int = 0
    max_retries_allowed: int = 3
    is_high_value: bool = False
    recovery_result: Optional[Dict[str, Any]] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    resolved_at: Optional[str] = None

class AgentDecisionModel(BaseModel):
    decision_id: str
    case_id: str
    diagnosis: str
    recovery_probability: float
    recommended_action: ActionType
    confidence: float
    reasoning_summary: str
    context_used: Dict[str, Any] = Field(default_factory=dict)
    policy_result: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RecoveryActionModel(BaseModel):
    action_id: str
    case_id: str
    action_type: ActionType
    status: str = "pending"  # pending, executed, failed, skipped
    idempotency_key: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    execution_result: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AuditLogModel(BaseModel):
    event_id: str
    recovery_case_id: str
    event_type: str
    actor: str  # webhook, ai_agent, policy_engine, email_service, merchant
    action: str
    result: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
