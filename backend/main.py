import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from pymongo import MongoClient
import bcrypt
from fastapi import HTTPException
from pydantic import BaseModel
from geopy.geocoders import Nominatim
from agent import run_agent
from fastapi.middleware.cors import CORSMiddleware
import base64
import json
from database import engine, SessionLocal, ChatSession, HealthTrend, Base
import PyPDF2
from sqlalchemy.orm import Session
from fastapi import Depends
import io
from models.health import HealthMetrics
from api.health import calculate_wellness_data
from datetime import datetime, date
from bson import ObjectId

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- MONGODB SETUP ---
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["aegis_db"]
users_collection = mongo_db["users"]
chats_collection = mongo_db["chats"]
directives_collection = mongo_db["directives"]  # Added directives collection

@app.get("/")
def health_check():
    return {"status": "Agent is Online"}

@app.get("/health-stats")
def get_health_stats(db: Session = Depends(get_db)):
    dummy_metrics = HealthMetrics(
        sleep_hours=6.5,
        activity_mins=20.0,
        nutrition_score=7,
        hydration_liters=2.0
    )
    
    dashboard_data = calculate_wellness_data(dummy_metrics)
    return dashboard_data


# --- ANOMALY DETECTION ENGINE (SENTINEL PROTOCOL) ---
def detect_anomalies(metrics: HealthMetrics):
    anomalies = []
    # Rule 1: High activity, severe dehydration
    if metrics.activity_mins > 60 and metrics.hydration_liters < 1.0:
        anomalies.append("CRITICAL: Severe dehydration risk. High kinetic output with insufficient fluid intake.")
    
    # Rule 2: Exhaustion risk
    if metrics.sleep_hours < 5 and metrics.activity_mins > 45:
        anomalies.append("WARNING: System exhaustion imminent. High physical stress detected on low neural rest.")
        
    # Rule 3: Nutritional deficit
    if metrics.nutrition_score < 4 and metrics.activity_mins > 30:
        anomalies.append("WARNING: Caloric deficit. Insufficient fuel for current activity levels.")
        
    # Rule 4: Total System Failure
    if metrics.sleep_hours < 4 and metrics.hydration_liters < 1.0 and metrics.nutrition_score < 4:
        anomalies.append("CRITICAL: Multiple system failures imminent. Immediate intervention required.")
        
    return anomalies

@app.post("/health-score")
async def get_health_score(metrics: HealthMetrics):
    # Get the normal pie/bar chart data
    result = calculate_wellness_data(metrics)
    
    # Run the Sentinel Protocol
    detected_threats = detect_anomalies(metrics)
    
    # Inject the threats into the response sent to React
    result["anomalies"] = detected_threats
    
    # Override the status if there is a threat
    if len(detected_threats) > 0:
        result["stress_level"] = "CRITICAL FAILURE"
        result["overall_score"] = min(result["overall_score"], 35) # Force score to drop
        
    return result


@app.post("/chat")
async def chat(
    message: str = Form(...),
    language: str = Form("English"),
    location: str = Form(None),
    user_id: str = Form("anonymous"),  # Accept user_id from frontend
    file: UploadFile = File(None)
):
    image_b64 = None
    final_message = message
    
    if file:
        contents = await file.read()
        
        if file.content_type == "application/pdf":
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
            pdf_text = ""
            for page in pdf_reader.pages:
                pdf_text += page.extract_text() + "\n"
            final_message += f"\n\n[USER UPLOADED PDF DOCUMENT]:\n{pdf_text}"
        else:
            image_b64 = base64.b64encode(contents).decode("utf-8")
            
    loc_dict = None
    if location:
        try:
            loc_dict = json.loads(location)
        except:
            pass
            
    response = run_agent(final_message, image_b64, loc_dict, language)
    
    # Save to MongoDB instead of SQLAlchemy
    chat_document = {
        "user_id": user_id,
        "user_message": message,
        "ai_response": response,
        "timestamp": datetime.now().isoformat()
    }
    chats_collection.insert_one(chat_document)
    
    return {"agent_response": response}

@app.get("/chat-history/{user_id}")
def get_chat_history(user_id: str, limit: int = 50):
    """
    Return the most recent chat history entries for a specific user from MongoDB.
    """
    try:
        # Query MongoDB for this specific user's chats, sorted newest to oldest
        chats = list(chats_collection.find(
            {"user_id": user_id},
            {"_id": 0}  # Hide the MongoDB internal _id field from the frontend
        ).sort("timestamp", -1).limit(limit))
        
        return {"status": "success", "history": chats}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- GAMIFIED DIRECTIVES ---
@app.get("/directives/{user_id}")
def get_directives(user_id: str):
    today_str = date.today().isoformat()
    
    # Check if the user already has directives for today
    existing = list(directives_collection.find({"user_id": user_id, "date": today_str}))
    
    # If not, generate their daily goals
    if not existing:
        default_directives = [
            {"user_id": user_id, "date": today_str, "task": "Hydration Protocol: Consume 2.5L of H2O", "completed": False},
            {"user_id": user_id, "date": today_str, "task": "Kinetic Sync: 30 mins of elevated heart rate", "completed": False},
            {"user_id": user_id, "date": today_str, "task": "Neural Rest: Achieve 7+ hours of sleep cycle", "completed": False}
        ]
        directives_collection.insert_many(default_directives)
        existing = list(directives_collection.find({"user_id": user_id, "date": today_str}))

    # Convert MongoDB ObjectIds to strings so React can read them
    formatted_directives = []
    for d in existing:
        d["_id"] = str(d["_id"])
        formatted_directives.append(d)
        
    return {"status": "success", "directives": formatted_directives}

