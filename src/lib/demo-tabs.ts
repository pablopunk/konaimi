import { restoreTabs, type SavedTabs } from "./tabs";

export function restoreDemoTabs(raw: string | null, legacy: string | null, modelIds: string[], migrateDefault: boolean): SavedTabs {
  const restored = restoreTabs(raw, legacy, modelIds.slice(0, 3));
  const validIds = new Set(modelIds);
  const hadOldModels = restored.tabs.some((tab) => tab.modelIds.some((id) => !validIds.has(id)));
  const tabs = restored.tabs.map((tab) => {
    const selected = tab.modelIds.filter((id) => validIds.has(id));
    const oldDefault = selected.length === 2 && selected.every((id, index) => id === modelIds[index]);
    return { ...tab, modelIds: migrateDefault && oldDefault ? modelIds.slice(0, 3) : selected };
  });
  if (hadOldModels && tabs.every((tab) => tab.modelIds.length === 0)) {
    tabs[0].modelIds = modelIds.slice(0, 3);
  }
  return { ...restored, tabs };
}
