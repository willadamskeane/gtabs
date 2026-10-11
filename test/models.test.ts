import { beforeEach, describe, expect, it, vi } from 'vitest';
import { discoverModels } from '../src/models';

const config = { baseUrl: 'https://provider.example/v1/', apiKey: ' key ', model: '' };
const reply = (body: unknown) => ({ ok: true, json: async () => body });

describe('live model discovery', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));

  it('accepts future model IDs, deduplicates and sorts without an allowlist', async () => {
    vi.mocked(fetch).mockResolvedValue(reply({ data: [{ id: 'future-z' }, { id: 'future-a' }, { id: 'future-z' }, {}] }) as Response);
    expect((await discoverModels('custom', config)).map(m => m.id)).toEqual(['future-a', 'future-z']);
    expect(fetch).toHaveBeenCalledWith('https://provider.example/v1/models', expect.objectContaining({ headers: { Authorization: 'Bearer key' }, redirect: 'error' }));
  });

  it('follows Anthropic pagination and uses its authentication headers', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(reply({ data: [{ id: 'new-a' }], has_more: true, last_id: 'new-a' }) as Response)
      .mockResolvedValueOnce(reply({ data: [{ id: 'new-b' }], has_more: false }) as Response);
    expect((await discoverModels('anthropic', { ...config, baseUrl: 'https://api.anthropic.com' })).map(m => m.id)).toEqual(['new-a', 'new-b']);
    expect(fetch).toHaveBeenLastCalledWith('https://api.anthropic.com/v1/models?limit=1000&after_id=new-a', expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'key' }) }));
  });

  it('reads installed Ollama models from a configurable endpoint', async () => {
    vi.mocked(fetch).mockResolvedValue(reply({ models: [{ name: 'my-local-model' }] }) as Response);
    expect(await discoverModels('ollama', { ...config, baseUrl: 'http://localhost:11434/v1', apiKey: '' })).toEqual([{ id: 'my-local-model', name: 'my-local-model' }]);
    expect(fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags', expect.anything());
  });

  it('uses live prices to select free OpenRouter models; missing prices are unknown', async () => {
    vi.mocked(fetch).mockResolvedValue(reply({ data: [
      { id: 'free-today', pricing: { prompt: '0', completion: '0' } },
      { id: 'paid:free', pricing: { prompt: '.1', completion: '0' } },
      { id: 'unknown:free' },
    ] }) as Response);
    expect((await discoverModels('openrouter-free', config)).map(m => m.id)).toEqual(['free-today']);
  });

  it('reports unavailable catalogs without silently supplying stale defaults', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
    await expect(discoverModels('openai', config)).rejects.toThrow('401');
    vi.mocked(fetch).mockResolvedValue(reply({ unexpected: [] }) as Response);
    await expect(discoverModels('custom', config)).rejects.toThrow('manually');
  });

  it('rejects credential-bearing URLs and broken pagination', async () => {
    await expect(discoverModels('custom', { ...config, baseUrl: 'https://user:secret@provider.example' })).rejects.toThrow('without credentials');
    vi.mocked(fetch).mockResolvedValue(reply({ data: [], has_more: true, last_id: 'same' }) as Response);
    await expect(discoverModels('anthropic', config)).rejects.toThrow('pagination cursor');
  });

  it('leaves the built-in browser model to Chrome', async () => {
    expect(await discoverModels('chrome-ai', config)).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
