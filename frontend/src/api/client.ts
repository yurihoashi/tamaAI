import axios from 'axios';
import { PetStats } from '../types/pet';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface UserSettings {
    sleepTime: string;
    wakeTime: string;
    screenTimeLimit: number;
    unhealthyFoodLimit: number;
}

export const getPetStats = async (): Promise<PetStats> => {
    const response = await api.get<PetStats>('/pet-stats');
    return response.data;
};

export const updateSettings = async (settings: UserSettings): Promise<void> => {
    await api.post('/settings', settings);
};

export const logScreenTime = async (minutes: number): Promise<void> => {
    await api.post('/screen-time', { minutes });
};

export const analyzeFood = async (file: File): Promise<{
    foodType: string;
    confidence: number;
    calories: number;
    nutritionScore: number;
}> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/analyze-food', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export default api; 