import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Bell, BellOff, CheckCircle2, Zap, Clock } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const PRESETS = [
    { label: 'Hydration', mins: 30, icon: '💧' },
    { label: 'Posture Check', mins: 45, icon: '🧘' },
    { label: 'Eye Rest', mins: 20, icon: '👁️' },
    { label: 'Medication', mins: 60, icon: '💊' },
    { label: 'Walk Break', mins: 90, icon: '🚶' },
    { label: 'Deep Breath', mins: 10, icon: '🌬️' },
];

export default function ProtocolTimer() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [reminderText, setReminderText] = useState('Hydration Protocol');
    const [timerMins, setTimerMins] = useState(30);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerComplete, setTimerComplete] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const [notifGranted, setNotifGranted] = useState(
        'Notification' in window ? Notification.permission === 'granted' : false
    );

    // Request OS notification permission
    useEffect(() => {
        // Pre-warm: ask early, but the real ask happens on Initiate click
        if ('Notification' in window && Notification.permission === 'default') {
            // Don't request here — wait for user gesture (startTimer)
        }
    }, []);

    // Max-volume 3-burst synthetic beep (Web Audio API — no browser block)
    const playSyntheticBeep = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            for (let i = 0; i < 3; i++) {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + i * 0.28);

                // MAX volume (1.0)
                gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime + i * 0.28);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.28 + 0.2);

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start(audioCtx.currentTime + i * 0.28);
                oscillator.stop(audioCtx.currentTime + i * 0.28 + 0.2);
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    };

    // Countdown engine
    useEffect(() => {
        let interval = null;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (isTimerRunning && timeLeft === 0) {
            setIsTimerRunning(false);
            setTimerComplete(true);
            setCompletedCount(c => c + 1);
            setTimeout(() => setTimerComplete(false), 5000);

            // Play 3-burst max-volume beep
            playSyntheticBeep();

            // OS notification (best-effort)
            if (Notification.permission === 'granted') {
                new Notification('AEGIS-AI // PROTOCOL COMPLETE', {
                    body: `✅ Directive Fulfilled: ${reminderText}`,
                    icon: '/vite.svg'
                });
            }

            // Guaranteed in-browser alert — delayed 500ms so audio plays first
            setTimeout(() => {
                alert(`AEGIS-AI SYSTEM ALERT\n\nProtocol Complete: ${reminderText}`);
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, reminderText]);

    const startTimer = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(perm => setNotifGranted(perm === 'granted'));
        }
        if (timerMins > 0) {
            setTimeLeft(timerMins * 60);
            setIsTimerRunning(true);
            setTimerComplete(false);
        }
    };

    const stopTimer = () => {
        setIsTimerRunning(false);
        setTimeLeft(null);
        setTimerComplete(false);
    };

    const applyPreset = (preset) => {
        if (isTimerRunning) return;
        setReminderText(preset.label);
        setTimerMins(preset.mins);
        setTimeLeft(null);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const progress = timeLeft !== null ? timeLeft / (timerMins * 60) : 1;
    const circumference = 2 * Math.PI * 110;

    // Theme tokens
    const bg = isDark ? '#050810' : '#f0f4ff';
    const cardBg = isDark ? 'rgba(7,11,20,0.85)' : 'rgba(255,255,255,0.92)';
    const cardBorder = isDark ? 'rgba(6,182,212,0.25)' : 'rgba(147,197,253,0.5)';
    const panelBg = isDark ? 'rgba(3,7,18,0.6)' : 'rgba(239,246,255,0.7)';
    const panelBorder = isDark ? '#1f2937' : '#bfdbfe';
    const accent = isDark ? '#06b6d4' : '#2563eb';
    const textPrimary = isDark ? '#e0f2fe' : '#0f172a';
    const textSecondary = isDark ? '#64748b' : '#94a3b8';
    const inputBg = isDark ? 'rgba(3,7,18,0.7)' : 'rgba(241,245,249,0.9)';
    const inputBorder = isDark ? '#1f2937' : '#e2e8f0';

    return (
        <div
            className="w-full h-full overflow-y-auto custom-scrollbar p-6 transition-colors duration-300"
            style={{ background: bg, color: textPrimary }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-black tracking-widest uppercase flex items-center gap-3" style={{ color: accent }}>
                            <Timer className="w-7 h-7" />
                            Protocol Timer
                        </h2>
                        <p className="text-xs font-mono mt-1 tracking-widest" style={{ color: textSecondary }}>
                            AEGIS-AI // ACTIVE MONITORING SYSTEM
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg border"
                        style={{ borderColor: cardBorder, background: cardBg, color: textSecondary }}>
                        {notifGranted ? (
                            <><Bell className="w-3 h-3 text-emerald-500" /> Notifications On</>
                        ) : (
                            <><BellOff className="w-3 h-3 text-yellow-500" /> Notifications Off</>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Protocols Run', value: completedCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
                        { label: 'Active Directive', value: reminderText, icon: <Zap className="w-5 h-5" style={{ color: accent }} /> },
                        { label: 'Duration', value: `${timerMins} min`, icon: <Clock className="w-5 h-5" style={{ color: accent }} /> },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-2xl border"
                            style={{ background: cardBg, borderColor: cardBorder }}
                        >
                            <div className="flex items-center gap-2 mb-1">{stat.icon}
                                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: textSecondary }}>{stat.label}</span>
                            </div>
                            <p className="text-lg font-black font-mono truncate" style={{ color: textPrimary }}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main timer panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left: Config */}
                    <motion.div
                        className="p-6 rounded-3xl border space-y-5"
                        style={{ background: cardBg, borderColor: cardBorder }}
                    >
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em]" style={{ color: accent }}>Configure Directive</h3>

                        <div>
                            <label className="text-[10px] font-mono uppercase tracking-widest mb-2 block" style={{ color: textSecondary }}>Directive Label</label>
                            <input
                                type="text"
                                value={reminderText}
                                onChange={e => setReminderText(e.target.value)}
                                disabled={isTimerRunning}
                                placeholder="E.g., Posture Check"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none font-mono border transition-all"
                                style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                                onFocus={e => e.target.style.borderColor = accent}
                                onBlur={e => e.target.style.borderColor = inputBorder}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-mono uppercase tracking-widest mb-2 block" style={{ color: textSecondary }}>Duration (minutes)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={timerMins}
                                    onChange={e => setTimerMins(Math.max(1, parseInt(e.target.value) || 1))}
                                    disabled={isTimerRunning}
                                    min="1"
                                    className="w-28 rounded-xl px-4 py-3 text-sm outline-none font-mono text-center border transition-all"
                                    style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                                    onFocus={e => e.target.style.borderColor = accent}
                                    onBlur={e => e.target.style.borderColor = inputBorder}
                                />
                                <span className="text-xs font-mono" style={{ color: textSecondary }}>minutes</span>
                            </div>
                        </div>

                        {/* Presets */}
                        <div>
                            <label className="text-[10px] font-mono uppercase tracking-widest mb-3 block" style={{ color: textSecondary }}>Quick Presets</label>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => applyPreset(preset)}
                                        disabled={isTimerRunning}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono text-left transition-all"
                                        style={{
                                            background: reminderText === preset.label ? (isDark ? 'rgba(8,145,178,0.2)' : 'rgba(219,234,254,0.8)') : inputBg,
                                            borderColor: reminderText === preset.label ? accent : inputBorder,
                                            color: reminderText === preset.label ? accent : textSecondary,
                                            opacity: isTimerRunning ? 0.4 : 1
                                        }}
                                    >
                                        <span>{preset.icon}</span>
                                        <span>{preset.label}</span>
                                        <span className="ml-auto text-[10px]">{preset.mins}m</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Circular countdown */}
                    <motion.div
                        className="p-6 rounded-3xl border flex flex-col items-center justify-center relative overflow-hidden"
                        style={{ background: panelBg, borderColor: panelBorder, minHeight: '360px' }}
                    >
                        {/* Pulsing glow ring when running */}
                        {isTimerRunning && (
                            <motion.div
                                className="absolute inset-0 pointer-events-none rounded-3xl"
                                style={{ background: isDark ? 'rgba(6,182,212,0.04)' : 'rgba(59,130,246,0.04)' }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}

                        {/* Completion overlay */}
                        <AnimatePresence>
                            {timerComplete && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center z-30 rounded-3xl"
                                    style={{ background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(220,252,231,0.9)' }}
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                    >
                                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                                    </motion.div>
                                    <p className="text-emerald-500 font-black font-mono uppercase tracking-widest text-sm">Directive Complete!</p>
                                    <p className="text-emerald-400/70 font-mono text-xs mt-1">{reminderText}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* SVG circular progress */}
                        <div className="relative mb-6 z-10">
                            <svg width="260" height="260" viewBox="0 0 260 260">
                                {/* Track */}
                                <circle cx="130" cy="130" r="110"
                                    fill="none"
                                    stroke={isDark ? '#1f2937' : '#e2e8f0'}
                                    strokeWidth="8"
                                />
                                {/* Progress arc */}
                                <circle cx="130" cy="130" r="110"
                                    fill="none"
                                    stroke={accent}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference * (1 - progress)}
                                    transform="rotate(-90 130 130)"
                                    style={{ transition: 'stroke-dashoffset 1s linear', filter: isTimerRunning ? `drop-shadow(0 0 8px ${accent})` : 'none' }}
                                />
                            </svg>
                            {/* Center time display */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div
                                    className="text-5xl font-black font-mono tracking-widest transition-all duration-300"
                                    style={{
                                        color: isTimerRunning ? accent : textSecondary,
                                        textShadow: isTimerRunning ? `0 0 24px ${isDark ? 'rgba(6,182,212,0.9)' : 'rgba(37,99,235,0.5)'}` : 'none'
                                    }}
                                >
                                    {timeLeft !== null ? formatTime(timeLeft) : `${String(timerMins).padStart(2, '0')}:00`}
                                </div>
                                <div className="text-[10px] font-mono uppercase tracking-widest mt-2" style={{ color: textSecondary }}>
                                    {isTimerRunning ? '● PROTOCOL ACTIVE' : timeLeft === null ? 'STANDBY' : '■ PAUSED'}
                                </div>
                            </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex gap-4 z-10">
                            {!isTimerRunning ? (
                                <motion.button
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={startTimer}
                                    className="px-8 py-3 rounded-xl text-sm font-mono font-bold uppercase tracking-widest border transition-all"
                                    style={{
                                        background: isDark ? 'rgba(8,145,178,0.25)' : 'rgba(219,234,254,0.9)',
                                        borderColor: accent,
                                        color: accent,
                                        boxShadow: `0 0 20px ${isDark ? 'rgba(6,182,212,0.3)' : 'rgba(37,99,235,0.2)'}`
                                    }}
                                >
                                    ▶ Initiate
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={stopTimer}
                                    className="px-8 py-3 rounded-xl text-sm font-mono font-bold uppercase tracking-widest border transition-all"
                                    style={{
                                        background: isDark ? 'rgba(127,29,29,0.3)' : 'rgba(254,226,226,0.9)',
                                        borderColor: isDark ? '#ef4444' : '#fca5a5',
                                        color: isDark ? '#fca5a5' : '#dc2626'
                                    }}
                                >
                                    ■ Abort
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(8,145,178,0.3); border-radius: 10px; }
            `}</style>
        </div>
    );
}