@app.put("/directives/{directive_id}/complete")
def complete_directive(directive_id: str):
    try:
        # Mark the task as true in the database
        directives_collection.update_one(
            {"_id": ObjectId(directive_id)},
            {"$set": {"completed": True}}
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/directives/{user_id}/reset")
def reset_directives(user_id: str):
    try:
        today_str = date.today().isoformat()
        # Find all directives for this user for today and set completed to False
        directives_collection.update_many(
            {"user_id": user_id, "date": today_str},
            {"$set": {"completed": False}}
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

import random

# --- HISTORICAL TRENDS ---
@app.get("/health-trends/{user_id}")
def get_health_trends(user_id: str):
    """
    Provides historical health index scores for the frontend charts.
    """
    try:
        # Generate realistic simulated trend data
        weekly_data = [
            {"time": "Mon", "score": random.randint(70, 95)},
            {"time": "Tue", "score": random.randint(72, 98)},
            {"time": "Wed", "score": random.randint(65, 90)},
            {"time": "Thu", "score": random.randint(75, 95)},
            {"time": "Fri", "score": random.randint(80, 100)},
            {"time": "Sat", "score": random.randint(85, 100)},
            {"time": "Sun", "score": random.randint(80, 98)}
        ]
        
        monthly_data = [
            {"time": "Week 1", "score": random.randint(65, 85)},
            {"time": "Week 2", "score": random.randint(70, 90)},
            {"time": "Week 3", "score": random.randint(75, 95)},
            {"time": "Week 4", "score": random.randint(80, 98)}
        ]
        
        yearly_data = [
            {"time": "Jan", "score": random.randint(60, 80)},
            {"time": "Feb", "score": random.randint(65, 85)},
            {"time": "Mar", "score": random.randint(70, 88)},
            {"time": "Apr", "score": random.randint(68, 85)},
            {"time": "May", "score": random.randint(75, 92)},
            {"time": "Jun", "score": random.randint(80, 95)},
            {"time": "Jul", "score": random.randint(85, 98)},
            {"time": "Aug", "score": random.randint(82, 95)},
            {"time": "Sep", "score": random.randint(78, 92)},
            {"time": "Oct", "score": random.randint(75, 90)},
            {"time": "Nov", "score": random.randint(70, 88)},
            {"time": "Dec", "score": random.randint(75, 95)}
        ]
        
        return {
            "status": "success",
            "trends": {
                "weekly": weekly_data,
                "monthly": monthly_data,
                "yearly": yearly_data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- AUTHENTICATION ---
class UserSignup(BaseModel):
    email: str
    password: str

@app.post("/signup")
def signup(user: UserSignup):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    users_collection.insert_one({
        "email": user.email, 
        "password": hashed_password
    })
    
    return {"status": "success", "message": "User registered successfully!"}

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user["password"].encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {"status": "success", "message": "Login successful", "email": user.email}

class PasswordReset(BaseModel):
    email: str
    new_password: str

@app.post("/reset-password")
def reset_password(data: PasswordReset):
    db_user = users_collection.find_one({"email": data.email})
    if not db_user:
        raise HTTPException(status_code=404, detail="Email not found in the system")
    
    hashed_password = bcrypt.hashpw(data.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    users_collection.update_one(
        {"email": data.email},
        {"$set": {"password": hashed_password}}
    )
    
    return {"status": "success", "message": "Password successfully overridden"}

# --- PROTOCOL TIMER HISTORY ---
class TimerLog(BaseModel):
    user_id: str
    task_name: str
    duration_mins: int

@app.post("/timer-history")
def save_timer_history(log: TimerLog):
    try:
        log_entry = {
            "user_id": log.user_id,
            "task_name": log.task_name,
            "duration_mins": log.duration_mins,
            "timestamp": datetime.now().isoformat(),
            "date": date.today().isoformat()
        }
        mongo_db["timer_history"].insert_one(log_entry)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/timer-history/{user_id}")
def get_timer_history(user_id: str, limit: int = 10):
    try:
        history = list(mongo_db["timer_history"].find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit))
        return {"status": "success", "history": history}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/timer-stats/{user_id}")
def get_timer_stats(user_id: str):
    """
    Returns completion counts for the last 7 days for the consistency chart.
    """
    try:
        from datetime import timedelta
        end_date = date.today()
        stats = []
        for i in range(6, -1, -1):
            target_date = (end_date - timedelta(days=i)).isoformat()
            count = mongo_db["timer_history"].count_documents({"user_id": user_id, "date": target_date})
            day_label = (end_date - timedelta(days=i)).strftime("%a")
            stats.append({"day": day_label, "completions": count})
        
        return {"status": "success", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))