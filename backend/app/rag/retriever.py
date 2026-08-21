import logging
from typing import List, Dict, Any
import numpy as np
from app.rag.embeddings import EmbeddingEngine

logger = logging.getLogger(__name__)

POLICY_DOCUMENTS = [
    {
        "id": "temporary_failure_policy",
        "title": "Temporary Failure & Insufficient Funds Policy",
        "category": "soft_failure",
        "content": "For temporary insufficient funds on subscription or standard payments: Verify customer payment reliability score (>0.75) and LTV. Send a personalized payment retry link via email. Allow a 48-hour grace period before initiating the next automated retry."
    },
    {
        "id": "expired_payment_method_policy",
        "title": "Expired Payment Method Policy",
        "category": "card_maintenance",
        "content": "When a payment fails due to card details or expired payment method: Do NOT execute immediate automated retries to avoid gateway penalty fees. Send a Payment Method Update notification email directing customer to Razorpay checkout to update card on file."
    },
    {
        "id": "subscription_recovery_policy",
        "title": "Subscription Dunning Policy",
        "category": "subscription",
        "content": "For recurring subscription payments: If initial attempt fails, keep subscription status as 'past_due'. Issue recovery communication with one-click payment checkout link. Limit retries to 3 attempts over 7 days before escalating to merchant support."
    },
    {
        "id": "checkout_recovery_policy",
        "title": "Checkout Abandonment Recovery Policy",
        "category": "abandonment",
        "content": "When a customer reaches the payment stage but abandons checkout: Trigger an automated checkout recovery notification within 30 minutes with a pre-filled cart checkout link. Offer soft reminders without aggressive retries."
    },
    {
        "id": "high_value_payment_policy",
        "title": "High Value Payment Guardrail Policy",
        "category": "risk_management",
        "content": "For transactions equal to or exceeding ₹50,000: Automated retries are strictly prohibited without merchant approval. For transactions between ₹10,000 and ₹50,000: Flag as high-value and assign VIP priority escalation."
    },
    {
        "id": "stopping_rules",
        "title": "Security & Failure Stopping Rules",
        "category": "security",
        "content": "Immediately halt all recovery actions if payment failure is marked as fraud_blocked, stolen_card, card_blacklisted, or account_closed. Stop recovery immediately once payment status is verified captured/recovered."
    }
]

class PolicyRetriever:
    """
    RAG Policy Retrieval Engine using vector similarity search.
    """
    def __init__(self):
        self.documents = POLICY_DOCUMENTS
        self.embedding_engine = EmbeddingEngine()
        self.doc_texts = [d["title"] + " " + d["content"] for d in self.documents]
        self.doc_vectors = self.embedding_engine.fit_transform(self.doc_texts)

    def retrieve_relevant_policies(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        if not query:
            return self.documents[:top_k]

        q_vec = self.embedding_engine.transform_query(query)
        scores = []
        for idx, doc_vec in enumerate(self.doc_vectors):
            score = float(np.dot(q_vec, doc_vec))
            scores.append((score, self.documents[idx]))

        scores.sort(key=lambda x: x[0], reverse=True)
        return [
            {
                "id": doc["id"],
                "title": doc["title"],
                "category": doc["category"],
                "content": doc["content"],
                "relevance_score": round(score, 3)
            }
            for score, doc in scores[:top_k]
        ]

policy_retriever = PolicyRetriever()
