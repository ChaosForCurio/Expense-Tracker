"use client";

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

export function ClickSoundEffect() {
    const soundRef = useRef<Howl | null>(null);

    useEffect(() => {
        // Initialize sound
        soundRef.current = new Howl({
            src: ['data:audio/wav;base64,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'],
            html5: false, // Use Web Audio API for lower latency with base64
            volume: 0.5,
            format: ['wav'],
            onload: () => console.log('Sound loaded successfully'),
            onloaderror: (id, error) => console.error('Sound load error:', error),
        });

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if the clicked element or its parent is interactive
            const clickable = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]');

            if (clickable && soundRef.current) {
                soundRef.current.play();
            }
        };

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
            soundRef.current?.unload();
        };
    }, []);

    return null;
}
