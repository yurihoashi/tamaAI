import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import styled from '@emotion/styled';
import usePetBehavior from '../hooks/usePetBehavior';
import { PetStats } from '../types/pet';

const PetContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 64px;
  height: 64px;
  -webkit-app-region: drag;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: scale(2);
`;

const PetSprite = styled.div<{ mood: string; action: string; direction: 'left' | 'right' }>`
  width: 32px;
  height: 32px;
  background-color: ${props => {
        switch (props.mood) {
            case 'happy': return '#FFD700';
            case 'neutral': return '#87CEEB';
            case 'sad': return '#A9A9A9';
            default: return '#FFD700';
        }
    }};
  border: 2px solid #000;
  border-radius: 50%;
  position: relative;
  transform: ${props => props.direction === 'left' ? 'scaleX(-1)' : 'none'};
  animation: ${props => {
        switch (props.action) {
            case 'walk': return 'bounce 0.5s infinite alternate';
            case 'play': return 'jump 0.5s infinite alternate';
            case 'sleep': return 'none';
            default: return 'idle 2s infinite';
        }
    }};

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background-color: inherit;
    border: 2px solid #000;
    border-radius: 50%;
  }

  &::after {
    content: '${props => props.action === 'sleep' ? 'z' : ''}';
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 12px;
    font-weight: bold;
  }

  @keyframes bounce {
    from { transform: translateY(0) ${props => props.direction === 'left' ? 'scaleX(-1)' : 'none'}; }
    to { transform: translateY(-4px) ${props => props.direction === 'left' ? 'scaleX(-1)' : 'none'}; }
  }

  @keyframes jump {
    from { transform: translateY(0) ${props => props.direction === 'left' ? 'scaleX(-1)' : 'none'}; }
    to { transform: translateY(-8px) ${props => props.direction === 'left' ? 'scaleX(-1)' : 'none'}; }
  }

  @keyframes idle {
    0%, 100% { transform: scale(1) ${props => props.direction === 'left' ? 'scaleX(-1)' : 'none'}; }
    50% { transform: scale(1.1) ${props => props.direction === 'left' ? 'scaleX(-1)' : 'none'}; }
  }
`;

const StatsContainer = styled.div`
  position: absolute;
  top: -40px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 8px;
  color: white;
  font-size: 12px;
  -webkit-app-region: no-drag;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PetContainer}:hover & {
    opacity: 1;
  }
`;

const Pet: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const { state, updateStats: updatePetStats } = usePetBehavior({
        health: 100,
        happiness: 100,
        energy: 100,
        hunger: 100,
    });

    useEffect(() => {
        const decreaseStats = () => {
            const newStats: Partial<PetStats> = {
                hunger: Math.max(0, state.stats.hunger - 0.1),
                energy: Math.max(0, state.stats.energy - 0.05),
                happiness: Math.max(0, state.stats.happiness - 0.03),
            };
            updatePetStats(newStats);
        };

        const interval = setInterval(decreaseStats, 1000);
        return () => clearInterval(interval);
    }, [state.stats, updatePetStats]);

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

    return (
        <PetContainer
            x={state.position.x}
            y={state.position.y}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <PetSprite
                mood={state.mood}
                action={state.action}
                direction={state.direction}
            />
            <StatsContainer>
                <div>Health: {Math.round(state.stats.health)}%</div>
                <div>Happiness: {Math.round(state.stats.happiness)}%</div>
                <div>Energy: {Math.round(state.stats.energy)}%</div>
                <div>Hunger: {Math.round(state.stats.hunger)}%</div>
            </StatsContainer>
        </PetContainer>
    );
};

export default Pet; 