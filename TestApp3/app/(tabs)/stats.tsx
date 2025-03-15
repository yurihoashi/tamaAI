import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';

export default function StatsPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Statistics</Text>
        
        {/* Daily Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Overview</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Time Active:</Text>
            <Text style={styles.statValue}>4h 30m</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Meals:</Text>
            <Text style={styles.statValue}>3</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Exercise:</Text>
            <Text style={styles.statValue}>2 sessions</Text>
          </View>
        </View>

        {/* Achievement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementRow}>
            <Text style={styles.achievementTitle}>Early Bird</Text>
            <Text style={styles.achievementDesc}>Wake up before 7 AM</Text>
          </View>
          <View style={styles.achievementRow}>
            <Text style={styles.achievementTitle}>Fitness Freak</Text>
            <Text style={styles.achievementDesc}>Exercise 3 days in a row</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'pixel-font',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'pixel-font',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statLabel: {
    fontSize: 16,
    fontFamily: 'pixel-font',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'pixel-font',
  },
  achievementRow: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'pixel-font',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'pixel-font',
  },
}); 