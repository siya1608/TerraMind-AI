"""
TerraMind AI — Marketplace Test Suite
======================================
Tests for carbon offset project listing, contribution flow,
CO2 offset math, XP rewards, and my-contributions history.
"""

import pytest


# ── Project Listing ───────────────────────────────────────────────────────────

def test_list_projects_seeded(client, auth_headers):
    """Marketplace projects are seeded and returned to authenticated users."""
    response = client.get("/api/marketplace/projects", headers=auth_headers)
    assert response.status_code == 200
    projects = response.json()
    assert isinstance(projects, list)
    assert len(projects) > 0
    project = projects[0]
    assert "id" in project
    assert "title" in project
    assert "category" in project
    assert "price_per_ton" in project
    assert "co2_reduction" in project


def test_list_projects_requires_auth(client):
    """Marketplace projects require authentication."""
    response = client.get("/api/marketplace/projects")
    assert response.status_code == 403


# ── Contribution ──────────────────────────────────────────────────────────────

def test_contribute_to_project(client, auth_headers):
    """User can contribute to a project and receives CO2 offset + XP."""
    # First get available projects
    projects = client.get("/api/marketplace/projects", headers=auth_headers).json()
    project_id = projects[0]["id"]

    contribution_payload = {"project_id": project_id, "amount": 50.0}
    response = client.post(
        "/api/marketplace/contribute",
        json=contribution_payload,
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "co2_offset" in data
    assert "earned_xp" in data
    assert data["co2_offset"] > 0
    assert data["earned_xp"] > 0
    # 5 XP per dollar: 50 * 5 = 250
    assert data["earned_xp"] == 250


def test_contribute_co2_offset_calculation(client, auth_headers):
    """CO2 offset is calculated as: amount / price_per_ton * co2_reduction."""
    projects = client.get("/api/marketplace/projects", headers=auth_headers).json()
    project = projects[0]
    project_id = project["id"]
    price_per_ton = project["price_per_ton"]
    co2_reduction = project["co2_reduction"]

    amount = 100.0
    expected_offset = round(amount / price_per_ton * co2_reduction, 3)

    response = client.post(
        "/api/marketplace/contribute",
        json={"project_id": project_id, "amount": amount},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert abs(response.json()["co2_offset"] - expected_offset) < 0.01


def test_contribute_nonexistent_project(client, auth_headers):
    """Contributing to a non-existent project returns 404."""
    response = client.post(
        "/api/marketplace/contribute",
        json={"project_id": 99999, "amount": 10.0},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_contribute_zero_amount_rejected(client, auth_headers):
    """Contribution with zero or negative amount is rejected (Pydantic validation)."""
    projects = client.get("/api/marketplace/projects", headers=auth_headers).json()
    project_id = projects[0]["id"]

    response = client.post(
        "/api/marketplace/contribute",
        json={"project_id": project_id, "amount": 0.0},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_contribute_requires_auth(client):
    """Contribution endpoint requires authentication."""
    response = client.post(
        "/api/marketplace/contribute",
        json={"project_id": 1, "amount": 10.0},
    )
    assert response.status_code == 403


# ── My Contributions ──────────────────────────────────────────────────────────

def test_my_contributions_initially_empty(client, auth_headers):
    """New user has no contributions."""
    response = client.get("/api/marketplace/my-contributions", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_my_contributions_after_contribution(client, auth_headers):
    """Contributions appear in the user's history after making one."""
    projects = client.get("/api/marketplace/projects", headers=auth_headers).json()
    project_id = projects[0]["id"]
    client.post(
        "/api/marketplace/contribute",
        json={"project_id": project_id, "amount": 25.0},
        headers=auth_headers,
    )
    response = client.get("/api/marketplace/my-contributions", headers=auth_headers)
    assert response.status_code == 200
    contribs = response.json()
    assert len(contribs) == 1
    assert contribs[0]["amount"] == 25.0
    assert "co2_offset" in contribs[0]
