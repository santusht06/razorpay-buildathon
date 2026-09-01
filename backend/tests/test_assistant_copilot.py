import pytest
from httpx import AsyncClient
from app.main import app
from app.services.assistant_service import AssistantService
from app.services.recovery_service import RecoveryService

@pytest.mark.asyncio
async def test_assistant_chat_service_general_metrics():
    """
    Test AssistantService synthesizes live DB metrics and RAG sources.
    """
    res = await AssistantService.chat(message="What is our total revenue recovered and conversion rate?")
    assert "reply" in res
    assert len(res["reply"]) > 10
    assert "sources" in res
    assert isinstance(res["sources"], list)
    assert len(res["sources"]) > 0
    assert "suggested_prompts" in res
    assert len(res["suggested_prompts"]) > 0

@pytest.mark.asyncio
async def test_assistant_chat_service_policy_grounding():
    """
    Test AssistantService retrieves relevant policies when asked about ₹50k limit or fraud rules.
    """
    res = await AssistantService.chat(message="What is our guardrail policy on transactions over 50000 rupees?")
    assert "reply" in res
    assert "sources" in res
    # Sources should include high value policy
    assert any("High Value" in s or "Guardrail" in s or "Policy" in s for s in res["sources"])

@pytest.mark.asyncio
async def test_assistant_chat_api_endpoint(async_client: AsyncClient):
    """
    Test POST /api/v1/assistant/chat API endpoint.
    """
    payload = {
        "message": "List all active recovery guardrails and summarize performance.",
        "conversation_history": []
    }
    response = await async_client.post("/api/v1/assistant/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "sources" in data
    assert "suggested_prompts" in data
