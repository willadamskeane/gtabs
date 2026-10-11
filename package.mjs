import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('dist/manifest.json', 'utf8'));
writeFileSync('dist/INSTALL.txt', `gTabs Quiet Workspace ${manifest.version}\n\n1. Extract this ZIP into a permanent folder.\n2. Open chrome://extensions and enable Developer mode.\n3. Click Load unpacked and choose that folder.\n4. Open gTabs Settings, select a provider, then choose a model from its current catalog or enter its ID.\n\nCustom endpoint: enter the API base URL (typically ending in /v1). Click Refresh models to grant access to that endpoint. Keys stay on this device.\n\nThe extension is MIT licensed. Local models have no provider token charges; cloud usage may cost money.\n`);
const result = spawnSync('zip', ['-rX', '../gtabs-quiet-workspace-0.6.0.zip', '.', '-x', '*.map'], { cwd: 'dist', stdio: 'inherit' });
if (result.status) process.exit(result.status);
