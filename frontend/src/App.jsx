import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, X, Activity, Cpu, HeartPulse, User, Mic, MicOff, FileText, MapPin, LogOut, History, ShieldAlert, MessageSquare, Sun, Moon, Timer, BarChart3 } from 'lucide-react'
import HealthDashboard from './components/HealthDashboard'
import ChatHistory from './components/ChatHistory'
import ProtocolAnalytics from './components/ProtocolAnalytics'
import ProtocolTimer from './components/ProtocolTimer'
import { marked } from 'marked'
import TypewriterMarkdown from './components/TypewriterMarkdown'
import { useMicrophone } from './hooks/useMicrophone'
import Login from './Login'
import Signup from './Signup'
import { useTheme } from './ThemeContext'

const API_URL = "http://127.0.0.1:8000"

const indianLanguages = [
  "English",
  "Hindi (हिंदी)",
  "Tamil (தமிழ்)",
  "Telugu (తెలుగు)",
  "Malayalam (മലയാളം)",
  "Kannada (ಕನ್ನಡ)",
  "Bengali (বাংলা)",
  "Marathi (मराठी)",
  "Gujarati (ગુજરાતી)"
];

const languageCodes = {
  "English": "en-IN",
  "Hindi (हिंदी)": "hi-IN",
  "Tamil (தமிழ்)": "ta-IN",
  "Telugu (తెలుగు)": "te-IN",
  "Malayalam (മലയാളം)": "ml-IN",
  "Kannada (ಕನ್ನಡ)": "kn-IN",
  "Bengali (বাংলা)": "bn-IN",
  "Marathi (मराठी)": "mr-IN",
  "Gujarati (ગુજરાતી)": "gu-IN"
};

