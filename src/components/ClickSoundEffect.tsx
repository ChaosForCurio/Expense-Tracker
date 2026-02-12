"use client";

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

export function ClickSoundEffect() {
    const soundRef = useRef<Howl | null>(null);

    useEffect(() => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        const playClick = () => {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        };

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const clickable = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]');

            if (clickable) {
                playClick();
            }
        };

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
            audioCtx.close();
        };
    }, []);

    return null;
}
