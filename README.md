# SyncBeat

SyncBeat is a real-time collaborative music synchronization platform where users can listen to music together in shared rooms with synchronized playback. The platform combines WebSockets, AI-powered recommendations, and cloud deployment to create a social listening experience.

Users can create rooms, invite others, sync playback actions in real time, manage shared queues, chat live, and receive AI-generated song recommendations using Gemini API.

This is an educational and collaborative music synchronization project created for learning real-time full-stack application development.

---

# Submission Links

* 🔗 Live Application: https://syncbeat-513687979801.us-west1.run.app/
* 💻 GitHub Repository: https://github.com/kusheen8/SyncBeat
* 📝 Medium: Add your Medium article link here
* 💼 LinkedIn: Add your LinkedIn profile link here

---

# Features

* Real-time synchronized playback
* Shared listening rooms
* Live play/pause/seek synchronization
* Shared music queue system
* Real-time room chat
* Typing indicators
* Gemini AI-powered music recommendations
* Socket.IO-based communication
* REST APIs + WebSocket architecture
* Responsive UI
* Google AI Studio integration
* Cloud Run deployment

---

# Tech Stack

## Frontend

* React
* Vite
* TypeScript
* CSS

## Backend

* Node.js
* Express.js
* Socket.IO

## AI Integration

* Gemini API
* Google AI Studio

## Deployment

* Google Cloud Run

---

# Quick Start

## Requirements

* Node.js 18 or newer
* npm

---

## Install Dependencies

```bash id="a7k3we"
npm install
```

---

## Run Development Server

```bash id="h2u9ql"
npm run dev
```

---

## Build Project

```bash id="3v8pmf"
npm run build
```

---

## Start Production Server

```bash id="tz8l2n"
npm start
```

---

# Environment Variables

Create a local `.env` file:

```env id="rx4c6k"
GEMINI_API_KEY=your_real_gemini_key
PORT=3000
NODE_ENV=production
```

Never expose `GEMINI_API_KEY` in frontend files, GitHub repositories, or public JavaScript.

---

# Real-Time Synchronization

SyncBeat uses Socket.IO for low-latency real-time communication between connected users.

Implemented events:

* `join_room`
* `leave_room`
* `play_song`
* `pause_song`
* `seek_song`
* `add_to_queue`
* `room_chat`
* `typing_status`

The server maintains synchronized room states including:

* current song
* playback position
* playback state
* queue updates

Users joining a room automatically receive the latest synchronized playback state.

---

# AI Recommendation System

SyncBeat integrates Gemini AI for music recommendations.

The recommendation system:

* analyzes liked songs
* identifies listening patterns
* generates similar recommendations
* returns structured recommendation data

API Route:

```bash id="p2d0lb"
GET /api/recommendations
```

Gemini runs securely through the backend server and API keys are never exposed to the frontend.

---

# API Routes

## Health Check

```bash id="0cw1po"
GET /api/health
```

Returns server status.

---

## Songs API

```bash id="k3g6sa"
GET /api/songs
```

Returns available songs.

---

## Room Creation API

```bash id="ydl0hf"
POST /api/rooms
```

Creates collaborative listening rooms.

---

# Project Structure

```bash id="hzx7nq"
src/
  components/
  pages/
  hooks/
  data/
  styles/

server/
  server.ts

public/

dist/
```

---

# Code Quality

* Modular frontend architecture
* Reusable components
* Real-time event-driven backend
* Production-ready deployment structure
* Socket-based synchronization logic
* Secure environment variable handling
* AI integration through backend APIs
* Lightweight and scalable architecture

---

# Security

Implemented security practices:

* Server-side Gemini API usage
* Environment variable protection
* Controlled WebSocket events
* CORS configuration
* Request validation
* No frontend API key exposure

---

# Accessibility

Implemented:

* Responsive UI
* Mobile-friendly layout
* Keyboard-accessible controls
* Readable interface structure
* Accessible interaction flow

---

# Google AI Studio Integration

SyncBeat integrates Gemini AI using Google AI Studio for:

* AI-powered recommendation workflows
* backend AI processing
* secure API integrations

---

# Google Cloud Run Deployment

SyncBeat is deployed using Google Cloud Run.

The backend automatically listens on:

```js id="2m4v8k"
process.env.PORT || 3000
```

Cloud Run provides:

* HTTPS hosting
* automatic scaling
* production container deployment
* secure backend hosting

---

# Deployment Workflow

Production deployment flow:

1. Build frontend assets
2. Start Express backend
3. Serve static frontend files
4. Maintain WebSocket connections through Cloud Run
5. Handle AI requests securely through backend APIs

---

# Testing Flow

1. Open the live application
2. Create or join a room
3. Start synchronized playback
4. Test play/pause synchronization
5. Test seek synchronization
6. Add songs to queue
7. Send chat messages
8. Test typing indicators
9. Generate AI recommendations

---

# Future Improvements

* Spotify integration
* User authentication
* Persistent room storage
* Collaborative playlists
* Voice chat
* Friend system
* Mobile application
* Playlist history
* Database integration
* Admin moderation tools

---

# Deployment Notes

SyncBeat was built and deployed using:

* Google AI Studio
* Gemini API
* Google Cloud Run

The production server:

* serves frontend assets
* handles WebSocket communication
* processes AI recommendations
* manages synchronized room states

---

# Disclaimer

SyncBeat is a collaborative educational/demo music synchronization platform created for learning real-time full-stack development, WebSocket communication, AI integration, and cloud deployment workflows.
