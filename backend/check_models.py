import os
import google.generativeai as genai
from dotenv import load_dotenv

# PASTE YOUR WORKING KEY HERE
key = os.getenv("GOOGLE_KEY")
genai.configure(api_key=key)

print("🔍 Checking available models for this key...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" - {m.name}")
except Exception as e:
    print(f"❌ Error: {e}")