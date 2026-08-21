import hmac
import hashlib
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class RazorpayService:
    @staticmethod
    def verify_webhook_signature(body: bytes, signature: str, secret: Optional[str] = None) -> bool:
        """
        Verifies Razorpay webhook signature using HMAC-SHA256.
        Returns True if signature is valid.
        """
        webhook_secret = secret or settings.RAZORPAY_WEBHOOK_SECRET
        if not signature or not webhook_secret:
            logger.warning("Webhook signature or secret missing.")
            return False

        try:
            expected_signature = hmac.new(
                key=webhook_secret.encode('utf-8'),
                msg=body,
                digestmod=hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {e}")
            return False

    @staticmethod
    def simulate_retry_payment(payment_id: str, amount: float) -> Dict[str, Any]:
        """
        Simulates retrying a failed payment with Razorpay sandbox/test API behavior.
        """
        logger.info(f"Simulating payment retry for payment {payment_id} (₹{amount})")
        # In a real setup, this calls razorpay_client.payment.capture or payment retry API
        return {
            "success": True,
            "new_payment_id": f"pay_retry_{payment_id[-8:]}",
            "status": "captured",
            "amount": amount,
            "message": "Payment successfully retried and captured."
        }
