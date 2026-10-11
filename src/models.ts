import type { LLMConfig } from './types';

export interface ModelInfo {
  id: string;
  name: string;
  /** Price per token, when supplied by the provider. Missing means unknown. */
  pricing?: { input: number; output: number };
}

/** No model IDs or release-dependent allowlists. Providers own their catalogs. */
export async function discoverModels(
  provider: string,
  config: LLMConfig,
  signal?: AbortSignal,
): Promise<ModelInfo[]> {
  if (provider === 'chrome-ai') return [];
  const base = new URL(config.baseUrl);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) {
    throw new Error('Use an HTTP or HTTPS endpoint without credentials in its URL.');
  }
  const root = config.baseUrl.replace(/\/+$/, '');
  const anthropic = provider === 'anthropic';
  const ollama = provider === 'ollama';
  const endpoint = ollama
    ? `${root.replace(/\/v1$/, '')}/api/tags`
    : `${root}${anthropic && !root.endsWith('/v1') ? '/v1' : ''}/models`;
  const headers: Record<string, string> = {};
  if (config.apiKey.trim()) {
    if (anthropic) headers['x-api-key'] = config.apiKey.trim();
    else headers.Authorization = `Bearer ${config.apiKey.trim()}`;
  }
  if (anthropic) {
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }
  const models = new Map<string, ModelInfo>();
  let cursor: string | undefined;
  const seenCursors = new Set<string>();
  for (let page = 0; page < 100; page++) {
    const url = new URL(endpoint);
    if (anthropic) {
      url.searchParams.set('limit', '1000');
      if (cursor) url.searchParams.set('after_id', cursor);
    }
    const response = await fetch(url.toString(), {
      headers,
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000),
      // Do not forward credentials to a redirect destination.
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`Model discovery failed (${response.status}). You can enter a model ID manually.`);
    const body = await response.json();
    const rows: unknown = ollama ? body.models : body.data;
    if (!Array.isArray(rows)) throw new Error('The endpoint did not return a model catalog. Enter a model ID manually.');
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const id = ollama ? row.name || row.model : row.id;
      if (typeof id !== 'string' || !id.trim()) continue;
      // Free is determined from catalog pricing, never a model name suffix.
      const input = Number(row.pricing?.prompt);
      const output = Number(row.pricing?.completion);
      const hasPricing = row.pricing?.prompt != null && row.pricing?.completion != null
        && Number.isFinite(input) && Number.isFinite(output) && input >= 0 && output >= 0;
      if (provider === 'openrouter-free' && !(hasPricing && input === 0 && output === 0)) continue;
      const name = row.display_name || row.name;
      models.set(id, {
        id,
        name: typeof name === 'string' ? name : id,
        ...(hasPricing ? { pricing: { input, output } } : {}),
      });
    }
    if (!anthropic || !body.has_more) return [...models.values()].sort((a, b) => a.id.localeCompare(b.id));
    if (typeof body.last_id !== 'string' || seenCursors.has(body.last_id)) {
      throw new Error('The provider returned an invalid pagination cursor.');
    }
    const nextCursor: string = body.last_id;
    cursor = nextCursor;
    seenCursors.add(nextCursor);
  }
  throw new Error('The model catalog exceeded the pagination limit.');
}
