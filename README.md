# travel-planner-pro-50904-50913

This repository contains the Travel Planner multi-container project:
- Frontend: React app in travel_planner_frontend (port 3000)
- Backend: FastAPI app (port 3001)

The frontend includes:
- Sidebar listing trips
- Itinerary builder main area
- Modals to add/edit destinations, accommodations, transport, and notes
- Lightweight API client using REACT_APP_API_BASE_URL (defaults to http://localhost:3001)

## Getting Started

1) Start Backend (FastAPI)
- Ensure the FastAPI backend runs at http://localhost:3001 and has CORS enabled for http://localhost:3000.
- Endpoints expected by the frontend:
  - Trips: GET/POST /trips, PUT/DELETE /trips/{id}
  - Itinerary: GET/POST /trips/{id}/itinerary, PUT/DELETE /trips/{id}/itinerary/{itemId}
  - Destinations search (mock): GET /search/destinations?q=term

2) Start Frontend (React)
- cd travel_planner_frontend
- Optional: cp .env.example .env and adjust REACT_APP_API_BASE_URL (defaults to http://localhost:3001)
- If using a preview host (non-localhost) and you see "Invalid Host header":
  - Preferred: ensure `.env` includes `DANGEROUSLY_DISABLE_HOST_CHECK=true` (development only)
  - Or run `npm run start:insecure-host`
- npm install
- npm start (dev server at http://localhost:3000)

## End-to-End Flow Checklist

- Create a trip (sidebar “+ Add”)
- Load trips list (visible in sidebar)
- Select a trip (click a list item)
- Add itinerary items (Destinations, Accommodations, Transport, Notes)
- Edit/Delete items
- Loading and error states are surfaced in the main area (e.g., “Loading itinerary…”, error banner)

## Environment Variables

Frontend (.env in travel_planner_frontend):
- REACT_APP_API_BASE_URL=http://localhost:3001  (default used if not set)

Backend:
- Refer to backend README/env for database and other runtime variables. Defaults typically use local SQLite.

## CORS

Keep backend CORS as currently configured. It should allow:
- Origin: http://localhost:3000
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: true

## Development Proxy (optional)

If your environment blocks cross-origin requests during development, you can rely on the built-in development proxy in the React app:
- The frontend package.json includes: `"proxy": "http://localhost:3001"`
- Option A (CORS mode): Set REACT_APP_API_BASE_URL to the backend origin (e.g., http://localhost:3001). Requests go cross-origin via CORS.
- Option B (Proxy mode): Unset REACT_APP_API_BASE_URL (or avoid referencing it) and use relative paths in the API client to route via the dev proxy. In this project we keep absolute URLs by default; change only if your environment needs it.