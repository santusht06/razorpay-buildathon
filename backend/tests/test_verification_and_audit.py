import pytest
from app.db.mongodb import db_col
from app.services.verification_service import VerificationService
from app.models.recovery import RecoveryCaseModel, RecoveryStatus
from app.models.payment import PaymentModel

@pytest.mark.asyncio
async def test_verification_service_rejects_unverified_payment():
    """Verify service returns False if payment in database is still in 'failed' status."""
    payment_id = "pay_verify_fail_01"
    case_id = "rc_verify_fail_01"
    
    await db_col("payments").insert_one({
        "payment_id": payment_id,
        "amount": 2499.0,
        "status": "failed"
    })
    await db_col("recovery_cases").insert_one({
        "case_id": case_id,
        "payment_id": payment_id,
        "amount_at_risk": 2499.0,
        "recovery_status": RecoveryStatus.RECOVERING.value
    })
    
    verified, details = await VerificationService.verify_payment_outcome(payment_id, case_id)
    
    assert verified is False
    assert details["verified"] is False
    assert details["status"] == "failed"
    
    # Case in DB must still NOT be marked as RECOVERED
    case_in_db = await db_col("recovery_cases").find_one({"case_id": case_id})
    assert case_in_db["recovery_status"] != RecoveryStatus.RECOVERED.value

@pytest.mark.asyncio
async def test_verification_service_accepts_captured_payment_and_creates_audit_log():
    """Verify service updates case to RECOVERED and logs audit trail when payment is 'captured'."""
    payment_id = "pay_verify_cap_01"
    case_id = "rc_verify_cap_01"
    
    await db_col("payments").insert_one({
        "payment_id": payment_id,
        "amount": 4999.0,
        "status": "captured"
    })
    await db_col("recovery_cases").insert_one({
        "case_id": case_id,
        "payment_id": payment_id,
        "amount_at_risk": 4999.0,
        "recovery_status": RecoveryStatus.RECOVERING.value
    })
    
    verified, details = await VerificationService.verify_payment_outcome(payment_id, case_id)
    
    assert verified is True
    assert details["verified"] is True
    assert details["amount_recovered"] == 4999.0
    
    # Check DB state updated
    case_in_db = await db_col("recovery_cases").find_one({"case_id": case_id})
    assert case_in_db["recovery_status"] == RecoveryStatus.RECOVERED.value
    assert case_in_db["recovery_result"]["verified"] is True
    
    # Check audit log written
    audit_log = await db_col("audit_logs").find_one({"recovery_case_id": case_id, "event_type": "PAYMENT_VERIFIED_CAPTURED"})
    assert audit_log is not None
    assert audit_log["result"] == "RECOVERED"
