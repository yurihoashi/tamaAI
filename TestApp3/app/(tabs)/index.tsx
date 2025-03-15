import { View, Text, StyleSheet, Image, Dimensions } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { constants } from 'buffer';


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const appTitle = "PET NAME"
// Asset constants
const ASSETS = {
  images: {
    pet: require('../../assets/images/abbussy_cat.png'),
  },
  fonts: {
    pixel: require('../../assets/fonts/Pixeboy.ttf'),
  }
} as const;

// Color constants
const COLORS = {
  healthy: '#50fa7b',    // Green for good status
  warning: '#FFD700',    // Yellow for warning
  danger: '#FF6B6B',     // Red for danger
} as const;

const getStatColor = (value: number): string => {
  if (value <= 20) return COLORS.danger;
  if (value <= 50) return COLORS.warning;
  return COLORS.healthy;
};

interface StatBarProps {
    label: string;
    value: number;
    color: string;
}

interface Stats {
    happiness: number;
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
    happiness: 80,
    diet: 50,
    sleep: 60,
    exercise: 40,
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
        happiness: Math.max(MIN_STAT, prevStats.happiness - (DECAY_RATE / 6)),
        diet: prevStats.diet, 
        sleep: Math.max(MIN_STAT, prevStats.sleep - (DECAY_RATE / 3)),
        exercise: Math.max(MIN_STAT, prevStats.exercise - (DECAY_RATE / 5)),
      }));
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  // Auto-sleep when happiness is low
  useEffect(() => {
    if (stats.happiness < 20) {
      updateStat('sleep', 30);
      updateStat('happiness', 20);
    }
  }, [stats.happiness]);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'pixel-font': ASSETS.fonts.pixel,
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
        <Text style={styles.text}>{appTitle}</Text>
        <View style={styles.statsContainer}>
          <StatBar label="Happiness" value={stats.happiness} color={getStatColor(stats.happiness)} />
          <StatBar label="Diet" value={stats.diet} color={getStatColor(stats.diet)} />
          <StatBar label="Sleep" value={stats.sleep} color={getStatColor(stats.sleep)} />
          <StatBar label="Exercise" value={stats.exercise} color={getStatColor(stats.exercise)} />
        </View>
      </View>
      <View style={styles.bottomContent}>
        <Image 
          source={ASSETS.images.pet}
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