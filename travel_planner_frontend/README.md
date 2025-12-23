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
If not provided, the app falls back to `http://localhost:3001`.

## Development

- `npm start` — start dev server at http://localhost:3000
- `npm test` — run tests
- `npm run build` — production build

## Notes

- Backend endpoints will be implemented separately; API client is structured with placeholder routes.
- The UI seeds demo data if the backend is not yet available.
