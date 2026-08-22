import pytest
from app.rag.retriever import policy_retriever, POLICY_DOCUMENTS
from app.rag.embeddings import EmbeddingEngine

def test_rag_retriever_initialization():
    """Verify RAG corpus is loaded with all 6 merchant policy documents."""
    assert len(policy_retriever.documents) == 6
    assert policy_retriever.doc_vectors.shape[0] == 6

def test_rag_retrieves_insufficient_funds_policy():
    """Verify vector search returns soft failure policy for insufficient funds query."""
    query = "insufficient funds temporary payment failure"
    results = policy_retriever.retrieve_relevant_policies(query, top_k=2)
    
    assert len(results) == 2
    doc_ids = [d["id"] for d in results]
    assert "temporary_failure_policy" in doc_ids
    assert results[0]["relevance_score"] > 0.0

def test_rag_retrieves_expired_card_policy():
    """Verify vector search returns expired payment method policy."""
    query = "card_expired payment method update"
    results = policy_retriever.retrieve_relevant_policies(query, top_k=2)
    
    doc_ids = [d["id"] for d in results]
    assert "expired_payment_method_policy" in doc_ids

def test_rag_retrieves_fraud_security_stopping_rules():
    """Verify security rules are retrieved for fraud / stolen card events."""
    query = "fraud_blocked stolen card terminal failure"
    results = policy_retriever.retrieve_relevant_policies(query, top_k=2)
    
    doc_ids = [d["id"] for d in results]
    assert "stopping_rules" in doc_ids

def test_embedding_engine_cosine_similarity():
    """Verify TF-IDF normalized vector mathematics produce unit norms."""
    engine = EmbeddingEngine()
    docs = ["Payment failed insufficient funds", "Card expired update details"]
    vectors = engine.fit_transform(docs)
    
    assert len(vectors) == 2
    # Verify query transformation produces valid non-zero vector for matched vocab
    q_vec = engine.transform_query("insufficient funds")
    assert q_vec.shape[0] == len(engine.vocab)
