"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { axes, canChartModel, chartPositions, hasCompleteStats } from "@/lib/compare";
import { searchModels } from "@/lib/search";
import { createTab, restoreTabs, type ComparisonTab } from "@/lib/tabs";
import { modelColor, Radar } from "./radar";
import type { Catalog, Model } from "@/lib/models";

const storageKey = (source: Catalog["source"]) => `konaimi:models:${source}:v1`;
const tabsKey = (source: Catalog["source"]) => `konaimi:tabs:${source}:v1`;

const showValue = (model: Model, key: (typeof axes)[number]["key"]) => {
  const value = model[key];
  if (value === null) return "No data";
  if (key === "costPerTask") return `$${value.toFixed(value < 1 ? 3 : 2)}`;
  return value.toFixed(1);
};

const missingStats = (model: Model) => axes.filter((axis) => model[axis.key] === null)
  .map((axis) => axis.name).join(" and ");

export function Comparison() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [tabs, setTabs] = useState<ComparisonTab[]>([]);
  const [activeTabId, setActiveTabId] = useState("");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/models").then(async (response) => {
      if (!response.ok) throw new Error("The model list is not available right now.");
      return await response.json() as Catalog;
    }).then((data) => {
      if (!active) return;
      let savedTabs: string | null = null;
      let oldSelection: string | null = null;
      try {
        savedTabs = localStorage.getItem(tabsKey(data.source));
        oldSelection = localStorage.getItem(storageKey(data.source));
      } catch {}
      const restored = restoreTabs(
        savedTabs,
        oldSelection,
        data.source === "demo" ? data.models.slice(0, 2).map((model) => model.id) : [],
      );
      setTabs(restored.tabs);
      setActiveTabId(restored.activeTabId);
      setCatalog(data);
      setReady(true);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load models.");
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!catalog || !ready) return;
    try { localStorage.setItem(tabsKey(catalog.source), JSON.stringify({ tabs, activeTabId })); }
    catch {}
  }, [catalog, ready, tabs, activeTabId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const selectedIds = activeTab?.modelIds ?? [];
  const byId = useMemo(() => new Map(catalog?.models.map((model) => [model.id, model]) ?? []), [catalog]);
  const selected = selectedIds.map((id) => byId.get(id)).filter((model): model is Model => model !== undefined);
  const available = searchModels(catalog?.models.filter((model) => !selectedIds.includes(model.id)) ?? [], query).slice(0, 30);
  const chartable = selected.filter(canChartModel);
  const positions = chartPositions(chartable);

  const add = (id: string) => {
    if (!selectedIds.includes(id)) updateSelection((ids) => [...ids, id]);
  };

  const updateSelection = (update: (ids: string[]) => string[]) => {
    setTabs((current) => current.map((tab) => tab.id === activeTabId ? { ...tab, modelIds: update(tab.modelIds) } : tab));
  };

  const addTab = () => {
    const tab = createTab([], tabs);
    setTabs((current) => [...current, tab]);
    setActiveTabId(tab.id);
    setQuery("");
  };

  const closeTab = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    if (!remaining.length) remaining.push(createTab());
    setTabs(remaining);
    if (activeTabId === id) setActiveTabId(remaining[Math.min(index, remaining.length - 1)].id);
    if (editingTabId === id) setEditingTabId(null);
  };

  const saveName = (id: string) => {
    const name = draftName.trim();
    if (name) setTabs((current) => current.map((tab) => tab.id === id ? { ...tab, name } : tab));
    setEditingTabId(null);
  };

  return (
    <main className="app-shell">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Konaimi home"><span className="brand-mark"><span className="brand-mark-letter">K</span></span><span>KON<span className="brand-ai">AI</span>MI<span className="brand-period">.</span></span></Link>
        <span className="header-tag">MODEL COMPARISON</span>
      </header>

      <nav className="tabs" aria-label="Saved comparisons">
        {tabs.map((tab) => <div className={`tab ${tab.id === activeTabId ? "active" : ""}`} key={tab.id}>
          {editingTabId === tab.id ? <input className="tab-name-input" aria-label="Comparison name" value={draftName} autoFocus
            onChange={(event) => setDraftName(event.target.value)} onBlur={() => saveName(tab.id)}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") setEditingTabId(null); }} /> :
            <button className="tab-name" aria-current={tab.id === activeTabId ? "page" : undefined}
              onClick={() => { setActiveTabId(tab.id); setQuery(""); }}
              onDoubleClick={() => { setEditingTabId(tab.id); setDraftName(tab.name); }}
              title="Double-click to rename">{tab.name}</button>}
          <button className="tab-close" aria-label={`Close ${tab.name}`} onClick={() => closeTab(tab.id)}>×</button>
        </div>)}
        {ready && <button className="tab-add" onClick={addTab} aria-label="New comparison" title="New comparison">+</button>}
      </nav>

      {catalog?.source === "demo" && <div className="notice demo-notice"><strong>DEMO MODE</strong><span>These are made-up models and numbers. Add an Artificial Analysis API key to use live data.</span></div>}
      {catalog?.stale && <div className="notice"><strong>OLD DATA</strong><span>Latest refresh failed; showing the last complete model list.</span></div>}
      {error && <div className="notice error-notice" role="alert"><strong>DATA ERROR</strong><span>{error}</span><button onClick={() => window.location.reload()}>Try again</button></div>}

      <div className="workspace">
        <div className="sidebar">
        <section className="panel select-panel" aria-label="Select models">
          <div className="panel-heading"><h2>Models</h2><span className="small-label">{selectedIds.length} SELECTED</span></div>
          <label htmlFor="model-search" className="field-label">FIND A MODEL</label>
           <div className="search-box"><Search className="search-icon" size={19} strokeWidth={2} aria-hidden="true" /><input id="model-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models or creators..." disabled={!catalog} autoComplete="off" /></div>
          <div className="model-results" role="list" aria-label="Available models">
            {!catalog && !error && <p className="quiet">Loading models…</p>}
            {catalog && available.length === 0 && <p className="quiet">No models found.</p>}
            {catalog && available.map((model) => (
              <button className="model-option" key={model.id} onClick={() => add(model.id)} role="listitem">
                <span><strong>{model.name}</strong><small>{model.creator}</small></span>
                <span className="model-option-action"><small>{model.intelligence === null ? "No score" : `Intelligence ${model.intelligence.toFixed(1)}`}</small><span className="add-icon" aria-hidden="true">+</span></span>
              </button>
            ))}
          </div>
        </section>

        <section className="roster panel" aria-label="Selected model statistics">
          <div className="roster-heading"><h2>Selected models</h2></div>
          {selectedIds.length === 0 ? <div className="roster-empty">No models selected yet. Add two above to start a comparison.</div> :
            <div className="cards">
              {selectedIds.map((id, index) => {
                const model = byId.get(id);
                return <article className="player-card" key={id} style={{ "--card-accent": modelColor(index) } as React.CSSProperties}>
                  <div className="card-top"><span className="player-number">{String(index + 1).padStart(2, "0")}</span><button className="remove-button" onClick={() => updateSelection((ids) => ids.filter((item) => item !== id))} aria-label={`Remove ${model?.name ?? "unavailable model"}`}>×</button></div>
                  <div className="card-identity"><small>{model?.creator ?? "UNAVAILABLE"}</small><h3>{model?.name ?? "Model no longer listed"}</h3></div>
                  {model ? <div className="stat-list">{axes.map((axis) => <div className="stat-row" key={axis.key}><span>{axis.name}<small>{axis.subtitle}</small></span><strong>{showValue(model, axis.key)}</strong></div>)}</div> : <p className="quiet">This saved model is not in the latest data. You can remove it above.</p>}
                  {model && !hasCompleteStats(model) && <div className="card-note">{missingStats(model)}: no score in the API; {canChartModel(model) ? "drawn at 0 on the chart, not measured." : "this model cannot be charted."}</div>}
                </article>;
              })}
            </div>}
        </section>
        </div>

        <section className="panel chart-panel" aria-label="Comparison chart">
          <div className="panel-heading"><h2>Comparison</h2><span className="small-label">FARTHER OUT = BETTER</span></div>
          <div className="chart-stage">
            {chartable.length >= 2 ? <Radar key={activeTabId} models={selected} positions={positions} /> :
              <div className="chart-empty"><div className="empty-symbol">◇</div><span>Select two models with Intelligence and cost data.</span></div>}
          </div>
          <div className="chart-foot">
            {catalog?.source === "live" && <span className="chart-source">Source: <a href="https://artificialanalysis.ai/leaderboards/models" target="_blank" rel="noreferrer">Artificial Analysis</a> · Intelligence Index v{catalog.indexVersion ?? "?"} · {new Date(catalog.updatedAt).toLocaleDateString()}</span>}
            <span className="legend-marker" /> Farther from the center is better on every axis: lower cost per task reaches farther out. Values are relative to the selected models; missing Coding or Agentic scores are drawn at 0, not measured.
          </div>
        </section>
      </div>

      <footer className="footer">{catalog?.source === "live" ? <>Data: <a href="https://artificialanalysis.ai/" target="_blank" rel="noreferrer">Artificial Analysis ↗</a> · Index v{catalog.indexVersion ?? "?"} · Updated {new Date(catalog.updatedAt).toLocaleDateString()}</> : "Sample data · Not real model scores"}</footer>
    </main>
  );
}
