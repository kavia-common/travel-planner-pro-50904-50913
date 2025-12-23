/*
 Lightweight API client for Travel Planner frontend
 - Reads base URL from REACT_APP_API_BASE_URL with fallback to http://localhost:3001
 - Uses CORS with credentials for compatibility with FastAPI CORS middleware
*/

const DEFAULT_BASE_URL = "http://localhost:3001";

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the API base URL from environment or a sensible default. */
  const base = process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
  // Normalize to avoid trailing slash duplication
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

// Internal helper for JSON fetch with basic error handling and timeouts
async function request(path, { method = "GET", body, headers = {}, signal } = {}) {
  const controller = !signal ? new AbortController() : null;
  const timeoutId = !signal ? setTimeout(() => controller.abort(), 15000) : null;

  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: signal || (controller && controller.signal),
    credentials: "include",
    mode: "cors",
  }).catch((err) => {
    if (timeoutId) clearTimeout(timeoutId);
    throw err;
  });

  if (timeoutId) clearTimeout(timeoutId);

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : await response.text();

  if (!response.ok) {
    const error = new Error((data && data.message) || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

// PUBLIC_INTERFACE
export const api = {
  /** Trips */
  async listTrips() {
    /** Fetch all trips. */
    return request("/trips");
  },
  async createTrip(payload) {
    /** Create a new trip. */
    return request("/trips", { method: "POST", body: payload });
  },
  async updateTrip(tripId, payload) {
    /** Update an existing trip. */
    return request(`/trips/${encodeURIComponent(tripId)}`, { method: "PUT", body: payload });
  },
  async deleteTrip(tripId) {
    /** Delete a trip by id. */
    return request(`/trips/${encodeURIComponent(tripId)}`, { method: "DELETE" });
  },

  /** Itinerary items (destination, accommodation, transport, note) */
  async listItinerary(tripId) {
    /** Get itinerary entries for trip. */
    return request(`/trips/${encodeURIComponent(tripId)}/itinerary`);
  },
  async addItineraryItem(tripId, payload) {
    /** Add a new itinerary item to a trip. */
    return request(`/trips/${encodeURIComponent(tripId)}/itinerary`, { method: "POST", body: payload });
  },
  async updateItineraryItem(tripId, itemId, payload) {
    /** Update itinerary item. */
    return request(`/trips/${encodeURIComponent(tripId)}/itinerary/${encodeURIComponent(itemId)}`, {
      method: "PUT",
      body: payload,
    });
  },
  async deleteItineraryItem(tripId, itemId) {
    /** Delete itinerary item. */
    return request(`/trips/${encodeURIComponent(tripId)}/itinerary/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });
  },

  /** Destinations search (mock on backend) */
  async searchDestinations(query) {
    /** Search destinations via backend mock endpoint. */
    const params = new URLSearchParams({ q: query || "" });
    return request(`/search/destinations?${params.toString()}`);
  },
};

export default api;
