"""
TerraMind AI — Gamification Test Suite
=======================================
Tests for badges, challenges, leaderboard, and profile-stats endpoints.
"""

import pytest


# ── Badges ────────────────────────────────────────────────────────────────────

def test_get_badges_seeded_and_returned(client, auth_headers):
    """Badge list is seeded automatically and returned for authenticated users."""
    response = client.get("/api/gamification/badges", headers=auth_headers)
    assert response.status_code == 200
    badges = response.json()
    assert isinstance(badges, list)
    assert len(badges) > 0
    badge = badges[0]
    assert "name" in badge
    assert "description" in badge
    assert "earned" in badge
    assert isinstance(badge["earned"], bool)


def test_badges_not_earned_initially(client, auth_headers):
    """New user has no badges earned before making any calculations."""
    response = client.get("/api/gamification/badges", headers=auth_headers)
    assert response.status_code == 200
    badges = response.json()
    # Initially all badges should be unearned
    assert all(not b["earned"] for b in badges)


def test_eco_starter_badge_awarded_after_calculation(client, auth_headers, make_calculation):
    """Eco Starter badge is awarded after the user submits their first calculation."""
    client.get("/api/gamification/badges", headers=auth_headers)  # Seed badges
    make_calculation()
    response = client.get("/api/gamification/badges", headers=auth_headers)
    badges = {b["name"]: b["earned"] for b in response.json()}
    assert badges.get("Eco Starter") is True


def test_badges_requires_auth(client):
    """Badge endpoint requires authentication."""
    response = client.get("/api/gamification/badges")
    assert response.status_code == 403


# ── Challenges ────────────────────────────────────────────────────────────────

def test_get_challenges_seeded(client, auth_headers):
    """Challenges are seeded and returned for authenticated users."""
    response = client.get("/api/gamification/challenges", headers=auth_headers)
    assert response.status_code == 200
    challenges = response.json()
    assert isinstance(challenges, list)
    assert len(challenges) > 0
    c = challenges[0]
    assert "title" in c
    assert "xp_reward" in c
    assert "difficulty" in c


def test_challenges_requires_auth(client):
    """Challenges endpoint requires authentication."""
    response = client.get("/api/gamification/challenges")
    assert response.status_code == 403


# ── Leaderboard ───────────────────────────────────────────────────────────────

def test_leaderboard_empty_initially(client):
    """Leaderboard returns empty list when no calculations have been submitted."""
    response = client.get("/api/gamification/leaderboard")
    assert response.status_code == 200
    assert response.json() == []


def test_leaderboard_populated_after_calculation(client, auth_headers, make_calculation):
    """User appears on leaderboard after submitting a calculation."""
    make_calculation()
    response = client.get("/api/gamification/leaderboard")
    assert response.status_code == 200
    leaderboard = response.json()
    assert len(leaderboard) == 1
    entry = leaderboard[0]
    assert "rank" in entry
    assert "xp" in entry
    assert entry["rank"] == 1


def test_leaderboard_pagination(client, auth_headers, make_calculation):
    """Leaderboard skip/limit pagination returns correct subsets."""
    make_calculation()
    response_limited = client.get("/api/gamification/leaderboard?skip=0&limit=1")
    assert response_limited.status_code == 200
    assert len(response_limited.json()) == 1

    response_skipped = client.get("/api/gamification/leaderboard?skip=1&limit=10")
    assert response_skipped.status_code == 200
    assert len(response_skipped.json()) == 0


def test_leaderboard_invalid_period(client):
    """Invalid period returns 422."""
    response = client.get("/api/gamification/leaderboard?period=badvalue")
    assert response.status_code == 422


# ── Profile Stats ─────────────────────────────────────────────────────────────

def test_profile_stats_baseline(client, auth_headers):
    """Profile stats return sensible defaults for a new user."""
    response = client.get("/api/gamification/profile-stats", headers=auth_headers)
    assert response.status_code == 200
    stats = response.json()
    assert "level" in stats
    assert "xp" in stats
    assert "streak" in stats
    assert "badges_earned" in stats
    assert "total_badges" in stats
    assert stats["level"] == "Eco Explorer"
    assert stats["xp"] == 0


def test_profile_stats_xp_increases_after_calculation(client, auth_headers, make_calculation):
    """XP in profile stats increases after submitting a calculation."""
    before = client.get("/api/gamification/profile-stats", headers=auth_headers).json()
    make_calculation()
    after = client.get("/api/gamification/profile-stats", headers=auth_headers).json()
    assert after["xp"] > before["xp"]


def test_profile_stats_requires_auth(client):
    """Profile stats require authentication."""
    response = client.get("/api/gamification/profile-stats")
    assert response.status_code == 403
