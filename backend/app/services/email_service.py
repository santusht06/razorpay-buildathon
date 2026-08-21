import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_recovery_email(
        case_id: str,
        customer_name: str,
        customer_email: str,
        amount: float,
        failure_reason: str,
        custom_reasoning: str,
        recovery_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends personalized recovery email to customer.
        Safe: Never asks for CVV, card numbers, OTP, or sensitive credentials.
        """
        if not recovery_url:
            recovery_url = f"http://localhost:5173/recoveries/{case_id}?action=retry_payment"

        formatted_amount = f"₹{amount:,.2f}"
        
        # Clean human friendly reason
        reason_display = {
            "insufficient_funds": "A temporary balance or limit issue on your account",
            "card_expired": "An expired payment card on file",
            "bank_outage": "A temporary bank network outage during processing",
            "authentication_failed": "A 3D Secure / OTP verification timeout",
            "fraud_risk": "A security verification check"
        }.get(failure_reason, "A temporary bank processing issue")

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f4f6f9; color: #1e293b; margin: 0; padding: 20px; }}
            .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .header {{ background: #0f172a; padding: 24px; text-align: center; color: white; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px; }}
            .body-content {{ padding: 32px; }}
            .amount-badge {{ display: inline-block; background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 24px; padding: 8px 16px; border-radius: 8px; margin: 16px 0; }}
            .reason-box {{ background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 4px; font-size: 14px; color: #475569; margin-bottom: 24px; }}
            .btn {{ display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(37,99,235,0.2); }}
            .footer {{ background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }}
            .security-note {{ font-size: 12px; color: #64748b; margin-top: 24px; background: #f1f5f9; padding: 10px; border-radius: 6px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Razorpay Merchant Support</h1>
            </div>
            <div class="body-content">
              <p>Hi {customer_name},</p>
              <p>We noticed your recent payment of <strong>{formatted_amount}</strong> for your subscription could not be completed.</p>
              
              <div style="text-align: center;">
                <div class="amount-badge">{formatted_amount}</div>
              </div>

              <div class="reason-box">
                <strong>Details:</strong> {reason_display}. {custom_reasoning}
              </div>

              <p>To keep your subscription active without interruption, please click the secure link below to retry your payment or update your payment method:</p>
              
              <div style="text-align: center; margin: 28px 0;">
                <a href="{recovery_url}" class="btn">Complete Payment Safe & Secure →</a>
              </div>

              <div class="security-note">
                <strong>🔒 Security Notice:</strong> Razorpay will never ask for your PIN, OTP, CVV, or card password via email.
              </div>
            </div>
            <div class="footer">
              Sent safely via Razorpay Autonomous Revenue Recovery Agent • Case ID: {case_id}
            </div>
          </div>
        </body>
        </html>
        """

        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        logger.info(f"[EMAIL SERVICE] Simulated email sent to {customer_email} for case {case_id} (Message ID: {message_id})")

        return {
            "status": "delivered",
            "message_id": message_id,
            "to": customer_email,
            "subject": f"Action Required: Complete your payment of {formatted_amount}",
            "recovery_url": recovery_url,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "rendered_html_snippet": html_content[:300] + "..."
        }
