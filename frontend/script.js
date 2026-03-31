// ============================================================
// SecureNote — Frontend Script (Vanilla JS)
// Frontend talks only to local backend: http://localhost:3001
// Backend handles PocketHost access token automatically
// ============================================================

const BASE_URL = "http://localhost:3001";

// ── State ─────────────────────────────────────────────────
let editingNoteId = null;
let notesCache = [];

// ── DOM Element References ─────────────────────────────────
const tokenInput = document.getElementById("token-input");
const tokenToggle = document.getElementById("token-toggle");
const tokenStatus = document.getElementById("token-status");

const noteCount = document.getElementById("note-count");
const serverDot = document.getElementById("server-status-dot");
const serverLabel = document.getElementById("server-status-label");
const loadingState = document.getElementById("loading-state");
const errorBanner = document.getElementById("error-banner");
const notesGrid = document.getElementById("notes-grid");
const emptyState = document.getElementById("empty-state");
const formFeedback = document.getElementById("form-feedback");
const submitBtn = document.getElementById("submit-btn");
const submitLabel = document.getElementById("submit-label");
const submitSpinner = document.getElementById("submit-spinner");
const noteTitleInput = document.getElementById("note-title");
const noteContentInput = document.getElementById("note-content");
const formSectionTitle = document.getElementById("form-section-title");
const searchInput = document.getElementById("search-input");

// ── Hide token UI เพราะไม่ต้องใช้แล้ว ─────────────────────
if (tokenInput) tokenInput.style.display = "none";
if (tokenToggle) tokenToggle.style.display = "none";
if (tokenStatus) {
  tokenStatus.textContent = "Access token is handled by backend automatically";
  tokenStatus.className = "token-status ok";
}

// ── Section Navigation ────────────────────────────────────
function showSection(which) {
  document.getElementById("section-list").style.display = which === "list" ? "" : "none";
  document.getElementById("section-new").style.display = which === "new" ? "" : "none";

  document.getElementById("btn-all-notes").classList.toggle("nav-btn--active", which === "list");
  document.getElementById("btn-new-note").classList.toggle("nav-btn--active", which === "new");

  if (which === "list") {
    loadNotes();
  }

  if (which === "new" && editingNoteId === null) {
    clearForm();
  }
}

// ── Helpers ────────────────────────────────────────────────
function showError(message) {
  errorBanner.textContent = "⚠ " + message;
  errorBanner.style.display = "block";
}

function hideError() {
  errorBanner.style.display = "none";
}

function setLoading(isLoading) {
  loadingState.style.display = isLoading ? "flex" : "none";
  notesGrid.style.display = isLoading ? "none" : "";

  notesGrid.style.opacity = isLoading ? "0.3" : "1";
  notesGrid.style.pointerEvents = isLoading ? "none" : "auto";
}

function setServerOnline(online) {
  serverDot.className = online ? "online" : "";
  serverLabel.textContent = online ? "Online" : "Offline";
}

function normalizeNotesResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

// ── Load Notes + Search ───────────────────────────────────
async function loadNotes() {
  hideError();
  setLoading(true);
  emptyState.style.display = "none";

  try {
    const keyword = searchInput ? searchInput.value.trim() : "";
    const url = keyword
      ? `${BASE_URL}/api/notes?search=${encodeURIComponent(keyword)}`
      : `${BASE_URL}/api/notes`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const notes = normalizeNotesResponse(data);

    notesCache = notes; // สำคัญ: เก็บไว้ใช้ตอน edit/delete

    renderNotes(notes);
    noteCount.textContent = notes.length;
    setServerOnline(true);
  } catch (err) {
    setServerOnline(false);
    showError(`Could not connect to the server. Is the backend running? (${err.message})`);
  } finally {
    setLoading(false);
  }
}

