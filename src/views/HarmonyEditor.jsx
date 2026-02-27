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
import { ConnectCollectionModal } from '../components/ConnectCollectionModal';
import { ConnectContextModal } from '../components/ConnectContextModal';
import { ManageItemsPanel } from '../components/ManageItemsPanel';
import { FilterModal } from '../components/FilterModal';
import { EmptySettingsPanel } from '../components/EmptySettingsPanel';
import { RepeaterItemElementPanel } from '../components/RepeaterItemElementPanel';
import { applyFilterRules } from '../utils/filterRules';
import { recipesCollectionItems, unconfiguredRepeaterItems, availableContexts, connectModalPresetIds, getDefaultItemBindingsForContext, getFilterFieldsForContext, defaultSortRules } from '../data/demoData';
import { applySortRules } from '../utils/sortRules';
import './Editor.css';

function createComponent(type) {
  const comp = { id: `${type}-${Date.now()}`, type };
  if (type === 'repeater') comp.connected = false;
  if (type === 'text') comp.content = 'Add your text here';
  if (type === 'image') {
    comp.src = '';
    comp.alt = '';
  }
  return comp;
}

const HARMONY_ADDABLE_COMPONENTS = [
  { type: 'repeater', label: 'Design preset 1 (Team)', group: 'Repeaters' },
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
];

