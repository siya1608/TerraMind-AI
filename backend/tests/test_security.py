"""
TerraMind AI — Security Module Unit Tests
==========================================
Tests for password hashing, JWT lifecycle, token blacklisting,
input sanitisation, and authentication boundary enforcement.
"""

import time
import pytest
from datetime import timedelta

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    sanitize_string,
    blacklist_token,
    is_token_blacklisted,
)


# ── Password Hashing ──────────────────────────────────────────────────────────

def test_hash_password_returns_string():
    """hash_password returns a non-empty string."""
    result = hash_password("TestPassword1")
    assert isinstance(result, str)
    assert len(result) > 0


def test_hash_password_format():
    """Password hash contains exactly two colon-separated hex components."""
    result = hash_password("TestPassword1")
    parts = result.split(":")
    assert len(parts) == 2
    salt_hex, hash_hex = parts
    assert len(salt_hex) == 32    # 16 bytes → 32 hex chars
    assert len(hash_hex) == 64    # SHA-256 → 32 bytes → 64 hex chars


def test_hash_is_random():
    """Two hashes of the same password produce different outputs (random salt)."""
    h1 = hash_password("SamePassword1")
    h2 = hash_password("SamePassword1")
    assert h1 != h2


def test_verify_password_correct():
    """verify_password returns True for the correct password."""
    password = "CorrectHorseBattery9"
    hashed = hash_password(password)
    assert verify_password(password, hashed) is True


def test_verify_password_wrong():
    """verify_password returns False for an incorrect password."""
    hashed = hash_password("RightPassword1")
    assert verify_password("WrongPassword1", hashed) is False


def test_verify_password_malformed_hash():
    """verify_password handles malformed hash strings gracefully."""
    assert verify_password("anything", "not-a-valid-hash") is False
    assert verify_password("anything", "") is False


# ── JWT ───────────────────────────────────────────────────────────────────────

def test_create_access_token_returns_string():
    """create_access_token returns a non-empty JWT string."""
    token = create_access_token(subject="user-123")
    assert isinstance(token, str)
    assert len(token) > 0
    assert token.count(".") == 2  # header.payload.signature


def test_access_token_custom_expiry():
    """Access token with custom expiry can be decoded successfully."""
    import jwt
    from app.config import settings
    token = create_access_token(subject="user-xyz", expires_delta=timedelta(minutes=5))
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == "user-xyz"


def test_access_token_expired():
    """Expired token raises PyJWTError on decode."""
    import jwt
    from app.config import settings
    token = create_access_token(subject="user-expired", expires_delta=timedelta(seconds=-1))
    with pytest.raises(jwt.ExpiredSignatureError):
        jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])


# ── Token Blacklist ───────────────────────────────────────────────────────────

def test_token_not_blacklisted_by_default():
    """A freshly created token is not in the blacklist."""
    token = create_access_token(subject="fresh-user")
    assert is_token_blacklisted(token) is False


def test_blacklist_token():
    """A blacklisted token is subsequently detected as blacklisted."""
    token = create_access_token(subject="logout-user")
    assert is_token_blacklisted(token) is False
    blacklist_token(token)
    assert is_token_blacklisted(token) is True


# ── Input Sanitisation ────────────────────────────────────────────────────────

def test_sanitize_strips_html_tags():
    """sanitize_string removes HTML tags."""
    result = sanitize_string("<script>alert('xss')</script>Hello")
    assert "<script>" not in result
    assert "Hello" in result


def test_sanitize_strips_dangerous_chars():
    """sanitize_string removes SQL/XSS dangerous characters."""
    result = sanitize_string("Hello'; DROP TABLE users; --")
    assert "'" not in result
    assert ";" not in result


def test_sanitize_truncates_to_max_length():
    """sanitize_string truncates output to max_length."""
    long_input = "a" * 2000
    result = sanitize_string(long_input, max_length=100)
    assert len(result) == 100


def test_sanitize_preserves_safe_text():
    """sanitize_string preserves normal alphanumeric content."""
    result = sanitize_string("I reduced my carbon footprint by 20 percent today!")
    assert "reduced" in result
    assert "carbon" in result


def test_sanitize_empty_string():
    """sanitize_string handles empty string gracefully."""
    result = sanitize_string("")
    assert result == ""


# ── API-level auth boundary ───────────────────────────────────────────────────

def test_protected_endpoint_without_token(client):
    """Protected endpoints return 403 without any Authorization header."""
    response = client.get("/api/auth/profile")
    assert response.status_code == 403


def test_protected_endpoint_with_invalid_token(client):
    """Protected endpoints return 401 with a syntactically invalid token."""
    headers = {"Authorization": "Bearer totallyinvalidtoken"}
    response = client.get("/api/auth/profile", headers=headers)
    assert response.status_code == 401


def test_admin_endpoint_with_user_token(client):
    """Non-admin user receives 403 on admin-only endpoints."""
    # Register two users: first is admin, second is regular user
    client.post("/api/auth/signup", json={"email": "first@test.com", "password": "FirstPass1"})
    login = client.post("/api/auth/login", json={"email": "first@test.com", "password": "FirstPass1"})
    client.post("/api/auth/signup", json={"email": "second@test.com", "password": "SecondPass2"})
    user_login = client.post("/api/auth/login", json={"email": "second@test.com", "password": "SecondPass2"})
    token = user_login.json()["access_token"]
    response = client.get("/api/admin/dashboard-stats", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
