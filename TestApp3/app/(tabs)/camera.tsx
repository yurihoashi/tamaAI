import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MealScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [classification, setClassification] = useState<string | null>(null);

    // Request camera permissions when component mounts
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

                if (status !== 'granted' || cameraStatus.status !== 'granted') {
                    Alert.alert(
                        'Sorry, we need camera permissions to make this work!',
                        'Please enable camera access in your device settings.',
                        [{ text: 'OK' }]
                    );
                }
            }
        })();
    }, []);

    const takePicture = async () => {
        try {
            // Launch camera with ImagePicker, without editing/cropping
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
                await classifyMeal(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to take picture. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const pickImage = async () => {
        try {
            // Launch image library
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
                await classifyMeal(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to pick image. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const classifyMeal = async (imageUri: string) => {
        try {
            setClassification('Processing...');

            // Create form data to send the image
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg', // or 'image/png'
                name: 'meal.jpg'
            } as any);

            // Send to your FastAPI backend
            const response = await fetch('http://localhost:8000/analyse-food', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setClassification(data.classification);
        } catch (error) {
            console.error('Error sending image:', error);
            setClassification('Error classifying meal');
            Alert.alert(
                'Error',
                'Failed to classify meal. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Track Your Meal</Text>

                {image && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: image }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {classification && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultText}>
                            Classification: {classification}
                        </Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={takePicture}
                    >
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={pickImage}
                    >
                        <Text style={styles.buttonText}>Pick from Gallery</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 4 / 3,
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    resultContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
    },
    resultText: {
        fontSize: 18,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
});