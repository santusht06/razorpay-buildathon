import logging
from typing import Dict, Any
from app.db.mongodb import db_col
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class ContinuousLearningEngine:
    """
    Self-learning feedback loop.
    Records every recovery outcome to maintain historical conversion lift
    across failure reasons, customer segments, and action strategies.
    """

    @classmethod
    async def record_recovery_outcome(
        cls,
        case_id: str,
        failure_reason: str,
        strategy: str,
        amount: float,
        outcome: str  # "RECOVERED", "FAILED", "ESCALATED"
    ):
        """
        Updates the learning matrix in MongoDB with real-time conversion statistics.
        """
        stats_col = db_col("learning_matrix")
        now = datetime.now(timezone.utc).isoformat()
        
        is_success = outcome == "RECOVERED"

        await stats_col.update_one(
            {"failure_reason": failure_reason, "strategy": strategy},
            {
                "$inc": {
                    "total_attempts": 1,
                    "successful_recoveries": 1 if is_success else 0,
                    "total_revenue_recovered": amount if is_success else 0.0
                },
                "$set": {"last_updated": now}
            },
            upsert=True
        )
        logger.info(f"[LEARNING ENGINE] Updated conversion feedback for {failure_reason} / {strategy} (Outcome: {outcome})")

    @classmethod
    async def get_adaptive_boost(cls, failure_reason: str, strategy: str) -> float:
        """
        Returns dynamic probability multiplier based on historical win-rate for this strategy.
        """
        stats_col = db_col("learning_matrix")
        record = await stats_col.find_one({"failure_reason": failure_reason, "strategy": strategy})
        if not record or record.get("total_attempts", 0) < 5:
            return 1.0  # Default neutral weight if insufficient data
        
        attempts = record.get("total_attempts", 1)
        successes = record.get("successful_recoveries", 0)
        win_rate = successes / attempts
        
        # Multiplier ranges from 0.85 (underperforming) to 1.15 (high converting)
        return round(0.85 + (win_rate * 0.30), 2)
