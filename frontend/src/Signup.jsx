import { useState } from 'react';
import { HeartPulse, Activity, Shield, UserPlus, Mail, Lock, Loader2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';

import PWAInstallButton from './components/PWAInstallButton';

export default function Signup({ onToggle }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            const response = await fetch('https://aegis-ai-healthos-3.onrender.com/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("✅ " + data.message + " Redirecting...");
                setEmail('');
                setPassword('');
                setTimeout(() => {
                    onToggle();
                }, 1500);
            } else {
                setMessage("❌ " + data.detail); 
                setIsLoading(false);
            }
        } catch (error) {
            setMessage("❌ Critical failure: Unable to connect to server.");
            setIsLoading(false);
        }
    };

    const msgStyle = message.includes('✅')
        ? { background: 'var(--msg-success-bg)', color: 'var(--msg-success-text)', border: '1px solid var(--msg-success-border)' }
        : message.includes('⚠️')
        ? { background: 'var(--msg-warn-bg)', color: 'var(--msg-warn-text)', border: '1px solid var(--msg-warn-border)' }
        : { background: 'var(--msg-error-bg)', color: 'var(--msg-error-text)', border: '1px solid var(--msg-error-border)' };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex w-full h-screen overflow-hidden"
        >
            {/* ══════════════ LEFT PANEL ══════════════ */}
            <motion.div 
                initial={{ x: '-10%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="hidden lg:flex flex-col justify-between w-[55%] bg-[#0d0216] p-16 text-white relative overflow-hidden shadow-2xl z-10"
            >
                {/* Gradient layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#10051a]/90 via-[#220b38]/90 to-[#0d0216]/90 z-0" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay z-0" />

                {/* Glow orbs */}
                <motion.div 
                    animate={{ scale: [1, 1.4, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] right-[-30%] w-[140%] h-[140%] bg-[#b330ff] rounded-full blur-[220px] opacity-25 pointer-events-none mix-blend-screen z-0"
                />
                <motion.div 
                    animate={{ scale: [1, 1.6, 1], x: [0, -150, 0], y: [0, -80, 0] }}
                    transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-30%] left-[-20%] w-[110%] h-[110%] bg-[#ff2a85] rounded-full blur-[200px] opacity-15 pointer-events-none mix-blend-screen z-0"
                />

                {/* Floating ambient particles */}
                {[
                    { top: '15%', left: '20%',  size: 'w-2 h-2',    color: 'bg-white',       duration: 6,  anim: { y: [0,25,0],  opacity: [0.3,0.7,0.3] } },
                    { top: '20%', right: '25%',  size: 'w-3 h-3',    color: 'bg-[#b330ff]',   duration: 8,  anim: { y: [0,-35,0], opacity: [0.2,0.6,0.2] } },
                    { top: '50%', right: '10%',  size: 'w-1.5 h-1.5',color: 'bg-pink-400',    duration: 7,  anim: { x: [0,-40,0], opacity: [0.4,0.9,0.4] } },
                    { top: '70%', left: '30%',   size: 'w-2 h-2',    color: 'bg-purple-300',  duration: 5,  anim: { y: [0,15,0],  opacity: [0.2,0.8,0.2] } },
                    { top: '85%', right: '35%',  size: 'w-1 h-1',    color: 'bg-fuchsia-300', duration: 9,  anim: { x: [0,25,0],  opacity: [0.5,1,0.5] } },
                ].map((p, i) => (
                    <motion.div
                        key={i}
                        animate={p.anim}
                        transition={{ duration: p.duration, repeat: Infinity }}
                        style={{ position: 'absolute', top: p.top, left: p.left, right: p.right }}
                        className={`${p.size} rounded-full ${p.color} blur-[1px] z-0`}
                    />
                ))}

                {/* Header */}
                <div className="relative z-10 mt-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
                        <span className="text-xs font-semibold tracking-[0.2em] text-[#f3e8ff] uppercase">New Subject Initialization</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-6xl font-black flex items-center gap-4 font-serif tracking-tighter drop-shadow-2xl"
                    >
                        <HeartPulse className="text-[#a855f7] w-16 h-16 filter drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]" /> Aegis-AI
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-8 text-[#e2d5f8] font-light text-xl max-w-lg leading-relaxed relative"
                    >
                        <span className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#a855f7] to-transparent rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        Join the <span className="text-white font-semibold">diagnostic revolution.</span> Train our advanced models with your baseline biological parameters.
                    </motion.p>
                </div>

                {/* 3D card + feature list */}
                <div className="relative z-10 flex-1 flex items-center justify-between w-full mt-12 pr-8 perspective-[2000px]">
                    {/* 3D Card */}
                    <motion.div 
                        initial={{ rotateX: 15, rotateY: 30, scale: 0.8, opacity: 0, x: -50 }}
                        animate={{ rotateX: 0, rotateY: 10, scale: 1, opacity: 1, x: 0 }}
                        transition={{ delay: 1.5, type: "spring", stiffness: 40, damping: 20 }}
                        whileHover={{ scale: 1.1, rotateY: 0, rotateX: 5, z: 50 }}
                        className="w-[280px] h-[400px] border border-white/20 rounded-[40px] bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-3xl relative flex flex-col items-center pt-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] group overflow-hidden transform-gpu"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#ff2a85]/20 via-transparent to-[#a855f7]/30 opacity-60 group-hover:opacity-100 transition-opacity duration-700 ease-in-out" />
                        <div className="w-20 h-1.5 rounded-full bg-black/50 mb-10 shadow-inner" />

                        {/* Pulse rings + Shield icon */}
                        <div className="relative flex items-center justify-center mb-8">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10"
                            >
                                <Shield className="w-24 h-24 text-[#a855f7] drop-shadow-[0_0_40px_rgba(168,85,247,1)] group-hover:drop-shadow-[0_0_60px_rgba(168,85,247,1)] transition-all" />
                                <div className="absolute inset-0 bg-[#a855f7] blur-[60px] opacity-70 rounded-full scale-150" />
                            </motion.div>
                            {[0, 0.55, 1.1].map((delay, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full border-2 border-[#a855f7]/50"
                                    style={{ width: 96, height: 96 }}
                                    animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay }}
                                />
                            ))}
                        </div>

                        <span className="text-center font-extrabold mb-3 tracking-[0.25em] text-lg uppercase text-white drop-shadow-md">Identity Matrix</span>

                        <div className="absolute bottom-8 w-[85%] h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-xs tracking-[0.1em] shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-[#a855f7]/40 backdrop-blur-md overflow-hidden">
                            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] animate-[shine_3s_infinite]" />
                            <div className="flex gap-2 items-center relative z-10">
                                <div className="w-2 h-2 bg-[#a855f7] rounded-full animate-ping shadow-[0_0_10px_rgba(168,85,247,1)]" />
                                <span className="uppercase text-white/90 font-semibold">Awaiting Input...</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature list */}
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 1 } }
                        }}
                        className="flex flex-col gap-6 items-end"
                    >
                        {[
                            { icon: UserPlus, title: "Personalized Insights", desc: "AI models trained specifically on your biology." },
                            { icon: Shield, title: "HIPAA Compliant", desc: "Absolute data privacy and security guarantees." },
                            { icon: Activity, title: "Seamless Integration", desc: "Connects with all major wearable health devices." }
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx}
                                variants={{ hidden: { x: 30, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } } }}
                                whileHover={{ x: -10, backgroundColor: "rgba(255,255,255,0.08)" }}
                                className="flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-white/10 transition-all cursor-default w-[300px] flex-row-reverse text-right"
                            >
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                    <item.icon className="w-6 h-6 text-[#a855f7]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-sm tracking-wide">{item.title}</h3>
                                    <p className="text-xs text-[#e2d5f8]/70 mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* ══════════════ RIGHT PANEL (FORM) ══════════════ */}
            <div
                className="w-full lg:w-[45%] flex flex-col justify-center relative z-0 transition-colors duration-300"
                style={{ background: 'var(--form-bg)', color: 'var(--form-text)' }}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

                {/* Theme toggle */}
                <motion.button
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-6 right-6 z-20 p-2.5 rounded-full border transition-all duration-300 shadow-sm"
                    style={{ background: 'var(--toggle-bg)', borderColor: 'var(--toggle-border)', color: 'var(--form-text)' }}
                    title="Toggle theme"
                >
                    <AnimatePresence mode="wait">
                        {theme === 'dark' ? (
                            <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
                                <Sun className="w-5 h-5 text-amber-400" />
                            </motion.div>
                        ) : (
                            <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.3 }}>
                                <Moon className="w-5 h-5 text-indigo-500" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                    className="w-full max-w-md mx-auto px-8 relative z-10"
                >
                    <div className="text-center mb-10">
                        {/* Icon with pulse rings */}
                        <div className="relative inline-flex items-center justify-center mb-6">
                            <motion.div
                                whileHover={{ rotate: -180, scale: 1.1 }}
                                transition={{ duration: 0.6, ease: "anticipate" }}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg relative z-10"
                                style={{ background: 'var(--icon-bg)', borderColor: 'var(--icon-border)' }}
                            >
                                <UserPlus className="w-8 h-8" style={{ color: 'var(--link-color)' }} />
                            </motion.div>
                            {[0, 0.6, 1.2].map((delay, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-2xl border-2 w-16 h-16"
                                    style={{ borderColor: 'var(--link-color)' }}
                                    animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay }}
                                />
                            ))}
                        </div>

                        <h2 className="text-4xl font-bold font-serif tracking-tight" style={{ color: 'var(--form-text)' }}>Create Profile.</h2>
                        <p className="text-base mt-3 font-medium" style={{ color: 'var(--form-sub)' }}>Initialize your health data vault.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        {/* Email */}
                        <div className="group">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 transition-colors" style={{ color: 'var(--placeholder)' }} />
                                </div>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    disabled={isLoading}
                                    placeholder="Enter your email" 
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm transition-all outline-none font-medium shadow-sm border"
                                    style={{
                                        background: 'var(--input-bg)',
                                        borderColor: 'var(--input-border)',
                                        color: 'var(--input-text)',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--input-focus-border)'; e.target.style.boxShadow = '0 0 0 4px var(--input-focus-ring)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="group">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 transition-colors" style={{ color: 'var(--placeholder)' }} />
                                </div>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    disabled={isLoading}
                                    placeholder="Create a password" 
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm transition-all outline-none font-medium shadow-sm border"
                                    style={{
                                        background: 'var(--input-bg)',
                                        borderColor: 'var(--input-border)',
                                        color: 'var(--input-text)',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--input-focus-border)'; e.target.style.boxShadow = '0 0 0 4px var(--input-focus-ring)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.02, boxShadow: "0 15px 30px -5px rgba(168, 85, 247, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={isLoading}
                            className="group w-full py-4 bg-gradient-to-r from-[#a855f7] to-[#9333ea] hover:from-[#9333ea] hover:to-[#7c3aed] text-white rounded-2xl font-bold tracking-wide shadow-lg shadow-purple-500/20 transition-all mt-8 cursor-pointer flex justify-center items-center gap-2 disabled:opacity-70 text-base"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>INITIALIZE RECORD <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /></>
                            )}
                        </motion.button>
                    </form>

                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="mt-6 text-sm text-center p-4 rounded-xl font-medium"
                                style={msgStyle}
                            >
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="text-center text-sm mt-12 font-medium" style={{ color: 'var(--form-sub)' }}>
                        Already initialized?{' '}
                        <button
                            onClick={onToggle}
                            className="font-bold transition-colors underline underline-offset-4 cursor-pointer ml-1.5"
                            style={{ color: 'var(--form-text)' }}
                            onMouseEnter={e => e.target.style.color = 'var(--link-color)'}
                            onMouseLeave={e => e.target.style.color = 'var(--form-text)'}
                        >
                            Authenticate
                        </button>
                    </p>
                </motion.div>
            </div>
            <PWAInstallButton />
        </motion.div>
    );
}