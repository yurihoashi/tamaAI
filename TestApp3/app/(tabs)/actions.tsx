import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  color: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onPress, color }) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: color }]} 
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export default function ActionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet Actions</Text>
      <View style={styles.buttonGrid}>
        <ActionButton 
          label="Feed" 
          color="#FF6B6B"
          onPress={() => {
            // TODO: Implement feeding action
          }} 
        />
        <ActionButton 
          label="Play" 
          color="#50fa7b"
          onPress={() => {
            // TODO: Implement playing action
          }} 
        />
        <ActionButton 
          label="Sleep" 
          color="#4169E1"
          onPress={() => {
            // TODO: Implement sleeping action
          }} 
        />
        <ActionButton 
          label="Exercise" 
          color="#FFD700"
          onPress={() => {
            // TODO: Implement exercise action
          }} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'pixel-font',
    marginBottom: 30,
    color: '#000',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#000',
    margin: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 24,
    fontFamily: 'pixel-font',
    textTransform: 'uppercase',
  },
}); 