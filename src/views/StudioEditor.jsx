import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Stage } from '../components/Stage';
import { Section } from '../components/Section';
import { Repeater } from '../components/Repeater';
import { RepeaterFloatingToolbar } from '../components/RepeaterFloatingToolbar';
import { Text } from '../components/Text';
import { Image } from '../components/Image';
import { RepeaterSettingsPanel } from '../components/RepeaterSettingsPanel';
import { TextSettingsPanel } from '../components/TextSettingsPanel';
import { ImageSettingsPanel } from '../components/ImageSettingsPanel';
import { ContextDetailsPanel } from '../components/ContextDetailsPanel';
import { UseCollectionContentPanel } from '../components/UseCollectionContentPanel';
import { ContentTitleSettingsPanel } from '../components/ContentTitleSettingsPanel';
import { SectionSettingsPanel } from '../components/SectionSettingsPanel';
import { PageSettingsPanel } from '../components/PageSettingsPanel';
import { ManageItemsPanel } from '../components/ManageItemsPanel';
import { FilterModal } from '../components/FilterModal';
import { ConnectContextModal } from '../components/ConnectContextModal';
import { ContextInstanceSettingsModal } from '../components/ContextInstanceSettingsModal';
import { EmptySettingsPanel } from '../components/EmptySettingsPanel';
import { BlankRepeaterSlotPanel } from '../components/BlankRepeaterSlotPanel';
import { RepeaterItemElementPanel } from '../components/RepeaterItemElementPanel';
import { applyFilterRules } from '../utils/filterRules';
import {
  unconfiguredRepeaterItems,
  availableContexts,
  connectModalPresetIds,
  getUnconfiguredItemsForPreset,
  getDefaultItemBindingsForContext,
  getFilterFieldsForContext,
  getSortFieldsForContext,
  defaultSortRules,
} from '../data/demoData';
import { applySortRules, getSortSummary } from '../utils/sortRules';
import { SortModal } from '../components/SortModal';
import './Editor.css';

function createComponent(type, preset) {
  const comp = { id: `${type}-${Date.now()}`, type };
  if (type === 'repeater') {
    comp.connected = false;
    if (preset) comp.preset = preset;
  }
  if (type === 'text') comp.content = 'Add your text here';
  if (type === 'image') {
    comp.src = '';
    comp.alt = '';
  }
  return comp;
}

/** Repeater presets shown in Add component under "Repeaters" section (Studio only). */
const STUDIO_REPEATER_PRESETS = [
  { type: 'repeater', preset: 'services', label: 'Design preset 1 (Services)', group: 'Repeaters' },
  { type: 'repeater', preset: 'books', label: 'Design preset 2 (Books)', group: 'Repeaters' },
  { type: 'repeater', preset: 'realestate', label: 'Design preset 3 (Real estate properties)', group: 'Repeaters' },
  { type: 'repeater', preset: 'blank', label: 'Blank', group: 'Repeaters' },
];

const STUDIO_ADDABLE_COMPONENTS = [
  ...STUDIO_REPEATER_PRESETS,
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
];

const STUDIO_TABS = [
  { id: 'concept', label: 'Concept 1' },
];

