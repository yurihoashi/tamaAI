import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import styled from '@emotion/styled';

interface PetStats {
    health: number;
    happiness: number;
    energy: number;
    hunger: number;
}

const PetContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  -webkit-app-region: drag;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const PetSprite = styled.div<{ mood: string }>`
  width: 64px;
  height: 64px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
  cursor: pointer;
  -webkit-app-region: no-drag;
`;

const StatsContainer = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
  color: white;
  font-size: 12px;
  -webkit-app-region: no-drag;
`;

const Pet: React.FC = () => {
    const [stats, setStats] = useState<PetStats>({
        health: 100,
        happiness: 100,
        energy: 100,
        hunger: 100,
    });

    const [showStats, setShowStats] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateStats = () => {
            // Decrease stats over time
            setStats(prev => ({
                ...prev,
                hunger: Math.max(0, prev.hunger - 0.1),
                energy: Math.max(0, prev.energy - 0.05),
                happiness: Math.max(0, prev.happiness - 0.03),
            }));
        };

        const interval = setInterval(updateStats, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;
            ipcRenderer.send('pet-window-drag', { mouseX: deltaX, mouseY: deltaY });
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const getMood = (): string => {
        const average = (stats.health + stats.happiness + stats.energy + stats.hunger) / 4;
        if (average > 75) return 'happy';
        if (average > 50) return 'neutral';
        return 'sad';
    };

    return (
        <PetContainer
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <PetSprite
                mood={getMood()}
                onClick={() => setShowStats(!showStats)}
            />
            {showStats && (
                <StatsContainer>
                    <div>Health: {Math.round(stats.health)}%</div>
                    <div>Happiness: {Math.round(stats.happiness)}%</div>
                    <div>Energy: {Math.round(stats.energy)}%</div>
                    <div>Hunger: {Math.round(stats.hunger)}%</div>
                </StatsContainer>
            )}
        </PetContainer>
    );
};

export default Pet; 