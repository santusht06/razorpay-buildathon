import pytest
import asyncio
import uuid
from typing import Dict, Any
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.config import settings
from app.db.mongodb import DatabaseManager, InMemoryDatabase
from app.db.redis import RedisManager

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
async def setup_test_db():
    """
    Ensure every test runs with an isolated clean database and cleared Redis cache.
    """
    # Use isolated test in-memory database
    DatabaseManager.db = InMemoryDatabase("test_razorpay_recovery_db")
    DatabaseManager.is_in_memory = True
    
    # Clear in-memory Redis keys
    RedisManager._in_memory_keys.clear()
    RedisManager._in_memory_ttls.clear()
    
    yield
    
    # Clean up after test
    RedisManager._in_memory_keys.clear()
    RedisManager._in_memory_ttls.clear()

@pytest.fixture
async def async_client():
    """Async test client for FastAPI endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

@pytest.fixture
def sample_payment_payload():
    """Standard payment failure webhook payload fixture."""
    def _create_payload(amount: float = 2499.0, reason: str = "insufficient_funds", email: str = "test.user@example.com", name: str = "Test User"):
        return {
            "event": "payment.failed",
            "payload": {
                "payment": {
                    "entity": {
                        "id": f"pay_test_{uuid.uuid4().hex[:8]}",
                        "amount": int(amount * 100) if amount < 100000 else int(amount),
                        "currency": "INR",
                        "status": "failed",
                        "method": "card",
                        "error_code": "PAYMENT_FAILED",
                        "error_reason": reason,
                        "error_description": f"Test failure: {reason}",
                        "email": email,
                        "notes": {
                            "customer_name": name
                        }
                    }
                }
            }
        }
    return _create_payload
