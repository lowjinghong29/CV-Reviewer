# AI CV Coach - Development Setup

This document provides instructions on how to set up and run the AI CV Coach application locally for development. The project is structured with a React/Vite frontend and a Node.js/Express backend.

## Prerequisites

- Node.js (v18 or later)
- npm (or pnpm/yarn)

## 1. Installation

The project contains two separate packages: one for the frontend (in the root directory) and one for the backend (in the `/backend` directory). You need to install dependencies for both.

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend
npm install
cd ..
```

## 2. Environment Variables

The backend requires an API key for the Google Gemini API.

1.  Navigate to the `/backend` directory.
2.  Create a new file named `.env`.
3.  Add the following variables to the `.env` file:

    ```env
    # Your Google Gemini API Key
    # This is required for the application to function.
    API_KEY="YOUR_GEMINI_API_KEY"

    # The port for the backend server to run on.
    # The frontend is configured to connect to this port.
    PORT=8080
    ```

    Replace `"YOUR_GEMINI_API_KEY"` with your actual key.

## 3. Running the Application

You need to run two separate commands in two separate terminal windows to start both the frontend and backend development servers.

**Terminal 1: Start the Backend Server**

```bash
# Navigate to the backend directory
cd backend

# Start the development server (uses ts-node-dev for hot-reloading)
npm run dev
```

The backend API will now be running at `http://localhost:8080`.

**Terminal 2: Start the Frontend Server**

```bash
# From the project root directory
npm run dev
```

The frontend React application will now be running. Vite will typically start it at `http://localhost:5173`.

## 4. Accessing the App

Open your web browser and navigate to the frontend URL provided by Vite (usually **http://localhost:5173**).

You can now use the application. Upload a CV to get started!