// ── Render Notes ───────────────────────────────────────────
function renderNotes(notes) {
  notesGrid.innerHTML = "";

  if (!notes.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  notes
    .slice()
    .reverse()
    .forEach((note, i) => {
      const card = document.createElement("div");
      card.className = "note-card";
      card.style.animationDelay = `${i * 60}ms`;

      const rawDate = note.createdAt || note.created || note.updated;
      const date = rawDate ? new Date(rawDate) : null;

      const formatted =
        date && !isNaN(date)
          ? date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }) +
            " · " +
            date.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "No date";

      card.innerHTML = `
        <div class="note-card__header">
          <h3 class="note-card__title">${escapeHtml(note.title || "Untitled")}</h3>
        </div>
        <p class="note-card__content">${escapeHtml(note.content || "")}</p>
        <div class="note-card__footer" style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
          <span class="note-card__date">${formatted}</span>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn--ghost btn--sm" data-id="${note.id}" data-action="edit" type="button">Edit</button>
            <button class="btn btn--danger btn--sm" data-id="${note.id}" data-action="delete" type="button">Delete</button>
          </div>
        </div>
      `;

      notesGrid.appendChild(card);
    });
}

// ── Events จาก notes grid ─────────────────────────────────
if (notesGrid) {
  notesGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;
    if (!action || !id) return;

    if (action === "edit") {
      startEditNote(id);
    }

    if (action === "delete") {
      deleteNote(id, button);
    }
  });
}

// ── Start Edit ─────────────────────────────────────────────
function startEditNote(id) {
  const note = notesCache.find((item) => String(item.id) === String(id));

  if (!note) {
    showError("Note not found for editing.");
    return;
  }

  editingNoteId = id;
  noteTitleInput.value = note.title || "";
  noteContentInput.value = note.content || "";

  if (formSectionTitle) {
    formSectionTitle.textContent = "Edit Note";
  }

  submitLabel.textContent = "Update Note";
  hideFeedback();
  showSection("new");
}

// ── Create or Update Note ─────────────────────────────────
async function createNote() {
  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();

  hideFeedback();

  if (!title || !content) {
    showFeedback("Please fill in both title and content.", "err");
    return;
  }

  setSubmitLoading(true);

  try {
    const isEditMode = !!editingNoteId;
    const url = isEditMode
      ? `${BASE_URL}/api/notes/${editingNoteId}`
      : `${BASE_URL}/api/notes`;

    const method = isEditMode ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    showFeedback(
      isEditMode ? "Note updated successfully!" : "Note saved successfully!",
      "ok"
    );

    setTimeout(() => {
      clearForm();
      showSection("list");
    }, 700);
  } catch (err) {
    showFeedback(`Failed to save note: ${err.message}`, "err");
  } finally {
    setSubmitLoading(false);
  }
}

// ── Delete Note ────────────────────────────────────────────
async function deleteNote(id, btnEl) {
  btnEl.disabled = true;
  btnEl.textContent = "Deleting...";

  try {
    const response = await fetch(`${BASE_URL}/api/notes/${id}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    const card = btnEl.closest(".note-card");
    if (card) {
      card.style.transition = "opacity .3s, transform .3s";
      card.style.opacity = "0";
      card.style.transform = "scale(.95)";
    }

    setTimeout(() => {
      notesCache = notesCache.filter((note) => String(note.id) !== String(id));

      if (card) {
        card.remove();
      }

      const remaining = notesCache.length;
      noteCount.textContent = remaining;

      if (remaining === 0) {
        emptyState.style.display = "block";
      }
    }, 300);
  } catch (err) {
    showError(`Delete failed: ${err.message}`);
    btnEl.disabled = false;
    btnEl.textContent = "Delete";
  }
}

// ── Form Helpers ───────────────────────────────────────────
function clearForm() {
  editingNoteId = null;
  noteTitleInput.value = "";
  noteContentInput.value = "";
  hideFeedback();

  if (formSectionTitle) {
    formSectionTitle.textContent = "New Note";
  }

  submitLabel.textContent = "Save Note";
}

function showFeedback(msg, type) {
  formFeedback.textContent = (type === "ok" ? "✓ " : "⚠ ") + msg;
  formFeedback.className = `form-feedback ${type}`;
  formFeedback.style.display = "block";
}

function hideFeedback() {
  formFeedback.style.display = "none";
}

function setSubmitLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitLabel.style.display = isLoading ? "none" : "inline";
  submitSpinner.style.display = isLoading ? "inline-block" : "none";
}

// ── Utility: Escape HTML ───────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ── Search Events ──────────────────────────────────────────
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      loadNotes();
    }
  });

  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      loadNotes();
    }, 300);
  });
}

// ── Init ───────────────────────────────────────────────────
loadNotes();