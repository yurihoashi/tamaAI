import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { PetAction, PetMood } from '../types/pet';

interface PetSpriteProps {
    action: PetAction;
    mood: PetMood;
    direction: 'left' | 'right';
    onAnimationComplete?: () => void;
}

const SpriteCanvas = styled.canvas`
    image-rendering: pixelated;
    position: absolute;
    pointer-events: none;
`;

const SPRITE_CONFIG = {
    frameWidth: 32,
    frameHeight: 32,
    animations: {
        idle: { frames: 4, duration: 500 },
        walk: { frames: 6, duration: 600 },
        eat: { frames: 4, duration: 400 },
        sleep: { frames: 4, duration: 800 },
        play: { frames: 6, duration: 500 },
    },
};

const PetSprite: React.FC<PetSpriteProps> = ({
    action,
    mood,
    direction,
    onAnimationComplete,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef(0);
    const lastFrameTimeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = SPRITE_CONFIG.frameWidth;
        canvas.height = SPRITE_CONFIG.frameHeight;

        // Load sprite sheet
        const spriteSheet = new Image();
        spriteSheet.src = `/assets/sprites/${mood}_${action}.png`;

        const animate = (timestamp: number) => {
            if (!lastFrameTimeRef.current) {
                lastFrameTimeRef.current = timestamp;
            }

            const deltaTime = timestamp - lastFrameTimeRef.current;
            const animConfig = SPRITE_CONFIG.animations[action];

            if (deltaTime >= animConfig.duration / animConfig.frames) {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw current frame
                ctx.save();
                if (direction === 'left') {
                    ctx.scale(-1, 1);
                    ctx.translate(-SPRITE_CONFIG.frameWidth, 0);
                }

                ctx.drawImage(
                    spriteSheet,
                    frameRef.current * SPRITE_CONFIG.frameWidth,
                    0,
                    SPRITE_CONFIG.frameWidth,
                    SPRITE_CONFIG.frameHeight,
                    0,
                    0,
                    SPRITE_CONFIG.frameWidth,
                    SPRITE_CONFIG.frameHeight
                );
                ctx.restore();

                // Update frame
                frameRef.current = (frameRef.current + 1) % animConfig.frames;
                lastFrameTimeRef.current = timestamp;

                // Notify when animation completes a cycle
                if (frameRef.current === 0 && onAnimationComplete) {
                    onAnimationComplete();
                }
            }

            requestAnimationFrame(animate);
        };

        const animationFrame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [action, mood, direction, onAnimationComplete]);

    return <SpriteCanvas ref={canvasRef} />;
};

export default PetSprite; 