import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid } from 'recharts';
import { ShieldAlert, CheckCircle2, Circle, Timer, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HealthDashboard = ({ user, apiUrl }) => {
    // Determine the base URL for API calls
    const BASE_URL = apiUrl || "http://127.0.0.1:8000";

    // 1. Metrics & Data State
    const [metrics, setMetrics] = useState({
        sleep_hours: 6.5,
        activity_mins: 20,
        nutrition_score: 7,
        hydration_liters: 0
    });
    const [chartData, setChartData] = useState(null);
    const [directives, setDirectives] = useState([]);
    
    // NEW: Trends State
    const [trendData, setTrendData] = useState({ weekly: [], monthly: [], yearly: [] });
    const [activeTimeframe, setActiveTimeframe] = useState('weekly');

    // 2. Timer State
    const [reminderText, setReminderText] = useState("Hydration Protocol");
    const [timerMins, setTimerMins] = useState(30);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Fetch Wellness Data & Directives & Trends
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = user || "anonymous";

                // Fetch Charts/Anomalies
                const wellnessRes = await fetch(`${BASE_URL}/health-score`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(metrics),
                });
                const wellnessData = await wellnessRes.json();
                setChartData(wellnessData);

                // Fetch Daily Directives
                const directivesRes = await fetch(`${BASE_URL}/directives/${userId}`);
                const directivesData = await directivesRes.json();
                if (directivesData.directives) setDirectives(directivesData.directives);

                // Fetch Historical Trends
                const trendsRes = await fetch(`${BASE_URL}/health-trends/${userId}`);
                const trendsData = await trendsRes.json();
                if (trendsData.trends) setTrendData(trendsData.trends);

            } catch (error) {
                console.error("Telemetry link failed:", error);
            }
        };

        const timeoutId = setTimeout(() => fetchData(), 150);
        return () => clearTimeout(timeoutId);
    }, [metrics, user]);

    // --- TIMER LOGIC ---
    useEffect(() => {
        let interval = null;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (isTimerRunning && (timeLeft === 0 || timeLeft === null)) {
            if (isTimerRunning) {
                setIsTimerRunning(false);
                triggerAlarm();
            }
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    const triggerAlarm = async () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            for (let i = 0; i < 3; i++) {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + (i * 0.25)); 
                gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime + (i * 0.25));
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (i * 0.25) + 0.2);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start(audioCtx.currentTime + (i * 0.25));
                oscillator.stop(audioCtx.currentTime + (i * 0.25) + 0.2);
            }
        } catch(e) { console.log("Audio blocked", e); }

        // Log completion to backend
        try {
            const userId = user || "anonymous";
            await fetch(`${BASE_URL}/timer-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    task_name: reminderText,
                    duration_mins: timerMins
                }),
            });
        } catch (error) {
            console.error("Failed to log timer completion:", error);
        }

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("AEGIS-AI // PROTOCOL COMPLETE", { body: `Directive Fulfilled: ${reminderText}` });
        }
        setTimeout(() => alert(`AEGIS-AI SYSTEM ALERT:\n\nProtocol Complete: ${reminderText}`), 500);
    };

    const startTimer = () => {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
        if (timerMins > 0) {
            setTimeLeft(timerMins * 60);
            setIsTimerRunning(true);
        }
    };

    const stopTimer = () => {
        setIsTimerRunning(false);
        setTimeLeft(null);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    // --- END TIMER LOGIC ---

    const handleSliderChange = (e) => setMetrics({ ...metrics, [e.target.name]: parseFloat(e.target.value) });

    const completeDirective = async (id) => {
        try {
            await fetch(`${BASE_URL}/directives/${id}/complete`, { method: 'PUT' });
            setDirectives(prev => prev.map(d => d._id === id ? { ...d, completed: true } : d));
        } catch (error) { console.error("Failed to update directive", error); }
    };

    const resetDirectives = async () => {
        try {
            const userId = user || "anonymous";
            await fetch(`${BASE_URL}/directives/${userId}/reset`, { method: 'POST' });
            setDirectives(prev => prev.map(d => ({ ...d, completed: false })));
        } catch (error) { console.error("Failed to reset directives", error); }
    };

    if (!chartData) return <div className="text-cyan-500 p-8 font-mono animate-pulse">CALIBRATING NEURAL LINK...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-[#050810] p-8 rounded-3xl border border-cyan-500/30 text-white shadow-[0_0_30px_rgba(6,182,212,0.1)]">

                {/* DASHBOARD HEADER */}
                <div className="text-center mb-8 border-b border-gray-800 pb-6">
                    <h3 className="text-cyan-500 tracking-[0.3em] text-xs font-bold mb-2 uppercase font-mono">Wellness Index</h3>
                    <span className="text-7xl font-black tracking-tighter shadow-cyan-500 drop-shadow-lg">
                        {chartData.overall_score}%
                    </span>
                    <div className={`mt-4 text-sm font-mono font-bold tracking-widest ${chartData.overall_score < 40 ? 'text-red-500' : chartData.overall_score < 70 ? 'text-yellow-500' : 'text-green-500'}`}>
                        STATUS: {chartData.stress_level}
                    </div>
                </div>

                {/* SENTINEL ANOMALY BANNER */}
                {chartData.anomalies && chartData.anomalies.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-red-950/40 border-2 border-red-500/50 rounded-xl p-5 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_20px)]"></div>
                        <h3 className="text-red-500 font-black tracking-widest text-sm flex items-center gap-3 mb-3 relative z-10 uppercase">
                            <ShieldAlert className="w-6 h-6" /> Sentinel Protocol: Anomaly Detected
                        </h3>
                        <ul className="list-disc pl-6 text-red-200 text-xs font-mono space-y-2 relative z-10">
                            {chartData.anomalies.map((anomaly, idx) => <li key={idx} className="tracking-wide">{anomaly}</li>)}
                        </ul>
                    </motion.div>
                )}

                {/* CHARTS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="h-72 bg-gray-900/40 rounded-2xl p-6 border border-gray-800/50">
                        <h4 className="text-gray-400 text-[10px] text-center mb-4 font-mono uppercase tracking-[0.2em]">Health Composition</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={chartData.pie_data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value" stroke="none">
                                    {chartData.pie_data.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#050810', border: '1px solid #164e63', color: '#fff' }} />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="h-72 bg-gray-900/40 rounded-2xl p-6 border border-gray-800/50">
                        <h4 className="text-gray-400 text-[10px] text-center mb-4 font-mono uppercase tracking-[0.2em]">Target Variance</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData.bar_data}>
                                <XAxis dataKey="metric" hide />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#050810', border: '1px solid #164e63' }} />
                                <Bar dataKey="current" name="Current" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="target" name="Ideal" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={24} />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- NEW: HISTORICAL TRENDS CHART --- */}
                <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/50 mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                        <h4 className="text-cyan-500 text-[10px] font-mono tracking-[0.3em] uppercase flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Historical Health Trends
                        </h4>
                        
                        {/* Timeframe Toggles */}
                        <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                            {['weekly', 'monthly', 'yearly'].map((tf) => (
                                <button 
                                    key={tf}
                                    onClick={() => setActiveTimeframe(tf)}
                                    className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-md transition-all ${
                                        activeTimeframe === tf 
                                        ? 'bg-cyan-900/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
                                    }`}
                                >
                                    {tf.replace('ly', '')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={trendData[activeTimeframe]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#050810', border: '1px solid #164e63', borderRadius: '8px' }}
                                itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '12px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="score" 
                                name="Health Index" 
                                stroke="#06b6d4" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* MANUAL OVERRIDE CONSOLE */}
                <div className="bg-gray-900/30 p-8 rounded-2xl border border-gray-800/50">
                    <h4 className="text-cyan-500 text-[10px] font-mono mb-8 tracking-[0.3em] text-center uppercase">Manual Override Console</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {['hydration_liters', 'sleep_hours', 'activity_mins', 'nutrition_score'].map((key) => (
                            <div key={key} className="flex flex-col gap-3">
                                <label className="text-gray-400 text-xs font-mono flex justify-between uppercase tracking-tighter">
                                    <span>{key.replace('_', ' ')}</span>
                                    <span className="text-cyan-400 font-bold">{metrics[key]} {key.includes('liters') ? 'L' : key.includes('hours') ? 'h' : key.includes('mins') ? 'm' : ''}</span>
                                </label>
                                <input 
                                    type="range" name={key} 
                                    min={key === 'nutrition_score' ? "1" : "0"} 
                                    max={key === 'activity_mins' ? "120" : key === 'sleep_hours' ? "12" : "10"} 
                                    step={key === 'hydration_liters' ? "0.1" : "1"}
                                    value={metrics[key]} onChange={handleSliderChange} 
                                    className="accent-cyan-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- DAILY DIRECTIVES --- */}
            <div className="bg-[#050810] p-8 rounded-3xl border border-cyan-500/20 text-white">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-cyan-500 text-xs font-mono tracking-[0.3em] flex items-center gap-3 uppercase">
                        <CheckCircle2 className="w-5 h-5" /> Daily Biological Directives
                    </h3>
                    <button onClick={resetDirectives} className="p-2 text-cyan-700 hover:text-cyan-400 hover:bg-cyan-900/30 rounded-lg transition-all" title="Force System Reset">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {directives.map((dir) => (
                        <button key={dir._id} onClick={() => !dir.completed && completeDirective(dir._id)} className={`p-5 rounded-2xl border text-left transition-all duration-500 group relative overflow-hidden ${dir.completed ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-gray-900/40 border-gray-800 hover:border-cyan-500/50'}`}>
                            <div className="flex items-start gap-4 relative z-10">
                                {dir.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> : <Circle className="w-6 h-6 text-gray-600 group-hover:text-cyan-400 shrink-0" />}
                                <div>
                                    <p className={`text-xs font-mono leading-relaxed tracking-wide ${dir.completed ? 'text-emerald-500/50 line-through' : 'text-gray-300'}`}>{dir.task}</p>
                                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-widest">{dir.completed ? 'Directive Fulfilled' : 'Awaiting Input'}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CUSTOM PROTOCOL TIMER --- */}
            <div className="bg-[#050810] p-8 rounded-3xl border border-cyan-500/20 text-white flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 w-full space-y-4">
                    <h3 className="text-cyan-500 text-xs font-mono tracking-[0.3em] flex items-center gap-3 uppercase mb-4">
                        <Timer className="w-5 h-5" /> Active Protocol Timer
                    </h3>
                    <input 
                        type="text" value={reminderText} onChange={(e) => setReminderText(e.target.value)} disabled={isTimerRunning}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-cyan-50 outline-none focus:border-cyan-500/50 transition-all font-mono"
                        placeholder="E.g., Core Workout"
                    />
                    <div className="flex items-center gap-4">
                        <input 
                            type="number" value={timerMins} onChange={(e) => setTimerMins(parseInt(e.target.value))} disabled={isTimerRunning} min="1"
                            className="w-24 bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-cyan-50 outline-none focus:border-cyan-500/50 font-mono text-center"
                        />
                        <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">Minutes</span>
                    </div>
                </div>

                <div className="md:w-72 w-full flex flex-col items-center justify-center bg-gray-900/40 p-6 rounded-2xl border border-gray-800 relative overflow-hidden h-40">
                    {isTimerRunning && <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>}
                    
                    <div className={`text-5xl font-black font-mono tracking-widest mb-4 z-10 transition-colors ${isTimerRunning ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'text-gray-600'}`}>
                        {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
                    </div>

                    <div className="flex gap-3 z-10 w-full px-4">
                        {!isTimerRunning ? (
                            <button onClick={startTimer} className="flex-1 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 rounded-lg text-xs font-mono uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                Initiate
                            </button>
                        ) : (
                            <button onClick={stopTimer} className="flex-1 py-2 bg-red-950 hover:bg-red-900 border border-red-700/50 text-red-300 rounded-lg text-xs font-mono uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                Abort
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default HealthDashboard;