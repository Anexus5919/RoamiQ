<div align="center">
  
# RoamIQ - AI-Powered Travel Planning Platform

</div>
<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=for-the-badge&logo=react)
![Ollama](https://img.shields.io/badge/Ollama-llama3-000000?style=for-the-badge&logo=llama)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

**Transform your travel dreams into detailed, personalized itineraries with the power of AI**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## 📖 Overview

RoamIQ is an intelligent travel planning platform that leverages **local AI** (Ollama with Llama 3) to generate comprehensive, day-by-day travel itineraries. The application provides real-time travel data, hotel recommendations, weather forecasts, and an interactive 3D globe visualization of your journey.

### ⚠️ **Important: Local Ollama Required**

> **This application requires Ollama running locally on port 11434.**  
> The deployed/production version will only display the frontend UI. For full functionality including AI-powered itinerary generation, you **must** clone this repository and run Ollama with the Llama 3 model on your local machine.

---

## ✨ Features

### 🤖 **AI-Powered Planning**
- **Real-time streaming** AI responses with progress indicators
- **Personalized itineraries** based on interests, budget, and travel style
- **Chain-of-thought display** showing AI reasoning process

### 🗺️ **Interactive Visualizations**
- **3D Globe** with animated flight paths using react-globe.gl
- **Progressive data loading** - see results as they're generated
- **Responsive design** optimized for all devices

### 🌤️ **Real-Time Data Integration**
- **Weather forecasts** for destination cities
- **Hotel recommendations** filtered by budget
- **Travel distance calculations** with multiple transport options
- **Destination highlights** from SerpAPI

### 🎨 **Modern UI/UX**
- **Dark/Light mode** with seamless theme switching
- **Frosted glass effects** and smooth animations
- **shadcn/ui components** for consistent design
- **Lucide React icons** throughout

### 📱 **Smart Features**
- **Suggested trips** with pre-curated destinations
- **Plan new trip** directly from itinerary page
- **Interest tags** with pill-based input system
- **Date range picker** with validation

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15.5.6** - React framework with App Router
- **React 19.1.0** - UI library
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **shadcn/ui** - Component library
- **Lucide React** - Icon system
- **react-globe.gl** - 3D globe visualization

### **Backend & APIs**
- **Ollama** - Local AI inference (Llama 3 model)
- **TomTom API** - Geocoding and routing
- **SerpAPI** - Destination data and highlights
- **OpenWeather API** - Weather forecasts
- **MongoDB** - Database for suggested trips

### **State Management & Utilities**
- **Context API** - Global state management
- **next-themes** - Theme management
- **date-fns** - Date manipulation
- **Mongoose** - MongoDB ODM

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### **Required**
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Ollama** ([Download](https://ollama.ai/))
- **Llama 3 model** for Ollama

### **API Keys** (Required for full functionality)
- **TomTom API Key** - [Get here](https://developer.tomtom.com/)
- **SerpAPI Key** - [Get here](https://serpapi.com/)
- **OpenWeather API Key** - [Get here](https://openweathermap.org/api)
- **MongoDB Connection String** (optional for suggestions feature)

---

## 🚀 Installation

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/Anexus5919/RoamIQ.git
cd RoamIQ
```

### **Step 2: Install Dependencies**

```bash
npm install
# or
yarn install
```

### **Step 3: Set Up Ollama**

1. **Download and install Ollama** from [ollama.ai](https://ollama.ai/)

2. **Pull the Llama 3 model:**
```bash
ollama pull llama3:latest
```

3. **Verify Ollama is running** (should be on port 11434):
```bash
ollama list
```

4. **Test the model:**
```bash
ollama run llama3:latest "Hello, world!"
```

> **Critical:** Ollama must be running on `http://localhost:11434` for the application to generate itineraries.

### **Step 4: Configure Environment Variables**

Create a `.env.local` file in the root directory:

```env
# API Keys
TOMTOM_API_KEY=your_tomtom_api_key_here
SERPAPI_API_KEY=your_serpapi_key_here
OPENWEATHER_API_KEY=your_openweather_key_here

# MongoDB (Optional - for suggestions feature)
MONGODB_URI=your_mongodb_connection_string

# Ollama Configuration (Default)
OLLAMA_BASE_URL=http://localhost:11434
```

### **Step 5: Run the Development Server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Architecture

### **Project Structure**

```
RoamIQ/
├── app/
│   ├── api/                    # API Routes
│   │   ├── itinerary/         # AI itinerary generation endpoint
│   │   ├── suggestions/       # Curated trip suggestions
│   │   └── weather/           # Weather forecast endpoint
│   │
│   ├── components/            # React Components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── ChainOfThoughtDisplay.jsx
│   │   ├── GlobeDisplay.jsx
│   │   ├── ItineraryDisplay.jsx
│   │   ├── ItineraryForm.jsx
│   │   ├── Navbar.jsx
│   │   └── ...
│   │
│   ├── context/              # React Context
│   │   └── ItineraryContext.js
│   │
│   ├── itinerary/            # Itinerary results page
│   │   └── page.js
│   │
│   ├── suggestions/          # Suggested trips page
│   │   └── page.jsx
│   │
│   ├── layout.js             # Root layout
│   ├── page.js               # Landing page
│   ├── providers.jsx         # Context providers
│   └── globals.css           # Global styles
│
├── lib/                      # Utility functions
│   ├── dbConnect.js          # MongoDB connection
│   └── utils.js              # Helper utilities
│
├── models/                   # MongoDB models
│   └── Suggestion.js
│
├── public/                   # Static assets
│
├── .env.local               # Environment variables
└── package.json             # Dependencies
```

### **Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LANDING PAGE (app/page.js)                                 │
│  - ItineraryForm collects user input                        │
│  - Stores formData in ItineraryContext                      │
│  - Navigates to /itinerary                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ITINERARY PAGE (app/itinerary/page.js)                     │
│  - Retrieves formData from context                          │
│  - Displays progress with ChainOfThoughtDisplay             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  API ROUTE (app/api/itinerary/route.js)                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 1. Geocode locations (TomTom API)                       ││
│  │ 2. Calculate routes and distances                       ││
│  │ 3. Fetch destination data (SerpAPI)                     ││
│  │ 4. Generate AI itinerary (Ollama + Llama 3)             ││
│  │ 5. Stream response in real-time                         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  RESULTS DISPLAY                                            │
│  - GlobeDisplay: 3D visualization with flight path          │
│  - WeatherDisplay: Forecast for destination                 │
│  - TravelAnalysisDisplay: Distance & transport options      │
│  - ItineraryDisplay: Day-by-day plan                        │
│  - HotelSuggestions: Budget-filtered recommendations        │
└─────────────────────────────────────────────────────────────┘
```

### **Key Components Relationships**

#### **State Management (Context API)**
```
ItineraryContext
├── itinerary (full itinerary data)
├── formData (user input)
├── isLoading (loading state)
├── error (error messages)
├── streamingText (raw AI output)
└── cotSteps (progress steps)
```

#### **Page Flow**
1. **`/`** (Landing) → User fills form → Navigate to `/itinerary`
2. **`/itinerary`** → Fetch AI data → Display results
3. **`/suggestions`** → Browse curated trips → Select → Auto-fill form

#### **API Integration**
- **TomTom API**: Geocoding, routing, travel time calculations
- **SerpAPI**: Destination highlights, attractions, best time to visit
- **OpenWeather**: Real-time weather forecasts
- **Ollama**: AI-powered itinerary generation with streaming

---

## 🎯 Usage

### **Creating an Itinerary**

1. **Navigate to the landing page** ([http://localhost:3000](http://localhost:3000))
2. **Fill in the form:**
   - **From:** Your starting location
   - **Destination:** Where you want to go
   - **Dates:** Start and end dates
   - **Budget:** Budget, Mid-range, or Luxury
   - **Transport:** Flight, Train, Car, or Any
   - **Interests:** Add tags (food, history, art, etc.)
3. **Click "Build My Itinerary"**
4. **Watch the AI generate** your plan in real-time
5. **View results:** Globe visualization, weather, hotels, and day-by-day itinerary

### **Using Suggested Trips**

1. Click **"I'm Feeling Lucky"** on the landing page
2. Browse curated destinations (Kyoto, Rome, Paris, etc.)
3. Click any card to auto-fill the form with that destination

### **Planning Another Trip**

From any itinerary page:
- Click **"Plan a New Trip"** button in the navbar
- Returns to landing page with fresh form

---

## 🔑 Environment Variables

Create a `.env.local` file with these variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TOMTOM_API_KEY` | TomTom API key for geocoding | ✅ Yes | - |
| `SERPAPI_API_KEY` | SerpAPI key for destination data | ✅ Yes | - |
| `OPENWEATHER_API_KEY` | OpenWeather API key for forecasts | ✅ Yes | - |
| `MONGODB_URI` | MongoDB connection string | ⚠️ Optional | - |
| `OLLAMA_BASE_URL` | Ollama server URL | ⚠️ Optional | `http://localhost:11434` |

---

## 🐳 Deployment Notes

### **Important Considerations**

1. **Ollama Requirement:**
   - Ollama **must** run locally on the user's machine
   - Cannot be deployed to serverless platforms (Vercel, Netlify, etc.)
   - Consider self-hosting on VPS/dedicated server with Ollama installed

2. **Alternative AI Options:**
   - Replace Ollama with OpenAI API for cloud deployment
   - Use Anthropic Claude API
   - Integrate with other LLM providers

3. **Database:**
   - MongoDB is optional (only for suggestions feature)
   - Can remove if not needed

### **Self-Hosting with Ollama**

If deploying to a VPS:

```bash
# Install Ollama on server
curl https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama3:latest

# Run as service
ollama serve

# Deploy Next.js app
npm run build
npm start
```

---

## 👨‍💻 Developer

**Adarsh Singh**

- GitHub: [@Anexus5919](https://github.com/Anexus5919)
- LinkedIn: [linkedin.com/in/anexus](https://www.linkedin.com/in/anexus/)
- Email: anexus5919@gmail.com

---

## 🎓 Developed For

**Gradguide by Computrain**

---

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Anexus5919-181717?style=for-the-badge&logo=github)](https://github.com/Anexus5919)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-anexus-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/anexus/)

</div>