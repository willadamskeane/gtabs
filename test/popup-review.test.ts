import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resetAllMocks } from './setup';
import { saveSuggestions, getSuggestions } from '../src/storage';
const html = readFileSync(resolve(__dirname, '../src/popup.html'), 'utf8');
const flush = async () => { for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0)); };
const groups = [
  { name: 'Work', color: 'green' as const, tabs: [{ id: 1, title: 'Code', url: 'https://github.com/example' }, { id: 2, title: 'Docs', url: 'https://docs.example.com' }] },
  { name: 'Reading', color: 'blue' as const, tabs: [{ id: 3, title: 'Research', url: 'https://arxiv.org' }] },
];
beforeEach(async () => {
  vi.resetModules(); resetAllMocks(); vi.clearAllMocks(); document.body.innerHTML = html;
  await saveSuggestions(structuredClone(groups));
  vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg: any, cb: any) => cb({ status: 'done' }));
});
describe('editable review flow', () => {
  it('applies only included tabs and learns a rename even after another group is removed', async () => {
    await import('../src/popup'); await flush();
    const rename = document.querySelector<HTMLInputElement>('.group-name')!;
    rename.value = 'Development'; rename.dispatchEvent(new Event('input'));
    const exclude = document.querySelector<HTMLInputElement>('.include-tab[data-id="2"]')!;
    exclude.checked = false; exclude.dispatchEvent(new Event('change'));
    (document.querySelectorAll('.remove-group')[1] as HTMLButtonElement).click(); await flush();
    document.getElementById('apply-all')!.click(); await flush();
    const calls = vi.mocked(chrome.runtime.sendMessage).mock.calls.map(c => c[0]) as any[];
    expect(calls.find(c => c.type === 'apply').suggestions).toEqual([{ ...groups[0], name: 'Development', tabs: [groups[0].tabs[0]] }]);
    expect(calls.find(c => c.type === 'record-corrections').corrections.corrections).toEqual([{ domain: 'github.com', originalGroup: 'Work', correctedGroup: 'Development' }]);
  });
  it('retains the review and does not learn corrections when applying fails', async () => {
    await import('../src/popup'); await flush();
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((msg: any, cb: any) => cb(msg.type === 'apply' ? { error: 'Worker could not group tabs' } : { status: 'done' }));
    document.getElementById('apply-all')!.click(); await flush();
    expect((document.getElementById('apply-all') as HTMLButtonElement).hidden).toBe(false);
    expect(document.getElementById('status')?.textContent).toContain('could not group');
    expect(vi.mocked(chrome.runtime.sendMessage).mock.calls.some(c => (c[0] as any).type === 'record-corrections')).toBe(false);
  });
  it('cancels the preview without sending a tab mutation', async () => {
    await import('../src/popup'); await flush();
    document.getElementById('cancel-review')!.click(); await flush();
    expect(await getSuggestions()).toBeNull();
    expect((document.getElementById('apply-all') as HTMLButtonElement).hidden).toBe(true);
    expect(vi.mocked(chrome.runtime.sendMessage).mock.calls.some(c => ['apply','undo'].includes((c[0] as any).type))).toBe(false);
  });
});
