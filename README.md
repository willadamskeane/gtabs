# gTabs — Quiet Workspace

An AI tab organizer for Chrome, redesigned around a calm, readable review flow. This fork is based on [vaddisrinivas/gtabs](https://github.com/vaddisrinivas/gtabs), under its MIT license.

## Install

Extract `gtabs-quiet-workspace-0.6.0.zip` into a permanent folder. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the extracted folder. Pin gTabs, then open Settings to configure a connection.

Alternatively, build from source:

```sh
npm ci
npm run build
npm run package
```

Load `dist/` as an unpacked extension. Chrome 120 or newer is required for the extension; Chrome's built-in AI has additional browser, device, and availability requirements.

## Organize with a review

Choose **Organize tabs**, review the suggested groups, rename them or change colors, and exclude individual tabs before applying. The review list scrolls while Apply and Cancel remain visible. Search filters tabs; Undo restores the previous grouping. Pinned groups, domain rules, learning, workspaces, snooze, scheduled organizing, and power tools remain available.

## Models follow the provider

There is no built-in cloud model catalog or default cloud model ID. Settings fetches the provider's current model list. Refresh after changing credentials or an endpoint, then choose a chat-capable model or enter its ID manually. An unavailable saved ID is preserved so outages and catalog changes do not silently change your configuration.

Supported connections include OpenAI, Anthropic, OpenRouter, Groq, xAI, Ollama, Chrome built-in AI, and custom OpenAI-compatible servers. Anthropic discovery follows pagination. Ollama discovers installed models through `/api/tags`. Chrome manages its built-in model.

Provider credentials are stored locally and isolated between connection profiles. Custom endpoints request access to their origin when you click Refresh models. Changing a custom endpoint's origin clears the previous key.

OpenRouter's free connection is filtered using provider-reported zero input/output prices. It refuses calls without verified zero pricing. Other catalogs may omit pricing; gTabs records token usage without treating unknown prices as free. A configured spending cap blocks unpriced cloud calls. All cost figures are estimates and may differ from provider bills.

## Development and verification

```sh
npm run typecheck
npm test
npm run build
npm run dev -- --port 4173
```

The browser preview uses simulated tabs, storage, permissions, and model responses. Its fixture is never included in the extension package. Preview interactions do not organize real browser tabs or contact providers. Test the unpacked extension in a real Chrome profile before distributing it.

The UI uses bundled Phosphor SVG icons; their license is in `icons/ui/LICENSE`. No remote fonts or runtime UI dependencies are required. See [PRIVACY.md](PRIVACY.md) for data handling and [CHANGELOG.md](CHANGELOG.md) for release changes.