function App() {
  const { theme, toggleTheme } = useTheme()
  const [currentView, setCurrentView] = useState('login') // login, signup, chat, dashboard, history
  const [user, setUser] = useState(null)
  const [input, setInput] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [messages, setMessages] = useState([
    { sender: "bot", text: "System Online. Neural interface engaged. State your symptoms or upload a medical PDF for analysis.", isInitial: true }
  ])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [interruptActive, setInterruptActive] = useState(false)

  // Refs
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Callbacks
  const handleTranscriptChange = useCallback((newTranscript) => {
      setInput(prev => prev + (prev ? " " : "") + newTranscript)
  }, [])

  // Custom Hooks
  const { isListening, toggleMic: toggleListening, forceStopMic } = useMicrophone({
      onTranscriptChange: handleTranscriptChange,
      languageCode: languageCodes[selectedLanguage] || 'en-IN'
  })

  // Effects
  useEffect(() => {
    if (currentView === 'chat' || currentView === 'dashboard') {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, currentView])

  const syncLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("GPS Telemetry not supported by this browser.")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.state
          setUserLocation({ address: city })
          setIsLocating(false)
        } catch (error) {
          setUserLocation({ address: `Coordinates: ${latitude}, ${longitude}` })
          setIsLocating(false)
        }
      },
      (error) => {
        setIsLocating(false)
      }
    )
  }

  // --- Logic Functions ---
  const handleLoginSuccess = (email) => {
    setUser(email)
    setCurrentView('chat')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('login')
  }


  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      if (file.type.startsWith('image/')) {
        setFilePreview({ type: 'image', url: URL.createObjectURL(file) })
      } else if (file.type === 'application/pdf') {
        setFilePreview({ type: 'pdf', name: file.name })
      } else {
        setFilePreview({ type: 'other', name: file.name })
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const sendMessage = async () => {
    if (!input.trim() && !selectedFile) return
    if (isListening) {
      forceStopMic()
    }
    setInterruptActive(false)
    setIsGenerating(true)
    const formData = new FormData()
    formData.append("message", input || "Please analyze this attached document/image.")
    formData.append("language", selectedLanguage)
    formData.append("user_id", user || "anonymous")
    if (selectedFile) {
      formData.append("file", selectedFile)
    }
    if (userLocation) {
      formData.append("location", JSON.stringify(userLocation))
    }
    const userMessage = {
      sender: "user",
      text: input || "Uploaded a file for analysis.",
      file: filePreview
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    try {
      const response = await axios.post(`${API_URL}/chat`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      const botMessage = { sender: "bot", text: response.data.agent_response }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      let errorReason = "⚠️ Connection failed."
      if (error.response) {
        errorReason = `⚠️ Backend Rejected Request (Code ${error.response.status}). Details: ${JSON.stringify(error.response.data)}`
      } else if (error.request) {
        errorReason = "⚠️ Network Error: Could not reach the backend. Is uvicorn running?"
      } else {
        errorReason = `⚠️ Request setup error: ${error.message}`
      }
      setMessages((prev) => [...prev, { sender: "bot", text: errorReason }])
    } finally {
      setLoading(false)
    }
  }

  if (currentView === 'login') {
      return (
          <div className="min-h-screen flex items-center justify-center p-0 m-0 antialiased font-sans w-full h-screen overflow-hidden">
              <Login onToggleSignup={() => setCurrentView('signup')} onLoginSuccess={handleLoginSuccess} />
          </div>
      )
  }

  if (currentView === 'signup') {
      return (
          <div className="min-h-screen flex items-center justify-center p-0 m-0 antialiased font-sans w-full h-screen overflow-hidden">
              <Signup onToggle={() => setCurrentView('login')} />
          </div>
      )
  }

  if (currentView === 'history') {
    return <ChatHistory onBack={() => setCurrentView('chat')} user={user} />
  }

  const isDark = theme === 'dark'

  return (
    <div
      className="flex h-screen w-full overflow-hidden font-sans relative transition-colors duration-300"
      style={{
        background: isDark ? '#050810' : '#f0f4ff',
        color: isDark ? '#cbd5e1' : '#1e293b'
      }}
    >
      
      {/* Background ambient lights */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${isDark ? 'bg-cyan-900/10' : 'bg-cyan-400/10'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${isDark ? 'bg-purple-900/10' : 'bg-indigo-300/15'}`}></div>
      </div>

      {/* 1. LEFT SIDEBAR */}
      <div
        className="w-64 flex flex-col border-r p-5 z-20 h-full relative shadow-lg transition-colors duration-300"
        style={{
          background: isDark ? '#070b14' : '#ffffff',
          borderRightColor: isDark ? 'rgba(8,145,178,0.3)' : 'rgba(203,213,225,0.8)',
          boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.3)' : '4px 0 24px rgba(0,0,0,0.06)'
        }}
      >
        
        {/* Sidebar Header / Logo */}
        <div className="mb-8 mt-2 pb-6" style={{ borderBottom: isDark ? '1px solid rgba(30,41,59,0.6)' : '1px solid #e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border shrink-0 ${isDark ? 'bg-cyan-950/50 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-cyan-50 border-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.15)]'}`}>
              <HeartPulse className="text-cyan-500 w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 uppercase leading-none">
                Aegis-AI
              </h1>
              <p className={`text-[10px] tracking-widest uppercase mt-1 ${isDark ? 'text-cyan-600' : 'text-cyan-400'}`}>v2.0 // System</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
          <p className={`text-[10px] font-bold tracking-widest uppercase mb-1 px-1 mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Navigation</p>
          
          <button 
            onClick={() => setCurrentView('chat')}
            className="flex items-center gap-3 px-4 py-3 border rounded-lg text-sm transition-all w-full justify-start shrink-0"
            style={currentView === 'chat' ? {
              background: isDark ? '#1a2640' : '#eff6ff',
              borderColor: isDark ? '#06b6d4' : '#93c5fd',
              color: isDark ? '#ecfeff' : '#1d4ed8',
              boxShadow: isDark ? '0 0 15px rgba(6,182,212,0.2)' : '0 0 10px rgba(59,130,246,0.1)'
            } : {
              background: isDark ? '#111a2e' : '#f8fafc',
              borderColor: isDark ? 'rgba(8,145,178,0.5)' : '#e2e8f0',
              color: isDark ? '#a5f3fc' : '#475569'
            }}
          >
            <MessageSquare className={`w-4 h-4 ${currentView === 'chat' ? (isDark ? 'text-cyan-400' : 'text-blue-500') : (isDark ? 'text-cyan-700' : 'text-slate-400')}`} />
            NEURAL CHAT
          </button>

          <button 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-3 px-4 py-3 border rounded-lg text-sm transition-all w-full justify-start shrink-0"
            style={currentView === 'dashboard' ? {
              background: isDark ? '#1a2640' : '#eff6ff',
              borderColor: isDark ? '#06b6d4' : '#93c5fd',
              color: isDark ? '#ecfeff' : '#1d4ed8',
              boxShadow: isDark ? '0 0 15px rgba(6,182,212,0.2)' : '0 0 10px rgba(59,130,246,0.1)'
            } : {
              background: isDark ? '#111a2e' : '#f8fafc',
              borderColor: isDark ? 'rgba(8,145,178,0.5)' : '#e2e8f0',
              color: isDark ? '#a5f3fc' : '#475569'
            }}
          >
            <Activity className={`w-4 h-4 ${currentView === 'dashboard' ? (isDark ? 'text-cyan-400' : 'text-blue-500') : (isDark ? 'text-cyan-700' : 'text-slate-400')}`} />
            DASHBOARD
          </button>
          
          <button 
            onClick={() => setCurrentView('history')}
            className="flex items-center gap-3 px-4 py-3 border rounded-lg text-sm transition-all w-full justify-start shrink-0 mt-2"
            style={{
              background: isDark ? '#111a2e' : '#f8fafc',
              borderColor: isDark ? 'rgba(8,145,178,0.5)' : '#e2e8f0',
              color: isDark ? '#a5f3fc' : '#475569'
            }}
          >
            <History className={`w-4 h-4 ${isDark ? 'text-cyan-500' : 'text-slate-400'}`} />
            SESSION HISTORY
          </button>

          <button 
            onClick={() => setCurrentView('timer')}
            className="flex items-center gap-3 px-4 py-3 border rounded-lg text-sm transition-all w-full justify-start shrink-0"
            style={currentView === 'timer' ? {
              background: isDark ? '#1a2640' : '#eff6ff',
              borderColor: isDark ? '#06b6d4' : '#93c5fd',
              color: isDark ? '#ecfeff' : '#1d4ed8',
              boxShadow: isDark ? '0 0 15px rgba(6,182,212,0.2)' : '0 0 10px rgba(59,130,246,0.1)'
            } : {
              background: isDark ? '#111a2e' : '#f8fafc',
              borderColor: isDark ? 'rgba(8,145,178,0.5)' : '#e2e8f0',
              color: isDark ? '#a5f3fc' : '#475569'
            }}
          >
            <Timer className={`w-4 h-4 ${currentView === 'timer' ? (isDark ? 'text-cyan-400' : 'text-blue-500') : (isDark ? 'text-cyan-700' : 'text-slate-400')}`} />
            PROTOCOL TIMER
          </button>

          <button 
            onClick={() => setCurrentView('protocol_stats')}
            className="flex items-center gap-3 px-4 py-3 border rounded-lg text-sm transition-all w-full justify-start shrink-0"
            style={currentView === 'protocol_stats' ? {
              background: isDark ? '#1a2640' : '#eff6ff',
              borderColor: isDark ? '#06b6d4' : '#93c5fd',
              color: isDark ? '#ecfeff' : '#1d4ed8',
              boxShadow: isDark ? '0 0 15px rgba(6,182,212,0.2)' : '0 0 10px rgba(59,130,246,0.1)'
            } : {
              background: isDark ? '#111a2e' : '#f8fafc',
              borderColor: isDark ? 'rgba(8,145,178,0.5)' : '#e2e8f0',
              color: isDark ? '#a5f3fc' : '#475569'
            }}
          >
            <BarChart3 className={`w-4 h-4 ${currentView === 'protocol_stats' ? (isDark ? 'text-cyan-400' : 'text-blue-500') : (isDark ? 'text-cyan-700' : 'text-slate-400')}`} />
            PROTOCOL ANALYTICS
          </button>
        </div>

        {/* User Profile & Logout (Bottom) */}
        <div className="mt-auto pt-6" style={{ borderTop: isDark ? '1px solid rgba(30,41,59,0.6)' : '1px solid #e2e8f0' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-xs font-bold tracking-wider uppercase transition-all mb-3"
            style={{
              background: isDark ? 'rgba(30,41,59,0.4)' : '#f1f5f9',
              borderColor: isDark ? 'rgba(51,65,85,0.6)' : '#e2e8f0',
              color: isDark ? '#94a3b8' : '#64748b'
            }}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }} className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" /> LIGHT MODE
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.25 }} className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" /> DARK MODE
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="mb-4 px-1">
            <p className={`text-[10px] tracking-widest uppercase mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active Entity</p>
            <p className={`text-sm truncate flex items-center gap-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${isDark ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-cyan-400'}`}></span>
              {user ? user.split('@')[0] : 'Guest'}
            </p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-xs font-bold tracking-wider uppercase transition-all"
            style={{
              background: isDark ? 'rgba(69,10,10,0.2)' : '#fff5f5',
              borderColor: isDark ? 'rgba(127,29,29,0.3)' : '#fecaca',
              color: isDark ? '#f87171' : '#dc2626'
            }}
          >
            <LogOut className="w-4 h-4" />
            DISCONNECT
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative h-full z-10 p-4 max-w-6xl mx-auto w-full overflow-hidden">
        
        {/* CHAT VIEW */}
        {currentView === 'chat' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 backdrop-blur-xl border rounded-3xl flex flex-col overflow-hidden relative h-full transition-colors duration-300"
            style={{
              background: isDark ? 'rgba(17,24,39,0.6)' : 'rgba(255,255,255,0.85)',
              borderColor: isDark ? 'rgba(6,182,212,0.2)' : 'rgba(147,197,253,0.4)',
              boxShadow: isDark ? '0 0 40px rgba(6,182,212,0.05)' : '0 0 40px rgba(59,130,246,0.06)'
            }}
          >
            {/* Chat Header */}
            <div
              className="border-b p-4 flex items-center justify-between shadow-sm relative overflow-hidden transition-colors duration-300"
              style={{
                background: isDark ? 'linear-gradient(to right, #111827, #1f2937, #111827)' : 'linear-gradient(to right, #f8faff, #eff6ff, #f8faff)',
                borderBottomColor: isDark ? 'rgba(6,182,212,0.2)' : 'rgba(147,197,253,0.4)'
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-5 h-5 ${isDark ? 'text-cyan-600' : 'text-blue-400'}`} />
                <span className={`text-sm font-mono tracking-widest uppercase ${isDark ? 'text-cyan-500' : 'text-blue-500'}`}>Neural Link Active</span>
              </div>

              <div className="flex gap-4 items-center">
                <button
                  onClick={syncLocation}
                  disabled={isLocating}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono tracking-widest transition-all`}
                  style={userLocation ? {
                    background: isDark ? 'rgba(8,145,178,0.2)' : 'rgba(219,234,254,0.8)',
                    borderColor: isDark ? '#22d3ee' : '#93c5fd',
                    color: isDark ? '#22d3ee' : '#2563eb'
                  } : {
                    background: isDark ? 'rgba(17,24,39,0.6)' : 'rgba(248,250,255,0.8)',
                    borderColor: isDark ? '#374151' : '#e2e8f0',
                    color: isDark ? '#9ca3af' : '#94a3b8'
                  }}
                >
                  {isLocating ? (
                    <span className={`animate-pulse ${isDark ? 'text-cyan-500' : 'text-blue-500'}`}>ACQUIRING SATELLITE...</span>
                  ) : userLocation ? (
                    <>
                      <MapPin className="w-3 h-3" />
                      {userLocation.address}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3" />
                      SYNC LOCATION
                    </>
                  )}
                </button>

                <div
                  className="flex items-center gap-3 rounded-lg px-3 py-2 backdrop-blur-sm border"
                  style={{
                    background: isDark ? 'rgba(17,24,39,0.6)' : 'rgba(239,246,255,0.8)',
                    borderColor: isDark ? 'rgba(8,145,178,0.5)' : '#bfdbfe'
                  }}
                >
                  <span className={`text-xs font-mono tracking-widest uppercase hidden sm:inline ${isDark ? 'text-cyan-500' : 'text-blue-400'}`}>
                    Translation:
                  </span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-transparent text-xs font-mono outline-none cursor-pointer border-none"
                    style={{ color: isDark ? '#e0f2fe' : '#1d4ed8' }}
                  >
                    {indianLanguages.map((lang) => (
                      <option key={lang} value={lang} style={{ background: isDark ? '#111827' : '#ffffff' }}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent" style={{ background: isDark ? 'transparent' : 'rgba(248,250,255,0.4)' }}>
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    key={index}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-3`}
                  >
                    {msg.sender === "bot" && (
                      <div className="flex flex-col gap-2 items-center">
                        <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                        </div>
                      </div>
                    )}

                    <div className={`max-w-[85%] flex flex-col gap-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-5 py-4 text-sm leading-relaxed shadow-lg font-light tracking-wide relative inline-block ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl rounded-tr-sm border border-cyan-400/30'
                            : 'rounded-2xl rounded-tl-sm backdrop-blur-md'
                        }`}
                        style={msg.sender !== 'user' ? {
                          background: isDark ? 'rgba(31,41,55,0.8)' : 'rgba(239,246,255,0.9)',
                          borderColor: isDark ? '#374151' : '#bfdbfe',
                          border: isDark ? '1px solid #374151' : '1px solid #bfdbfe',
                          color: isDark ? '#e0f2fe' : '#1e293b'
                        } : {}}>
                        {msg.sender === "bot" && !msg.isInitial ? (
                          <>
                            <TypewriterMarkdown
                              content={msg.text}
                              speed={12}
                              onType={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                              forceStop={interruptActive}
                              onComplete={() => setIsGenerating(false)}
                            />

                            {!isGenerating && (
                              <div className="h-2" /> 
                            )}
                          </>
                        ) : (
                          <div
                            className="markdown-body space-y-2 w-full"
                            dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                          />
                        )}
                      </div>

                      {msg.file && msg.file.type === 'image' && (
                        <div className="mt-1 rounded-xl overflow-hidden border border-cyan-500/20 shadow-lg max-w-sm">
                          <img src={msg.file.url} alt="Uploaded symptom" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      {msg.file && msg.file.type === 'pdf' && (
                        <div className="mt-1 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30 shadow-lg flex items-center gap-2 text-sm text-orange-200">
                          <FileText className="w-4 h-4 text-red-400" />
                          <span className="font-mono text-xs truncate max-w-[200px]">{msg.file.name}</span>
                        </div>
                      )}
                    </div>

                    {
                      msg.sender === "user" && (
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500/40 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                      )
                    }
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex justify-start items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-cyan-600 animate-spin" />
                  </div>
                  <div className="bg-gray-800/50 text-cyan-500 border border-gray-700/50 px-4 py-3 rounded-2xl rounded-tl-sm text-xs font-mono tracking-widest flex gap-1 items-center">
                    PROCESSING <span className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {isGenerating && (
              <div className="absolute bottom-[100px] left-1/2 transform -translate-x-1/2 z-30">
                <button
                  onClick={() => setInterruptActive(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-950/90 border border-red-500/50 text-red-500 text-xs font-mono font-bold tracking-widest uppercase rounded-full hover:bg-red-900 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] backdrop-blur-md cursor-pointer pointer-events-auto"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Sever Neural Sync
                </button>
              </div>
            )}

            {/* Input Area */}
            <div
              className="p-4 border-t backdrop-blur-md relative z-20 transition-colors duration-300"
              style={{
                background: isDark ? 'rgba(17,24,39,0.8)' : 'rgba(248,250,255,0.9)',
                borderTopColor: isDark ? 'rgba(8,145,178,0.3)' : 'rgba(147,197,253,0.4)'
              }}
            >
              <AnimatePresence>
                {filePreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative inline-block"
                  >
                    {filePreview.type === 'image' ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <img src={filePreview.url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"></div>
                      </div>
                    ) : (
                      <div className="relative px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-mono text-gray-300 max-w-[150px] truncate">{filePreview.name}</span>
                      </div>
                    )}
                    <button
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full p-1 shadow-md transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 items-end">
                <div
                  className="flex-1 rounded-2xl p-2 transition-all shadow-inner flex items-center relative border"
                  style={{
                    background: isDark ? 'rgba(3,7,18,0.5)' : 'rgba(241,245,249,0.8)',
                    borderColor: isDark ? '#374151' : '#e2e8f0'
                  }}
                >
                  {isListening && <div className="absolute inset-0 -z-10 bg-cyan-500/10 rounded-2xl animate-pulse blur-sm"></div>}
                  <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="p-3 text-cyan-600 hover:text-cyan-400 hover:bg-cyan-950/30 rounded-xl transition-all" title="Attach Photo or PDF">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button onClick={toggleListening} className={`p-3 rounded-xl transition-all ${isListening ? "text-red-500 bg-red-950/30 animate-pulse" : "text-cyan-600 hover:text-cyan-400 hover:bg-cyan-950/30"}`} title="Voice Input">
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <textarea
                    className={`flex-1 bg-transparent outline-none px-3 py-2 resize-none h-[44px] max-h-[120px] text-sm font-light tracking-wide custom-scrollbar ${isListening ? 'text-red-400' : ''}`}
                    style={{ color: isListening ? (isDark ? '#fca5a5' : '#dc2626') : (isDark ? '#e0f2fe' : '#1e293b') }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={isListening ? "Listening... Speak now..." : "Query system or upload diagnostic scan/PDF..."}
                   
                    disabled={loading}
                    rows={1}
                  />
                </div>
                <button onClick={sendMessage} disabled={loading || (!input.trim() && !selectedFile)} className={`p-4 rounded-2xl flex items-center justify-center transition-all duration-300 z-10 ${loading || (!input.trim() && !selectedFile) ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"}`}>
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TIMER VIEW */}
        {currentView === 'timer' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-full overflow-hidden backdrop-blur-xl border rounded-3xl transition-colors duration-300"
            style={{
              background: isDark ? 'rgba(17,24,39,0.4)' : 'rgba(255,255,255,0.85)',
              borderColor: isDark ? 'rgba(6,182,212,0.2)' : 'rgba(147,197,253,0.4)'
            }}
          >
            <ProtocolTimer />
          </motion.div>
        )}

        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full overflow-y-auto custom-scrollbar backdrop-blur-xl border rounded-3xl p-6 transition-colors duration-300"
            style={{
              background: isDark ? 'rgba(17,24,39,0.4)' : 'rgba(255,255,255,0.85)',
              borderColor: isDark ? 'rgba(6,182,212,0.2)' : 'rgba(147,197,253,0.4)'
            }}
          >
            <HealthDashboard user={user} isDark={isDark} apiUrl={API_URL} />
          </motion.div>
        )}

        {/* PROTOCOL ANALYTICS VIEW */}
        {currentView === 'protocol_stats' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full overflow-y-auto custom-scrollbar backdrop-blur-xl border rounded-3xl p-6 transition-colors duration-300"
            style={{
              background: isDark ? 'rgba(17,24,39,0.4)' : 'rgba(255,255,255,0.85)',
              borderColor: isDark ? 'rgba(6,182,212,0.2)' : 'rgba(147,197,253,0.4)'
            }}
          >
            <ProtocolAnalytics user={user} isDark={isDark} apiUrl={API_URL} onBack={() => setCurrentView('chat')} />
          </motion.div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(8, 145, 178, 0.3); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-track-transparent::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thumb-cyan-900::-webkit-scrollbar-thumb { background: rgba(22, 78, 99, 0.5); border-radius: 10px; }
        
        .markdown-body p { margin-bottom: 0.75rem; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body strong { color: ${isDark ? '#22d3ee' : '#2563eb'}; font-weight: 600; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .markdown-body ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .markdown-body li { margin-bottom: 0.25rem; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: ${isDark ? '#67e8f9' : '#1d4ed8'}; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
      `}} />
    </div>
  )
}

export default App