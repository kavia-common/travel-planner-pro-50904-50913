# Travel Planner Frontend (React)

This project is a lightweight React frontend for the Travel Planner app with a clean, modern UI and minimal dependencies.

## Features

- Sidebar listing trips with add/rename/delete
- Main area with itinerary builder and sections:
  - Destinations
  - Accommodations
  - Transport
  - Notes
- Modal dialogs to add/edit entries
- Optimistic UI updates for create/update/delete
- Lightweight API client with configurable base URL

## Environment Variables

Create a `.env` file (or copy `.env.example`) in the project root with:
```
REACT_APP_API_BASE_URL=http://localhost:3001
```

- If not provided, the app falls back to `http://localhost:3001`.
- The API client uses CORS with credentials enabled and assumes the backend enables CORS for http://localhost:3000.

## Development

1. Start backend (FastAPI) on port 3001.
2. Start frontend:
   - `npm install`
   - `npm start` — dev server at http://localhost:3000

Optional: Development proxy is not required when setting REACT_APP_API_BASE_URL to http://localhost:3001 because the API client calls the full URL directly with CORS. If your environment blocks CORS and you prefer a proxy, you may add `"proxy": "http://localhost:3001"` to `package.json`, then remove REACT_APP_API_BASE_URL to rely on the relative path approach.

## Testing and Build

- `npm test` — run tests
- `npm run build` — production build

## Backend Connectivity

- The frontend calls these endpoints on the backend:
  - `GET /trips`, `POST /trips`, `PUT /trips/{id}`, `DELETE /trips/{id}`
  - `GET /trips/{id}/itinerary`, `POST /trips/{id}/itinerary`,
    `PUT /trips/{id}/itinerary/{itemId}`, `DELETE /trips/{id}/itinerary/{itemId}`
  - `GET /search/destinations?q=term` (mocked in backend)

Ensure the backend CORS configuration allows:
- Origin: http://localhost:3000
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: true

If the backend is on a non-default host/port, set `REACT_APP_API_BASE_URL` accordingly.