export function StudioEditor() {
  const [studioTab, setStudioTab] = useState('concept');
  const [selection, setSelection] = useState(null);
  const [section1Components, setSection1Components] = useState([]);
  const [section2Components, setSection2Components] = useState([]);
  const [section3Components, setSection3Components] = useState([]);
  const [sectionTitles, setSectionTitles] = useState({
    section1: 'Section 1',
    section2: 'Section 2 (Main)',
    section3: 'Section 3',
  });
  const [sectionContentTitles, setSectionContentTitles] = useState({
    section2: '',
  });
  const [repeaterItemOverrides, setRepeaterItemOverrides] = useState({});
  /** Page can have multiple contexts; each has its own settings keyed by contextId. */
  const [pageContextIds, setPageContextIds] = useState([]);
  const [sectionContextIds, setSectionContextIds] = useState({ section1: [], section2: [], section3: [] });
  const defaultContextSettings = () => ({ pageLoad: 4, loadMoreEnabled: true, filterRules: [], sortRules: [...defaultSortRules] });
  /** Page context settings keyed by contextId. */
  const [pageContextSettings, setPageContextSettings] = useState({});
  /** Per-section context settings: sectionId -> { [contextId]: settings }. */
  const [sectionContextSettings, setSectionContextSettings] = useState({
    section1: {},
    section2: {},
    section3: {},
  });
  const [connectModalTarget, setConnectModalTarget] = useState(null);
  const [manageItemsTarget, setManageItemsTarget] = useState(null);
  const [filterModalTarget, setFilterModalTarget] = useState(null);
  const [sortModalTarget, setSortModalTarget] = useState(null);
  const [contextDetailsTarget, setContextDetailsTarget] = useState(null);
  const [contextInstanceModalTarget, setContextInstanceModalTarget] = useState(null);
  const [connectorPanelTarget, setConnectorPanelTarget] = useState(null);
  const [connectorPanelSourceContextId, setConnectorPanelSourceContextId] = useState(null);
  const [presetUsedIds, setPresetUsedIds] = useState([]);
  const [repeaterSettingsPanelOpen, setRepeaterSettingsPanelOpen] = useState(false);
  const settingsAsideRef = useRef(null);
  const scrollToSettingsPanel = useCallback(() => {
    settingsAsideRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, []);
  const openRepeaterSettings = useCallback(() => {
    setRepeaterSettingsPanelOpen(true);
    scrollToSettingsPanel();
  }, [scrollToSettingsPanel]);

  const openConnectModal = useCallback((sectionId, componentId) => {
    setConnectModalTarget(componentId != null ? { type: 'component', sectionId, componentId } : { type: 'section', sectionId });
  }, []);
  const openPageConnectModal = useCallback(() => setConnectModalTarget({ type: 'page' }), []);
  const openSectionConnectModal = useCallback((sectionId) => setConnectModalTarget({ type: 'section', sectionId }), []);
  const closeConnectModal = useCallback(() => setConnectModalTarget(null), []);

  /** Context ids that are connected on the page (page + sections). Repeater and inner elements can access parent context only. */
  const contextIdsOnPage = useMemo(
    () => [
      ...new Set([
        ...(pageContextIds || []),
        ...(sectionContextIds.section1 || []),
        ...(sectionContextIds.section2 || []),
        ...(sectionContextIds.section3 || []),
      ]),
    ],
    [pageContextIds, sectionContextIds]
  );

  /** Context ids that are "created" or in use on the page (page + sections + repeater-assigned). When user connects a preset repeater to e.g. Services, that context becomes available in the CMS list for other connect flows. */
  const contextIdsCreatedOnPage = useMemo(() => {
    const set = new Set(contextIdsOnPage);
    [section1Components, section2Components, section3Components].forEach((comps) => {
      (comps || []).forEach((comp) => {
        if (comp.type === 'repeater' && comp.assignedContextId) set.add(comp.assignedContextId);
      });
    });
    return [...set];
  }, [contextIdsOnPage, section1Components, section2Components, section3Components]);

  /** Context objects from parents (page/section). Used by container settings to "use context from page" or show "Add context" when empty. */
  const parentContextsForContainer = useMemo(
    () => availableContexts.filter((c) => contextIdsOnPage.includes(c.id)),
    [availableContexts, contextIdsOnPage]
  );

  /** Which scope (page or sectionId) provides this contextId. Prefer repeater's section. */
  const getContextSource = useCallback((contextId, repeaterSectionId) => {
    if (!contextId) return null;
    const sectionIds = repeaterSectionId ? [repeaterSectionId, 'section1', 'section2', 'section3'] : ['section1', 'section2', 'section3'];
    if (repeaterSectionId && (sectionContextIds[repeaterSectionId] || []).includes(contextId)) return repeaterSectionId;
    if ((pageContextIds || []).includes(contextId)) return 'page';
    for (const sid of sectionIds) {
      if ((sectionContextIds[sid] || []).includes(contextId)) return sid;
    }
    return null;
  }, [pageContextIds, sectionContextIds]);

  /** Pagination, filter, sort for a context instance. From context panel (page/section), keyed by contextId. */
  const getContextSettings = useCallback((contextId, repeaterSectionId) => {
    const source = getContextSource(contextId, repeaterSectionId);
    if (source === 'page') return (pageContextSettings || {})[contextId] ?? null;
    if (source && sectionContextSettings[source]) return sectionContextSettings[source][contextId] ?? null;
    return null;
  }, [getContextSource, pageContextSettings, sectionContextSettings]);

  /** For repeater settings: repeater (child) can consume context from container (parent) and upper contexts (page/section). */
  const availableContextsForRepeater = useMemo(() => {
    const ids = new Set(contextIdsOnPage);
    const sel = selection;
    if ((sel?.type === 'component' || sel?.type === 'repeaterItem' || sel?.type === 'repeater' || sel?.type === 'blankSlotElement') && sel?.sectionId && sel?.componentId) {
      const comps = sel.sectionId === 'section1' ? section1Components : sel.sectionId === 'section2' ? section2Components : sel.sectionId === 'section3' ? section3Components : [];
      const comp = comps.find((c) => c.id === sel.componentId);
      if (comp?.assignedContextId) ids.add(comp.assignedContextId);
    }
    return availableContexts.filter((c) => ids.has(c.id));
  }, [availableContexts, contextIdsOnPage, selection, section1Components, section2Components, section3Components]);

  const openContextDetails = useCallback((sectionId, componentId) => {
    setContextDetailsTarget({ sectionId, componentId });
    settingsAsideRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, []);
  const closeContextDetails = useCallback(() => setContextDetailsTarget(null), []);

  /** Unique context instance label per context usage. Keys: page-${contextId}, ${sectionId}-${contextId}, ${sectionId}-${comp.id} for repeaters. */
  const contextInstanceLabelMap = useMemo(() => {
    const map = {};
    const countByContextId = {};
    const assign = (contextId, key) => {
      if (!contextId) return;
      const ctx = availableContexts.find((c) => c.id === contextId);
      const label = ctx?.label ?? contextId;
      countByContextId[contextId] = (countByContextId[contextId] ?? 0) + 1;
      const n = countByContextId[contextId];
      map[key] = `${label} ${n}`;
    };
    (pageContextIds || []).forEach((contextId) => assign(contextId, `page-${contextId}`));
    ['section1', 'section2', 'section3'].forEach((sectionId) => {
      (sectionContextIds[sectionId] || []).forEach((contextId) => assign(contextId, `${sectionId}-${contextId}`));
    });
    const sectionList = [
      ['section1', section1Components],
      ['section2', section2Components],
      ['section3', section3Components],
    ];
    sectionList.forEach(([sectionId, comps]) => {
      const sectionIds = sectionContextIds[sectionId] || [];
      const pageIds = pageContextIds || [];
      comps.forEach((comp) => {
        if (comp.type !== 'repeater' || !comp.assignedContextId) return;
        const addedViaAddContext = comp.contextSource === 'add';
        const parentHasIt = !addedViaAddContext && (sectionIds.includes(comp.assignedContextId) || pageIds.includes(comp.assignedContextId));
        if (parentHasIt) {
          const parentKey = sectionIds.includes(comp.assignedContextId) ? `${sectionId}-${comp.assignedContextId}` : `page-${comp.assignedContextId}`;
          map[`${sectionId}-${comp.id}`] = map[parentKey] ?? (availableContexts.find((c) => c.id === comp.assignedContextId)?.label ?? comp.assignedContextId);
        } else {
          assign(comp.assignedContextId, `${sectionId}-${comp.id}`);
        }
      });
    });
    return map;
  }, [pageContextIds, sectionContextIds, section1Components, section2Components, section3Components, availableContexts]);

  /** For repeater Select context modal: parent contexts with instance labels, level, and source (one entry per scope-context pair). */
  const repeaterSelectContextList = useMemo(() => {
    const levelLabel = (key) => {
      if (key === 'page') return 'Page';
      if (key === 'section1') return 'Section 1';
      if (key === 'section2') return 'Section 2';
      if (key === 'section3') return 'Section 3';
      return key ?? '—';
    };
    const list = [];
    (pageContextIds || []).forEach((contextId) => {
      const ctx = availableContexts.find((c) => c.id === contextId);
      list.push({
        contextId,
        label: ctx?.label ?? contextId,
        instanceLabel: contextInstanceLabelMap[`page-${contextId}`] ?? ctx?.label ?? contextId,
        source: ctx?.source ?? null,
        level: 'Page',
      });
    });
    ['section1', 'section2', 'section3'].forEach((sectionId) => {
      (sectionContextIds[sectionId] || []).forEach((contextId) => {
        const ctx = availableContexts.find((c) => c.id === contextId);
        list.push({
          contextId,
          label: ctx?.label ?? contextId,
          instanceLabel: contextInstanceLabelMap[`${sectionId}-${contextId}`] ?? ctx?.label ?? contextId,
          source: ctx?.source ?? null,
          level: levelLabel(sectionId),
        });
      });
    });
    return list;
  }, [pageContextIds, sectionContextIds, availableContexts, contextInstanceLabelMap]);

  /** For repeater Connect modal: only page + the section where the repeater lives count as parent. Other sections are not parent. */
  const parentContextsForRepeaterModal = useMemo(() => {
    if (connectModalTarget?.type !== 'component' || !connectModalTarget.sectionId) return repeaterSelectContextList;
    const sectionLevelLabel =
      connectModalTarget.sectionId === 'section1' ? 'Section 1'
        : connectModalTarget.sectionId === 'section2' ? 'Section 2'
        : connectModalTarget.sectionId === 'section3' ? 'Section 3'
        : null;
    return repeaterSelectContextList.filter(
      (entry) => entry.level === 'Page' || entry.level === sectionLevelLabel
    );
  }, [repeaterSelectContextList, connectModalTarget?.type, connectModalTarget?.sectionId]);

  const getSetBySection = useCallback((sectionId) => {
    switch (sectionId) {
      case 'section1': return setSection1Components;
      case 'section2': return setSection2Components;
      case 'section3': return setSection3Components;
      default: return () => {};
    }
  }, []);

  const addComponent = useCallback((sectionId, type, preset) => {
    const setter = getSetBySection(sectionId);
    setter((prev) => [...prev, createComponent(type, preset)]);
  }, [getSetBySection]);

  const removeComponent = useCallback((sectionId, componentId) => {
    const setter = getSetBySection(sectionId);
    setter((prev) => prev.filter((c) => c.id !== componentId));
    if (selection?.type === 'component' && selection.sectionId === sectionId && selection.componentId === componentId) {
      setSelection(null);
    }
    if (selection?.type === 'repeaterItem' && selection.sectionId === sectionId && selection.componentId === componentId) {
      setSelection(null);
    }
  }, [getSetBySection, selection]);

  const updateTextContent = useCallback((sectionId, componentId, content) => {
    const setter = getSetBySection(sectionId);
    setter((prev) => prev.map((c) => (c.id === componentId ? { ...c, content } : c)));
  }, [getSetBySection]);

  const updateImageContent = useCallback((sectionId, componentId, updates) => {
    const setter = getSetBySection(sectionId);
    setter((prev) => prev.map((c) => (c.id === componentId ? { ...c, ...updates } : c)));
  }, [getSetBySection]);

  const fieldKeyByBindProperty = (bindProperty) =>
    bindProperty === 'text' ? 'boundField'
      : bindProperty === 'image' ? 'boundFieldImage'
      : bindProperty === 'imageAlt' ? 'boundFieldImageAlt'
      : bindProperty === 'imageLink' ? 'boundFieldImageLink'
      : bindProperty === 'buttonLink' ? 'boundFieldButtonLink'
      : 'boundFieldButtonText';

  const updateComponentBinding = useCallback((sectionId, componentId, bindProperty, value) => {
    const setter = getSetBySection(sectionId);
    const key = fieldKeyByBindProperty(bindProperty);
    setter((prev) => prev.map((c) => (c.id === componentId ? { ...c, [key]: value || undefined } : c)));
  }, [getSetBySection]);

  const defaultBlankSlotComponents = () => ({ 'blank-slot-0': [], 'blank-slot-1': [], 'blank-slot-2': [] });

  const BLANK_SLOT_IDS = ['blank-slot-0', 'blank-slot-1', 'blank-slot-2'];

  const addComponentToBlankSlot = useCallback((sectionId, componentId, slotId, type) => {
    const setter = getSetBySection(sectionId);
    const base = Date.now();
    setter((prev) =>
      prev.map((c) => {
        if (c.id !== componentId || c.type !== 'repeater') return c;
        const slots = c.slotComponents ?? defaultBlankSlotComponents();
        const newSlots = { ...slots };
        BLANK_SLOT_IDS.forEach((sid, idx) => {
          const newComp = type === 'text'
            ? { type: 'text', id: `text-${base}-${idx}`, content: '' }
            : { type: 'image', id: `image-${base}-${idx}`, src: '', alt: '' };
          const list = newSlots[sid] ?? [];
          newSlots[sid] = [...list, newComp];
        });
        return { ...c, slotComponents: newSlots };
      })
    );
  }, [getSetBySection]);

  const removeComponentFromBlankSlot = useCallback((sectionId, componentId, slotId, compId) => {
    const setter = getSetBySection(sectionId);
    const baseId = compId.replace(/-\d+$/, '');
    setter((prev) =>
      prev.map((c) => {
        if (c.id !== componentId || c.type !== 'repeater') return c;
        const slots = c.slotComponents ?? defaultBlankSlotComponents();
        const newSlots = {};
        BLANK_SLOT_IDS.forEach((sid) => {
          const list = (slots[sid] ?? []).filter((x) => !x.id.startsWith(baseId + '-'));
          newSlots[sid] = list;
        });
        return { ...c, slotComponents: newSlots };
      })
    );
  }, [getSetBySection]);

  const updateBlankSlotComponent = useCallback((sectionId, componentId, slotId, compId, updates) => {
    const setter = getSetBySection(sectionId);
    const baseId = compId.replace(/-\d+$/, '');
    const matchId = (id) => id === compId || id.startsWith(baseId + '-');
    setter((prev) =>
      prev.map((c) => {
        if (c.id !== componentId || c.type !== 'repeater') return c;
        const slots = c.slotComponents ?? defaultBlankSlotComponents();
        const newSlots = {};
        BLANK_SLOT_IDS.forEach((sid) => {
          const list = (slots[sid] ?? []).map((x) => (matchId(x.id) ? { ...x, ...updates } : x));
          newSlots[sid] = list;
        });
        return { ...c, slotComponents: newSlots };
      })
    );
  }, [getSetBySection]);

  const addDroppedElementToRepeater = useCallback((sectionId, componentId, payload) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) =>
        c.id === componentId && c.type === 'repeater'
          ? { ...c, droppedElements: [...(c.droppedElements || []), { type: payload.type, content: payload.content, src: payload.src, alt: payload.alt }] }
          : c
      )
    );
  }, [getSetBySection]);

  useEffect(() => {
    if (selection?.type !== 'component') setRepeaterSettingsPanelOpen(false);
  }, [selection?.type]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const target = e.target;
      if (target && (target.closest('input') || target.closest('textarea') || target.closest('select') || target.isContentEditable)) return;
      if (selection?.type === 'component') {
        e.preventDefault();
        removeComponent(selection.sectionId, selection.componentId);
        setSelection(null);
      } else if (selection?.type === 'repeaterItem') {
        e.preventDefault();
        removeComponent(selection.sectionId, selection.componentId);
        setSelection(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, removeComponent]);

  /** contextSource: 'add' = from "Add context to repeater" (new instance); 'parent' = from "Available from parent level" (reuse parent instance). */
  const setComponentContext = useCallback((sectionId, componentId, contextId, contextSource) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) =>
        c.id === componentId
          ? {
              ...c,
              assignedContextId: contextId || null,
              connected: !!contextId,
              itemsConnectTo: contextId ? 'items' : (c.itemsConnectTo ?? 'items'),
              ...(contextId && contextSource != null && { contextSource }),
            }
          : c
      )
    );
  }, [getSetBySection]);

  const setRepeaterFilter = useCallback((sectionId, componentId, filterQuery) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, filterQuery: filterQuery ?? '' } : c))
    );
  }, [getSetBySection]);

  const setRepeaterFilterRules = useCallback((sectionId, componentId, rules) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, filterRules: rules ?? [] } : c))
    );
  }, [getSetBySection]);

  const setRepeaterSortRules = useCallback((sectionId, componentId, rules) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, sortRules: rules ?? [] } : c))
    );
  }, [getSetBySection]);

  const setRepeaterPageLoad = useCallback((sectionId, componentId, value) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, pageLoad: Math.max(1, Math.min(100, Number(value) || 1)) } : c))
    );
  }, [getSetBySection]);

  const setRepeaterLoadMore = useCallback((sectionId, componentId, enabled) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, loadMoreEnabled: enabled } : c))
    );
  }, [getSetBySection]);

  const selectPage = useCallback(() => setSelection({ type: 'page' }), []);
  const selectSection = useCallback((sectionId) => setSelection({ type: 'section', sectionId }), []);
  const selectContentTitle = useCallback((sectionId) => setSelection({ type: 'contentTitle', sectionId }), []);
  const selectComponent = useCallback((sectionId, componentId) =>
    setSelection({ type: 'component', sectionId, componentId }), []);
  const selectRepeater = useCallback((sectionId, componentId) =>
    setSelection({ type: 'repeater', sectionId, componentId }), []);
  const selectRepeaterItem = useCallback((sectionId, componentId, itemId, elementKind) =>
    setSelection({ type: 'repeaterItem', sectionId, componentId, itemId, elementKind: elementKind ?? undefined }), []);
  const selectBlankSlotElement = useCallback((sectionId, componentId, slotId, elementId, elementType) =>
    setSelection({ type: 'blankSlotElement', sectionId, componentId, slotId, elementId, elementType }), []);

  const updateSectionTitle = useCallback((sectionId, title) => {
    setSectionTitles((prev) => ({ ...prev, [sectionId]: title }));
  }, []);
  const updateSectionContentTitle = useCallback((sectionId, contentTitle) => {
    setSectionContentTitles((prev) => ({ ...prev, [sectionId]: contentTitle }));
  }, []);
  const addPageContext = useCallback((contextId) => {
    if (!contextId) return;
    setPageContextIds((prev) => (prev.includes(contextId) ? prev : [...prev, contextId]));
    setPageContextSettings((prev) => ({
      ...prev,
      [contextId]: prev[contextId] ?? defaultContextSettings(),
    }));
  }, []);
  const removePageContext = useCallback((contextId) => {
    setPageContextIds((prev) => prev.filter((id) => id !== contextId));
    setPageContextSettings((prev) => {
      const next = { ...prev };
      delete next[contextId];
      return next;
    });
  }, []);
  const addSectionContext = useCallback((sectionId, contextId) => {
    if (!contextId) return;
    setSectionContextIds((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).includes(contextId) ? prev[sectionId] : [...(prev[sectionId] || []), contextId],
    }));
    setSectionContextSettings((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [contextId]: (prev[sectionId] || {})[contextId] ?? defaultContextSettings(),
      },
    }));
  }, []);
  const removeSectionContext = useCallback((sectionId, contextId) => {
    setSectionContextIds((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).filter((id) => id !== contextId),
    }));
    setSectionContextSettings((prev) => {
      const next = { ...prev, [sectionId]: { ...prev[sectionId] } };
      delete next[sectionId][contextId];
      return next;
    });
  }, []);
  const updatePageContextSettings = useCallback((contextId, patch) => {
    setPageContextSettings((prev) => ({
      ...prev,
      [contextId]: { ...defaultContextSettings(), ...prev[contextId], ...patch },
    }));
  }, []);
  const updateSectionContextSettings = useCallback((sectionId, contextId, patch) => {
    setSectionContextSettings((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [contextId]: { ...defaultContextSettings(), ...(prev[sectionId] || {})[contextId], ...patch },
      },
    }));
  }, []);
  const openManageItems = useCallback((sectionId, componentId) => {
    setManageItemsTarget({ sectionId, componentId });
  }, []);
  const closeManageItems = useCallback(() => setManageItemsTarget(null), []);
  const openFilterModal = useCallback((sectionId, componentId) => {
    setFilterModalTarget({ type: 'component', sectionId, componentId });
  }, []);
  const openFilterModalForContext = useCallback((source, contextId) => {
    setFilterModalTarget({ type: 'context', source, contextId });
  }, []);
  const closeFilterModal = useCallback(() => setFilterModalTarget(null), []);

  const getComponentsBySection = useCallback((sectionId) => {
    switch (sectionId) {
      case 'section1': return section1Components;
      case 'section2': return section2Components;
      case 'section3': return section3Components;
      default: return [];
    }
  }, [section1Components, section2Components, section3Components]);

  const selectedRepeaterComp =
    (selection?.type === 'component' || selection?.type === 'repeaterItem' || selection?.type === 'repeater' || selection?.type === 'blankSlotElement') && selection?.sectionId && selection?.componentId
      ? getComponentsBySection(selection.sectionId)?.find((c) => c.id === selection.componentId)
      : null;

  const getContextById = useCallback((id) => availableContexts.find((c) => c.id === id), []);

  const applyDefaultBindingsForContext = useCallback((contextId) => {
    if (!contextId) return;
    const ctx = getContextById(contextId);
    const defaults = getDefaultItemBindingsForContext(contextId);
    setRepeaterItemOverrides((prev) => {
      const next = { ...prev };
      (ctx?.items ?? []).forEach((item) => {
        const existing = prev[item.id] || {};
        const merged = {};
        Object.keys(defaults).forEach((key) => {
          const current = existing[key];
          merged[key] = (current != null && current !== '') ? current : defaults[key];
        });
        next[item.id] = { ...existing, ...merged };
      });
      return next;
    });
  }, [getContextById]);

  const itemsForContext = useCallback((contextId) => {
    const ctx = getContextById(contextId);
    if (!ctx) return [];
    const raw = ctx.items ?? [];
    return raw.map((i) => ({ ...i, ...repeaterItemOverrides[i.id] }));
  }, [getContextById, repeaterItemOverrides]);

  const selectedRepeaterItem =
    selection?.type === 'repeaterItem' && selectedRepeaterComp?.assignedContextId
      ? itemsForContext(selectedRepeaterComp.assignedContextId).find((i) => i.id === selection.itemId)
        ?? getContextById(selectedRepeaterComp.assignedContextId)?.items?.find((i) => i.id === selection.itemId)
      : null;

  const updateRepeaterItem = useCallback((itemId, updated) => {
    setRepeaterItemOverrides((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...updated } }));
  }, []);

  /** Apply a binding (boundField, boundFieldImage, etc.) to all items. When valueOverride is set (e.g. source is not repeater's context), all items display that same value. */
  const updateRepeaterItemBindingForAll = useCallback((sectionId, componentId, fieldKey, value, options = null) => {
    const comp = getComponentsBySection(sectionId)?.find((c) => c.id === componentId);
    const contextId = comp?.assignedContextId;
    const ctx = contextId ? getContextById(contextId) : null;
    let itemIds = (ctx?.items ?? []).map((i) => i.id);
    if (itemIds.length === 0) {
      let unconfiguredItems = getUnconfiguredItemsForPreset(comp?.preset) ?? unconfiguredRepeaterItems;
      if (!unconfiguredItems?.length && comp?.preset !== 'blank') unconfiguredItems = unconfiguredRepeaterItems;
      itemIds = (unconfiguredItems ?? []).map((i) => i.id);
    }
    if (itemIds.length === 0) return;
    const valueOverride = options?.valueOverride;
    setRepeaterItemOverrides((prev) => {
      const next = { ...prev };
      itemIds.forEach((id) => {
        const patch = { ...(next[id] || {}), [fieldKey]: value || undefined };
        if (fieldKey === 'boundField') {
          patch.boundFieldValueOverride = valueOverride !== undefined ? (valueOverride != null ? String(valueOverride) : '') : undefined;
        }
        next[id] = patch;
      });
      return next;
    });
  }, [getComponentsBySection, getContextById]);

  const applyFilterAndSort = useCallback((rawItems, filterQuery, sortRules, filterRules) => {
    let list = rawItems;
    if (filterRules?.length) {
      list = applyFilterRules(list, filterRules);
    } else if (filterQuery && filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      list = list.filter((i) => (i.title ?? i.name ?? '').toLowerCase().includes(q));
    }
    list = applySortRules(list, sortRules ?? []);
    return list;
  }, []);

  const renderComponent = useCallback((comp, sectionId) => {
    if (comp.type === 'repeater') {
      const ctx = comp.assignedContextId ? getContextById(comp.assignedContextId) : null;
      const ctxSettings = getContextSettings(comp.assignedContextId, sectionId);
      const pageSize = ctxSettings?.pageLoad ?? comp.pageLoad ?? 4;
      const loadMoreOn = comp.loadMoreEnabled !== undefined ? comp.loadMoreEnabled : (ctxSettings?.loadMoreEnabled !== false);
      const filterRules = ctxSettings?.filterRules ?? comp.filterRules ?? [];
      const rawSortRules = ctxSettings?.sortRules ?? comp.sortRules ?? defaultSortRules;
      const sortRules = (rawSortRules?.length ? rawSortRules : null) ?? defaultSortRules;
      const rawItems = comp.connected && ctx
        ? itemsForContext(comp.assignedContextId)
        : (() => {
            let list = getUnconfiguredItemsForPreset(comp.preset) ?? unconfiguredRepeaterItems;
            if (!list?.length && comp.preset !== 'blank') list = unconfiguredRepeaterItems;
            return (list ?? []).map((i) => ({ ...i, ...repeaterItemOverrides[i.id] }));
          })();
      const items = comp.connected && ctx ? applyFilterAndSort(rawItems, comp.filterQuery, sortRules, filterRules) : rawItems;
      const contextProp = ctx ? { type: ctx.type, label: ctx.label } : { type: 'default', label: '' };
      const firstItemId = rawItems[0]?.id;
      const firstItemOverrides = firstItemId ? repeaterItemOverrides[firstItemId] : null;
      const repeaterKey = `repeater-${sectionId}-${comp.id}-${firstItemOverrides?.boundField ?? ''}-${firstItemOverrides?.boundFieldValueOverride ?? ''}`;
      return (
        <Repeater
          key={repeaterKey}
          context={contextProp}
          items={items}
          pageSize={pageSize}
          showLoadMoreButton={loadMoreOn}
          connected={comp.connected ?? false}
          onConnect={() => openConnectModal(sectionId, comp.id)}
          selectedItemId={selection?.type === 'repeaterItem' && selection.sectionId === sectionId && selection.componentId === comp.id ? selection.itemId : null}
          selectedElementKind={selection?.type === 'repeaterItem' && selection.sectionId === sectionId && selection.componentId === comp.id ? selection.elementKind : null}
          onSelectItem={(itemId) => selectRepeaterItem(sectionId, comp.id, itemId)}
          onSelectItemElement={(itemId, kind) => selectRepeaterItem(sectionId, comp.id, itemId, kind)}
          isSelected={(selection?.type === 'component' || selection?.type === 'repeater' || selection?.type === 'repeaterItem' || selection?.type === 'blankSlotElement') && selection?.sectionId === sectionId && selection?.componentId === comp.id}
          onOpenManageItems={() => openManageItems(sectionId, comp.id)}
          onOpenRepeaterSettings={openRepeaterSettings}
          contextLabel={ctx?.label ?? '—'}
          contextInstanceLabel={contextInstanceLabelMap[`${sectionId}-${comp.id}`] ?? '—'}
          contextInstance={{
            pagination: { pageSize },
            filter: filterRules,
            sort: sortRules,
          }}
          hasActiveFilter={(filterRules?.length ?? 0) > 0}
          usesParentContext={
            comp.assignedContextId != null &&
            (((sectionContextIds[sectionId] || []).includes(comp.assignedContextId) &&
              contextInstanceLabelMap[`${sectionId}-${comp.id}`] === contextInstanceLabelMap[`${sectionId}-${comp.assignedContextId}`]) ||
              ((pageContextIds || []).includes(comp.assignedContextId) &&
                contextInstanceLabelMap[`${sectionId}-${comp.id}`] === contextInstanceLabelMap[`page-${comp.assignedContextId}`]))
          }
          requireContext={false}
          unconfiguredDesignOnly={!comp.preset || comp.preset === 'blank'}
          unconfiguredRibbonDescription={comp.preset && comp.preset !== 'blank' ? 'First select the context.' : undefined}
          unconfiguredRibbonButtonLabel={comp.preset && comp.preset !== 'blank' ? 'Select context' : undefined}
          onOpenContextDetails={() => openContextDetails(sectionId, comp.id)}
          isRepeaterSelected={selection?.type === 'repeater' && selection?.sectionId === sectionId && selection?.componentId === comp.id}
          onSelectRepeater={() => selectRepeater(sectionId, comp.id)}
          onSelectInnerRepeater={() => selectComponent(sectionId, comp.id)}
          preset={comp.preset}
          presetContextLabel={
            comp.preset === 'services' ? 'Services' : comp.preset === 'books' ? 'Books' : comp.preset === 'realestate' ? 'Real estate properties' : undefined
          }
          droppedElements={comp.droppedElements}
          onDropElement={(payload) => addDroppedElementToRepeater(sectionId, comp.id, payload)}
          slotComponents={comp.slotComponents ?? defaultBlankSlotComponents()}
          onSelectBlankSlotElement={(slotId, elementId, elementType) => selectBlankSlotElement(sectionId, comp.id, slotId, elementId, elementType)}
          selectedBlankSlotElement={selection?.type === 'blankSlotElement' && selection.sectionId === sectionId && selection.componentId === comp.id ? { slotId: selection.slotId, elementId: selection.elementId } : null}
        />
      );
    }
    if (comp.type === 'text') {
      const isTextSelected = selection?.type === 'component' && selection?.sectionId === sectionId && selection?.componentId === comp.id;
      return (
        <div className="component-with-toolbar">
          {isTextSelected && (
            <RepeaterFloatingToolbar
              showManageItems={false}
              onRepeaterSettings={scrollToSettingsPanel}
            />
          )}
          <Text
            content={comp.content ?? ''}
            isSelected={isTextSelected}
            onSelect={() => selectComponent(sectionId, comp.id)}
            onChange={(value) => updateTextContent(sectionId, comp.id, value)}
          />
        </div>
      );
    }
    if (comp.type === 'image') {
      const isImageSelected = selection?.type === 'component' && selection?.sectionId === sectionId && selection?.componentId === comp.id;
      return (
        <div className="component-with-toolbar">
          {isImageSelected && (
            <RepeaterFloatingToolbar
              showManageItems={false}
              onRepeaterSettings={scrollToSettingsPanel}
            />
          )}
          <Image
            src={comp.src ?? ''}
            alt={comp.alt ?? ''}
            isSelected={isImageSelected}
            onSelect={() => selectComponent(sectionId, comp.id)}
          />
        </div>
      );
    }
    return null;
  }, [getContextById, itemsForContext, applyFilterAndSort, selection, studioTab, selectRepeaterItem, selectRepeater, selectBlankSlotElement, openManageItems, openRepeaterSettings, openConnectModal, openContextDetails, updateTextContent, updateImageContent, addDroppedElementToRepeater, scrollToSettingsPanel, repeaterItemOverrides]);

  function renderSettingsPanel() {
    if (contextDetailsTarget) {
      const comp = getComponentsBySection(contextDetailsTarget.sectionId)?.find((c) => c.id === contextDetailsTarget.componentId);
      const ctx = comp?.assignedContextId ? getContextById(comp.assignedContextId) : null;
      const ctxSettings = getContextSettings(comp?.assignedContextId, contextDetailsTarget.sectionId);
      const contextInstanceLabel = contextInstanceLabelMap[`${contextDetailsTarget.sectionId}-${contextDetailsTarget.componentId}`];
      const pagination = ctxSettings ? { pageSize: ctxSettings.pageLoad ?? 4 } : null;
      const filter = ctxSettings?.filterRules ?? comp?.filterRules ?? [];
      const sortRules = ctxSettings?.sortRules ?? comp?.sortRules ?? defaultSortRules;
      const sortSummary = getSortSummary(sortRules, getSortFieldsForContext(comp?.assignedContextId));
      return (
        <ContextDetailsPanel
          connected={comp?.connected ?? false}
          contextInstance={comp?.connected ? { pagination, filter, sortRules, sortSummary } : null}
          contextLabel={ctx?.label}
          contextInstanceLabel={contextInstanceLabel}
          onClose={closeContextDetails}
        />
      );
    }
    if (connectorPanelTarget) {
      const comp = getComponentsBySection(connectorPanelTarget.sectionId)?.find((c) => c.id === connectorPanelTarget.componentId);
      const bindProperty = connectorPanelTarget.bindProperty ?? 'text';
      const fieldKey = fieldKeyByBindProperty(bindProperty);
      const isRepeaterItem = connectorPanelTarget.itemId != null;
      const sectionId = connectorPanelTarget.sectionId;
      const sectionCtxIds = sectionId ? (sectionContextIds[sectionId] || []) : [];
      const pageCtxIds = pageContextIds || [];
      const parentContextId = sectionId && (sectionCtxIds.length > 0 || pageCtxIds.length > 0)
        ? (sectionCtxIds[0] ?? pageCtxIds[0])
        : null;
      const repeaterContextId = isRepeaterItem ? (comp?.assignedContextId ?? null) : null;
      const repeaterContextLabel = repeaterContextId ? getContextById(repeaterContextId)?.label : null;
      const sourceOptions = isRepeaterItem
        ? (() => {
            const seen = new Set();
            const list = [];
            if (repeaterContextId) {
              const rCtx = getContextById(repeaterContextId);
              list.push({ contextId: repeaterContextId, label: `Repeater context (${rCtx?.label ?? repeaterContextId})` });
              seen.add(repeaterContextId);
            }
            sectionCtxIds.forEach((cid) => {
              if (!seen.has(cid)) {
                const sCtx = getContextById(cid);
                list.push({ contextId: cid, label: `Section context (${sCtx?.label ?? cid})` });
                seen.add(cid);
              }
            });
            pageCtxIds.forEach((cid) => {
              if (!seen.has(cid)) {
                const pCtx = getContextById(cid);
                list.push({ contextId: cid, label: `Page context (${pCtx?.label ?? cid})` });
                seen.add(cid);
              }
            });
            return list.length > 0 ? [{ contextId: '', label: 'Select source' }, ...list] : [{ contextId: '', label: 'No context available' }];
          })()
        : null;
      const selectedSourceContextId = connectorPanelSourceContextId ?? (isRepeaterItem && repeaterContextId ? repeaterContextId : '');
      const ctx = selectedSourceContextId ? getContextById(selectedSourceContextId) : null;
      const sourceLabel = ctx
        ? (selectedSourceContextId === repeaterContextId
          ? `Repeater context (${ctx.label})`
          : sectionCtxIds.includes(selectedSourceContextId)
            ? `Section context (${ctx.label})`
            : `Page context (${ctx.label})`)
        : '—';
      const repeaterItemsForBinding = isRepeaterItem
        ? (repeaterContextId
            ? itemsForContext(repeaterContextId)
            : (() => {
                let list = comp ? (getUnconfiguredItemsForPreset(comp.preset) ?? unconfiguredRepeaterItems) : [];
                if (!list?.length && comp?.preset !== 'blank') list = unconfiguredRepeaterItems;
                return (list ?? []).map((i) => ({ ...i, ...repeaterItemOverrides[i.id] }));
              })())
        : [];
      const item = isRepeaterItem && selection?.type === 'repeaterItem' && selection.sectionId === connectorPanelTarget.sectionId && selection.componentId === connectorPanelTarget.componentId && selection.itemId === connectorPanelTarget.itemId
        ? (repeaterItemsForBinding.find((i) => i.id === selection.itemId) ?? selectedRepeaterItem)
        : null;
      const bindingItem = item ?? repeaterItemsForBinding[0];
      const selectedField = isRepeaterItem ? (bindingItem?.[fieldKey] ?? '') : (comp?.[fieldKey] ?? '');
      const onSelectField = isRepeaterItem
        ? (value) => {
            const sourceCtx = selectedSourceContextId ? getContextById(selectedSourceContextId) : null;
            const valueOverride =
              selectedSourceContextId && selectedSourceContextId !== repeaterContextId && sourceCtx?.items?.[0]
                ? sourceCtx.items[0][value]
                : undefined;
            updateRepeaterItemBindingForAll(
              connectorPanelTarget.sectionId,
              connectorPanelTarget.componentId,
              fieldKey,
              value,
              valueOverride !== undefined ? { valueOverride: valueOverride != null ? String(valueOverride) : '' } : undefined
            );
          }
        : (value) => updateComponentBinding(connectorPanelTarget.sectionId, connectorPanelTarget.componentId, bindProperty, value);
      const hasRealSourceOptions = sourceOptions?.length > 0 && sourceOptions.some((o) => o.contextId !== '');
      const repeaterCtx = isRepeaterItem && repeaterContextId ? getContextById(repeaterContextId) : null;
      return (
        <UseCollectionContentPanel
          collectionLabel={ctx?.label ?? 'Collection'}
          contextId={ctx?.id ?? null}
          contextType={ctx?.type ?? null}
          bindProperty={bindProperty}
          selectedField={selectedField}
          onSelectField={onSelectField}
          onClose={() => { setConnectorPanelTarget(null); setConnectorPanelSourceContextId(null); }}
          repeaterAssignedContextId={isRepeaterItem ? repeaterContextId : undefined}
          repeaterContextLabel={isRepeaterItem ? repeaterContextLabel : undefined}
          sourceLabel={hasRealSourceOptions ? undefined : sourceLabel}
          sourceOptions={isRepeaterItem ? sourceOptions : undefined}
          selectedSourceContextId={isRepeaterItem ? selectedSourceContextId : undefined}
          onSourceChange={isRepeaterItem ? (id) => setConnectorPanelSourceContextId(id || null) : undefined}
          fallbackContextIdForLabel={isRepeaterItem ? repeaterContextId : undefined}
          fallbackContextTypeForLabel={isRepeaterItem ? (repeaterCtx?.type ?? null) : undefined}
        />
      );
    }
    if (!selection) return <EmptySettingsPanel />;
    if (selection.type === 'page') {
      const attachedContexts = (pageContextIds || []).map((contextId) => {
        const ctx = availableContexts.find((c) => c.id === contextId);
        const settings = (pageContextSettings || {})[contextId] ?? defaultContextSettings();
        return {
          contextId,
          label: ctx?.label ?? '—',
          instanceLabel: contextInstanceLabelMap[`page-${contextId}`] ?? '—',
          settings,
          sortSummary: getSortSummary(settings.sortRules ?? defaultSortRules, getSortFieldsForContext(contextId)),
        };
      });
      return (
        <PageSettingsPanel
          attachedContexts={attachedContexts}
          onOpenConnectModal={openPageConnectModal}
          onClose={() => setSelection(null)}
          onOpenContextInstanceSettings={(contextId) => setContextInstanceModalTarget({ type: 'page', contextId })}
          onDisconnectContext={removePageContext}
        />
      );
    }
    if (selection.type === 'section') {
      const sectionId = selection.sectionId;
      const ids = sectionContextIds[sectionId] || [];
      const attachedContexts = ids.map((contextId) => {
        const ctx = availableContexts.find((c) => c.id === contextId);
        const settings = (sectionContextSettings[sectionId] || {})[contextId] ?? defaultContextSettings();
        return {
          contextId,
          label: ctx?.label ?? '—',
          instanceLabel: contextInstanceLabelMap[`${sectionId}-${contextId}`] ?? '—',
          settings,
          sortSummary: getSortSummary(settings.sortRules ?? defaultSortRules, getSortFieldsForContext(contextId)),
        };
      });
      return (
        <SectionSettingsPanel
          sectionId={sectionId}
          attachedContexts={attachedContexts}
          onOpenConnectModal={() => openSectionConnectModal(sectionId)}
          onClose={() => setSelection(null)}
          onOpenContextInstanceSettings={(contextId) => setContextInstanceModalTarget({ type: 'section', sectionId, contextId })}
          onDisconnectContext={(contextId) => removeSectionContext(sectionId, contextId)}
        />
      );
    }
    if (selection.type === 'contentTitle') {
      return (
        <ContentTitleSettingsPanel
          value={selection.sectionId === 'section2' ? sectionContentTitles.section2 : ''}
          onChange={(v) => updateSectionContentTitle(selection.sectionId, v)}
        />
      );
    }
    if (selection.type === 'component' && selectedRepeaterComp?.type === 'text') {
      return (
        <TextSettingsPanel
          content={selectedRepeaterComp?.content ?? ''}
          onChange={(content) => updateTextContent(selection.sectionId, selection.componentId, content)}
          onClose={() => setSelection(null)}
          onOpenConnectorPanel={(bindProperty) => setConnectorPanelTarget({ sectionId: selection.sectionId, componentId: selection.componentId, bindProperty })}
          connected={!!(selectedRepeaterComp?.boundField && selectedRepeaterComp.boundField.trim() !== '')}
        />
      );
    }
    if (selection.type === 'component' && selectedRepeaterComp?.type === 'image') {
      return (
        <ImageSettingsPanel
          src={selectedRepeaterComp?.src ?? ''}
          alt={selectedRepeaterComp?.alt ?? ''}
          onSrcChange={(src) => updateImageContent(selection.sectionId, selection.componentId, { src })}
          onAltChange={(alt) => updateImageContent(selection.sectionId, selection.componentId, { alt })}
          onClose={() => setSelection(null)}
          onOpenConnectorPanel={(bindProperty) => setConnectorPanelTarget({ sectionId: selection.sectionId, componentId: selection.componentId, bindProperty })}
          srcConnected={!!(selectedRepeaterComp?.boundFieldImage && selectedRepeaterComp.boundFieldImage.trim() !== '')}
          altConnected={!!(selectedRepeaterComp?.boundFieldImageAlt && selectedRepeaterComp.boundFieldImageAlt.trim() !== '')}
        />
      );
    }
    if (selection.type === 'blankSlotElement') {
      const comp = selectedRepeaterComp;
      const slotId = selection.slotId;
      const elementId = selection.elementId;
      const elementType = selection.elementType ?? 'text';
      const slotComps = comp?.slotComponents?.[slotId] ?? [];
      const slotEl = slotComps.find((x) => x.id === elementId);
      if (slotEl?.type === 'text') {
        const syntheticItem = { title: slotEl.content ?? '', name: '', boundField: '' };
        return (
          <RepeaterItemElementPanel
            item={syntheticItem}
            elementKind="text"
            contextId={null}
            contextType={null}
            onUpdate={(updated) => updateBlankSlotComponent(selection.sectionId, selection.componentId, slotId, elementId, { content: updated.title ?? updated.name ?? '' })}
            onClose={() => setSelection(null)}
            onOpenConnectorPanel={(bindProperty) => setConnectorPanelTarget({
              sectionId: selection.sectionId,
              componentId: selection.componentId,
              itemId: slotId,
              bindProperty: bindProperty ?? 'text',
            })}
          />
        );
      }
      if (slotEl?.type === 'image') {
        const syntheticItem = {
          image: slotEl.src ?? '',
          imageAlt: slotEl.alt ?? '',
          imageLink: '',
          boundFieldImage: '',
          boundFieldImageAlt: '',
          boundFieldImageLink: '',
        };
        return (
          <RepeaterItemElementPanel
            item={syntheticItem}
            elementKind="image"
            contextId={null}
            contextType={null}
            onUpdate={(updated) => updateBlankSlotComponent(selection.sectionId, selection.componentId, slotId, elementId, {
              src: updated.image ?? '',
              alt: updated.imageAlt ?? '',
            })}
            onClose={() => setSelection(null)}
            onOpenConnectorPanel={(bindProperty) => setConnectorPanelTarget({
              sectionId: selection.sectionId,
              componentId: selection.componentId,
              itemId: slotId,
              bindProperty: bindProperty ?? 'image',
            })}
          />
        );
      }
    }
    if (selection.type === 'repeaterItem') {
      const comp = selectedRepeaterComp;
      const slotId = selection.itemId;
      if (comp?.preset === 'blank' && typeof slotId === 'string' && slotId.startsWith('blank-slot-')) {
        const slotIndex = parseInt(slotId.replace('blank-slot-', ''), 10);
        if (!Number.isNaN(slotIndex) && slotIndex >= 0 && slotIndex <= 2) {
          const slotComps = comp.slotComponents?.[slotId] ?? [];
          return (
            <BlankRepeaterSlotPanel
              slotIndex={slotIndex}
              components={slotComps}
              onAddText={() => addComponentToBlankSlot(selection.sectionId, selection.componentId, slotId, 'text')}
              onAddImage={() => addComponentToBlankSlot(selection.sectionId, selection.componentId, slotId, 'image')}
              onRemove={(compId) => removeComponentFromBlankSlot(selection.sectionId, selection.componentId, slotId, compId)}
              onUpdate={(compId, updates) => updateBlankSlotComponent(selection.sectionId, selection.componentId, slotId, compId, updates)}
              onClose={() => setSelection(null)}
            />
          );
        }
      }
      const ctx = comp?.assignedContextId ? getContextById(comp.assignedContextId) : null;
      const item = selectedRepeaterItem ?? null;
      return (
        <RepeaterItemElementPanel
          item={item}
          elementKind={selection.elementKind ?? 'text'}
          contextId={comp?.assignedContextId}
          contextType={ctx?.type}
          onUpdate={(updated) => updateRepeaterItem(selection.itemId, updated)}
          onClose={() => setSelection(null)}
          onOpenConnectorPanel={(bindProperty) => setConnectorPanelTarget({
            sectionId: selection.sectionId,
            componentId: selection.componentId,
            itemId: selection.itemId,
            bindProperty: bindProperty ?? 'text',
          })}
        />
      );
    }
    if ((selection.type === 'component' || selection.type === 'repeater') && selectedRepeaterComp?.type !== 'repeater') {
      return <EmptySettingsPanel />;
    }
    if ((selection.type === 'component' || selection.type === 'repeater') && selectedRepeaterComp?.type === 'repeater') {
      const assignedCtx = selectedRepeaterComp?.assignedContextId
        ? getContextById(selectedRepeaterComp.assignedContextId)
        : null;
      const ctxSettings = getContextSettings(selectedRepeaterComp?.assignedContextId, selection.sectionId);
      const contextSource = getContextSource(selectedRepeaterComp?.assignedContextId, selection.sectionId);
      return (
      <RepeaterSettingsPanel
        availableContexts={availableContextsForRepeater}
        assignedContextId={selectedRepeaterComp?.assignedContextId ?? null}
        onSelectContext={(contextId) => {
          setComponentContext(selection.sectionId, selection.componentId, contextId);
          applyDefaultBindingsForContext(contextId);
        }}
        onOpenConnectModal={() => setConnectModalTarget({ type: 'component', sectionId: selection.sectionId, componentId: selection.componentId, mode: 'replace' })}
        onClose={() => { setRepeaterSettingsPanelOpen(false); setSelection(null); }}
        contextLabel={assignedCtx?.label ?? ''}
        hasContext={selectedRepeaterComp?.connected ?? false}
        itemsConnectTo={selectedRepeaterComp?.itemsConnectTo ?? 'items'}
        onItemsConnectToChange={(value) => {
          const setter = getSetBySection(selection.sectionId);
          setter((prev) => prev.map((c) => (c.id === selection.componentId ? { ...c, itemsConnectTo: value } : c)));
        }}
        loadMoreEnabled={selectedRepeaterComp?.loadMoreEnabled !== false}
        onLoadMoreChange={(enabled) => setRepeaterLoadMore(selection.sectionId, selection.componentId, enabled)}
        contextSettingsReadOnly={ctxSettings ? { pageLoad: ctxSettings.pageLoad ?? 4, filterRules: ctxSettings.filterRules ?? [], sortRules: ctxSettings.sortRules ?? defaultSortRules, sortSummary: getSortSummary(ctxSettings.sortRules ?? defaultSortRules, getSortFieldsForContext(selectedRepeaterComp?.assignedContextId)) } : null}
        contextSource={contextSource}
        onOpenContextSettings={(source) => setSelection(source === 'page' ? { type: 'page' } : { type: 'section', sectionId: source })}
        onOpenContextInstanceSettings={() => setContextInstanceModalTarget({ sectionId: selection.sectionId, componentId: selection.componentId })}
        contextInstanceLabel={contextInstanceLabelMap[`${selection.sectionId}-${selection.componentId}`]}
      />
    );
    }
    return <EmptySettingsPanel />;
  }

  return (
    <div className="editor editor--studio">
      <ConnectContextModal
        isOpen={connectModalTarget !== null}
        onClose={closeConnectModal}
        connectTarget={connectModalTarget}
        targetLabel={
          connectModalTarget?.type === 'page'
            ? 'this page'
            : connectModalTarget?.type === 'section'
              ? 'this section'
              : connectModalTarget
                ? 'this repeater'
                : 'this page'
        }
        selectedContextId={
          connectModalTarget?.type === 'page'
            ? (pageContextIds?.[0] ?? null)
            : connectModalTarget?.type === 'section'
              ? (sectionContextIds[connectModalTarget.sectionId]?.[0] ?? null)
              : connectModalTarget?.type === 'component' && connectModalTarget.sectionId && connectModalTarget.componentId
                ? (getComponentsBySection(connectModalTarget.sectionId)?.find((c) => c.id === connectModalTarget.componentId)?.assignedContextId)
                : null
        }
        allowedContextIds={undefined}
        allowedContextsWithInstances={connectModalTarget?.type === 'component' ? parentContextsForRepeaterModal : undefined}
        allowAddContext={connectModalTarget?.type === 'component'}
        suggestedContextIdForPreset={
          connectModalTarget?.type === 'component' && connectModalTarget.sectionId && connectModalTarget.componentId
            ? (() => {
                const comp = getComponentsBySection(connectModalTarget.sectionId)?.find((c) => c.id === connectModalTarget.componentId);
                return comp?.preset === 'services' ? 'services' : comp?.preset === 'books' ? 'bookends' : comp?.preset === 'realestate' ? 'realestate' : null;
              })()
            : null
        }
        createdContextIds={contextIdsCreatedOnPage}
        addContextTarget={
          connectModalTarget?.type === 'component' && connectModalTarget.sectionId && connectModalTarget.componentId
            ? { type: 'repeaterAddContext', sectionId: connectModalTarget.sectionId, componentId: connectModalTarget.componentId }
            : undefined
        }
        attachedContextIds={
          connectModalTarget?.type === 'page'
            ? (pageContextIds || [])
            : connectModalTarget?.type === 'section'
              ? (sectionContextIds[connectModalTarget.sectionId] || [])
              : undefined
        }
        onConnect={(contextId, target) => {
          if (!contextId) return;
          const t = target ?? connectModalTarget;
          if (!t) return;
          if (t.type === 'page') {
            addPageContext(contextId);
          } else if (t.type === 'section') {
            addSectionContext(t.sectionId, contextId);
          } else if (t.type === 'repeaterAddContext' && t.sectionId && t.componentId) {
            setComponentContext(t.sectionId, t.componentId, contextId, 'add');
            applyDefaultBindingsForContext(contextId);
            if (connectModalPresetIds.includes(contextId)) {
              setPresetUsedIds((prev) => (prev.includes(contextId) ? prev : [...prev, contextId]));
            }
          } else if (t.sectionId && t.componentId) {
            setComponentContext(t.sectionId, t.componentId, contextId, 'parent');
            applyDefaultBindingsForContext(contextId);
            if (connectModalPresetIds.includes(contextId)) {
              setPresetUsedIds((prev) => (prev.includes(contextId) ? prev : [...prev, contextId]));
            }
          }
          closeConnectModal();
        }}
      />
      <FilterModal
        isOpen={filterModalTarget !== null}
        onClose={closeFilterModal}
        filterRules={
          filterModalTarget?.type === 'context' && filterModalTarget.contextId != null
            ? (filterModalTarget.source === 'page'
                ? (pageContextSettings || {})[filterModalTarget.contextId]?.filterRules
                : (sectionContextSettings[filterModalTarget.source] || {})[filterModalTarget.contextId]?.filterRules) ?? []
            : filterModalTarget?.type === 'component' && filterModalTarget.sectionId
              ? getComponentsBySection(filterModalTarget.sectionId)?.find((c) => c.id === filterModalTarget.componentId)?.filterRules ?? []
              : []
        }
        onApply={(rules) => {
          if (filterModalTarget?.type === 'context' && filterModalTarget.contextId != null) {
            if (filterModalTarget.source === 'page') updatePageContextSettings(filterModalTarget.contextId, { filterRules: rules });
            else updateSectionContextSettings(filterModalTarget.source, filterModalTarget.contextId, { filterRules: rules });
          } else if (filterModalTarget?.type === 'component') {
            setRepeaterFilterRules(filterModalTarget.sectionId, filterModalTarget.componentId, rules);
          }
          closeFilterModal();
        }}
        availableFields={
          filterModalTarget?.type === 'context' && filterModalTarget.contextId != null
            ? getFilterFieldsForContext(filterModalTarget.contextId)
            : filterModalTarget?.type === 'component' && filterModalTarget.sectionId
              ? (() => {
                  const comp = getComponentsBySection(filterModalTarget.sectionId)?.find((c) => c.id === filterModalTarget.componentId);
                  return getFilterFieldsForContext(comp?.assignedContextId);
                })()
              : undefined
        }
      />
      <SortModal
        isOpen={sortModalTarget !== null}
        onClose={() => setSortModalTarget(null)}
        sortRules={
          sortModalTarget?.type === 'context' && sortModalTarget.contextId != null
            ? (sortModalTarget.source === 'page'
                ? (pageContextSettings || {})[sortModalTarget.contextId]?.sortRules
                : (sectionContextSettings[sortModalTarget.source] || {})[sortModalTarget.contextId]?.sortRules) ?? []
            : sortModalTarget?.type === 'component' && sortModalTarget.sectionId
              ? getComponentsBySection(sortModalTarget.sectionId)?.find((c) => c.id === sortModalTarget.componentId)?.sortRules ?? []
              : []
        }
        onApply={(rules) => {
          if (sortModalTarget?.type === 'context' && sortModalTarget.contextId != null) {
            if (sortModalTarget.source === 'page') updatePageContextSettings(sortModalTarget.contextId, { sortRules: rules ?? [] });
            else updateSectionContextSettings(sortModalTarget.source, sortModalTarget.contextId, { sortRules: rules ?? [] });
          } else if (sortModalTarget?.type === 'component') {
            setRepeaterSortRules(sortModalTarget.sectionId, sortModalTarget.componentId, rules ?? []);
          }
          setSortModalTarget(null);
        }}
        availableFields={
          sortModalTarget?.type === 'context' && sortModalTarget.contextId != null
            ? getSortFieldsForContext(sortModalTarget.contextId)
            : sortModalTarget?.type === 'component' && sortModalTarget.sectionId
              ? (() => {
                  const comp = getComponentsBySection(sortModalTarget.sectionId)?.find((c) => c.id === sortModalTarget.componentId);
                  return getSortFieldsForContext(comp?.assignedContextId) ?? [];
                })()
              : []
        }
      />
      {contextInstanceModalTarget && (() => {
        if (contextInstanceModalTarget.type === 'page' && contextInstanceModalTarget.contextId) {
          const contextId = contextInstanceModalTarget.contextId;
          const settings = (pageContextSettings || {})[contextId] ?? defaultContextSettings();
          return (
            <ContextInstanceSettingsModal
              isOpen
              onClose={() => setContextInstanceModalTarget(null)}
              instanceLabel={contextInstanceLabelMap[`page-${contextId}`] ?? '—'}
              pageLoad={settings?.pageLoad ?? 4}
              onPageLoadChange={(v) => updatePageContextSettings(contextId, { pageLoad: Math.max(1, Math.min(100, Number(v) || 1)) })}
              filterRules={settings?.filterRules ?? []}
              onOpenFilter={() => openFilterModalForContext('page', contextId)}
              sortRules={settings?.sortRules ?? defaultSortRules}
              onOpenSort={() => setSortModalTarget({ type: 'context', source: 'page', contextId })}
              availableSortFields={getSortFieldsForContext(contextId)}
            />
          );
        }
        if (contextInstanceModalTarget.type === 'section' && contextInstanceModalTarget.sectionId && contextInstanceModalTarget.contextId) {
          const sectionId = contextInstanceModalTarget.sectionId;
          const contextId = contextInstanceModalTarget.contextId;
          const settings = (sectionContextSettings[sectionId] || {})[contextId] ?? defaultContextSettings();
          return (
            <ContextInstanceSettingsModal
              isOpen
              onClose={() => setContextInstanceModalTarget(null)}
              instanceLabel={contextInstanceLabelMap[`${sectionId}-${contextId}`] ?? '—'}
              pageLoad={settings?.pageLoad ?? 4}
              onPageLoadChange={(v) => updateSectionContextSettings(sectionId, contextId, { pageLoad: Math.max(1, Math.min(100, Number(v) || 1)) })}
              filterRules={settings?.filterRules ?? []}
              onOpenFilter={() => openFilterModalForContext(sectionId, contextId)}
              sortRules={settings?.sortRules ?? defaultSortRules}
              onOpenSort={() => setSortModalTarget({ type: 'context', source: sectionId, contextId })}
              availableSortFields={getSortFieldsForContext(contextId)}
            />
          );
        }
        const comp = getComponentsBySection(contextInstanceModalTarget.sectionId)?.find((c) => c.id === contextInstanceModalTarget.componentId);
        const instanceLabel = contextInstanceLabelMap[`${contextInstanceModalTarget.sectionId}-${contextInstanceModalTarget.componentId}`] ?? '—';
        const contextId = comp?.assignedContextId;
        return (
          <ContextInstanceSettingsModal
            isOpen
            onClose={() => setContextInstanceModalTarget(null)}
            instanceLabel={instanceLabel}
            pageLoad={comp?.pageLoad ?? 4}
            onPageLoadChange={(v) => setRepeaterPageLoad(contextInstanceModalTarget.sectionId, contextInstanceModalTarget.componentId, v)}
            filterRules={comp?.filterRules ?? []}
            onOpenFilter={() => openFilterModal(contextInstanceModalTarget.sectionId, contextInstanceModalTarget.componentId)}
            sortRules={comp?.sortRules ?? defaultSortRules}
            onOpenSort={() => setSortModalTarget({ type: 'component', sectionId: contextInstanceModalTarget.sectionId, componentId: contextInstanceModalTarget.componentId })}
            availableSortFields={getSortFieldsForContext(contextId)}
          />
        );
      })()}
      {manageItemsTarget && (() => {
        const comp = getComponentsBySection(manageItemsTarget.sectionId)?.find((c) => c.id === manageItemsTarget.componentId);
        const ctx = comp?.assignedContextId ? getContextById(comp.assignedContextId) : null;
        const ctxSettings = getContextSettings(comp?.assignedContextId, manageItemsTarget.sectionId);
        const filterRules = ctxSettings?.filterRules ?? comp?.filterRules ?? [];
        const rawSortRules = ctxSettings?.sortRules ?? comp?.sortRules ?? defaultSortRules;
        const sortRules = (rawSortRules?.length ? rawSortRules : null) ?? defaultSortRules;
        const rawItems = ctx ? itemsForContext(comp.assignedContextId) : [];
        const sorted = applySortRules(applyFilterRules(rawItems, filterRules), sortRules);
        const source = getContextSource(comp?.assignedContextId, manageItemsTarget.sectionId);
        const contextId = comp?.assignedContextId;
        const onSortChange = (rules) => {
          if (source === 'page' && contextId) updatePageContextSettings(contextId, { sortRules: rules ?? [] });
          else if (source && contextId) updateSectionContextSettings(source, contextId, { sortRules: rules ?? [] });
          else setRepeaterSortRules(manageItemsTarget.sectionId, manageItemsTarget.componentId, rules ?? []);
        };
        const onOpenFilter = () => {
          if (source === 'page' && contextId) openFilterModalForContext('page', contextId);
          else if (source && contextId) openFilterModalForContext(source, contextId);
          else openFilterModal(manageItemsTarget.sectionId, manageItemsTarget.componentId);
        };
        const onRemoveFilter = () => {
          if (source === 'page' && contextId) updatePageContextSettings(contextId, { filterRules: [] });
          else if (source && contextId) updateSectionContextSettings(source, contextId, { filterRules: [] });
          else setRepeaterFilterRules(manageItemsTarget.sectionId, manageItemsTarget.componentId, []);
        };
        return (
          <ManageItemsPanel
            isOpen
            onClose={closeManageItems}
            collectionLabel={ctx?.label ?? 'Collection'}
            collectionId={comp?.assignedContextId ?? null}
            items={sorted}
            sortRules={sortRules}
            onSortChange={onSortChange}
            onOpenSort={() => setSortModalTarget({ type: 'component', sectionId: manageItemsTarget.sectionId, componentId: manageItemsTarget.componentId })}
            availableSortFields={getSortFieldsForContext(comp?.assignedContextId) ?? []}
            filterRules={filterRules}
            onOpenFilter={onOpenFilter}
            onRemoveFilter={onRemoveFilter}
            onOpenCollection={closeManageItems}
            onEditItem={(item) => { closeManageItems(); selectRepeaterItem(manageItemsTarget.sectionId, manageItemsTarget.componentId, item.id); }}
            onAddItem={() => {}}
          />
        );
      })()}
      <header className="editor-header">
        <h1 className="editor-name">Studio</h1>
        <p className="editor-desc">
          Assign <strong>context</strong> (source) to the page, a section, or a container in the settings panel.
        </p>
        <div className="editor-studio-tabs" role="tablist">
          {STUDIO_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={studioTab === tab.id}
              className={`editor-studio-tab ${studioTab === tab.id ? 'editor-studio-tab--active' : ''}`}
              onClick={() => setStudioTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {studioTab === 'concept' && (
          <p className="editor-studio-concept-desc">
            User can design the blank repeater without selecting the context. For design presets, context selection is required first.
          </p>
        )}
      </header>

      <div className="editor-workspace">
        <section className="editor-canvas-section">
          <Stage
            className="stage--studio"
            isPageSelected={selection?.type === 'page'}
            onSelectPage={selectPage}
            pageContexts={(pageContextIds || []).map((id) => ({
              label: getContextById(id)?.label ?? '—',
              instanceLabel: contextInstanceLabelMap[`page-${id}`] ?? '—',
            }))}
            onOpenPageConnect={openPageConnectModal}
            showPageConnectButton={true}
            hasPageContext={(pageContextIds || []).length > 0}
          >
            <Section
              sectionId="section1"
              title={sectionTitles.section1}
              components={section1Components}
              renderComponent={renderComponent}
              onAddComponent={addComponent}
              addableComponents={STUDIO_ADDABLE_COMPONENTS}
              onRemoveComponent={removeComponent}
              isSectionSelected={selection?.type === 'section' && selection.sectionId === 'section1'}
              selectedComponentId={(selection?.type === 'component' || selection?.type === 'repeater' || selection?.type === 'repeaterItem' || selection?.type === 'blankSlotElement') && selection?.sectionId === 'section1' ? selection.componentId : null}
              onSelectSection={selectSection}
              onSelectComponent={selectComponent}
              sectionContexts={(sectionContextIds.section1 || []).map((id) => ({
                label: getContextById(id)?.label ?? '—',
                instanceLabel: contextInstanceLabelMap[`section1-${id}`] ?? '—',
              }))}
              onOpenSectionConnect={() => openSectionConnectModal('section1')}
              showSectionConnectButton={true}
            />
            <Section
              sectionId="section2"
              title={sectionTitles.section2}
              contentTitle={sectionContentTitles.section2}
              components={section2Components}
              renderComponent={renderComponent}
              onAddComponent={addComponent}
              addableComponents={STUDIO_ADDABLE_COMPONENTS}
              onRemoveComponent={removeComponent}
              isSectionSelected={selection?.type === 'section' && selection.sectionId === 'section2'}
              isContentTitleSelected={selection?.type === 'contentTitle' && selection.sectionId === 'section2'}
              selectedComponentId={(selection?.type === 'component' || selection?.type === 'repeater' || selection?.type === 'repeaterItem' || selection?.type === 'blankSlotElement') && selection?.sectionId === 'section2' ? selection.componentId : null}
              onSelectSection={selectSection}
              onSelectContentTitle={selectContentTitle}
              onSelectComponent={selectComponent}
              sectionContexts={(sectionContextIds.section2 || []).map((id) => ({
                label: getContextById(id)?.label ?? '—',
                instanceLabel: contextInstanceLabelMap[`section2-${id}`] ?? '—',
              }))}
              onOpenSectionConnect={() => openSectionConnectModal('section2')}
              showSectionConnectButton={true}
            />
            <Section
              sectionId="section3"
              title={sectionTitles.section3}
              components={section3Components}
              renderComponent={renderComponent}
              onAddComponent={addComponent}
              addableComponents={STUDIO_ADDABLE_COMPONENTS}
              onRemoveComponent={removeComponent}
              isSectionSelected={selection?.type === 'section' && selection.sectionId === 'section3'}
              selectedComponentId={(selection?.type === 'component' || selection?.type === 'repeater' || selection?.type === 'repeaterItem' || selection?.type === 'blankSlotElement') && selection?.sectionId === 'section3' ? selection.componentId : null}
              onSelectSection={selectSection}
              onSelectComponent={selectComponent}
              sectionContexts={(sectionContextIds.section3 || []).map((id) => ({
                label: getContextById(id)?.label ?? '—',
                instanceLabel: contextInstanceLabelMap[`section3-${id}`] ?? '—',
              }))}
              onOpenSectionConnect={() => openSectionConnectModal('section3')}
              showSectionConnectButton={true}
            />
          </Stage>
        </section>
        <aside ref={settingsAsideRef} id="editor-settings-aside" className="editor-settings-aside">
          {renderSettingsPanel()}
        </aside>
      </div>
    </div>
  );
}
