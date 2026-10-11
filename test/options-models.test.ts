import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resetAllMocks } from './setup';
import { saveSettings, getSettings } from '../src/storage';
import { DEFAULT_SETTINGS } from '../src/types';
import { discoverModels } from '../src/models';

vi.mock('../src/models', () => ({ discoverModels: vi.fn() }));
const html = readFileSync(resolve(__dirname, '../src/options.html'), 'utf8');
const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(r => setTimeout(r, 0)); };
const input = (id: string) => document.getElementById(id) as HTMLInputElement;
const clickProvider = (name: string) => Array.from(document.querySelectorAll<HTMLButtonElement>('.provider-card')).find(b => b.textContent?.includes(name))!.click();

beforeEach(async () => {
  vi.resetModules();
  resetAllMocks();
  document.body.innerHTML = html;
  vi.mocked(discoverModels).mockReset().mockResolvedValue([{ id: 'new-future-model', name: 'Future', pricing: { input: .000001, output: .000002 } }]);
  vi.mocked(chrome.permissions.contains).mockResolvedValue(true);
  vi.mocked(chrome.permissions.request).mockResolvedValue(true);
  vi.mocked(chrome.runtime.sendMessage).mockImplementation((msg: any, cb: any) => {
    cb(msg.type === 'check-chrome-ai' ? { available: false } : { status: 'done' });
  });
  await saveSettings({ ...DEFAULT_SETTINGS, provider: 'custom', baseUrl: 'http://workstation.local:8080/v1', model: 'my-saved-model', apiKey: 'my-server-key' });
});
afterEach(() => vi.restoreAllMocks());

describe('provider settings and live model selection', () => {
  it('keeps a manually selected model absent from a refreshed catalog', async () => {
    await import('../src/options'); await flush();
    expect(input('model-select').value).toBe('my-saved-model');
    expect(document.querySelector('datalist option')?.getAttribute('value')).toBe('new-future-model');
    expect(document.getElementById('model-status')?.textContent).toContain('kept');
    expect((await getSettings()).model).toBe('my-saved-model');
    input('model-select').value = 'new-future-model';
    input('model-select').dispatchEvent(new Event('change'));
    await flush();
    expect((await getSettings()).modelPricing).toEqual([1, 2]);
  });

  it('preserves the model and gives a manual fallback when discovery fails', async () => {
    vi.mocked(discoverModels).mockRejectedValue(new Error('Catalog is unavailable. Enter an ID manually.'));
    await import('../src/options'); await flush();
    expect(input('model-select').value).toBe('my-saved-model');
    expect(document.getElementById('model-status')?.textContent).toContain('manually');
  });

  it('isolates provider keys and ignores results from an old provider', async () => {
    let finish!: (value: any) => void;
    vi.mocked(discoverModels).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    await import('../src/options'); await flush();
    clickProvider('Groq'); await flush();
    expect(input('apiKey').value).toBe('');
    expect(input('model-select').value).toBe('');
    finish([{ id: 'wrong-provider-model', name: 'Old catalog' }]); await flush();
    expect(document.querySelector('datalist option')).toBeNull();
    expect((await getSettings()).provider).toBe('groq');
    clickProvider('Custom endpoint'); await flush();
    expect(input('apiKey').value).toBe('my-server-key');
    expect(input('model-select').value).toBe('my-saved-model');
  });

  it('requests access only to the selected endpoint on an explicit refresh', async () => {
    vi.mocked(chrome.permissions.contains).mockResolvedValue(false);
    await import('../src/options'); await flush();
    expect(discoverModels).not.toHaveBeenCalled();
    document.getElementById('refresh-models')!.click(); await flush();
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['http://workstation.local:8080/*'] });
    expect(discoverModels).toHaveBeenCalled();
  });

  it('clears the previous key when the custom endpoint changes origin', async () => {
    await import('../src/options'); await flush();
    input('base-url').value = 'http://different-server.local/v1';
    input('base-url').dispatchEvent(new Event('input'));
    input('base-url').dispatchEvent(new Event('change'));
    await flush();
    expect(input('apiKey').value).toBe('');
    expect((await getSettings()).apiKey).toBe('');
  });
});
