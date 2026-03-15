import { useState, useEffect } from 'react';
import { Download, Monitor, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        // Check if app is already launched in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            setIsInstalled(true);
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setShowButton(true);
            console.log('✅ PWA Install Prompt captured');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowButton(false);
            setDeferredPrompt(null);
            console.log('🚀 PWA was installed');
        });

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`👤 User response to install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        if (outcome === 'accepted') {
            setShowButton(false);
        }
    };

    if (isInstalled) return null;
    if (!showButton) return null;
    
    return (
        <AnimatePresence>
            <motion.button
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                whileHover={{ scale: 1.05, y: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="fixed top-8 left-8 z-[9999] flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl text-white/80 hover:text-white hover:border-[#ff7551]/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
                <Monitor className="w-4 h-4 text-[#ff7551]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Install Aegis-AI</span>
                <Download className="w-3.5 h-3.5 animate-bounce" />
            </motion.button>
        </AnimatePresence>
    );
}
