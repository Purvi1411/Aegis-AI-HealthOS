import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Timer, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ProtocolAnalytics = ({ user, apiUrl, onBack, isDark }) => {
    const BASE_URL = apiUrl || "https://aegis-ai-healthos-3.onrender.com";
    const [timerHistory, setTimerHistory] = useState([]);
    const [timerStats, setTimerStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = user || "anonymous";
                
                // Fetch Timer History
                const historyRes = await fetch(`${BASE_URL}/timer-history/${userId}`);
                const historyData = await historyRes.json();
                if (historyData.history) setTimerHistory(historyData.history);

                // Fetch Timer Stats
                const statsRes = await fetch(`${BASE_URL}/timer-stats/${userId}`);
                const statsData = await statsRes.json();
                if (statsData.stats) setTimerStats(statsData.stats);
                
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch protocol analytics:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [user, BASE_URL]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-cyan-500 font-mono animate-pulse tracking-[0.2em]">SYNCING PROTOCOL METRICS...</div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button 
                    onClick={onBack}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                        isDark ? 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-cyan-400' : 'bg-white border-gray-200 text-gray-600 hover:text-blue-500'
                    }`}
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-widest">Back</span>
                </button>
                <div className="text-right">
                    <h2 className="text-cyan-500 text-xs font-mono tracking-[0.4em] uppercase">Protocol Intelligence</h2>
                    <p className={`text-[10px] font-mono mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>HISTORICAL ADHERENCE DATA</p>
                </div>
            </div>

            {/* Protocol Consistency Chart */}
            <div className={`p-8 rounded-3xl border backdrop-blur-xl transition-colors ${
                isDark ? 'bg-gray-900/40 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)]' : 'bg-white border-blue-200 shadow-lg'
            }`}>
                <h3 className="text-cyan-500 text-[10px] font-mono tracking-[0.3em] flex items-center gap-3 uppercase mb-8">
                    <Activity className="w-4 h-4" /> Weekly Adherence Consistency
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timerStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1f2937" : "#e2e8f0"} vertical={false} />
                            <XAxis dataKey="day" stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                            <YAxis axisLine={false} tickLine={false} stroke="#4b5563" fontSize={11} />
                            <Tooltip 
                                cursor={{ fill: isDark ? 'rgba(6,182,212,0.05)' : 'rgba(59,130,246,0.05)' }}
                                contentStyle={{ 
                                    backgroundColor: isDark ? '#050810' : '#ffffff', 
                                    border: `1px solid ${isDark ? '#164e63' : '#bfdbfe'}`, 
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar 
                                dataKey="completions" 
                                name="Protocols Completed" 
                                fill={isDark ? "#06b6d4" : "#3b82f6"} 
                                radius={[6, 6, 0, 0]} 
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Protocol Audit Log */}
            <div className={`p-8 rounded-3xl border backdrop-blur-xl flex-1 overflow-hidden flex flex-col transition-colors ${
                isDark ? 'bg-gray-900/40 border-cyan-500/10 shadow-[0_0_20px_rgba(0,0,0,0.2)]' : 'bg-white border-blue-100 shadow-md'
            }`}>
                <h3 className="text-cyan-500 text-[10px] font-mono tracking-[0.3em] flex items-center gap-3 uppercase mb-6">
                    <Timer className="w-4 h-4" /> Comprehensive Session Audit
                </h3>
                <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-4">
                    {timerHistory.length > 0 ? timerHistory.map((log, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx} 
                            className={`p-5 rounded-2xl border flex justify-between items-center group transition-all ${
                                isDark 
                                ? 'bg-gray-950/40 border-gray-800 hover:border-cyan-500/30' 
                                : 'bg-gray-50 border-gray-200 hover:border-blue-400 shadow-sm'
                            }`}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isDark ? 'bg-cyan-950/30 border border-cyan-800/20' : 'bg-blue-100 border border-blue-200'
                                }`}>
                                    <Timer className={`w-5 h-5 ${isDark ? 'text-cyan-500' : 'text-blue-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold tracking-wide ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{log.task_name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">
                                        {new Date(log.timestamp).toLocaleDateString()} // {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-mono mb-2 inline-block ${
                                    isDark ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800/30' : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                    {log.duration_mins} MIN SESSION
                                </div>
                                <p className={`text-[10px] font-mono tracking-tighter ${isDark ? 'text-emerald-500/80' : 'text-emerald-600 font-bold'}`}>NOMINAL COMPLETION</p>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-20 text-gray-600 font-mono text-xs uppercase tracking-[0.3em]">
                            NO PROTOCOL LOGS FOUND IN DATABASE
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProtocolAnalytics;
