import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import api, { getApiBaseUrl } from "./api/client";

// Simple utility
const uid = () => Math.random().toString(36).slice(2, 10);

// Common styles (inline for simplicity)
const styles = {
  app: { display: "flex", minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" },
  sidebar: {
    width: 300,
    borderRight: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
    padding: 16,
    boxSizing: "border-box",
  },
  main: { flex: 1, padding: 16, boxSizing: "border-box" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tripItem: (selected) => ({
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 8,
    cursor: "pointer",
    border: `1px solid var(--border-color)`,
    background: selected ? "rgba(97, 218, 251, 0.12)" : "transparent",
  }),
  btn: {
    padding: "8px 12px",
    background: "var(--button-bg)",
    color: "var(--button-text)",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnGhost: {
    padding: "8px 12px",
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: 8,
    cursor: "pointer",
  },
  list: { listStyle: "none", paddingLeft: 0, margin: 0 },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    border: "1px solid var(--border-color)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  tag: {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    background: "transparent",
    color: "var(--text-primary)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: 12,
    padding: 16,
  },
  section: { marginTop: 16 },
};

// PUBLIC_INTERFACE
function App() {
  /** Travel Planner UI with sidebar trips and main itinerary builder. */
  const [theme, setTheme] = useState("light");
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const selectedTrip = useMemo(() => trips.find((t) => t.id === selectedTripId) || null, [trips, selectedTripId]);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState("");

  // modal state
  const initialModalState = { open: false, type: "destination", mode: "add", item: null };
  const [modal, setModal] = useState(initialModalState);

  // Effect to apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // load trips on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingTrips(true);
    api
      .listTrips()
      .then((data) => {
        if (!isMounted) return;
        // Expected backend response: [{ id, name, startDate, endDate, itinerary: [] }]
        const normalized = Array.isArray(data)
          ? data
          : []; // fallback to empty
        setTrips(normalized);
        if (normalized.length && !selectedTripId) setSelectedTripId(normalized[0].id);
      })
      .catch(() => {
        // Fallback seed when backend not ready
        const seed = [
          { id: "demo-1", name: "Demo Trip to Paris", startDate: "2025-05-01", endDate: "2025-05-07", itinerary: [] },
        ];
        setTrips(seed);
        setSelectedTripId(seed[0].id);
      })
      .finally(() => setLoadingTrips(false));
    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch itinerary when a trip is selected to ensure we reflect backend state
  useEffect(() => {
    const tripId = selectedTripId;
    if (!tripId) return;
    let cancelled = false;
    setItineraryLoading(true);
    setItineraryError("");
    api
      .listItinerary(tripId)
      .then((items) => {
        if (cancelled) return;
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, itinerary: Array.isArray(items) ? items : [] } : t))
        );
      })
      .catch((e) => {
        if (cancelled) return;
        setItineraryError("Failed to load itinerary");
      })
      .finally(() => {
        if (!cancelled) setItineraryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTripId]); // eslint-disable-line react-hooks/exhaustive-deps

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle light/dark theme */
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // Trip handlers
  const handleAddTrip = async () => {
    const name = prompt("Trip name?");
    if (!name) return;
    const optimistic = { id: uid(), name, startDate: "", endDate: "", itinerary: [], __optimistic: true };
    setTrips((prev) => [optimistic, ...prev]);
    try {
      const saved = await api.createTrip({ name });
      setTrips((prev) => prev.map((t) => (t.id === optimistic.id ? saved : t)));
      if (!selectedTripId) setSelectedTripId(saved.id);
    } catch (e) {
      // rollback
      setTrips((prev) => prev.filter((t) => t.id !== optimistic.id));
      alert("Failed to create trip");
    }
  };

  const handleDeleteTrip = async (tripId) => {
    const prev = trips;
    setTrips((p) => p.filter((t) => t.id !== tripId));
    if (selectedTripId === tripId) setSelectedTripId(null);
    try {
      await api.deleteTrip(tripId);
    } catch (e) {
      setTrips(prev);
      alert("Failed to delete trip");
    }
  };

  const handleRenameTrip = async (tripId) => {
    const name = prompt("New trip name?");
    if (!name) return;
    const prev = trips;
    setTrips((p) => p.map((t) => (t.id === tripId ? { ...t, name } : t)));
    try {
      await api.updateTrip(tripId, { name });
    } catch (e) {
      setTrips(prev);
      alert("Failed to rename trip");
    }
  };

  // Itinerary handlers
  const openAddModal = (type) => setModal({ open: true, type, mode: "add", item: null });
  const openEditModal = (type, item) => setModal({ open: true, type, mode: "edit", item });

  const handleSaveItem = async (formData) => {
    if (!selectedTrip) return;
    const isEdit = modal.mode === "edit";
    if (isEdit) {
      const prev = trips;
      setTrips((p) =>
        p.map((t) =>
          t.id !== selectedTrip.id
            ? t
            : {
                ...t,
                itinerary: t.itinerary.map((i) => (i.id === modal.item.id ? { ...i, ...formData } : i)),
              }
        )
      );
      try {
        await api.updateItineraryItem(selectedTrip.id, modal.item.id, formData);
      } catch (e) {
        setTrips(prev);
        alert("Failed to update item");
      }
    } else {
      const optimistic = { id: uid(), type: modal.type, ...formData, __optimistic: true };
      setTrips((p) =>
        p.map((t) => (t.id !== selectedTrip.id ? t : { ...t, itinerary: [optimistic, ...(t.itinerary || [])] }))
      );
      try {
        const saved = await api.addItineraryItem(selectedTrip.id, { type: modal.type, ...formData });
        setTrips((p) =>
          p.map((t) =>
            t.id !== selectedTrip.id
              ? t
              : { ...t, itinerary: t.itinerary.map((i) => (i.id === optimistic.id ? saved : i)) }
          )
        );
      } catch (e) {
        setTrips((p) =>
          p.map((t) =>
            t.id !== selectedTrip.id ? t : { ...t, itinerary: t.itinerary.filter((i) => i.id !== optimistic.id) }
          )
        );
        alert("Failed to add item");
      }
    }
    setModal(initialModalState);
  };

  const handleDeleteItem = async (itemId) => {
    if (!selectedTrip) return;
    const prev = trips;
    setTrips((p) =>
      p.map((t) => (t.id !== selectedTrip.id ? t : { ...t, itinerary: t.itinerary.filter((i) => i.id !== itemId) }))
    );
    try {
      await api.deleteItineraryItem(selectedTrip.id, itemId);
    } catch (e) {
      setTrips(prev);
      alert("Failed to delete item");
    }
  };

  const itineraryByType = useMemo(() => {
    if (!selectedTrip?.itinerary) return { destination: [], accommodation: [], transport: [], note: [] };
    return selectedTrip.itinerary.reduce(
      (acc, item) => {
        const k = item.type || "note";
        if (!acc[k]) acc[k] = [];
        acc[k].push(item);
        return acc;
      },
      { destination: [], accommodation: [], transport: [], note: [] }
    );
  }, [selectedTrip]);

  return (
    <div className="App" style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.header}>
          <strong>Trips</strong>
          <button style={styles.btn} onClick={handleAddTrip} aria-label="Add trip">
            + Add
          </button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
          API: {getApiBaseUrl()}
        </div>
        {loadingTrips && <div>Loading trips...</div>}
        <ul style={styles.list} aria-label="Trip list">
          {trips.map((t) => (
            <li
              key={t.id}
              style={styles.tripItem(t.id === selectedTripId)}
              onClick={() => setSelectedTripId(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedTripId(t.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{t.name}</div>
                  {(t.startDate || t.endDate) && (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {t.startDate} {t.endDate ? `→ ${t.endDate}` : ""}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    style={styles.btnGhost}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameTrip(t.id);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    style={styles.btnGhost}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(t.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
          {!trips.length && !loadingTrips && <li>No trips yet. Click "Add".</li>}
        </ul>
      </aside>

      {/* Main area */}
      <main style={styles.main}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>{selectedTrip ? selectedTrip.name : "Select or create a trip"}</h2>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {selectedTrip && (
          <>
            {/* Quick add actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={styles.btn} onClick={() => openAddModal("destination")}>
                + Destination
              </button>
              <button style={styles.btn} onClick={() => openAddModal("accommodation")}>
                + Accommodation
              </button>
              <button style={styles.btn} onClick={() => openAddModal("transport")}>
                + Transport
              </button>
              <button style={styles.btn} onClick={() => openAddModal("note")}>
                + Note
              </button>
            </div>

            {/* Sections */}
            <section style={styles.section}>
              <h3>Destinations</h3>
              {itineraryLoading && <div>Loading itinerary…</div>}
              {itineraryError && <div style={{ color: "tomato" }}>{itineraryError}</div>}
              {itineraryByType.destination.map((item) => (
                <ItineraryRow
                  key={item.id}
                  item={item}
                  onEdit={() => openEditModal("destination", item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
              {!itineraryByType.destination.length && <EmptyHint text="No destinations yet." />}
            </section>

            <section style={styles.section}>
              <h3>Accommodations</h3>
              {itineraryByType.accommodation.map((item) => (
                <ItineraryRow
                  key={item.id}
                  item={item}
                  onEdit={() => openEditModal("accommodation", item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
              {!itineraryByType.accommodation.length && <EmptyHint text="No accommodations yet." />}
            </section>

            <section style={styles.section}>
              <h3>Transport</h3>
              {itineraryByType.transport.map((item) => (
                <ItineraryRow
                  key={item.id}
                  item={item}
                  onEdit={() => openEditModal("transport", item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
              {!itineraryByType.transport.length && <EmptyHint text="No transport entries yet." />}
            </section>

            <section style={styles.section}>
              <h3>Notes</h3>
              {itineraryByType.note.map((item) => (
                <ItineraryRow
                  key={item.id}
                  item={item}
                  onEdit={() => openEditModal("note", item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
              {!itineraryByType.note.length && <EmptyHint text="No notes yet." />}
            </section>
          </>
        )}
      </main>

      {/* Modal */}
      {modal.open && (
        <Modal onClose={() => setModal(initialModalState)} title={`${modal.mode === "add" ? "Add" : "Edit"} ${capitalize(modal.type)}`}>
          <ItineraryForm
            type={modal.type}
            defaultValue={modal.item}
            onCancel={() => setModal(initialModalState)}
            onSubmit={handleSaveItem}
          />
        </Modal>
      )}
    </div>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function EmptyHint({ text }) {
  return <div style={{ opacity: 0.7, fontStyle: "italic", padding: "6px 0" }}>{text}</div>;
}

function ItineraryRow({ item, onEdit, onDelete }) {
  return (
    <div style={styles.row}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={styles.tag}>{capitalize(item.type || "item")}</span>
        <div>
          <div style={{ fontWeight: 600 }}>{item.title || item.name || "(untitled)"}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {item.date ? `${item.date}` : ""}
            {item.time ? ` • ${item.time}` : ""}
            {item.location ? ` • ${item.location}` : ""}
            {item.address ? ` • ${item.address}` : ""}
            {item.details ? ` • ${item.details}` : ""}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={styles.btnGhost} onClick={onEdit}>
          Edit
        </button>
        <button style={styles.btnGhost} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

// Accessible modal
function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.header, marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button style={styles.btnGhost} onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ marginBottom: 6, fontSize: 14 }}>{label}</div>
      {children}
    </label>
  );
}

const defaultValuesByType = {
  destination: { title: "", date: "", time: "", location: "", details: "" },
  accommodation: { title: "", date: "", address: "", details: "" },
  transport: { title: "", date: "", time: "", location: "", details: "" },
  note: { title: "", details: "" },
};

// PUBLIC_INTERFACE
function ItineraryForm({ type, defaultValue, onSubmit, onCancel }) {
  /** Form component used for add/edit of itinerary items across types */
  const [form, setForm] = useState(() => ({ ...(defaultValuesByType[type] || {}), ...(defaultValue || {}) }));
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const F = (k, label, attrs = {}) => (
    <Field key={k} label={label}>
      <input
        style={styles.input}
        value={form[k] || ""}
        onChange={onChange(k)}
        placeholder={label}
        {...attrs}
      />
    </Field>
  );

  const fields = [];
  // common title
  fields.push(F("title", "Title"));
  if (["destination", "transport", "accommodation"].includes(type)) {
    fields.push(F("date", "Date", { type: "date" }));
  }
  if (["destination", "transport"].includes(type)) {
    fields.push(F("time", "Time", { type: "time" }));
  }
  if (["destination", "transport"].includes(type)) {
    fields.push(F("location", "Location"));
  }
  if (["accommodation"].includes(type)) {
    fields.push(F("address", "Address"));
  }
  fields.push(
    <Field key="details" label="Details">
      <textarea
        style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
        value={form.details || ""}
        onChange={onChange("details")}
        placeholder="Additional notes or details"
      />
    </Field>
  );

  return (
    <form onSubmit={handleSubmit}>
      {fields}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" style={styles.btnGhost} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" style={styles.btn}>
          Save
        </button>
      </div>
    </form>
  );
}

export default App;
