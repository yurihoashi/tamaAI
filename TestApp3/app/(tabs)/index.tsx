import { View, Text, StyleSheet, Image, Dimensions } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

interface Stats {
  energy: number;
  diet: number;
  sleep: number;
  exercise: number;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color }) => (
  <View style={styles.statContainer}>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.barContainer}>
      <View style={[styles.bar, { width: `${value}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.statValue}>{Math.round(value)}%</Text>
  </View>
);

const MAX_STAT = 100;
const MIN_STAT = 0;
const DECAY_RATE = 2; // How much stats decrease per minute
const UPDATE_INTERVAL = 10000; // Update every 10 seconds

const app = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [stats, setStats] = useState<Stats>({
    energy: 80,
    diet: 65,
    sleep: 90,
    exercise: 70,
  });

  // Function to update a specific stat
  const updateStat = (statName: keyof Stats, amount: number) => {
    setStats(prevStats => ({
      ...prevStats,
      [statName]: Math.min(MAX_STAT, Math.max(MIN_STAT, prevStats[statName] + amount))
    }));
  };

  // Decay stats over time
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prevStats => ({
        energy: Math.max(MIN_STAT, prevStats.energy - (DECAY_RATE / 6)),
        diet: Math.max(MIN_STAT, prevStats.diet - (DECAY_RATE / 4)),
        sleep: Math.max(MIN_STAT, prevStats.sleep - (DECAY_RATE / 3)),
        exercise: Math.max(MIN_STAT, prevStats.exercise - (DECAY_RATE / 5)),
      }));
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  // Auto-sleep when energy is low
  useEffect(() => {
    if (stats.energy < 20) {
      updateStat('sleep', 30);
      updateStat('energy', 20);
    }
  }, [stats.energy]);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'pixel-font': require('../../assets/fonts/Pixeboy.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.topContent}>
        <Text style={styles.text}>Tamagotchi Style App</Text>
        <View style={styles.statsContainer}>
        {/* FFD700 */}
        {/* #FF6B6B */}
          <StatBar label="Energy" value={stats.energy} color="#50fa7b" />
          <StatBar label="Diet" value={stats.diet} color="#50fa7b" />
          <StatBar label="Sleep" value={stats.sleep} color="#50fa7b" />
          <StatBar label="Exercise" value={stats.exercise} color="#50fa7b" />
        </View>
      </View>
      <View style={styles.bottomContent}>
        <Image 
          source={require('../../assets/images/abbussy_cat.png')}
          style={styles.image}
        />
      </View>
    </View>
  )
}

export default app

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  topContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  bottomContent: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 60, 
  },
  text: {
    color: 'black',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'pixel-font',
    marginBottom: 20,
  },
  image: {
    width: 500,
    height: 500,
    resizeMode: 'contain',
  },
  statsContainer: {
    alignSelf: 'flex-start',
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    width: 80,
    fontFamily: 'pixel-font',
    fontSize: 18,
    color: '#000',
    textTransform: 'uppercase',
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 10,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  bar: {
    height: '100%',
    borderRightWidth: 4,
    borderRightColor: '#000',
  },
  statValue: {
    width: 45,
    fontFamily: 'pixel-font',
    fontSize: 16,
    color: '#000',
    textAlign: 'right',
  },
}) 