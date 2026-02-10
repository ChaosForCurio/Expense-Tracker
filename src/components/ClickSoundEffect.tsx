"use client";

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

export function ClickSoundEffect() {
    const soundRef = useRef<Howl | null>(null);

    useEffect(() => {
        // Initialize sound
        soundRef.current = new Howl({
            src: ['/audio/click.wav'],
            html5: false,
            volume: 0.5,
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
