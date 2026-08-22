"""
Razorpay Autonomous Revenue Recovery Agent - Production QA Test Runner
Executes real production queries and assertions against the system.
"""

import asyncio
import json
import uuid
import sys
import os

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.db.mongodb import DatabaseManager
from app.db.redis import RedisManager

GREEN = "\033[92m"
RED = "\033[91m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
BOLD = "\033[1m"
RESET = "\033[0m"

async def run_qa_suite():
    print(f"\n{BOLD}{BLUE}========================================================================{RESET}")
    print(f"{BOLD}{BLUE}  RAZORPAY REVENUE RECOVERY AGENT — PRODUCTION QA TEST EXECUTION RUNBOOK {RESET}")
    print(f"{BOLD}{BLUE}========================================================================{RESET}\n")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://localhost:8000") as client:
        
        passed_tests = 0
        failed_tests = 0

        def assert_test(name: str, condition: bool, details: str = ""):
            nonlocal passed_tests, failed_tests
            if condition:
                print(f"  {GREEN}✓ PASS{RESET} : {BOLD}{name}{RESET}")
                if details:
                    print(f"         {details}")
                passed_tests += 1
            else:
                print(f"  {RED}✗ FAIL{RESET} : {BOLD}{name}{RESET}")
                if details:
                    print(f"         {RED}{details}{RESET}")
                failed_tests += 1

        # TEST 1: Health & LLM System Readiness
        print(f"\n{BOLD}[1. SYSTEM READINESS & HEALTH CHECK]{RESET}")
        res = await client.get("/api/v1/health")
        data = res.json()
        assert_test(
            "API Health Check (GET /api/v1/health)",
            res.status_code == 200 and data.get("status") == "healthy",
            f"Status: {data.get('status')}, Database: {data.get('database')}"
        )

        # TEST 2: Ingest Level 1 Webhook Event (₹2,499 Soft Failure)
        print(f"\n{BOLD}[2. LEVEL 1 AUTONOMOUS RECOVERY — ₹2,499 SUBSCRIPTION FAILURE]{RESET}")
        pay_id_1 = f"pay_prod_l1_{uuid.uuid4().hex[:6]}"
        l1_payload = {
            "event": "payment.failed",
            "payload": {
                "payment": {
                    "entity": {
                        "id": pay_id_1,
                        "amount": 249900,  # 2499 INR in paise
                        "currency": "INR",
                        "status": "failed",
                        "method": "card",
                        "error_code": "PAYMENT_FAILED",
                        "error_reason": "insufficient_funds",
                        "email": "priya.sharma@example.com",
                        "notes": {"customer_name": "Priya Sharma"}
                    }
                }
            }
        }
        res = await client.post("/api/v1/webhooks/razorpay", json=l1_payload)
        res_data = res.json()
        rec_res = res_data.get("recovery_result", {})
        case_id_1 = rec_res.get("case_id")
        
        assert_test(
            "Webhook Ingestion & AI Decision Pipeline",
            res.status_code == 200 and rec_res.get("action_executed") == "SEND_RECOVERY_EMAIL",
            f"Case: {case_id_1}, Action: {rec_res.get('action_executed')}, AI Confidence: {rec_res.get('ai_decision', {}).get('confidence')}"
        )

        # Verify Payment Recovery Simulation
        rec_verify = await client.post(f"/api/v1/recoveries/{case_id_1}/recover")
        verify_data = rec_verify.json()
        assert_test(
            "Strict Payment Verification & Capture",
            rec_verify.status_code == 200 and verify_data.get("verified") is True,
            f"Amount Recovered: ₹{verify_data.get('amount_recovered')}, Status: {verify_data.get('status')}"
        )

        # TEST 3: Idempotency Protection
        print(f"\n{BOLD}[3. IDEMPOTENCY & DUPLICATE SUPPRESSION]{RESET}")
        dup_res = await client.post("/api/v1/webhooks/razorpay", json=l1_payload)
        dup_data = dup_res.json()
        assert_test(
            "Duplicate Webhook Rejection",
            dup_data.get("recovery_result", {}).get("status") == "duplicate_ignored",
            f"Idempotency suppression active for payment {pay_id_1}"
        )

        # TEST 4: Level 2 Expired Card Communication
        print(f"\n{BOLD}[4. LEVEL 2 AUTONOMOUS RECOVERY — EXPIRED CARD]{RESET}")
        pay_id_2 = f"pay_prod_l2_{uuid.uuid4().hex[:6]}"
        l2_payload = {
            "event": "payment.failed",
            "payload": {
                "payment": {
                    "entity": {
                        "id": pay_id_2,
                        "amount": 99900,
                        "currency": "INR",
                        "status": "failed",
                        "method": "card",
                        "error_code": "CARD_EXPIRED",
                        "error_reason": "card_expired",
                        "email": "rohan.mehta@example.com",
                        "notes": {"customer_name": "Rohan Mehta"}
                    }
                }
            }
        }
        res2 = await client.post("/api/v1/webhooks/razorpay", json=l2_payload)
        rec2 = res2.json().get("recovery_result", {})
        case_id_2 = rec2.get("case_id")
        assert_test(
            "Expired Card Diagnosis -> REQUEST_PAYMENT_METHOD_UPDATE",
            rec2.get("action_executed") == "REQUEST_PAYMENT_METHOD_UPDATE",
            f"Case: {case_id_2}, Strategy: {rec2.get('action_executed')}"
        )

        # TEST 5: Level 3 High-Value Guardrail Block & Merchant Approval
        print(f"\n{BOLD}[5. LEVEL 3 BOUNDED AUTONOMY — ₹75,000 HIGH-VALUE OVERRIDE]{RESET}")
        pay_id_3 = f"pay_prod_l3_{uuid.uuid4().hex[:6]}"
        l3_payload = {
            "event": "payment.failed",
            "payload": {
                "payment": {
                    "entity": {
                        "id": pay_id_3,
                        "amount": 7500000,  # ₹75,000 in paise
                        "currency": "INR",
                        "status": "failed",
                        "method": "netbanking",
                        "error_code": "PAYMENT_FAILED",
                        "error_reason": "insufficient_funds",
                        "email": "vip.client@enterprise.com",
                        "notes": {"customer_name": "Enterprise VIP Client"}
                    }
                }
            }
        }
        res3 = await client.post("/api/v1/webhooks/razorpay", json=l3_payload)
        rec3 = res3.json().get("recovery_result", {})
        case_id_3 = rec3.get("case_id")
        assert_test(
            "Guardrail Ceiling (₹50k+) -> Status ESCALATED",
            rec3.get("status") == "ESCALATED",
            f"Case: {case_id_3}, Status: {rec3.get('status')}"
        )

        # Merchant Approves Case 3
        approve_res = await client.post(f"/api/v1/recoveries/{case_id_3}/approve")
        app_data = approve_res.json()
        assert_test(
            "Merchant Manual Override Execution (POST /approve)",
            approve_res.status_code == 200 and app_data.get("status") == "RECOVERING" and app_data.get("action_executed") == "SEND_RECOVERY_EMAIL",
            f"Approved Case {case_id_3} executed action: {app_data.get('action_executed')}"
        )

        # TEST 6: Real MongoDB Aggregated Analytics
        print(f"\n{BOLD}[6. REAL ANALYTICS & 3-LEVEL AUTONOMY METRICS]{RESET}")
        analytics_res = await client.get("/api/v1/analytics")
        an_data = analytics_res.json()
        autonomy = an_data.get("autonomy_breakdown", {})
        assert_test(
            "Analytics Endpoint (GET /api/v1/analytics)",
            analytics_res.status_code == 200 and "summary" in an_data and "autonomy_breakdown" in an_data,
            f"L1 Auto: {autonomy.get('level1_auto_recovered')}, L2 Comm: {autonomy.get('level2_auto_communication')}, L3 Human: {autonomy.get('level3_merchant_approval')}"
        )

        # TEST 7: 1,000-Case Evaluation Benchmark
        print(f"\n{BOLD}[7. SYNTHETIC BENCHMARK & REVENUE LIFT EVALUATION]{RESET}")
        eval_res = await client.post("/api/v1/recovery/evaluation/run?count=1000")
        ev_data = eval_res.json()
        lift = ev_data.get("lift", {})
        assert_test(
            "Evaluation Benchmark (1,000 Cases)",
            eval_res.status_code == 200 and lift.get("incremental_revenue_recovered", 0) > 0,
            f"Incremental Revenue Saved: ₹{lift.get('incremental_revenue_recovered'):,.2f}, Wasteful Retries Reduced: {lift.get('wasteful_retry_reduction_pct')}%"
        )

        # SUMMARY
        print(f"\n{BOLD}{BLUE}========================================================================{RESET}")
        total = passed_tests + failed_tests
        if failed_tests == 0:
            print(f"{BOLD}{GREEN}  ALL {total} PRODUCTION QA TEST QUERIES PASSED WITH 100% ACCURACY!{RESET}")
        else:
            print(f"{BOLD}{RED}  {failed_tests} OF {total} QA TESTS FAILED. INVESTIGATE LOGS ABOVE.{RESET}")
        print(f"{BOLD}{BLUE}========================================================================{RESET}\n")

if __name__ == "__main__":
    asyncio.run(run_qa_suite())
