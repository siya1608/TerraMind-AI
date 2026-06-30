"""
TerraMind AI — Security Module
================================
Provides all authentication and authorisation primitives:
  - PBKDF2-SHA256 password hashing (zero native binary deps)
  - JWT access token creation and verification
  - FastAPI dependency injectors for authenticated/optional/admin users
  - Structured audit logging for auth events
  - Input sanitisation helpers
  - In-memory token blacklist (for logout invalidation)
"""

import hashlib
import logging
import os
import re
import time
from datetime import datetime, timedelta
from typing import Optional, Set, Union, Any

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db
from app.db.models import User

# ── Logging ───────────────────────────────────────────────────────────────────
logger = logging.getLogger("terramind_ai.security")

# ── Audit Logger ─────────────────────────────────────────────────────────────
_audit_logger = logging.getLogger("terramind_ai.audit")


def audit_log(event: str, user_email: str = "anonymous", ip_address: str = "unknown", **extra) -> None:
    """
    Emit a structured audit log entry for security-sensitive events.

    Args:
        event:       Short description of the event (e.g., 'LOGIN_SUCCESS').
        user_email:  Email of the user involved.
        ip_address:  Client IP address extracted from the request.
        **extra:     Any additional key-value context to include.
    """
    _audit_logger.info(
        "AUDIT | event=%-20s | user=%-35s | ip=%-15s | %s",
        event,
        user_email,
        ip_address,
        " | ".join(f"{k}={v}" for k, v in extra.items()),
    )


# ── Token Blacklist ───────────────────────────────────────────────────────────
# In-memory set of invalidated JTI (JWT IDs) or full tokens.
# For multi-process/production deployments, replace with Redis.
_token_blacklist: Set[str] = set()


def blacklist_token(token: str) -> None:
    """Add a token to the blacklist, preventing future use (soft logout)."""
    _token_blacklist.add(token)


def is_token_blacklisted(token: str) -> bool:
    """Return True if the token has been invalidated."""
    return token in _token_blacklist


# ── Input Sanitisation ────────────────────────────────────────────────────────
# Strip HTML tags and dangerous characters from user-supplied strings.
_HTML_TAG_RE = re.compile(r"<[^>]+>")
_DANGEROUS_CHARS_RE = re.compile(r"[\"\';<>\\]")


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Remove HTML tags and dangerous characters from a user-supplied string.

    Args:
        value:      The raw input string.
        max_length: Maximum allowed character length after sanitisation.

    Returns:
        Sanitised string, truncated to max_length.
    """
    cleaned = _HTML_TAG_RE.sub("", value)
    cleaned = _DANGEROUS_CHARS_RE.sub("", cleaned)
    return cleaned.strip()[:max_length]


# ── Password Hashing ──────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    """
    Hash a plain-text password using PBKDF2-HMAC-SHA256 with a random 16-byte salt.
    100,000 iterations aligns with NIST SP 800-63B recommendations.

    Returns:
        A string of the format: ``<salt_hex>:<hash_hex>``
    """
    salt = os.urandom(16)
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"{salt.hex()}:{pw_hash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against its stored PBKDF2 hash.

    Returns:
        True if the password matches, False otherwise.
    """
    try:
        salt_hex, hash_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        pw_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100_000)
        return pw_hash.hex() == hash_hex
    except Exception:
        return False


# ── JWT Utilities ─────────────────────────────────────────────────────────────
def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token with an expiry claim.

    Args:
        subject:      The user identifier to embed as the ``sub`` claim.
        expires_delta: Optional custom expiry; defaults to settings value.

    Returns:
        Signed JWT string.
    """
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.ALGORITHM)


# ── HTTP Bearer schemes ───────────────────────────────────────────────────────
_bearer_required = HTTPBearer()
_bearer_optional = HTTPBearer(auto_error=False)


def _decode_token(token: str) -> Optional[str]:
    """
    Decode and validate a JWT, returning the ``sub`` claim (user ID).

    Returns:
        User ID string, or None if the token is invalid or blacklisted.
    """
    if is_token_blacklisted(token):
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


# ── FastAPI Dependencies ──────────────────────────────────────────────────────
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_required),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — resolves the authenticated user from a Bearer token.

    Raises:
        HTTPException 401: If the token is missing, expired, or blacklisted.
        HTTPException 404: If the user record no longer exists.
    """
    user_id = _decode_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials — token invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user record not found.",
        )
    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    FastAPI dependency — resolves the user from a Bearer token if present.
    Returns None for unauthenticated requests (public endpoints).
    """
    if not credentials:
        return None
    user_id = _decode_token(credentials.credentials)
    if user_id is None:
        return None
    return db.query(User).filter(User.id == user_id).first()


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    FastAPI dependency — restricts access to users with the 'admin' role.

    Raises:
        HTTPException 403: If the authenticated user is not an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges — admin access required.",
        )
    return current_user
