import { useState, useEffect, useCallback } from 'react';
import { PetState, PetAction, PetMood, PetStats } from '../types/pet';

const SCREEN_PADDING = 50; // pixels from screen edges
const WALK_SPEED = 2; // pixels per frame
const DIRECTION_CHANGE_PROBABILITY = 0.01;
const ACTION_CHANGE_PROBABILITY = 0.005;

const getRandomPosition = () => {
    return {
        x: SCREEN_PADDING + Math.random() * (window.innerWidth - 2 * SCREEN_PADDING),
        y: SCREEN_PADDING + Math.random() * (window.innerHeight - 2 * SCREEN_PADDING),
    };
};

const calculateMood = (stats: PetStats): PetMood => {
    const average = (stats.health + stats.happiness + stats.energy + stats.hunger) / 4;
    if (average > 75) return 'happy';
    if (average > 50) return 'neutral';
    return 'sad';
};

export const usePetBehavior = (initialStats: PetStats) => {
    const [state, setState] = useState<PetState>({
        mood: 'happy',
        action: 'idle',
        direction: 'right',
        position: getRandomPosition(),
        stats: initialStats,
    });

    const updatePosition = useCallback(() => {
        if (state.action !== 'walk') return;

        setState(prev => {
            const newX = prev.direction === 'right'
                ? prev.position.x + WALK_SPEED
                : prev.position.x - WALK_SPEED;

            // Change direction if hitting screen bounds
            if (newX <= SCREEN_PADDING || newX >= window.innerWidth - SCREEN_PADDING) {
                return {
                    ...prev,
                    direction: prev.direction === 'right' ? 'left' : 'right',
                };
            }

            return {
                ...prev,
                position: { ...prev.position, x: newX },
            };
        });
    }, [state.action]);

    const updateAction = useCallback(() => {
        setState(prev => {
            // Randomly change direction
            if (Math.random() < DIRECTION_CHANGE_PROBABILITY) {
                return {
                    ...prev,
                    direction: prev.direction === 'right' ? 'left' : 'right',
                };
            }

            // Randomly change action
            if (Math.random() < ACTION_CHANGE_PROBABILITY) {
                const actions: PetAction[] = ['idle', 'walk', 'play'];
                const newAction = actions[Math.floor(Math.random() * actions.length)];
                return {
                    ...prev,
                    action: newAction,
                };
            }

            return prev;
        });
    }, []);

    const updateStats = useCallback((newStats: Partial<PetStats>) => {
        setState(prev => ({
            ...prev,
            stats: { ...prev.stats, ...newStats },
            mood: calculateMood({ ...prev.stats, ...newStats }),
        }));
    }, []);

    const setAction = useCallback((action: PetAction) => {
        setState(prev => ({ ...prev, action }));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            updateAction();
            updatePosition();
        }, 50);

        return () => clearInterval(interval);
    }, [updateAction, updatePosition]);

    return {
        state,
        updateStats,
        setAction,
    };
};

export default usePetBehavior; 