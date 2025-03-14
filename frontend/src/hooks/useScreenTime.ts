import { useEffect, useCallback } from 'react';
import { logScreenTime } from '../api/client';

const SCREEN_TIME_UPDATE_INTERVAL = 60000; // 1 minute

export const useScreenTime = () => {
    const updateScreenTime = useCallback(async () => {
        try {
            await logScreenTime(1); // Log 1 minute of screen time
        } catch (error) {
            console.error('Failed to log screen time:', error);
        }
    }, []);

    useEffect(() => {
        // Start tracking screen time
        const interval = setInterval(updateScreenTime, SCREEN_TIME_UPDATE_INTERVAL);

        // Clean up
        return () => {
            clearInterval(interval);
        };
    }, [updateScreenTime]);

    return {
        updateScreenTime,
    };
}; 