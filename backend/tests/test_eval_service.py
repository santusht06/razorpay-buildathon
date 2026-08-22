import pytest
from app.services.eval_service import EvaluationService

def test_eval_dataset_generation_properties():
    """Verify synthetic dataset produces 1,000 realistic cases with valid probability distributions."""
    dataset = EvaluationService.generate_synthetic_dataset(count=1000, seed=42)
    assert len(dataset) == 1000
    
    reasons = [d["failure_reason"] for d in dataset]
    assert "insufficient_funds" in reasons
    assert "card_expired" in reasons
    assert "fraud_blocked" in reasons
    assert "stolen_card" in reasons
    
    # Verify amounts are positive and structured
    for item in dataset:
        assert item["amount"] > 0
        assert 0.0 <= item["reliability_score"] <= 1.0

def test_eval_benchmark_execution_and_lift():
    """Verify benchmark execution proves AI Agent delivers positive revenue lift and retry reduction."""
    results = EvaluationService.run_benchmark(count=1000)
    
    assert results["total_cases_evaluated"] == 1000
    assert results["total_revenue_at_risk"] > 0
    
    baseline = results["baseline"]
    ai = results["ai_agent"]
    lift = results["lift"]
    
    # AI recovery rate must be higher than baseline
    assert ai["recovery_rate_pct"] > baseline["recovery_rate_pct"]
    assert lift["incremental_revenue_recovered"] > 0
    assert lift["recovery_rate_improvement_pct"] > 0
    
    # AI must eliminate wasteful retries on fraud/stolen cards
    assert ai["unnecessary_retries"] == 0
    assert baseline["unnecessary_retries"] > 0
    assert lift["wasteful_retry_reduction_pct"] == 100.0
