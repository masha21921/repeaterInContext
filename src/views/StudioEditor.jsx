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
import { PageSettingsPanel } from '../components/PageSettingsPanel';
import { ManageItemsPanel } from '../components/ManageItemsPanel';
import { FilterModal } from '../components/FilterModal';
import { ConnectContextModal } from '../components/ConnectContextModal';
import { EmptySettingsPanel } from '../components/EmptySettingsPanel';
import { BlankRepeaterSlotPanel } from '../components/BlankRepeaterSlotPanel';
import { ContainerSettingsPanel } from '../components/ContainerSettingsPanel';
import { RepeaterItemElementPanel } from '../components/RepeaterItemElementPanel';
import { applyFilterRules } from '../utils/filterRules';
import {
  unconfiguredRepeaterItems,
  availableContexts,
  connectModalPresetIds,
  getUnconfiguredItemsForPreset,
  getDefaultItemBindingsForContext,
} from '../data/demoData';
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
  { type: 'repeater', preset: 'products', label: 'Design preset 1', group: 'Repeaters' },
  { type: 'repeater', preset: 'team', label: 'Design preset 2', group: 'Repeaters' },
  { type: 'repeater', preset: 'blank', label: 'Blank', group: 'Repeaters' },
];

const STUDIO_ADDABLE_COMPONENTS = [
  ...STUDIO_REPEATER_PRESETS,
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
];

