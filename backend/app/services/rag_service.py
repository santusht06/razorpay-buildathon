import logging
from typing import List, Dict, Any
import numpy as np

logger = logging.getLogger(__name__)

# Merchant Policies & Playbooks Knowledge Base
KNOWLEDGE_BASE_DOCS = [
    {
        "id": "policy_insufficient_funds",
        "title": "Insufficient Funds Recovery Playbook",
        "category": "temporary_failure",
        "content": "For insufficient funds on recurring subscriptions: First, verify customer LTV and payment history score. If score > 0.8 and payment amount < ₹10,000, send a personalized payment retry email with a 48-hour retry grace period link. Schedule an automatic retry in 2 days. If customer history is poor, request immediate payment method update."
    },
    {
        "id": "policy_card_expired",
        "title": "Expired Payment Method Guidance",
        "category": "card_maintenance",
        "content": "When a card expires or fails authorization due to card details: Do NOT attempt automated payment retries immediately. Direct automated retries on expired cards result in gateway penalty fees. Send a Payment Method Update notification email requesting card update via Razorpay checkout interface."
    },
    {
        "id": "policy_bank_outage",
        "title": "Bank / Gateway Outage Handling Policy",
        "category": "network_failure",
        "content": "When error code indicates GATEWAY_ERROR, BANK_OUTAGE, or 3DS_TIMEOUT: The failure is non-customer fault. Schedule automatic payment retry within 4 hours. Do not panic the customer with aggressive emails unless retry fails twice."
    },
    {
        "id": "policy_high_value",
        "title": "High Value Transaction Recovery Policy",
        "category": "risk_management",
        "content": "For failed transactions equal to or exceeding ₹10,000: Escalate to merchant account manager for VIP outreach while issuing a soft reminder email. Automatic retries are limited to 1 attempt to avoid customer disruption."
    },
    {
        "id": "policy_terminal_fraud",
        "title": "Terminal Fraud & Security Exception Policy",
        "category": "security",
        "content": "For fraud blocks, stolen cards, or blacklisted BINs: Immediately halt all recovery attempts. Mark case as 'escalated' or 'stopped'. Log security audit trail and report to merchant risk team. Never issue retry links."
    }
]

class RAGService:
    """
    RAG Vector Store and Semantic Policy Retrieval Engine.
    Uses TF-IDF vectorization with Cosine Similarity for fast, dependency-free semantic retrieval.
    """
    def __init__(self):
        self.docs = KNOWLEDGE_BASE_DOCS
        self.vocabulary = set()
        self._build_index()

    def _tokenize(self, text: str) -> List[str]:
        import re
        tokens = re.findall(r'\w+', text.lower())
        return [t for t in tokens if len(t) > 2]

    def _build_index(self):
        # Build simple TF-IDF representation
        all_tokens = []
        for doc in self.docs:
            tokens = self._tokenize(doc["title"] + " " + doc["content"])
            all_tokens.extend(tokens)
            doc["_tokens"] = tokens

        self.vocabulary = list(set(all_tokens))
        self.vocab_map = {word: idx for idx, word in enumerate(self.vocabulary)}
        
        # Doc vectors
        self.doc_vectors = []
        for doc in self.docs:
            vec = np.zeros(len(self.vocabulary))
            for t in doc["_tokens"]:
                if t in self.vocab_map:
                    vec[self.vocab_map[t]] += 1
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            self.doc_vectors.append(vec)

    def retrieve_policies(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieves top_k relevant recovery policies for a given query or payment failure context.
        """
        query_tokens = self._tokenize(query)
        q_vec = np.zeros(len(self.vocabulary))
        for t in query_tokens:
            if t in self.vocab_map:
                q_vec[self.vocab_map[t]] += 1

        norm = np.linalg.norm(q_vec)
        if norm > 0:
            q_vec = q_vec / norm

        scores = []
        for idx, d_vec in enumerate(self.doc_vectors):
            score = float(np.dot(q_vec, d_vec))
            scores.append((score, self.docs[idx]))

        scores.sort(key=lambda x: x[0], reverse=True)
        
        results = []
        for score, doc in scores[:top_k]:
            results.append({
                "id": doc["id"],
                "title": doc["title"],
                "category": doc["category"],
                "content": doc["content"],
                "relevance_score": round(score, 3)
            })
        return results

rag_service = RAGService()
