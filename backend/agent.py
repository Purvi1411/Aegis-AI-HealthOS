import os
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()

GROQ_KEY = os.getenv("GROQ_API_KEY")
TAVILY_KEY = os.getenv("TAVILY_API_KEY")

# 4. Setup "Hands" (Search tools for verifying findings)
tools = [TavilySearchResults(max_results=3, tavily_api_key=TAVILY_KEY)]

# 5. Setup "Brain" (Multimodal Vision Model)
try:
    model = ChatGroq(
        # Llama 3.2 Vision 11B is optimized for medical VQA and OCR
        model="llama-3.3-70b-versatile", 
        temperature=0,
        groq_api_key=GROQ_KEY
    )
except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")

healthcare_agent = create_react_agent(model, tools)

def run_agent(query: str, image_b64: str = None, location: dict = None, language: str = "English"):
    # 🚨 UPDATED SYSTEM INSTRUCTIONS: Multilingual Translation 🚨
    system_instructions = (
        "You are AEGIS-AI, a high-precision medical diagnostic assistant. "
        f"CRITICAL INSTRUCTION: You MUST respond entirely in {language}. "
        "Respond DIRECTLY to the user in plain text using Markdown formatting. "
        "DO NOT use XML tags or attempt to call functions like <function=REPORT_MODE>. "
        "1. Simplify all medical jargon into everyday, easy-to-understand terms. "
        "2. For images: Analyze visual characteristics to suggest a classification. "
        "3. For PDF text: Summarize key findings, lab values, and doctor notes clearly. "
        "4. Always provide a 'Confidence Level' and a mandatory medical disclaimer. "
        "5. Recommend local specialists based on the user's location if applicable.\n\n"
    )

    context_str = system_instructions
    if location and location.get('address'):
        context_str += f"USER LOCATION: {location['address']}\n\n"
    
    # Text + PDF Content (Main.py extracts the text from the PDF)
    content = [{"type": "text", "text": context_str + query}]
    
    # Append Visual Data if present
    if image_b64:
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
        })
        
    try:
        message = HumanMessage(content=content)
        result = healthcare_agent.invoke({"messages": [message]})
        return result["messages"][-1].content
    except Exception as e:
        return f"⚠️ System Error: {str(e)}"