const STUDIO_TABS = [
  { id: 'concept', label: 'Concept 1' },
  { id: 'contextFirst', label: 'Concept 2' },
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
  const [pageContextId, setPageContextId] = useState(null);
  const [sectionContextIds, setSectionContextIds] = useState({});
  const [connectModalTarget, setConnectModalTarget] = useState(null);
  const [manageItemsTarget, setManageItemsTarget] = useState(null);
  const [filterModalTarget, setFilterModalTarget] = useState(null);
  const [contextDetailsTarget, setContextDetailsTarget] = useState(null);
  const [connectorPanelTarget, setConnectorPanelTarget] = useState(null);
  const [presetUsedIds, setPresetUsedIds] = useState([]);
  const [repeaterSettingsPanelOpen, setRepeaterSettingsPanelOpen] = useState(false);
  const [technicalMode, setTechnicalMode] = useState(false);
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
    () => [...new Set([pageContextId, sectionContextIds.section1, sectionContextIds.section2, sectionContextIds.section3].filter(Boolean))],
    [pageContextId, sectionContextIds]
  );

  /** Context objects from parents (page/section). Used by container settings to "use context from page" or show "Add context" when empty. */
  const parentContextsForContainer = useMemo(
    () => availableContexts.filter((c) => contextIdsOnPage.includes(c.id)),
    [availableContexts, contextIdsOnPage]
  );

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

  /** Unique context instance label per repeater: "CollectionName 1", "CollectionName 2", ... */
  const contextInstanceLabelMap = useMemo(() => {
    const map = {};
    const countByContextId = {};
    const sections = [
      ['section1', section1Components],
      ['section2', section2Components],
      ['section3', section3Components],
    ];
    sections.forEach(([sectionId, comps]) => {
      comps.forEach((comp) => {
        if (comp.type === 'repeater' && comp.assignedContextId) {
          const ctx = availableContexts.find((c) => c.id === comp.assignedContextId);
          const label = ctx?.label ?? comp.assignedContextId;
          countByContextId[comp.assignedContextId] = (countByContextId[comp.assignedContextId] ?? 0) + 1;
          const n = countByContextId[comp.assignedContextId];
          map[`${sectionId}-${comp.id}`] = `${label} ${n}`;
        }
      });
    });
    return map;
  }, [section1Components, section2Components, section3Components, availableContexts]);

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

  const setComponentContext = useCallback((sectionId, componentId, contextId) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) =>
        c.id === componentId
          ? {
              ...c,
              assignedContextId: contextId || null,
              connected: !!contextId,
              // Reset context instance to defaults when context changes
              filterRules: [],
              sortOption: 'default',
            }
          : c
      )
    );
  }, [getSetBySection]);

  const setRepeaterSort = useCallback((sectionId, componentId, sortOption) => {
    const setter = getSetBySection(sectionId);
    setter((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, sortOption } : c))
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
  const updatePageContext = useCallback((contextId) => setPageContextId(contextId || null), []);
  const updateSectionContext = useCallback((sectionId, contextId) => {
    setSectionContextIds((prev) => ({ ...prev, [sectionId]: contextId || null }));
  }, []);
  const openManageItems = useCallback((sectionId, componentId) => {
    setManageItemsTarget({ sectionId, componentId });
  }, []);
  const closeManageItems = useCallback(() => setManageItemsTarget(null), []);
  const openFilterModal = useCallback((sectionId, componentId) => {
    setFilterModalTarget({ sectionId, componentId });
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
        next[item.id] = { ...defaults, ...(prev[item.id] || {}) };
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

  /** Apply a binding (boundField, boundFieldImage, etc.) to all items in the repeater's context. */
  const updateRepeaterItemBindingForAll = useCallback((sectionId, componentId, fieldKey, value) => {
    const comp = getComponentsBySection(sectionId)?.find((c) => c.id === componentId);
    const contextId = comp?.assignedContextId;
    const ctx = contextId ? getContextById(contextId) : null;
    const itemIds = (ctx?.items ?? []).map((i) => i.id);
    if (itemIds.length === 0) return;
    setRepeaterItemOverrides((prev) => {
      const next = { ...prev };
      itemIds.forEach((id) => {
        next[id] = { ...(next[id] || {}), [fieldKey]: value || undefined };
      });
      return next;
    });
  }, [getComponentsBySection, getContextById]);

  const applyFilterAndSort = useCallback((rawItems, filterQuery, sortOption, filterRules) => {
    let list = rawItems;
    if (filterRules?.length) {
      list = applyFilterRules(list, filterRules);
    } else if (filterQuery && filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      list = list.filter((i) => (i.title ?? i.name ?? '').toLowerCase().includes(q));
    }
    list = [...list];
    if (sortOption === 'name') list.sort((a, b) => (a.title ?? a.name ?? '').localeCompare(b.title ?? b.name ?? ''));
    if (sortOption === 'nameDesc') list.sort((a, b) => (b.title ?? b.name ?? '').localeCompare(a.title ?? a.name ?? ''));
    return list;
  }, []);

  const renderComponent = useCallback((comp, sectionId) => {
    if (comp.type === 'repeater') {
      const ctx = comp.assignedContextId ? getContextById(comp.assignedContextId) : null;
      const rawItems = comp.connected && ctx
        ? itemsForContext(comp.assignedContextId)
        : getUnconfiguredItemsForPreset(comp.preset) ?? unconfiguredRepeaterItems;
      const items = comp.connected && ctx ? applyFilterAndSort(rawItems, comp.filterQuery, comp.sortOption, comp.filterRules) : rawItems;
      const contextProp = ctx ? { type: ctx.type, label: ctx.label } : { type: 'default', label: '' };
      return (
        <Repeater
          context={contextProp}
          items={items}
          pageSize={comp.pageLoad ?? 4}
          showLoadMoreButton={comp.loadMoreEnabled !== false}
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
            pagination: { pageSize: comp.pageLoad ?? 4 },
            filter: comp.filterRules ?? [],
            sort: comp.sortOption ?? 'default',
          }}
          hasActiveFilter={(comp.filterRules?.length ?? 0) > 0}
          technicalMode={technicalMode}
          exposeContext={technicalMode}
          requireContext={studioTab === 'contextFirst'}
          unconfiguredDesignOnly={true}
          onOpenContextDetails={() => openContextDetails(sectionId, comp.id)}
          isRepeaterSelected={selection?.type === 'repeater' && selection?.sectionId === sectionId && selection?.componentId === comp.id}
          onSelectRepeater={() => selectRepeater(sectionId, comp.id)}
          onSelectInnerRepeater={() => selectComponent(sectionId, comp.id)}
          preset={comp.preset}
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
  }, [getContextById, itemsForContext, applyFilterAndSort, selection, studioTab, technicalMode, selectRepeaterItem, selectRepeater, selectBlankSlotElement, openManageItems, openRepeaterSettings, openConnectModal, openContextDetails, updateTextContent, updateImageContent, addDroppedElementToRepeater, scrollToSettingsPanel]);

  function renderSettingsPanel() {
    if (contextDetailsTarget) {
      const comp = getComponentsBySection(contextDetailsTarget.sectionId)?.find((c) => c.id === contextDetailsTarget.componentId);
      const ctx = comp?.assignedContextId ? getContextById(comp.assignedContextId) : null;
      const contextInstanceLabel = contextInstanceLabelMap[`${contextDetailsTarget.sectionId}-${contextDetailsTarget.componentId}`];
      return (
        <ContextDetailsPanel
          connected={comp?.connected ?? false}
          contextInstance={comp?.connected ? { pagination: { pageSize: comp.pageLoad ?? 4 }, filter: comp.filterRules ?? [], sort: comp.sortOption ?? 'default' } : null}
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
      if (isRepeaterItem && (!comp?.assignedContextId || !comp?.connected)) {
        return (
          <EmptySettingsPanel
            title="Connect to CMS field"
            message="There is no context to connect to. Connect the container to a collection in the container settings first."
            onClose={() => setConnectorPanelTarget(null)}
          />
        );
      }
      const ctx = isRepeaterItem && comp?.assignedContextId
        ? getContextById(comp.assignedContextId)
        : (connectorPanelTarget.sectionId && (sectionContextIds[connectorPanelTarget.sectionId] || pageContextId))
          ? getContextById(sectionContextIds[connectorPanelTarget.sectionId] || pageContextId)
          : null;
      const item = isRepeaterItem && selection?.type === 'repeaterItem' && selection.sectionId === connectorPanelTarget.sectionId && selection.componentId === connectorPanelTarget.componentId && selection.itemId === connectorPanelTarget.itemId
        ? selectedRepeaterItem
        : null;
      const selectedField = isRepeaterItem ? (item?.[fieldKey] ?? '') : (comp?.[fieldKey] ?? '');
      const onSelectField = isRepeaterItem
        ? (value) => updateRepeaterItemBindingForAll(connectorPanelTarget.sectionId, connectorPanelTarget.componentId, fieldKey, value)
        : (value) => updateComponentBinding(connectorPanelTarget.sectionId, connectorPanelTarget.componentId, bindProperty, value);
      return (
        <UseCollectionContentPanel
          collectionLabel={ctx?.label ?? 'Collection'}
          contextId={ctx?.id ?? null}
          contextType={ctx?.type ?? null}
          bindProperty={bindProperty}
          selectedField={selectedField}
          onSelectField={onSelectField}
          onClose={() => setConnectorPanelTarget(null)}
        />
      );
    }
    if (selection?.type === 'repeater' && selectedRepeaterComp?.type === 'repeater') {
      const assignedCtx = selectedRepeaterComp?.assignedContextId
        ? getContextById(selectedRepeaterComp.assignedContextId)
        : null;
      return (
        <ContainerSettingsPanel
          parentContexts={parentContextsForContainer}
          assignedContextId={selectedRepeaterComp?.assignedContextId ?? null}
          onSelectContext={(contextId) => {
            setComponentContext(selection.sectionId, selection.componentId, contextId);
            applyDefaultBindingsForContext(contextId);
          }}
          onOpenConnectModal={() => setConnectModalTarget({ sectionId: selection.sectionId, componentId: selection.componentId, type: 'component' })}
          onClose={() => setSelection(null)}
          contextLabel={assignedCtx?.label ?? ''}
          hasContext={selectedRepeaterComp?.connected ?? false}
        />
      );
    }
    if (!selection) return <EmptySettingsPanel />;
    if (selection.type === 'page') {
      return (
        <PageSettingsPanel
          availableContexts={availableContexts}
          selectedContextId={pageContextId}
          onSelectContext={updatePageContext}
        />
      );
    }
    if (selection.type === 'section') {
      return <EmptySettingsPanel />;
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
    return (
      <RepeaterSettingsPanel
        availableContexts={availableContextsForRepeater}
        assignedContextId={selectedRepeaterComp?.assignedContextId ?? null}
        onSelectContext={(contextId) => {
          setComponentContext(selection.sectionId, selection.componentId, contextId);
          applyDefaultBindingsForContext(contextId);
        }}
        onOpenConnectModal={() => setConnectModalTarget({ type: 'component', sectionId: selection.sectionId, componentId: selection.componentId, mode: 'replace' })}
        onClose={() => setRepeaterSettingsPanelOpen(false)}
        contextLabel={assignedCtx?.label ?? ''}
        hasContext={selectedRepeaterComp?.connected ?? false}
        totalItems={assignedCtx?.items?.length ?? 0}
        pageLoad={selectedRepeaterComp?.pageLoad ?? 4}
        onPageLoadChange={(v) => setRepeaterPageLoad(selection.sectionId, selection.componentId, v)}
        loadMoreEnabled={selectedRepeaterComp?.loadMoreEnabled !== false}
        onLoadMoreChange={(enabled) => setRepeaterLoadMore(selection.sectionId, selection.componentId, enabled)}
        onOpenFilter={() => openFilterModal(selection.sectionId, selection.componentId)}
        filterRules={selectedRepeaterComp?.filterRules}
        sortOption={selectedRepeaterComp?.sortOption ?? 'default'}
        onSortChange={(option) => setRepeaterSort(selection.sectionId, selection.componentId, option)}
        itemsConnectTo={selectedRepeaterComp?.itemsConnectTo ?? 'items'}
        onItemsConnectToChange={(value) => {
          const setter = getSetBySection(selection.sectionId);
          setter((prev) => prev.map((c) => (c.id === selection.componentId ? { ...c, itemsConnectTo: value } : c)));
        }}
        arrayFieldOptions={[{ value: 'items', label: 'Items' }]}
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
        targetLabel={
          connectModalTarget?.type === 'page'
            ? 'this page'
            : connectModalTarget?.type === 'section'
              ? 'this section'
              : connectModalTarget
                ? 'this container'
                : 'this page'
        }
        allowedContextIds={connectModalTarget?.type === 'component' && connectModalTarget?.mode === 'replace' ? contextIdsOnPage : undefined}
        onConnect={(contextId) => {
          if (!connectModalTarget || !contextId) return;
          if (connectModalTarget.type === 'page') {
            updatePageContext(contextId);
          } else if (connectModalTarget.type === 'section') {
            updateSectionContext(connectModalTarget.sectionId, contextId);
          } else {
            setComponentContext(connectModalTarget.sectionId, connectModalTarget.componentId, contextId);
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
          filterModalTarget
            ? getComponentsBySection(filterModalTarget.sectionId)?.find((c) => c.id === filterModalTarget.componentId)?.filterRules ?? []
            : []
        }
        onApply={(rules) => {
          if (filterModalTarget) {
            setRepeaterFilterRules(filterModalTarget.sectionId, filterModalTarget.componentId, rules);
          }
          closeFilterModal();
        }}
      />
      {manageItemsTarget && (() => {
        const comp = getComponentsBySection(manageItemsTarget.sectionId)?.find((c) => c.id === manageItemsTarget.componentId);
        const ctx = comp?.assignedContextId ? getContextById(comp.assignedContextId) : null;
        const rawItems = ctx ? itemsForContext(comp.assignedContextId) : [];
        const filtered = applyFilterRules(rawItems, comp?.filterRules ?? []);
        const sorted = [...filtered];
        if (comp?.sortOption === 'name') sorted.sort((a, b) => (a.title ?? a.name ?? '').localeCompare(b.title ?? b.name ?? ''));
        if (comp?.sortOption === 'nameDesc') sorted.sort((a, b) => (b.title ?? b.name ?? '').localeCompare(a.title ?? a.name ?? ''));
        return (
          <ManageItemsPanel
            isOpen
            onClose={closeManageItems}
            collectionLabel={ctx?.label ?? 'Collection'}
            collectionId={comp?.assignedContextId ?? null}
            items={sorted}
            sortOption={comp?.sortOption ?? 'default'}
            onSortChange={(option) => setRepeaterSort(manageItemsTarget.sectionId, manageItemsTarget.componentId, option)}
            filterRules={comp?.filterRules ?? []}
            onOpenFilter={() => openFilterModal(manageItemsTarget.sectionId, manageItemsTarget.componentId)}
            onRemoveFilter={() => setRepeaterFilterRules(manageItemsTarget.sectionId, manageItemsTarget.componentId, [])}
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
            Concept 1: User can design the repeater without selecting the context.
          </p>
        )}
        {studioTab === 'contextFirst' && (
          <p className="editor-studio-concept-desc">
            Concept 2: Connect the repeater to a context first.
          </p>
        )}
        <label className="editor-technical-mode">
          <input
            type="checkbox"
            checked={technicalMode}
            onChange={(e) => setTechnicalMode(e.target.checked)}
          />
          Technical mode
        </label>
      </header>

      <div className="editor-workspace">
        <section className="editor-canvas-section">
          <Stage
            className="stage--studio"
            isPageSelected={selection?.type === 'page'}
            onSelectPage={selectPage}
            pageContextLabel={getContextById(pageContextId)?.label}
            pageContextInstanceLabel={pageContextId ? (getContextById(pageContextId)?.label ?? '—') : '—'}
            onOpenPageConnect={openPageConnectModal}
            showPageConnectButton={!pageContextId}
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
              contextLabel={getContextById(sectionContextIds.section1)?.label}
              contextInstanceLabel={sectionContextIds.section1 ? (getContextById(sectionContextIds.section1)?.label ?? '—') : '—'}
              onOpenSectionConnect={() => openSectionConnectModal('section1')}
              showSectionConnectButton={!sectionContextIds.section1}
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
              contextLabel={getContextById(sectionContextIds.section2)?.label}
              contextInstanceLabel={sectionContextIds.section2 ? (getContextById(sectionContextIds.section2)?.label ?? '—') : '—'}
              onOpenSectionConnect={() => openSectionConnectModal('section2')}
              showSectionConnectButton={!sectionContextIds.section2}
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
              contextLabel={getContextById(sectionContextIds.section3)?.label}
              contextInstanceLabel={sectionContextIds.section3 ? (getContextById(sectionContextIds.section3)?.label ?? '—') : '—'}
              onOpenSectionConnect={() => openSectionConnectModal('section3')}
              showSectionConnectButton={!sectionContextIds.section3}
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
