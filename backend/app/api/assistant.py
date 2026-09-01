from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/api/v1/assistant", tags=["Admin RAG Assistant"])

class ChatMessage(BaseModel):
    role: str = "user"  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list)
    context_case_id: Optional[str] = None

@router.post("/chat")
async def chat_with_copilot(req: ChatRequest):
    """
    RAG-Powered AI Copilot endpoint for Merchant Admin Portal.
    Answers queries about recovery cases, financial KPIs, merchant policies, and executes admin actions.
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history_dicts = [{"role": m.role, "content": m.content} for m in req.conversation_history]

    response = await AssistantService.chat(
        message=req.message,
        conversation_history=history_dicts,
        context_case_id=req.context_case_id
    )

    return response
