# REPORT.md — SecureNote Conceptual Report

**Project:** SecureNote — Full-Stack Web Application  
**Course:** Web Development Fundamentals & Architecture  

---

## 1. JS Engine vs. Runtime

**Frontend (Browser):**  
The frontend JavaScript in `script.js` is executed inside the **browser's JavaScript Engine**. Modern browsers like Chrome and Edge use **V8** (Google's open-source JS engine), while Firefox uses **SpiderMonkey**, and Safari uses **JavaScriptCore**. The engine compiles and executes the JS code directly.

The **Runtime Environment** on the frontend is the **Browser Runtime** — this provides Web APIs that the engine itself does not have: `document`, `window`, `fetch`, `localStorage`, event listeners, and the DOM. These are not part of JavaScript the language; they are APIs provided by the browser runtime.

**Backend (Node.js):**  
The backend `server.js` is executed using the **Node.js Runtime Environment**. Node.js also uses the **V8 engine** internally (the same engine as Chrome), but it wraps it in a completely different runtime. Instead of browser APIs, Node.js provides server-side APIs: `fs` (file system), `http`/`https`, `process`, `Buffer`, `require()`, and npm modules like `express`.

**Key Distinction:**  
The *engine* (V8) is just the parser and executor. The *runtime* determines what APIs are available. The same V8 engine runs in both environments, but `document.querySelector()` only works in the browser, and `fs.readFileSync()` only works in Node.js — because these are runtime-provided APIs, not language features.

---

## 2. DOM — How the Frontend Updates the Screen

This project uses the **Vanilla JavaScript Path (Path A)**.

The **DOM (Document Object Model)** is a tree-like, in-memory representation of the HTML document. The browser parses the HTML and constructs this tree; JavaScript can then query and manipulate it to update what the user sees — without reloading the page.

**In SecureNote, DOM manipulation is used in several ways:**

- **`document.getElementById()`** and **`document.createElement()`** are used to select existing elements and create new `<div>` note cards dynamically.
- **`element.innerHTML`** is set to inject the rendered HTML for each note card into `#notes-grid`.
- **`element.style.display`** is toggled to show and hide sections (list view vs. new note form) without page reloads.
- **`element.remove()`** is called when a note is deleted — the card fades out via CSS transition and is then removed from the DOM tree.
- **`element.appendChild()`** adds the newly created note cards into the parent container.
- **Event listeners** (`addEventListener`) on the token input, buttons, and nav links drive all interactivity.

This approach demonstrates the **client-side rendering pattern**: the server sends raw data (JSON), and the browser's JavaScript updates the DOM to present it visually.

---

## 3. HTTP/HTTPS — The Request/Response Cycle

**What happens when "Save Note" is clicked:**

1. The frontend calls:
   `fetch('http://localhost:3001/api/notes', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify(noteData)
   })`
2. The browser starts a TCP connection to `localhost:3001`.
3. The HTTP request contains:
   - Request-line: `POST /api/notes HTTP/1.1`
   - Headers: `Host`, `Content-Type`, `Authorization`, `Content-Length`, etc.
   - Body: JSON payload (title, content, etc.)
4. Backend (`server.js + route/api.js`) parses JSON, checks `Authorization` against `process.env.SECRET_TOKEN`, then saves note and responds with a JSON object and status code `201`.
5. Browser receives response, resolves fetch promise, and frontend updates the UI by re-rendering the notes list.

**Headers sent (minimum):**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`
- `Accept: application/json`
- `Host: localhost:3001`

**HTTPS vs HTTP:**
- Local development uses HTTP for simplicity.
- Production must use HTTPS to encrypt data in transit and protect tokens, credentials, and sensitive note content.
- HTTPS prevents man-in-the-middle attacks and ensures server identity with TLS certificates.

---

## 4. Environment Variables — Why Store `SECRET_TOKEN` in `.env`?

**Reason for `.env` on backend:**
- Keep secrets out of the public client bundle.
- Only server code should access `SECRET_TOKEN` via `process.env.SECRET_TOKEN`.
- `.env` is excluded from Git via `.gitignore` and never shipped to user browsers.

**If token is in frontend code:**
- It becomes visible to all users via browser dev tools.
- Attackers can copy it and make authenticated requests directly.
- Fully reintroduces security vulnerability the token is meant to prevent.

**Correct flow:**
1. User logs in (or in this demo, requests token via login endpoint).
2. Backend validates credentials and issues token.
3. Frontend stores token in a transient place (memory/session storage) and sends it in headers for API calls.
4. Backend validates the token each request.


