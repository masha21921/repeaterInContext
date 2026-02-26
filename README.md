# Repeater × Context — Harmony & Studio Demo

Proof-of-concept: **one Repeater component** in two editors (**Harmony** and **Studio**), with **context** as the high-level connection. Same component, different experience by editor and context.

- **Harmony:** Repeater connected to context → represented as a **CMS collection** (e.g. Blog Posts).
- **Studio:** Repeater connected to context → **seamless collection** or apps (**E-com**, **Bookends**, etc.).

## Run

**Use npm here** (not yarn), so this folder is independent from the parent Yarn workspace.

```bash
cd repeater-context-demo
npm install
npm run dev
```

Open the URL shown in the terminal (e.g. http://localhost:5173).

## Structure

- `src/components/Repeater.jsx` — shared Repeater; takes `context` + `items`, renders by context type.
- `src/views/HarmonyEditor.jsx` — Harmony view; Repeater with CMS collection context.
- `src/views/StudioEditor.jsx` — Studio view; Repeater with context selector (Seamless / E-com / Bookends).
- `src/data/demoData.js` — fake data for all context types.
