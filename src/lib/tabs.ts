export type ComparisonTab = { id: string; name: string; modelIds: string[] };
export type SavedTabs = { tabs: ComparisonTab[]; activeTabId: string };

const names = ["Extra Time", "Golden Boot", "Kick Off", "Counter Attack", "Final Whistle", "Hat Trick", "Top Corner", "Clean Sheet"];

export function createTab(modelIds: string[] = [], existing: ComparisonTab[] = []): ComparisonTab {
  const unused = names.filter((name) => !existing.some((tab) => tab.name === name));
  const name = unused.length ? unused[Math.floor(Math.random() * unused.length)] : `${names[Math.floor(Math.random() * names.length)]} ${existing.length + 1}`;
  return { id: crypto.randomUUID(), name, modelIds };
}

export function restoreTabs(raw: string | null, legacy: string | null, demoIds: string[] = []): SavedTabs {
  try {
    const saved: unknown = JSON.parse(raw ?? "null");
    if (saved && typeof saved === "object" && "tabs" in saved && Array.isArray(saved.tabs)) {
      const tabs: ComparisonTab[] = saved.tabs.filter((tab: unknown): tab is ComparisonTab => {
        if (!tab || typeof tab !== "object") return false;
        const value = tab as Record<string, unknown>;
        return typeof value.id === "string" && typeof value.name === "string" && Array.isArray(value.modelIds);
      }).map((tab: ComparisonTab) => ({
        id: tab.id,
        name: tab.name.trim() || "Comparison",
        modelIds: [...new Set(tab.modelIds.filter((id): id is string => typeof id === "string"))],
      }));
      if (tabs.length) {
        const activeTabId = "activeTabId" in saved && typeof saved.activeTabId === "string" && tabs.some((tab) => tab.id === saved.activeTabId)
          ? saved.activeTabId : tabs[0].id;
        return { tabs, activeTabId };
      }
    }
  } catch {}

  let modelIds = demoIds;
  try {
    const old: unknown = JSON.parse(legacy ?? "null");
    if (Array.isArray(old)) modelIds = [...new Set(old.filter((id): id is string => typeof id === "string"))];
  } catch {}
  const tab = createTab(modelIds);
  return { tabs: [tab], activeTabId: tab.id };
}
