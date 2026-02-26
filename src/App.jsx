import { useState } from 'react';
import { HarmonyEditor } from './views/HarmonyEditor';
import { StudioEditor } from './views/StudioEditor';
import './App.css';

export default function App() {
  const [editor, setEditor] = useState('harmony'); // 'harmony' | 'studio'

  return (
    <div className="app">
      <nav className="app-nav">
        <h1 className="app-title">Repeater × Context</h1>
        <p className="app-subtitle">Same Repeater component, different experience by editor and context.</p>
        <div className="app-tabs">
          <button
            className={`app-tab ${editor === 'harmony' ? 'active' : ''}`}
            onClick={() => setEditor('harmony')}
          >
            Harmony
          </button>
          <button
            className={`app-tab ${editor === 'studio' ? 'active' : ''}`}
            onClick={() => setEditor('studio')}
          >
            Studio
          </button>
        </div>
      </nav>

      <main className="app-main">
        <div className="app-editor-wrap" data-active={editor} hidden={editor !== 'harmony'}>
          <HarmonyEditor />
        </div>
        <div className="app-editor-wrap" data-active={editor} hidden={editor !== 'studio'}>
          <StudioEditor />
        </div>
      </main>
    </div>
  );
}
