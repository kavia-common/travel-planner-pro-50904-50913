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
   - `cp .env.example .env` (optional) and adjust values if needed
   - `npm start` — dev server at http://localhost:3000

### Preview environments and "Invalid Host header"

Some preview environments access the dev server via a non-localhost host/URL and CRA may show "Invalid Host header".
To allow the preview host in development only:

- Preferred: set environment variable in `.env`:
  - `DANGEROUSLY_DISABLE_HOST_CHECK=true`
- Or use the provided start script:
  - `npm run start:insecure-host`

These options are for development/preview only. Do not enable host check bypass in production.

### Dev proxy (optional)
This project includes `"proxy": "http://localhost:3001"` in `package.json` to help in environments where CORS is blocked.
- Default approach (CORS): keep `REACT_APP_API_BASE_URL` set (or rely on default http://localhost:3001); requests go cross-origin with CORS.
- Proxy approach: unset `REACT_APP_API_BASE_URL` and modify the API client to use relative paths if you need to force proxying. The current client uses absolute URLs intentionally to work well without proxy. Use this only if your environment requires it.

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
