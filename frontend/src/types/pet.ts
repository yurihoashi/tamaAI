export interface PetStats {
    health: number;
    happiness: number;
    energy: number;
    hunger: number;
}

export type PetMood = 'happy' | 'neutral' | 'sad';

export type PetAction = 'idle' | 'walk' | 'eat' | 'sleep' | 'play';

export interface PetState {
    mood: PetMood;
    action: PetAction;
    direction: 'left' | 'right';
    position: { x: number; y: number };
    stats: PetStats;
}

export interface PetSprite {
    action: PetAction;
    mood: PetMood;
    direction: 'left' | 'right';
    frameCount: number;
    frameWidth: number;
    frameHeight: number;
    frameDuration: number; // milliseconds
} 