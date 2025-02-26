# DEPRECATED (Not maintained any more)

# Gibble AI: Voice-Activated Product Navigator

Ever wished your customers could navigate your product effortlessly—whether it's a complex video editor or an intricate pricing matrix—without overwhelming your support team? Gibble AI is the ultimate voice-activated guide for your product, providing instant conversational answers to users' questions like:
- **"Does this feature exist?"**
- **"How do I do this?"**
- **"Show me an interactive demo."**

### Key Features
- **AI-powered voice assistant** to answer user queries instantly.
- **Interactive demo guidance** for users who get stuck using your platform.

## Installation Guide

### 1. Set Up the Frontend
```bash
cd frontend
npm install
```

Copy the example environment file and configure your variables:
```bash
cp .env.example .env
```

Start the development server:
```bash
npm run dev
```

### 2. Set Up the Backend
Navigate to the backend repository:
```bash
cd backend
```

### 3. Run the LiveKit Server
Build the Docker image:
```bash
docker build -t livekit-server:latest .
```

Run the LiveKit agent with the required API keys:
```bash
docker run -e DEEPGRAM_API_KEY=your_deepgram_api_key \
            -e LIVEKIT_API_KEY=your_livekit_api_key \
            -e LIVEKIT_API_SECRET=your_livekit_api_secret \
            -e LIVEKIT_URL=your_livekit_url \
            -e OPENAI_API_KEY=your_openai_api_key \
            -e ELEVEN_API_KEY=your_eleven_api_key \
            livekit-server
```

### 4. You're Ready to Go!
Your voice-activated product assistant is now running. Users can receive instant voice-based answers and interactive guidance to navigate your product seamlessly.

