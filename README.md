# TamaAI - Your Digital Wellness Companion

TamaAI is a mobile application that combines the nostalgic charm of Tamagotchi with modern health tracking technology. The app helps users maintain healthy lifestyle habits through an interactive virtual pet that responds to their daily activities and choices.

## Core Concept

TamaAI transforms health tracking into an engaging experience by:
- Creating a virtual pet that evolves based on your lifestyle choices
- Using gamification to encourage healthy habits
- Providing real-time feedback on your daily activities
- Making health tracking fun and interactive

## Detailed Features

### 1. Virtual Pet System
- **Dynamic Pet**: Your pet's appearance and mood change based on your health habits
- **Pet Stats**: Track your pet's happiness, diet, sleep, and exercise levels
- **Interactive Elements**: Pet responds to your daily activities and choices
- **Customization**: Personalize your pet's name and appearance

### 2. Health Tracking Features

#### Meal Tracking
- **Smart Food Recognition**: Take photos of your meals to automatically identify food items using computer vision
- **Manual Editing**: Edit food descriptions if the automatic recognition isn't accurate
- **Nutritional Analysis**: Get insights about your meal choices
- **Diet History**: Track your eating patterns over time

#### Sleep Management
- **Sleep Schedule Logging**: Record your sleep and wake times
- **24-Hour Format**: Easy time input with automatic formatting
- **Sleep Pattern Analysis**: Track your sleep consistency
- **Sleep Quality Monitoring**: Analyze your sleep habits

#### Exercise Tracking
- **Duration Tracking**: Log exercise sessions in minutes
- **Activity Logging**: Record different types of physical activities
- **Progress Monitoring**: Track your exercise consistency
- **Achievement System**: Earn rewards for maintaining regular exercise

### 3. Statistics and Analytics
- **Visual Dashboard**: View your health metrics in an easy-to-understand format
- **Happiness Chart**: Track your pet's happiness level with interactive pie charts
- **Progress Tracking**: Monitor your health journey over time
- **Achievement System**: Unlock achievements for maintaining healthy habits

### 4. User Interface
- **Pixel Art Style**: Retro-inspired design with modern functionality
- **Intuitive Navigation**: Easy-to-use tab-based interface
- **Responsive Design**: Works seamlessly on both iOS and Android
- **Keyboard-Aware**: Input fields automatically adjust when keyboard appears

## How It Works

1. **Daily Interaction**:
   - Log your meals by taking photos
   - Record your sleep schedule
   - Track your exercise minutes
   - Watch your pet respond to your choices

2. **Health Monitoring**:
   - The app analyzes your habits
   - Provides feedback through your pet's behavior
   - Tracks progress towards health goals
   - Suggests improvements based on patterns

3. **Achievement System**:
   - Complete daily health tasks
   - Maintain consistent routines
   - Earn achievements and rewards
   - Watch your pet grow and evolve

## Technical Integration

The app uses a FastAPI backend to:
- Process food images and provide nutritional information
- Track and analyze sleep patterns
- Monitor exercise consistency
- Manage achievement progress
- Store user data and preferences

## Why TamaAI?

- **Motivation**: The virtual pet provides constant motivation to maintain healthy habits
- **Engagement**: Gamification makes health tracking fun and engaging
- **Accountability**: Your pet's well-being depends on your choices
- **Progress**: Visual feedback helps track your health journey
- **Customization**: Personalize your experience with your own virtual companion

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.8+)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

## Development

1. Start the backend server:
   ```bash
   cd backend
   python main.py
   ```

2. Start the Electron app:
   ```bash
   cd frontend
   npm run dev
   ```

## Future Development

Planned features include:
- Social features to connect with other users
- More detailed nutritional analysis
- Advanced sleep tracking with smart alarms
- Exercise type categorization
- Pet customization options
- Health insights and recommendations

## Support

For support, feature requests, or bug reports, please open an issue in the repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
