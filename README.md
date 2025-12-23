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

1. Backend (FastAPI)
   - Ensure the backend service is running on http://localhost:3001 with CORS enabled for http://localhost:3000.
   - Endpoints expected by the frontend:
     - Trips: GET/POST /trips, PUT/DELETE /trips/{id}
     - Itinerary: GET/POST /trips/{id}/itinerary, PUT/DELETE /trips/{id}/itinerary/{itemId}
     - Destinations search (mock): GET /search/destinations?q=term

2. Frontend (React)
   - cd travel_planner_frontend
   - cp .env.example .env  (optional, defaults to http://localhost:3001)
   - npm install
   - npm start (runs at http://localhost:3000)

## Environment Variables

Frontend:
- REACT_APP_API_BASE_URL: Base URL of backend (default http://localhost:3001)

Backend:
- Refer to backend README/env for database and other runtime variables, if any.

## CORS

Backend must allow:
- Origin: http://localhost:3000
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: true