export function HarmonyEditor() {
  const [selected, setSelected] = useState(null);
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
  const [connectContextTarget, setConnectContextTarget] = useState(null);
  const [manageItemsTarget, setManageItemsTarget] = useState(null);
  const [filterModalTarget, setFilterModalTarget] = useState(null);
  const [contextDetailsTarget, setContextDetailsTarget] = useState(null);
  const [connectorPanelTarget, setConnectorPanelTarget] = useState(null);
  const [connectorPanelSourceContextId, setConnectorPanelSourceContextId] = useState(null);
  const [repeaterSettingsPanelOpen, setRepeaterSettingsPanelOpen] = useState(false);
  const [presetUsedIds, setPresetUsedIds] = useState([]);
  const settingsAsideRef = useRef(null);
  const scrollToSettingsPanel = useCallback(() => {
    settingsAsideRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, []);
  const openRepeaterSettings = useCallback(() => {
    setRepeaterSettingsPanelOpen(true);
    scrollToSettingsPanel();
  }, [scrollToSettingsPanel]);

  const openConnectModal = useCallback((sectionId, componentId) => {
    setConnectModalTarget({ sectionId, componentId });
  }, []);
  const closeConnectModal = useCallback(() => setConnectModalTarget(null), []);

  /** Context ids connected on the page (page + sections). Repeater and inner elements can access parent context only. */
  const contextIdsOnPage = useMemo(
    () => [...new Set([pageContextId, sectionContextIds.section1, sectionContextIds.section2, sectionContextIds.section3].filter(Boolean))],
    [pageContextId, sectionContextIds]
  );

  /** For repeater settings: repeater (child) can consume context from container (parent) and upper contexts (page/section). */
  const availableContextsForRepeater = useMemo(() => {
    const ids = new Set(contextIdsOnPage);
    const sel = selected;
    if ((sel?.type === 'component' || sel?.type === 'repeaterItem' || sel?.type === 'repeater' || sel?.type === 'blankSlotElement') && sel?.sectionId && sel?.componentId) {
      const comps = sel.sectionId === 'section1' ? section1Components : sel.sectionId === 'section2' ? section2Components : sel.sectionId === 'section3' ? section3Components : [];
      const comp = comps.find((c) => c.id === sel.componentId);
      if (comp?.assignedContextId) ids.add(comp.assignedContextId);
    }
    return availableContexts.filter((c) => ids.has(c.id));
  }, [availableContexts, contextIdsOnPage, selected, section1Components, section2Components, section3Components]);

  const openManageItems = useCallback((sectionId, componentId) => {
    setManageItemsTarget({ sectionId, componentId });
  }, []);
  const closeManageItems = useCallback(() => setManageItemsTarget(null), []);
  const openFilterModal = useCallback((sectionId, componentId) => {
    setFilterModalTarget({ sectionId, componentId });
  }, []);
  const closeFilterModal = useCallback(() => setFilterModalTarget(null), []);
  const openContextDetails = useCallback((sectionId, componentId) => {
    setContextDetailsTarget({ sectionId, componentId });
    settingsAsideRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, []);
  const closeContextDetails = useCallback(() => setContextDetailsTarget(null), []);

  const hasAnyConnectedRepeater =
    section1Components.some((c) => c.type === 'repeater' && c.connected) ||
    section2Components.some((c) => c.type === 'repeater' && c.connected) ||
    section3Components.some((c) => c.type === 'repeater' && c.connected);

  /** Unique context instance label per context usage (page, sections, repeaters): "CollectionName 1", "CollectionName 2", ... */
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
    assign(pageContextId, 'page');
    assign(sectionContextIds.section1, 'section1');
    assign(sectionContextIds.section2, 'section2');
    assign(sectionContextIds.section3, 'section3');
    const sectionList = [
      ['section1', section1Components],
      ['section2', section2Components],
      ['section3', section3Components],
    ];
    sectionList.forEach(([sectionId, comps]) => {
      comps.forEach((comp) => {
        if (comp.type !== 'repeater' || !comp.assignedContextId) return;
        const parentCtxId = sectionContextIds[sectionId] || pageContextId;
        if (parentCtxId && comp.assignedContextId === parentCtxId) {
          const parentKey = sectionContextIds[sectionId] ? sectionId : 'page';
          map[`${sectionId}-${comp.id}`] = map[parentKey] ?? (availableContexts.find((c) => c.id === parentCtxId)?.label ?? parentCtxId);
        } else {
          assign(comp.assignedContextId, `${sectionId}-${comp.id}`);
        }
      });
    });
    return map;
  }, [pageContextId, sectionContextIds, section1Components, section2Components, section3Components, availableContexts]);

  const getSetBySection = useCallback((sectionId) => {
    switch (sectionId) {
      case 'section1': return setSection1Components;
      case 'section2': return setSection2Components;
      case 'section3': return setSection3Components;
      default: return () => {};
    }
  }, []);

  const addComponent = useCallback((sectionId, type) => {
    const setter = getSetBySection(sectionId);
    setter((prev) => [...prev, createComponent(type)]);
  }, [getSetBySection]);

  const removeComponent = useCallback((sectionId, componentId) => {
    const setter = getSetBySection(sectionId);
    setter((prev) => prev.filter((c) => c.id !== componentId));
    if (selected?.type === 'component' && selected.sectionId === sectionId && selected.componentId === componentId) {
      setSelected(null);
    }
    if (selected?.type === 'repeaterItem' && selected.sectionId === sectionId && selected.componentId === componentId) {
      setSelected(null);
    }
  }, [getSetBySection, selected]);

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
    if (selected?.type !== 'component' && selected?.type !== 'repeater') setRepeaterSettingsPanelOpen(false);
  }, [selected?.type]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const target = e.target;
      if (target && (target.closest('input') || target.closest('textarea') || target.closest('select') || target.isContentEditable)) return;
      if (selected?.type === 'component') {
        e.preventDefault();
        removeComponent(selected.sectionId, selected.componentId);
        setSelected(null);
      } else if (selected?.type === 'repeaterItem') {
        e.preventDefault();
        removeComponent(selected.sectionId, selected.componentId);
        setSelected(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, removeComponent]);

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

  const selectPage = useCallback(() => setSelected({ type: 'page' }), []);
  const selectSection = useCallback((sectionId) => setSelected({ type: 'section', sectionId }), []);
  const selectContentTitle = useCallback((sectionId) => setSelected({ type: 'contentTitle', sectionId }), []);
  const selectComponent = useCallback((sectionId, componentId) =>
    setSelected({ type: 'component', sectionId, componentId }), []);
  const selectRepeater = useCallback((sectionId, componentId) =>
    setSelected({ type: 'repeater', sectionId, componentId }), []);
  const selectRepeaterItem = useCallback((sectionId, componentId, itemId, elementKind) =>
    setSelected({ type: 'repeaterItem', sectionId, componentId, itemId, elementKind: elementKind ?? undefined }), []);

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

  const getComponentsBySection = useCallback((sectionId) => {
    switch (sectionId) {
      case 'section1': return section1Components;
      case 'section2': return section2Components;
      case 'section3': return section3Components;
      default: return [];
    }
  }, [section1Components, section2Components, section3Components]);

  const selectedRepeaterComp =
    (selected?.type === 'component' || selected?.type === 'repeaterItem' || selected?.type === 'repeater') && selected?.sectionId && selected?.componentId
      ? getComponentsBySection(selected.sectionId)?.find((c) => c.id === selected.componentId)
      : null;

  const getContextById = useCallback((id) => availableContexts.find((c) => c.id === id), []);

  const itemsForContext = useCallback((contextId) => {
    const ctx = getContextById(contextId);
    if (!ctx) return [];
    const raw = ctx.items ?? [];
    return raw.map((i) => ({ ...i, ...repeaterItemOverrides[i.id] }));
  }, [getContextById, repeaterItemOverrides]);

  const itemsWithOverrides = useCallback(() => itemsForContext('recipes'), [itemsForContext]);

  const selectedRepeaterItem =
    selected?.type === 'repeaterItem' && selectedRepeaterComp?.assignedContextId
      ? itemsForContext(selectedRepeaterComp.assignedContextId).find((i) => i.id === selected.itemId)
        ?? getContextById(selectedRepeaterComp.assignedContextId)?.items?.find((i) => i.id === selected.itemId)
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
    if (sortOption === 'default') list = applySortRules(list, defaultSortRules);
    if (sortOption === 'name') list.sort((a, b) => (a.title ?? a.name ?? '').localeCompare(b.title ?? b.name ?? ''));
    if (sortOption === 'nameDesc') list.sort((a, b) => (b.title ?? b.name ?? '').localeCompare(a.title ?? a.name ?? ''));
    return list;
  }, []);

  const renderComponent = useCallback((comp, sectionId) => {
    if (comp.type === 'repeater') {
      const ctx = comp.assignedContextId ? getContextById(comp.assignedContextId) : null;
      const rawItems = comp.connected && ctx ? itemsForContext(comp.assignedContextId) : unconfiguredRepeaterItems;
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
          selectedItemId={selected?.type === 'repeaterItem' && selected.sectionId === sectionId && selected.componentId === comp.id ? selected.itemId : null}
          selectedElementKind={selected?.type === 'repeaterItem' && selected.sectionId === sectionId && selected.componentId === comp.id ? selected.elementKind : null}
          onSelectItem={(itemId) => selectRepeaterItem(sectionId, comp.id, itemId)}
          onSelectItemElement={(itemId, kind) => selectRepeaterItem(sectionId, comp.id, itemId, kind)}
          isSelected={(selected?.type === 'component' || selected?.type === 'repeaterItem' || selected?.type === 'repeater') && selected?.sectionId === sectionId && selected?.componentId === comp.id}
          onOpenConnectModal={() => openConnectModal(sectionId, comp.id)}
          onOpenManageItems={() => openManageItems(sectionId, comp.id)}
          onOpenRepeaterSettings={openRepeaterSettings}
          usesParentContext={!!(comp.assignedContextId && (comp.assignedContextId === sectionContextIds[sectionId] || comp.assignedContextId === pageContextId))}
          contextLabel={ctx?.label}
          contextInstanceLabel={contextInstanceLabelMap[`${sectionId}-${comp.id}`]}
          contextInstance={{
            pagination: { pageSize: comp.pageLoad ?? 4 },
            filter: comp.filterRules ?? [],
            sort: comp.sortOption ?? 'default',
          }}
          hasActiveFilter={(comp.filterRules?.length ?? 0) > 0}
          headerAction="details"
          onOpenContextDetails={() => openContextDetails(sectionId, comp.id)}
          isRepeaterSelected={selected?.type === 'repeater' && selected?.sectionId === sectionId && selected?.componentId === comp.id}
          onSelectRepeater={() => selectRepeater(sectionId, comp.id)}
          onSelectInnerRepeater={() => selectComponent(sectionId, comp.id)}
          unconfiguredRibbonDescription="Connect a collection to show this container on your live site."
          unconfiguredRibbonButtonLabel="Connect collection"
          droppedElements={comp.droppedElements}
          onDropElement={(payload) => addDroppedElementToRepeater(sectionId, comp.id, payload)}
        />
      );
    }
    if (comp.type === 'text') {
      const isTextSelected = selected?.type === 'component' && selected?.sectionId === sectionId && selected?.componentId === comp.id;
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
      const isImageSelected = selected?.type === 'component' && selected?.sectionId === sectionId && selected?.componentId === comp.id;
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
  }, [getContextById, itemsForContext, applyFilterAndSort, selected, openConnectModal, selectRepeater, selectRepeaterItem, openManageItems, openRepeaterSettings, selectComponent, updateTextContent, updateImageContent, addDroppedElementToRepeater, scrollToSettingsPanel]);

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
      const sectionId = connectorPanelTarget.sectionId;
      const sectionCtxId = sectionId ? sectionContextIds[sectionId] : null;
      const parentContextId = sectionId && (sectionCtxId || pageContextId) ? (sectionCtxId || pageContextId) : null;
      const repeaterContextId = isRepeaterItem ? (comp?.assignedContextId ?? null) : null;
      const repeaterContextLabel = repeaterContextId ? getContextById(repeaterContextId)?.label : null;
      const sourceOptions = isRepeaterItem
        ? (() => {
            const seen = new Set();
            const list = [];
            if (repeaterContextId) {
              const rCtx = getContextById(repeaterContextId);
              list.push({ contextId: repeaterContextId, label: rCtx?.label ?? repeaterContextId });
              seen.add(repeaterContextId);
            }
            if (sectionCtxId && !seen.has(sectionCtxId)) {
              const sCtx = getContextById(sectionCtxId);
              list.push({ contextId: sectionCtxId, label: sCtx?.label ?? sectionCtxId });
              seen.add(sectionCtxId);
            }
            if (pageContextId && !seen.has(pageContextId)) {
              const pCtx = getContextById(pageContextId);
              list.push({ contextId: pageContextId, label: pCtx?.label ?? pageContextId });
            }
            return list.length > 0 ? list : [{ contextId: '', label: 'No collection available' }];
          })()
        : null;
      const defaultCtxId = isRepeaterItem && repeaterContextId ? repeaterContextId : parentContextId;
      const selectedSourceContextId = connectorPanelSourceContextId ?? defaultCtxId ?? sourceOptions?.[0]?.contextId ?? '';
      const ctx = selectedSourceContextId ? getContextById(selectedSourceContextId) : null;
      const sourceLabel = ctx ? (ctx.label ?? '—') : '—';
      const item = isRepeaterItem && selected?.type === 'repeaterItem' && selected.sectionId === connectorPanelTarget.sectionId && selected.componentId === connectorPanelTarget.componentId && selected.itemId === connectorPanelTarget.itemId
        ? selectedRepeaterItem
        : null;
      const selectedField = isRepeaterItem ? (item?.[fieldKey] ?? '') : (comp?.[fieldKey] ?? '');
      const onSelectField = isRepeaterItem
        ? (value) => updateRepeaterItemBindingForAll(connectorPanelTarget.sectionId, connectorPanelTarget.componentId, fieldKey, value)
        : (value) => updateComponentBinding(connectorPanelTarget.sectionId, connectorPanelTarget.componentId, bindProperty, value);
      const hasRealSourceOptions = sourceOptions?.length > 0 && sourceOptions.some((o) => o.contextId !== '');
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
          sourceLabel={sourceLabel}
          sourceOptions={isRepeaterItem ? sourceOptions : undefined}
          selectedSourceContextId={isRepeaterItem ? selectedSourceContextId : undefined}
          onSourceChange={isRepeaterItem ? (id) => setConnectorPanelSourceContextId(id || null) : undefined}
          sourceSelectAriaLabel="Source collection"
          sourceReadOnly={true}
        />
      );
    }
    if (!selected) return <EmptySettingsPanel />;
    if (selected.type === 'page') {
      const pageCtx = pageContextId ? availableContexts.find((c) => c.id === pageContextId) : null;
      return (
        <PageSettingsPanel
          selectedContextId={pageContextId}
          contextLabel={pageCtx?.label ?? ''}
          onOpenConnectModal={() => setConnectContextTarget({ type: 'page' })}
          onClose={() => setSelected(null)}
        />
      );
    }
    if (selected.type === 'section') {
      return <EmptySettingsPanel />;
    }
    if (selected.type === 'contentTitle') {
      return (
        <ContentTitleSettingsPanel
          value={selected.sectionId === 'section2' ? sectionContentTitles.section2 : ''}
          onChange={(v) => updateSectionContentTitle(selected.sectionId, v)}
        />
      );
    }
    if (selected.type === 'component' && selectedRepeaterComp?.type === 'text') {
      return (
        <TextSettingsPanel
          content={selectedRepeaterComp?.content ?? ''}
          onChange={(content) => updateTextContent(selected.sectionId, selected.componentId, content)}
          onClose={() => setSelected(null)}
          onOpenConnectorPanel={(bindProperty) => setConnectorPanelTarget({ sectionId: selected.sectionId, componentId: selected.componentId, bindProperty })}
          connected={!!(selectedRepeaterComp?.boundField && selectedRepeaterComp.boundField.trim() !== '')}
        />
      );
    }
    if (selected.type === 'component' && selectedRepeaterComp?.type === 'image') {
      return (
        <ImageSettingsPanel
          src={selectedRepeaterComp?.src ?? ''}
          alt={selectedRepeaterComp?.alt ?? ''}
          onSrcChange={(src) => updateImageContent(selected.sectionId, selected.componentId, { src })}
          onAltChange={(alt) => updateImageContent(selected.sectionId, selected.componentId, { alt })}
          onClose={() => setSelected(null)}
          onOpenConnectorPanel={(bindProperty) => setConnectorPanelTarget({ sectionId: selected.sectionId, componentId: selected.componentId, bindProperty })}
          srcConnected={!!(selectedRepeaterComp?.boundFieldImage && selectedRepeaterComp.boundFieldImage.trim() !== '')}
          altConnected={!!(selectedRepeaterComp?.boundFieldImageAlt && selectedRepeaterComp.boundFieldImageAlt.trim() !== '')}
        />
      );
    }
    if (selected.type === 'repeaterItem') {
      const comp = selectedRepeaterComp;
      const ctx = comp?.assignedContextId ? getContextById(comp.assignedContextId) : null;
      const item = selectedRepeaterItem ?? null;
      return (
        <RepeaterItemElementPanel
          item={item}
          elementKind={selected.elementKind ?? 'text'}
          contextId={comp?.assignedContextId}
          contextType={ctx?.type}
          onUpdate={(updated) => updateRepeaterItem(selected.itemId, updated)}
          onClose={() => setSelected(null)}
          onOpenConnectorPanel={(bindProperty) => setConnectorPanelTarget({
            sectionId: selected.sectionId,
            componentId: selected.componentId,
            itemId: selected.itemId,
            bindProperty: bindProperty ?? 'text',
          })}
        />
      );
    }
    if ((selected.type === 'component' || selected.type === 'repeater') && selectedRepeaterComp?.type === 'repeater' && !selectedRepeaterComp.connected) {
      return <EmptySettingsPanel message="Connect a collection to configure this container." />;
    }
    if ((selected.type === 'component' || selected.type === 'repeater') && selectedRepeaterComp?.type === 'repeater' && selectedRepeaterComp?.connected && !repeaterSettingsPanelOpen) {
      return <EmptySettingsPanel message="Click Settings to configure this container." />;
    }
    if ((selected.type === 'component' || selected.type === 'repeater') && selectedRepeaterComp?.type !== 'repeater') {
      return <EmptySettingsPanel />;
    }
    const assignedCtx = selectedRepeaterComp?.assignedContextId
      ? getContextById(selectedRepeaterComp.assignedContextId)
      : null;
    return (
      <RepeaterSettingsPanel
        variant="harmony"
        availableContexts={availableContextsForRepeater}
        assignedContextId={selectedRepeaterComp?.assignedContextId ?? null}
        onSelectContext={(contextId) => setComponentContext(selected.sectionId, selected.componentId, contextId)}
        onOpenConnectModal={() => setConnectModalTarget({ sectionId: selected.sectionId, componentId: selected.componentId, mode: 'replace' })}
        onClose={() => setRepeaterSettingsPanelOpen(false)}
        contextLabel={assignedCtx?.label ?? ''}
        hasContext={selectedRepeaterComp?.connected ?? false}
        totalItems={assignedCtx?.items?.length ?? 0}
        pageLoad={selectedRepeaterComp?.pageLoad ?? 4}
        onPageLoadChange={(v) => setRepeaterPageLoad(selected.sectionId, selected.componentId, v)}
        loadMoreEnabled={selectedRepeaterComp?.loadMoreEnabled !== false}
        onLoadMoreChange={(enabled) => setRepeaterLoadMore(selected.sectionId, selected.componentId, enabled)}
        onManageItems={() => openManageItems(selected.sectionId, selected.componentId)}
        onOpenFilter={() => openFilterModal(selected.sectionId, selected.componentId)}
        filterRules={selectedRepeaterComp?.filterRules}
        sortOption={selectedRepeaterComp?.sortOption ?? 'default'}
        onSortChange={(option) => setRepeaterSort(selected.sectionId, selected.componentId, option)}
      />
    );
  }

  return (
    <div className="editor editor--harmony">
      <ConnectCollectionModal
        isOpen={connectModalTarget !== null}
        onClose={closeConnectModal}
        presetUsedIds={presetUsedIds}
        mode={connectModalTarget?.mode ?? 'connect'}
        allowedContextIds={undefined}
        onConnect={(contextId) => {
          if (connectModalTarget && contextId) {
            setComponentContext(connectModalTarget.sectionId, connectModalTarget.componentId, contextId);
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
            if (connectModalPresetIds.includes(contextId)) {
              setPresetUsedIds((prev) => (prev.includes(contextId) ? prev : [...prev, contextId]));
            }
          }
        }}
      />
      <ConnectContextModal
        isOpen={connectContextTarget !== null}
        onClose={() => setConnectContextTarget(null)}
        connectTarget={connectContextTarget}
        targetLabel={connectContextTarget?.type === 'page' ? 'this page' : connectContextTarget?.type === 'section' ? 'this section' : 'this page'}
        onConnect={(contextId, target) => {
          if (!contextId) return;
          const t = target ?? connectContextTarget;
          if (!t) return;
          if (t.type === 'page') {
            updatePageContext(contextId);
          } else if (t.type === 'section') {
            updateSectionContext(t.sectionId, contextId);
          }
          setConnectContextTarget(null);
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
        availableFields={
          filterModalTarget
            ? getFilterFieldsForContext(
                getComponentsBySection(filterModalTarget.sectionId)?.find((c) => c.id === filterModalTarget.componentId)?.assignedContextId
              )
            : undefined
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
        const sorted = comp?.sortOption === 'default' ? applySortRules([...filtered], defaultSortRules) : [...filtered];
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
        <h1 className="editor-name">Harmony</h1>
        <p className="editor-desc">
          Container connected to <strong>context</strong> → represented as a <strong>CMS collection</strong>.
        </p>
      </header>

      <div className="editor-workspace">
        <section className="editor-canvas-section">
          <Stage
            className="stage--harmony"
            isPageSelected={selected?.type === 'page'}
            onSelectPage={selectPage}
            showPageHeader={false}
          >
            <Section
              sectionId="section1"
              title={sectionTitles.section1}
              components={section1Components}
              renderComponent={renderComponent}
              onAddComponent={addComponent}
              addableComponents={HARMONY_ADDABLE_COMPONENTS}
              onRemoveComponent={removeComponent}
              isSectionSelected={selected?.type === 'section' && selected.sectionId === 'section1'}
              selectedComponentId={(selected?.type === 'component' || selected?.type === 'repeaterItem' || selected?.type === 'repeater') && selected?.sectionId === 'section1' ? selected.componentId : null}
              onSelectSection={selectSection}
              onSelectComponent={selectComponent}
              contextLabel={sectionContextIds.section1 ? getContextById(sectionContextIds.section1)?.label : null}
              contextInstanceLabel={contextInstanceLabelMap['section1'] ?? '—'}
              showContextLabel={false}
            />
            <Section
              sectionId="section2"
              title={sectionTitles.section2}
              contentTitle={sectionContentTitles.section2}
              components={section2Components}
              renderComponent={renderComponent}
              onAddComponent={addComponent}
              addableComponents={HARMONY_ADDABLE_COMPONENTS}
              onRemoveComponent={removeComponent}
              isSectionSelected={selected?.type === 'section' && selected.sectionId === 'section2'}
              isContentTitleSelected={selected?.type === 'contentTitle' && selected.sectionId === 'section2'}
              selectedComponentId={(selected?.type === 'component' || selected?.type === 'repeaterItem' || selected?.type === 'repeater') && selected?.sectionId === 'section2' ? selected.componentId : null}
              onSelectSection={selectSection}
              onSelectContentTitle={selectContentTitle}
              onSelectComponent={selectComponent}
              contextLabel={sectionContextIds.section2 ? getContextById(sectionContextIds.section2)?.label : null}
              contextInstanceLabel={contextInstanceLabelMap['section2'] ?? '—'}
              showContextLabel={false}
            />
            <Section
              sectionId="section3"
              title={sectionTitles.section3}
              components={section3Components}
              renderComponent={renderComponent}
              onAddComponent={addComponent}
              addableComponents={HARMONY_ADDABLE_COMPONENTS}
              onRemoveComponent={removeComponent}
              isSectionSelected={selected?.type === 'section' && selected.sectionId === 'section3'}
              selectedComponentId={(selected?.type === 'component' || selected?.type === 'repeaterItem' || selected?.type === 'repeater') && selected?.sectionId === 'section3' ? selected.componentId : null}
              onSelectSection={selectSection}
              onSelectComponent={selectComponent}
              contextLabel={sectionContextIds.section3 ? getContextById(sectionContextIds.section3)?.label : null}
              contextInstanceLabel={contextInstanceLabelMap['section3'] ?? '—'}
              showContextLabel={false}
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
