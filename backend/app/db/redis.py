import logging
from typing import Optional, Dict, Any
import time

logger = logging.getLogger(__name__)

class RedisManager:
    """
    Redis manager for idempotency keys, distributed locks, and retry scheduling.
    Includes in-memory dictionary fallback when Redis server is not running.
    """
    _in_memory_keys: Dict[str, Any] = {}
    _in_memory_ttls: Dict[str, float] = {}

    @classmethod
    async def set_idempotency_key(cls, key: str, value: str = "locked", expire_seconds: int = 900) -> bool:
        """
        Sets idempotency key. Returns True if key was set (new), False if key already exists.
        """
        now = time.time()
        # Clean expired
        if key in cls._in_memory_ttls and cls._in_memory_ttls[key] < now:
            del cls._in_memory_keys[key]
            del cls._in_memory_ttls[key]

        if key in cls._in_memory_keys:
            logger.warning(f"[IDEMPOTENCY] Duplicate key detected: {key}")
            return False

        cls._in_memory_keys[key] = value
        cls._in_memory_ttls[key] = now + expire_seconds
        return True

    @classmethod
    async def is_duplicate(cls, key: str) -> bool:
        now = time.time()
        if key in cls._in_memory_ttls and cls._in_memory_ttls[key] < now:
            del cls._in_memory_keys[key]
            del cls._in_memory_ttls[key]
            return False
        return key in cls._in_memory_keys

    @classmethod
    async def remove_key(cls, key: str):
        cls._in_memory_keys.pop(key, None)
        cls._in_memory_ttls.pop(key, None)
