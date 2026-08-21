import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db.mongodb import DatabaseManager
from app.api import webhooks, payments, recovery

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

async def seed_initial_demo_data():
    """
    Seeds initial realistic recovery cases so the dashboard starts with impressive data immediately!
    """
    from app.services.recovery_service import RecoveryService
    
    col = DatabaseManager.get_collection("recovery_cases")
    existing_count = await col.count_documents({})
    if existing_count > 0:
        logger.info(f"Database already populated with {existing_count} cases. Skipping seed.")
        return

    logger.info("Seeding initial recovery cases for Razorpay hackathon demo...")
    sample_failures = [
        {"amount": 2499.0, "reason": "insufficient_funds", "name": "Aarav Patel", "email": "aarav.patel@example.com"},
        {"amount": 4999.0, "reason": "card_expired", "name": "Diya Sengupta", "email": "diya.s@example.com"},
        {"amount": 1499.0, "reason": "bank_outage", "name": "Rohan Verma", "email": "rohan.v@example.com"},
        {"amount": 12500.0, "reason": "insufficient_funds", "name": "Vikram Malhotra", "email": "vikram.m@vip.com"},
        {"amount": 999.0, "reason": "fraud_blocked", "name": "Unknown User", "email": "suspicious@example.com"},
        {"amount": 3999.0, "reason": "authentication_failed", "name": "Ananya Roy", "email": "ananya.roy@example.com"},
    ]

    for sample in sample_failures:
        payload = {
            "event": "payment.failed",
            "payload": {
                "payment": {
                    "entity": {
                        "amount": sample["amount"],
                        "currency": "INR",
                        "status": "failed",
                        "method": "card",
                        "error_code": "PAYMENT_FAILED",
                        "error_reason": sample["reason"],
                        "email": sample["email"],
                        "notes": {"customer_name": sample["name"]}
                    }
                }
            }
        }
        res = await RecoveryService.process_failed_payment_event(payload)
        if sample["name"] in ["Aarav Patel", "Ananya Roy"]:
            await RecoveryService.simulate_customer_payment_recovery(res["case_id"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME}...")
    await DatabaseManager.connect()
    await seed_initial_demo_data()
    yield
    await DatabaseManager.close()
    logger.info("Shutdown complete.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Autonomous Revenue Recovery Agent Platform with Groq AI integration",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router)
app.include_router(payments.router)
app.include_router(recovery.router)

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "database": "in_memory" if DatabaseManager.is_in_memory else "mongodb",
        "groq_llm_configured": bool(settings.GROQ_API_KEY),
        "groq_model": settings.GROQ_MODEL,
        "openai_llm_configured": bool(settings.OPENAI_API_KEY)
    }

@app.get("/")
async def root():
    return {"message": "Razorpay Revenue Recovery Agent API (Groq AI Enabled) is running.", "docs": "/docs"}
