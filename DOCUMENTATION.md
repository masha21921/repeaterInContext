# Repeater × Context — Documentation

This document describes the repeater-context demo: behavior, editors, and main features.

---

## Overview

- **One Repeater component** is used in two editors: **Harmony** and **Studio**.
- **Context** is the high-level connection: page, section, or repeater can be connected to a context (e.g. CMS collection).
- Same component, different UX and wording per editor.

---

## Editors

### Harmony

- Repeater connected to context is represented as a **CMS collection** (e.g. Offices, Recipes).
- **Source** in “Use collection content” is the **collection name** only (e.g. “Offices”), not “Repeater context (Offices)”.
- Settings and Manage Items panels open from the repeater floating toolbar.
- Default sort: date created, new → old.
- Filter modal shows only fields relevant to the repeater’s collection.

### Studio

- Repeater can use **design presets** (e.g. Blank, Team, Real estate) or connect to context from page/section or “Add context”.
- **Connect Context** modal: “Suggested for this design” for preset repeaters; “Available from parent level”; “Add context to the repeater”.
- If the repeater’s context is **removed** (Disconnect in the modal), the repeater goes to **blank state** (three empty slots).
- Repeater selection: **blue** when not connected, **pink** when connected.
- Stage page header: button label is **Settings** when the page has a context, **Connect** when it does not.

---

## Repeater states

| State            | Description |
|------------------|-------------|
| **Unconnected**  | No context assigned. Blank preset shows three empty slots; other presets show blurred design + blue ribbon and “First select the context.” |
| **Connected**    | Context assigned. Virtual repeater container bar shows CTX and instance; cards/chips show content. |
| **Blank**        | Preset `blank` or after context is disconnected. Always shows the three-slot layout (L. REPEATER). |

---

## Context connection (Studio)

- **Page / Section:** Connect via the Connect button in the page or section header. One context per page/section in this demo.
- **Repeater:** Connect via Repeater settings or the virtual container bar.
  - **Replace** opens the Connect Context modal.
  - **Disconnect** in the modal clears the repeater’s context and resets it to the blank state.
- **Suggested for this design:** Shown only when **connecting** (not when using Replace). For preset repeaters (e.g. Real estate), a suggested context is shown; selecting it “creates” that context on the page and it appears in the CMS list.
- **Available from parent level:** Contexts already used on the page or in the same section.
- **Add context to the repeater:** Choose a new context (e.g. from CMS); it becomes a new instance for that repeater.

---

## Repeater settings (panel)

- **Display:** List of items, Tags, Media gallery, or Function.
- When the repeater has a context, the **Pagination, filter & sort** section shows the actual values (items per load, filter, sort) for that context instance (Studio).
- **Tags / Media:** “Add function to apply filter or sort”; Load more and full “Pagination, filter & sort” section can be hidden when not applicable.
- **Function:** “Pagination, filter & sort” section is hidden.
- **Manage items:** Opens the Manage Items panel (filter, sort, list of items).

---

## Use collection content (connector panel)

- Binds a repeater item element (e.g. text) to a **source** (e.g. repeater context or parent context) and a **property** (field).
- If the **source is disconnected** (Select source), the content becomes **static**: the same for all items, default **“text”**.
- If the selected source is **not** the repeater’s context (but is connected), a notice explains that the text will show the same content for all items (dynamic but uniform).
- Default text when not connected: **“text”**.

---

## Technical notes

- **Technical mode** has been removed; repeater container header and selection are always available where applicable.
- **Blank preset:** When `preset === 'blank'` and no context, the repeater shows empty slots and does not use placeholder items (e.g. from `unconfiguredRepeaterItems`).
- **Repeater key:** The Repeater’s React key includes override state so that binding/selection updates refresh the list correctly.

---

## Run

```bash
npm install
npm run dev
```

Open the URL from the terminal (e.g. http://localhost:5173). Use the tabs or routing to switch between **Harmony** and **Studio**.
