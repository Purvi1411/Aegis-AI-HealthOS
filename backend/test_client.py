import sys
import traceback
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
try:
    response = client.post("/signup", json={"email": "test7@test.com", "password": "test"})
    print("STATUS:", response.status_code)
    print("JSON:", response.json())
except Exception as e:
    traceback.print_exc()
