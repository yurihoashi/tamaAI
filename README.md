# TamaAI - Your Digital Wellness Companion

A desktop Tamagotchi-style application that helps you maintain healthy lifestyle habits through an interactive virtual pet.

## Features

- 🐱 Persistent desktop pet that responds to your daily habits
- 🥗 Food tracking with image recognition
- 💪 Exercise and screen time management
- 😴 Sleep schedule assistance
- 🎮 Gamified wellness tracking

## Tech Stack

- Frontend: Electron (TypeScript/React)
- Backend: Python (FastAPI)
- Database: Astra DB
- Image Recognition: TensorFlow/PyTorch

## Setup

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

## Project Structure

```
tamaAI/
├── frontend/           # Electron application
│   ├── src/           # Source code
│   ├── assets/        # Images and other static files
│   └── package.json   # Frontend dependencies
├── backend/           # Python backend
│   ├── main.py       # Main application file
│   ├── models/       # ML models and data structures
│   └── api/          # API endpoints
└── README.md         # Project documentation
```
