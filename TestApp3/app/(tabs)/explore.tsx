import React, { useState } from 'react';

import {
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PixelToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
}

const PixelToggle: React.FC<PixelToggleProps> = ({ value, onValueChange }) => (
    <Pressable
        style={[
            styles.toggle,
            value ? styles.toggleActive : styles.toggleInactive
        ]}
        onPress={() => onValueChange(!value)}
    >
        <View style={[
            styles.toggleHandle,
            value ? styles.toggleHandleActive : styles.toggleHandleInactive
        ]} />
    </Pressable>
);

export default function SettingsScreen() {
    const [petName, setPetName] = useState('My Pet');
    const [bedtime, setBedtime] = useState('22:00');
    const [unhealthyMealsLimit, setUnhealthyMealsLimit] = useState('3');
    const [notifications, setNotifications] = useState(true);
    const [screenTimeTracking, setScreenTimeTracking] = useState(true);

    const saveSettings = () => {
        // TODO: Implement settings save functionality
        alert('Settings saved!');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Settings</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pet Settings</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Pet Name</Text>
                        <TextInput
                            style={styles.input}
                            value={petName}
                            onChangeText={setPetName}
                            placeholder="Enter pet name"
                            placeholderTextColor="#666"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Goals</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Bedtime</Text>
                        <TextInput
                            style={styles.input}
                            value={bedtime}
                            onChangeText={setBedtime}
                            placeholder="HH:MM"
                            placeholderTextColor="#666"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Weekly Unhealthy Meals Limit</Text>
                        <TextInput
                            style={styles.input}
                            value={unhealthyMealsLimit}
                            onChangeText={setUnhealthyMealsLimit}
                            keyboardType="numeric"
                            placeholder="Enter number"
                            placeholderTextColor="#666"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Settings</Text>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.label}>Enable Notifications</Text>
                        <PixelToggle
                            value={notifications}
                            onValueChange={setNotifications}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.label}>Screen Time Tracking</Text>
                        <PixelToggle
                            value={screenTimeTracking}
                            onValueChange={setScreenTimeTracking}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveSettings}
                >
                    <Text style={styles.saveButtonText}>Save Settings</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: 'pixel-font',
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    sectionTitle: {
        fontSize: 24,
        marginBottom: 15,
        fontFamily: 'pixel-font',
        color: '#000',
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'pixel-font',
        color: '#000',
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#000',
        fontFamily: 'pixel-font',
        fontSize: 16,
        color: '#000',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    saveButton: {
        backgroundColor: '#50fa7b',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 2,
        borderColor: '#000',
    },
    saveButtonText: {
        color: '#000',
        fontSize: 20,
        fontFamily: 'pixel-font',
    },
    toggle: {
        width: 52,
        height: 32,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#50fa7b',
    },
    toggleInactive: {
        backgroundColor: '#767577',
    },
    toggleHandle: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#000',
    },
    toggleHandleActive: {
        backgroundColor: '#2a2a2a',
        alignSelf: 'flex-end',
    },
    toggleHandleInactive: {
        backgroundColor: '#f4f3f4',
        alignSelf: 'flex-start',
    },
}); 
