import React, { useState } from 'react';
import {
    Button,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import styled from '@emotion/styled';
import { analyzeFood } from '../api/client';

const UploadContainer = styled(Paper)`
    padding: 16px;
    text-align: center;
    margin-bottom: 16px;
`;

const PreviewImage = styled.img`
    max-width: 300px;
    max-height: 300px;
    margin: 16px 0;
    border-radius: 8px;
`;

const HiddenInput = styled.input`
    display: none;
`;

interface FoodUploadProps {
    onAnalysisComplete?: (result: {
        foodType: string;
        confidence: number;
        calories: number;
        nutritionScore: number;
    }) => void;
}

const FoodUpload: React.FC<FoodUploadProps> = ({ onAnalysisComplete }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        setSelectedFile(file);
        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError('');

        try {
            const result = await analyzeFood(selectedFile);
            if (onAnalysisComplete) {
                onAnalysisComplete(result);
            }
            // Clear the form
            setSelectedFile(null);
            setPreview('');
        } catch (err) {
            setError('Failed to analyze food. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UploadContainer>
            <Typography variant="h6" gutterBottom>
                Upload Food Picture
            </Typography>

            <Box sx={{ my: 2 }}>
                <Button
                    variant="contained"
                    component="label"
                    disabled={loading}
                >
                    Choose Picture
                    <HiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                </Button>
            </Box>

            {preview && (
                <Box>
                    <PreviewImage src={preview} alt="Food preview" />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Analyze Food'
                    )}
                </Button>
            </Box>
        </UploadContainer>
    );
};

export default FoodUpload; 