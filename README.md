# 🧬 Aegis-AI: Neural Health Interface

An AI-powered, multimodal diagnostic interface with real-time biometric anomaly detection. 

Aegis-AI acts as a personal medical command center, merging real-time biometric data with artificial neural networks for predictive healthcare. It features voice-activated interactions, visual symptom detection using advanced LLMs, and a gamified daily wellness protocol system.

## 🚀 Core Features

* 🧠 **Multimodal Diagnostic Agent:** Powered by Groq, the AI analyzes both text queries and uploaded images (e.g., visual symptoms, medical scans) to provide preliminary insights.
* 🚨 **Sentinel Protocol (Anomaly Detection):** A dynamic backend engine monitors user-inputted biometrics (sleep, hydration, activity) and visually alerts the user to critical health intersections (e.g., severe dehydration + high kinetic output).
* 🎙️ **Multilingual Neural Link:** Integrated Web Speech API and Web Audio API for hands-free voice querying and synthetic text-to-speech responses in multiple localized languages.
* 📱 **Progressive Web App (PWA):** Fully installable as a standalone desktop or mobile application for a native software experience without the browser UI.
* 📊 **Biometric Telemetry & Trends:** Interactive data visualization mapping daily health compositions and historical wellness trends using Recharts.
* ⏱️ **Active Protocol Timers:** OS-level background notifications and custom Web Audio alarms to enforce daily health directives (e.g., medication, hydration, posture).

## 🛠️ Tech Stack

**Frontend Interface**
* React.js (Vite)
* Tailwind CSS & Framer Motion (Styling & Animations)
* Recharts (Data Visualization)
* Lucide-React (Iconography)
* Vite PWA Plugin (Installability)

**Backend Core**
* Python 3 & FastAPI (RESTful API)
* MongoDB Atlas (NoSQL Database)
* PyPDF2 & python-multipart (File Processing)
* bcrypt (Authentication)

**Artificial Intelligence**
* Groq Generative AI

---

## ⚙️ Local Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/Purvi1411/Aegis-Ai-HealthOS.git](https://github.com/Purvi1411/Aegis-Ai-HealthOS.git)
cd Aegis-Ai-HealthOS
