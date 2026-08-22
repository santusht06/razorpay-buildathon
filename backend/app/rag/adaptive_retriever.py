import logging
from typing import List, Dict, Any, Optional
import numpy as np
from app.rag.embeddings import EmbeddingEngine

logger = logging.getLogger(__name__)

DEFAULT_POLICIES = [
    {
        "id": "temporary_failure_policy",
        "title": "Temporary Failure & Insufficient Funds Policy",
        "category": "soft_failure",
        "keywords": ["insufficient", "funds", "balance", "limit", "soft_fail", "retry", "decline"],
        "content": "For temporary insufficient funds on subscription or standard payments: Verify customer payment reliability score (>0.75) and LTV. Send a personalized payment retry link via email. Allow a 48-hour grace period before initiating the next automated retry."
    },
    {
        "id": "expired_payment_method_policy",
        "title": "Expired Payment Method Policy",
        "category": "card_maintenance",
        "keywords": ["expired", "card", "validity", "update", "replace", "cvv", "auth_failed"],
        "content": "When a payment fails due to card details or expired payment method: Do NOT execute immediate automated retries to avoid gateway penalty fees. Send a Payment Method Update notification email directing customer to Razorpay checkout to update card on file."
    },
    {
        "id": "subscription_recovery_policy",
        "title": "Subscription Dunning & Retention Policy",
        "category": "subscription",
        "keywords": ["subscription", "dunning", "recurring", "past_due", "grace_period", "plan"],
        "content": "For recurring subscription payments: If initial attempt fails, keep subscription status as 'past_due'. Issue recovery communication with one-click payment checkout link. Limit retries to 3 attempts over 7 days before escalating to merchant support."
    },
    {
        "id": "checkout_recovery_policy",
        "title": "Checkout Abandonment & Cart Recovery Policy",
        "category": "abandonment",
        "keywords": ["abandon", "cart", "checkout", "dropoff", "unfinished", "upi", "session"],
        "content": "When a customer reaches the payment stage but abandons checkout: Trigger an automated checkout recovery notification within 30 minutes with a pre-filled cart checkout link. Offer soft reminders without aggressive retries."
    },
    {
        "id": "high_value_payment_policy",
        "title": "High Value Payment Guardrail Policy",
        "category": "risk_management",
        "keywords": ["high_value", "limit", "enterprise", "threshold", "50000", "approval", "vip"],
        "content": "For transactions equal to or exceeding ₹50,000: Automated retries are strictly prohibited without merchant approval. For transactions between ₹10,000 and ₹50,000: Flag as high-value and assign VIP priority escalation."
    },
    {
        "id": "stopping_rules",
        "title": "Security & Failure Stopping Rules",
        "category": "security",
        "keywords": ["fraud", "stolen", "blacklisted", "illegal", "halt", "stop", "security"],
        "content": "Immediately halt all recovery actions if payment failure is marked as fraud_blocked, stolen_card, card_blacklisted, or account_closed. Stop recovery immediately once payment status is verified captured/recovered."
    }
]

class AdaptiveRAGRetriever:
    """
    Adaptive Hybrid RAG Retrieval Engine with Semantic Query Expansion,
    Keyword Weighting, and Dynamic Merchant Custom Policy Indexing.
    """

    def __init__(self):
        self.documents = list(DEFAULT_POLICIES)
        self.custom_merchant_policies = []
        self.embedding_engine = EmbeddingEngine()
        self._rebuild_index()

    def _rebuild_index(self):
        all_docs = self.documents + self.custom_merchant_policies
        self.doc_texts = [
            f"{d['title']} {' '.join(d.get('keywords', []))} {d['content']}"
            for d in all_docs
        ]
        self.doc_vectors = self.embedding_engine.fit_transform(self.doc_texts)

    def add_custom_merchant_policy(self, policy: Dict[str, Any]):
        """Dynamically indexes a new merchant-specific rule into the RAG vector space."""
        self.custom_merchant_policies.append(policy)
        self._rebuild_index()
        logger.info(f"[RAG ENGINE] Dynamic merchant policy '{policy.get('title')}' indexed.")

    def retrieve_relevant_policies(
        self,
        query: str,
        category_filter: Optional[str] = None,
        top_k: int = 2
    ) -> List[Dict[str, Any]]:
        """
        Adaptive retrieval combining TF-IDF cosine similarity, keyword domain boost,
        and category contextual filtering.
        """
        if not query:
            return (self.documents + self.custom_merchant_policies)[:top_k]

        # Domain Query Expansion
        expanded_query = self._expand_query(query)
        q_vec = self.embedding_engine.transform_query(expanded_query)

        all_docs = self.documents + self.custom_merchant_policies
        scores = []
        
        for idx, doc in enumerate(all_docs):
            base_score = float(np.dot(q_vec, self.doc_vectors[idx])) if idx < len(self.doc_vectors) else 0.0
            
            # Category boost
            if category_filter and doc.get("category") == category_filter:
                base_score += 0.25
                
            # Keyword exact match bonus
            q_lower = query.lower()
            keyword_matches = sum(1 for kw in doc.get("keywords", []) if kw in q_lower)
            boosted_score = base_score + (keyword_matches * 0.15)
            
            scores.append((boosted_score, doc))

        scores.sort(key=lambda x: x[0], reverse=True)

        return [
            {
                "id": doc["id"],
                "title": doc["title"],
                "category": doc["category"],
                "content": doc["content"],
                "relevance_score": round(max(0.1, score), 3),
                "is_custom_policy": doc in self.custom_merchant_policies
            }
            for score, doc in scores[:top_k]
        ]

    def _expand_query(self, query: str) -> str:
        """Enriches failure terms with payments/banking domain synonyms."""
        q_lower = query.lower()
        expansions = []
        if "insufficient" in q_lower or "balance" in q_lower:
            expansions.extend(["soft_failure", "temporary", "funds", "retry_link"])
        if "expired" in q_lower or "card" in q_lower:
            expansions.extend(["card_maintenance", "update_payment_method", "validity"])
        if "outage" in q_lower or "gateway" in q_lower or "bank" in q_lower:
            expansions.extend(["transient", "network", "schedule_retry", "downtime"])
        if "fraud" in q_lower or "stolen" in q_lower:
            expansions.extend(["security", "halt", "stopping_rules", "blacklist"])
        if "abandon" in q_lower or "cart" in q_lower:
            expansions.extend(["checkout_abandonment", "cart_recovery", "notification"])
            
        return f"{query} {' '.join(expansions)}"

adaptive_policy_retriever = AdaptiveRAGRetriever()
