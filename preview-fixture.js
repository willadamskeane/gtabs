// Simulated Chrome APIs for reviewing the extension UI without installing it.
// Only the local dev server injects this file; it is excluded from the release.
(() => {
  const groups = [
    { name: 'Development', color: 'green', tabs: [
      { id: 1, title: 'Pull requests · gTabs', url: 'https://github.com/vaddisrinivas/gtabs/pulls' },
      { id: 2, title: 'Release Notes: 1.107', url: 'https://code.visualstudio.com/updates' },
      { id: 3, title: 'python — How to handle async in FastAPI?', url: 'https://stackoverflow.com/questions/async' },
      { id: 4, title: 'Project Plan — gTabs', url: 'https://notion.so/project' },
      { id: 5, title: 'gTabs — Design System', url: 'https://figma.com/file/design' },
    ] },
    { name: 'Research', color: 'blue', tabs: [
      { id: 6, title: 'LLM evaluation benchmarks 2026', url: 'https://google.com/search?q=llm+benchmarks' },
      { id: 7, title: 'Attention Is All You Need (arXiv)', url: 'https://arxiv.org/abs/1706.03762' },
      { id: 8, title: 'State of AI Agents 2026 (video)', url: 'https://youtube.com/watch?v=example' },
      { id: 9, title: 'The next generation of AI browsers', url: 'https://theverge.com/ai' },
    ] },
    { name: 'Everyday', color: 'yellow', tabs: [
      { id: 10, title: 'Inbox (12) — me@gmail.com', url: 'https://mail.google.com/mail' },
      { id: 11, title: 'Calendar — October 2026', url: 'https://calendar.google.com' },
      { id: 12, title: 'Discover Weekly', url: 'https://open.spotify.com/playlist/example' },
    ] },
  ];
  const defaults = { provider: 'chrome-ai', baseUrl: '', apiKey: '', model: '', autoTrigger: false, threshold: 5, maxGroups: 6, mergeMode: false, maxTitleLength: 80, silentAutoAdd: false, autoPinApps: false, staleTabThresholdHours: 48, enableCorrectionTracking: true, enableRejectionMemory: true, enableGroupDrift: false, enablePatternMining: false, groupDriftThreshold: 50, reorgSchedule: 'off', reorgTime: 9, pinnedGroups: [], smartUngroup: false, spendingCapUSD: 0 };
  const initial = new URL(location.href).searchParams.get('state') === 'empty' ? null : groups;
  const store = (name, initialData) => ({
    async get(keys) { let saved; try { saved = JSON.parse(sessionStorage.getItem(name) || 'null'); } catch {} const data = saved || initialData; return typeof keys === 'string' ? { [keys]: data[keys] } : Array.isArray(keys) ? Object.fromEntries(keys.map(k => [k,data[k]])) : { ...keys, ...data }; },
    async set(value) { const data = await this.get(); sessionStorage.setItem(name, JSON.stringify({ ...data, ...value })); },
  });
  const tabs = groups.flatMap(g => g.tabs.map(t => ({ ...t, windowId: 1, groupId: -1 })));
  let suggestions = structuredClone(initial);
  let applied = false;
  const respond = async msg => {
    switch (msg.type) {
      case 'get-stats': return { stats: { totalOrganizations: applied ? 1 : 0, totalTabsGrouped: applied ? 12 : 0 } };
      case 'get-costs': return { costs: { totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, byProvider: {} } };
      case 'check-chrome-ai': return { available: false };
      case 'organize': case 'organize-ungrouped': await new Promise(r => setTimeout(r, 500)); suggestions = structuredClone(groups); return { suggestions };
      case 'apply': applied = true; await chrome.storage.local.set({ suggestions: null }); return { status: 'done' };
      case 'undo': applied = false; return { status: 'done' };
      case 'search-tabs': return { tabResults: tabs.filter(t => (t.title + t.url).toLowerCase().includes(msg.query)).map(t => ({ ...t, groupName: '' })) };
      case 'list-workspaces': return { workspaceNames: [] };
      case 'export-data': return { data: { settings: defaults, affinity: {}, domainRules: [], workspaces: {} } };
      default: return { status: 'done', count: 0 };
    }
  };
  window.chrome = {
    storage: { local: store('preview-local', { suggestions: initial, apiKeyLocal: '', affinityVersion: 2 }), sync: store('preview-sync', { settings: defaults }) },
    runtime: { getURL: path => new URL(path, location.origin).href, sendMessage: (msg, cb) => respond(msg).then(cb), openOptionsPage: () => { location.href = '/options.html'; } },
    permissions: { request: async () => true, contains: async () => true },
    tabs: { query: async () => tabs, get: async id => tabs.find(t => t.id === id), update: async () => ({}), remove: async () => {} },
    windows: { update: async () => ({}) },
  };
  const realFetch = window.fetch.bind(window);
  window.fetch = async (url, options) => {
    const parsed = new URL(String(url), location.href);
    if (parsed.origin === location.origin) return realFetch(url, options);
    if (parsed.pathname.endsWith('/models')) return new Response(JSON.stringify({ data: [
      { id: 'demo-current-model', name: 'Demo current model', pricing: { prompt: '0.000001', completion: '0.000002' } },
      { id: 'demo-new-model', name: 'Demo newly released model', pricing: { prompt: '0', completion: '0' } },
    ] }), { status: 200 });
    if (parsed.pathname.endsWith('/api/tags')) return new Response(JSON.stringify({ models: [{ name: 'demo-local-model' }] }));
    throw new Error('Preview does not send real provider requests.');
  };
})();
