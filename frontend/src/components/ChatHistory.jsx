import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MessageSquare, ShieldAlert } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const API_URL = "https://aegis-ai-healthos-3.onrender.com";

export default function ChatHistory({ onBack, user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const userId = user || "anonymous";
    axios.get(`${API_URL}/chat-history/${userId}`)
      .then(res => { setHistory(res.data.history); setLoading(false); })
      .catch(err => { console.error("Failed to load history", err); setLoading(false); });
  }, [user]);

  return (
    <div
      className="flex h-screen w-full overflow-hidden font-sans relative p-6 transition-colors duration-300"
      style={{ background: isDark ? '#050810' : '#f0f4ff', color: isDark ? '#cbd5e1' : '#1e293b' }}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[30%] w-[40%] h-[40%] rounded-full blur-[120px] ${isDark ? 'bg-cyan-900/10' : 'bg-cyan-400/10'}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto backdrop-blur-xl border rounded-2xl flex flex-col relative z-10 transition-colors duration-300"
        style={{
          background: isDark ? 'rgba(7,11,20,0.8)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(8,145,178,0.5)' : 'rgba(147,197,253,0.5)',
          boxShadow: isDark ? '0 0 40px rgba(6,182,212,0.1)' : '0 0 40px rgba(59,130,246,0.08)'
        }}
      >
        {/* Header */}
        <div
          className="p-5 border-b flex items-center justify-between transition-colors duration-300"
          style={{
            background: isDark ? 'rgba(17,24,39,0.5)' : 'rgba(239,246,255,0.8)',
            borderBottomColor: isDark ? 'rgba(8,145,178,0.4)' : 'rgba(147,197,253,0.5)'
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg transition-all"
              style={{ color: isDark ? '#06b6d4' : '#2563eb' }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(8,145,178,0.2)' : 'rgba(219,234,254,0.6)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2
                className="text-lg font-bold tracking-widest uppercase flex items-center gap-2"
                style={{ color: isDark ? '#22d3ee' : '#1d4ed8' }}
              >
                <ShieldAlert className="w-5 h-5" />
                Session Archives
              </h2>
              <p className="text-xs font-mono mt-1" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                Decrypting past neural logs for entity: {user || 'Guest'}
              </p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center animate-pulse" style={{ color: isDark ? '#0891b2' : '#3b82f6' }}>
              <Clock className="w-10 h-10 mb-3 opacity-50" />
              <p className="font-mono text-sm tracking-widest">DECRYPTING ARCHIVES...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center" style={{ color: isDark ? '#334155' : '#94a3b8' }}>
              <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-mono text-sm tracking-widest">NO LOGS FOUND IN MATRIX</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {history.map((chat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl transition-all border"
                  style={{
                    background: isDark ? 'rgba(17,24,39,0.4)' : 'rgba(239,246,255,0.6)',
                    borderColor: isDark ? '#1e293b' : '#bfdbfe'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = isDark ? 'rgba(8,145,178,0.5)' : '#93c5fd'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? '#1e293b' : '#bfdbfe'}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-mono px-2 py-1 rounded"
                      style={{
                        color: isDark ? '#06b6d4' : '#2563eb',
                        background: isDark ? 'rgba(8,145,178,0.15)' : 'rgba(219,234,254,0.6)'
                      }}
                    >
                      {new Date(chat.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs font-mono uppercase tracking-widest block mb-1" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                      User Query:
                    </span>
                    <p className="text-sm" style={{ color: isDark ? '#cbd5e1' : '#374151' }}>{chat.user_message}</p>
                  </div>
                  <div className="pl-4 border-l-2" style={{ borderLeftColor: isDark ? 'rgba(8,145,178,0.3)' : '#bfdbfe' }}>
                    <span className="text-xs font-mono uppercase tracking-widest block mb-1" style={{ color: isDark ? '#155e75' : '#60a5fa' }}>
                      Aegis Response:
                    </span>
                    <p className="text-sm line-clamp-3 opacity-80" style={{ color: isDark ? '#a5f3fc' : '#1e40af' }}>
                      {chat.ai_response}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}