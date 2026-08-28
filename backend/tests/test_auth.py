import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        },
    )
    # If user already exists, it might return 400.
    # For a fresh test, we expect 200.
    if response.status_code == 400:
        assert response.json()["detail"] == "User with this email already exists"
    else:
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data

def test_login_user():
    # Ensure user exists (ignoring 400 if already created)
    client.post(
        "/api/auth/register",
        json={
            "email": "login_test@example.com",
            "password": "testpassword",
            "full_name": "Login Test User"
        },
    )

    # Test login
    response = client.post(
        "/api/auth/login",
        data={
            "username": "login_test@example.com",
            "password": "testpassword"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials():
    response = client.post(
        "/api/auth/login",
        data={
            "username": "wrong@example.com",
            "password": "wrongpassword"
        },
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"
