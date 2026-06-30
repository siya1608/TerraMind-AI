"""
TerraMind AI — In-Memory TTL Cache Service
==========================================
Provides a lightweight, dependency-free, thread-safe TTL cache for
frequently-read, slowly-changing data (e.g., smart city statistics).

Usage:
    from app.services.cache import ttl_cache

    @ttl_cache(ttl_seconds=300)
    def get_expensive_data() -> list:
        ...
"""

import time
import threading
from functools import wraps
from typing import Any, Callable, Dict, Optional, Tuple


class _CacheEntry:
    """Holds a single cached value with its expiry timestamp."""

    __slots__ = ("value", "expires_at")

    def __init__(self, value: Any, expires_at: float) -> None:
        self.value = value
        self.expires_at = expires_at

    def is_expired(self) -> bool:
        return time.monotonic() > self.expires_at


class TTLCache:
    """
    Thread-safe in-memory cache with per-entry TTL expiry.

    Attributes:
        default_ttl: Default time-to-live in seconds for all entries.
    """

    def __init__(self, default_ttl: int = 300) -> None:
        self.default_ttl = default_ttl
        self._store: Dict[str, _CacheEntry] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Tuple[bool, Optional[Any]]:
        """
        Retrieve a value from the cache.

        Returns:
            (hit, value) — hit is False if missing or expired.
        """
        with self._lock:
            entry = self._store.get(key)
            if entry is None or entry.is_expired():
                if entry is not None:
                    del self._store[key]
                return False, None
            return True, entry.value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Store a value with an optional custom TTL (defaults to `default_ttl`)."""
        ttl_seconds = ttl if ttl is not None else self.default_ttl
        expires_at = time.monotonic() + ttl_seconds
        with self._lock:
            self._store[key] = _CacheEntry(value=value, expires_at=expires_at)

    def invalidate(self, key: str) -> None:
        """Remove a specific key from the cache."""
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        """Evict all entries from the cache."""
        with self._lock:
            self._store.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)


# ── Module-level singleton ────────────────────────────────────────────────────
# Shared cache instance for the entire application process.
app_cache = TTLCache(default_ttl=300)


def ttl_cache(ttl_seconds: int = 300, key_prefix: str = ""):
    """
    Decorator that caches the return value of a synchronous function.

    Args:
        ttl_seconds: How long (in seconds) to keep the cached value.
        key_prefix:  Optional prefix to namespace the cache key.

    Example:
        @ttl_cache(ttl_seconds=60, key_prefix="cities")
        def get_city_data(db) -> list:
            return db.query(CityStatistic).all()
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key from prefix + function name (ignore db session arg)
            cache_key = f"{key_prefix}:{func.__name__}" if key_prefix else func.__name__
            hit, cached_value = app_cache.get(cache_key)
            if hit:
                return cached_value
            result = func(*args, **kwargs)
            app_cache.set(cache_key, result, ttl=ttl_seconds)
            return result
        return wrapper
    return decorator
