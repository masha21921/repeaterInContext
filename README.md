# Repeater × Context — Harmony & Studio Demo

Proof-of-concept: **one Repeater component** in two editors (**Harmony** and **Studio**), with **context** as the high-level connection. Same component, different experience by editor.

- **Harmony:** Repeater → **CMS collection** (e.g. Offices, Recipes). Source in “Use collection content” is the collection name only; Settings and Manage Items open from the repeater toolbar.
- **Studio:** Repeater → **design presets** (Blank, Team, Real estate) or context from page/section. Connect Context modal: “Suggested for this design,” “Available from parent level,” “Add context.” Disconnect sends the repeater to blank state. Selection: blue when not connected, pink when connected.

## Run

Use **npm** (this folder is independent from a parent Yarn workspace):

```bash
cd repeater-context-demo
npm install
npm run dev
```

Open the URL from the terminal (e.g. http://localhost:5173). Use the tabs to switch between **Harmony** and **Studio**.

## Structure

- `src/components/Repeater.jsx` — shared Repeater; takes `context` + `items`, renders by context type.
- `src/views/HarmonyEditor.jsx` — Harmony: CMS collection wording, read-only Source, filter/sort by collection.
- `src/views/StudioEditor.jsx` — Studio: presets, Connect Context modal, Disconnect, instance labels (e.g. Recipes 1 / Recipes 2).
- `src/components/ConnectContextModal.jsx` — Connect/Replace/Disconnect; suggested context for presets.
- `src/components/RepeaterSettingsPanel.jsx` — Repeater settings (display, pagination, filter, sort, context instance).
- `src/data/demoData.js` — demo data for all context types.

## Docs

See **[DOCUMENTATION.md](./DOCUMENTATION.md)** for detailed behavior: repeater states, context connection, settings panel, use collection content, and technical notes.
