# Repeater × Context — Harmony & Studio Demo

Proof-of-concept: **one Repeater component** in two editors (**Harmony** and **Studio**), with **context assigned to the repeater itself** (no virtual container bar). Same component, different experience in each sub-tab.

- **Harmony:** Repeater → **CMS collection** (e.g. Offices, Recipes). Source in “Use collection content” is the collection name only; Settings, Manage items, and View details open from the repeater floating toolbar.
- **Studio:** Repeater → **design presets** (Blank, Team, Real estate) or context from page/section. Connect Context modal: “Suggested for this design,” “Available from parent level,” “Add context.” Disconnect sends the repeater to blank state. Selection: blue when not connected, pink when connected.

## Run

Use **npm** (this folder is independent from a parent Yarn workspace):

```bash
cd repeater-context-demo
npm install
npm run dev
```

Open the URL from the terminal (e.g. http://localhost:5173). Use the tabs to switch between **Harmony** and **Studio**.

## Shareable link (GitHub Pages)

Two workflows are available. **Recommended:** use the **gh-pages branch** (no “GitHub Actions” source, avoids 404 / “no runners” issues).

### Option A — Deploy from branch (recommended)

1. On GitHub: **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Set **Branch** to `gh-pages`, folder **/ (root)**. Save.
4. **Actions** tab → run the workflow **“Build and push to gh-pages”** (Run workflow, or push to `main` so it runs automatically).
5. After the run succeeds, the site is at: **https://masha21921.github.io/repeaterInContext/**

### Option B — GitHub Actions source

1. **Settings** → **Pages** → **Source**: **GitHub Actions**.
2. Push to `main` or run **“Deploy to GitHub Pages”** from the Actions tab.
3. Site URL: **https://masha21921.github.io/repeaterInContext/**

If you see **404** or **no workflow runs**: use Option A and ensure the **“Build and push to gh-pages”** workflow has run at least once (Actions → select it → Run workflow).

## Structure

- `src/components/Repeater.jsx` — shared Repeater; takes `context` + `items`, renders by context type.
- `src/views/HarmonyEditor.jsx` — Harmony: CMS collection wording, read-only Source, filter/sort by collection.
- `src/views/StudioEditor.jsx` — Studio: presets, Connect Context modal, Disconnect, instance labels (e.g. Recipes 1 / Recipes 2).
- `src/components/ConnectContextModal.jsx` — Connect/Replace/Disconnect; suggested context for presets.
- `src/components/RepeaterSettingsPanel.jsx` — Repeater settings (display, pagination, filter, sort, context instance).
- `src/data/demoData.js` — demo data for all context types.

## Docs

See **[DOCUMENTATION.md](./DOCUMENTATION.md)** for detailed behavior: repeater states, context connection, settings panel, use collection content, and technical notes.
