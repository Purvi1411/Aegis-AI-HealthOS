import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

const TypewriterMarkdown = ({ content, speed = 15, onType, forceStop, onComplete }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const contentRef = useRef('');

    useEffect(() => {
        let currentIndex = 0;
        setDisplayedContent('');
        setIsTyping(true);
        contentRef.current = '';

        const timer = setInterval(() => {
            if (forceStop) {
                clearInterval(timer);
                setIsTyping(false);
                const finalContent = contentRef.current + '\n\n<span style="color: #ef4444; font-family: monospace; font-weight: bold;">[NEURAL SYNC SEVERED BY USER]</span>';
                setDisplayedContent(finalContent);
                if (onComplete) onComplete();
                return;
            }

            if (currentIndex < content.length) {
                contentRef.current += content.charAt(currentIndex);
                setDisplayedContent(contentRef.current);
                currentIndex++;
            } else {
                clearInterval(timer);
                setIsTyping(false);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [content, speed, forceStop]);

    useEffect(() => {
        if (onType) onType();
    }, [displayedContent, onType]);

    return (
        <div className="relative font-sans w-full">
            <div
                className="markdown-body space-y-2 w-full"
                dangerouslySetInnerHTML={{ __html: marked.parse(displayedContent) }}
            />

            {/* Blinking Cyberpunk Cursor */}
            {isTyping && !forceStop && (
                <span className="inline-block w-2 h-4 ml-1 bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]" />
            )}
        </div>
    );
};

export default TypewriterMarkdown;
