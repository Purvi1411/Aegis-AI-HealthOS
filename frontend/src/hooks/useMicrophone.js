import { useState, useRef, useCallback } from 'react';

export const useMicrophone = ({ onTranscriptChange, languageCode }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const toggleMic = useCallback(() => {
        // If it's already listening, stop it.
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        // Grab the browser's speech recognition engine
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Microphone not supported by this browser. Please use Chrome or Edge.");
            return;
        }

        // Create a FRESH instance every single time the button is clicked
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = languageCode; // Uses the currently selected language

        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    currentTranscript += event.results[i][0].transcript;
                }
            }
            if (currentTranscript.trim()) {
                onTranscriptChange(currentTranscript.trim());
            }
        };

        recognition.onerror = (event) => {
            console.error("🛑 Mic error occurred:", event.error);
            // Don't kill the UI if it's just a 'no-speech' timeout
            if (event.error !== 'no-speech') {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            console.log("🏁 Microphone session ended.");
            setIsListening(false);
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
            setIsListening(true);
        } catch (e) {
            console.error("Could not start mic:", e);
            setIsListening(false);
        }

    }, [isListening, languageCode, onTranscriptChange]);

    const forceStopMic = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { isListening, toggleMic, forceStopMic };
};
