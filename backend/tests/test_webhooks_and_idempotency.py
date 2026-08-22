import pytest
import hmac
import hashlib
from app.config import settings
from app.services.razorpay_service import RazorpayService
from app.db.redis import RedisManager

def test_webhook_signature_verification_valid():
    """Verify HMAC-SHA256 signature verification accepts authentic Razorpay payloads."""
    body = b'{"event":"payment.failed","payload":{"payment":{"entity":{"id":"pay_sig_01"}}}}'
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    
    valid_signature = hmac.new(
        key=secret.encode('utf-8'),
        msg=body,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    assert RazorpayService.verify_webhook_signature(body, valid_signature, secret) is True

def test_webhook_signature_verification_invalid():
    """Verify forged or mismatched signatures are strictly rejected."""
    body = b'{"event":"payment.failed","payload":{"payment":{"entity":{"id":"pay_sig_01"}}}}'
    forged_signature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    
    assert RazorpayService.verify_webhook_signature(body, forged_signature) is False

@pytest.mark.asyncio
async def test_redis_idempotency_prevents_duplicate_processing():
    """Verify duplicate webhook idempotency key returns True for duplicate check."""
    key = "ik_webhook_pay_duplicate_test_01"
    
    # First arrival: Not a duplicate
    assert await RedisManager.is_duplicate(key) is False
    
    # Store key
    success = await RedisManager.set_idempotency_key(key, expire_seconds=60)
    assert success is True
    
    # Second arrival: Detected as duplicate
    assert await RedisManager.is_duplicate(key) is True
    
    # Duplicate set attempt returns False
    duplicate_set = await RedisManager.set_idempotency_key(key, expire_seconds=60)
    assert duplicate_set is False
