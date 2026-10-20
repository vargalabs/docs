---
title: Settings and preferences
order: 30
summary: Reference for all sigmaAid preferences, default workbench settings, themes, and keybindings.
---

# Settings and preferences

`sigma-ide` registers the `sigmaAid.*` preference schema in `@sigma-ai/sigma-aid-core` (`packages/sigma-aid-core/src/common/sigma-aid-preferences.ts`) and ships curated workbench defaults in `config/` and `applications/*/package.json`.

## `sigmaAid.*` preferences

| Preference name | Type | Default | Allowed values / bounds | Scope | Description |
|---|---|---|---|---|---|
| `sigmaAid.socketPath` | `string` | *(none; resolved on first run)* | Absolute path under `/tmp`, `/run`, or `/var/run` | `User` (`hidden: true`) | Local `sigma-aid` daemon Unix domain socket path that `sigma-ide` connects to. Persisted once resolved from `SIGMA_AID_SOCKET`, `XDG_RUNTIME_DIR`, or `/run/sigma-ai/sigma-aid.sock`, and takes precedence over the environment on subsequent starts. Edited through the **AI Configuration** header bar rather than the generic Settings UI. |
| `sigmaAid.enroller.completed` | `boolean` | `false` | `true`, `false` | `User` | Whether the initial **Sigma AI Setup Wizard** has been completed. When `false`, the wizard opens automatically on startup. |
| `sigmaAid.defaultProvider` | `string` | *(unset)* | Provider ID | Default | Preferred `sigma-aid` provider. |
| `sigmaAid.defaultModel` | `string` | *(unset)* | Model ID | Default | Preferred `sigma-aid` model. |
| `sigmaAid.console.activityPanelWidth` | `number` | `950` | `240` to `1250` (pixels) | Default | Width in pixels of the expanded **Agent Activity** panel in the Sigma Console. |
| `sigmaAid.console.activityPanelOpacity` | `number` | `0.95` | `0.15` to `1` | Default | Opacity of the **Agent Activity** panel background fill. Text and controls always render at full opacity; only the backdrop becomes more or less transparent. Can also be adjusted with the slider in the panel header. |
| `sigmaAid.speech.enabled` | `boolean` | `false` | `true`, `false` | Default | Enables microphone voice dictation in the Sigma Console. Audio streams directly from the browser to OpenAI using an ephemeral session token minted by `sigma-aid`. |
| `sigmaAid.speech.model` | `string` | `'gpt-transcribe'` | `'gpt-transcribe'`, `'gpt-live-transcribe'` | Default | Transcription model allow-listed by the daemon. `gpt-live-transcribe` has no server-side utterance segmentation, so dictation must be committed manually. |
| `sigmaAid.speech.language` | `string` | `'auto'` | ISO-639 / BCP-47 tag (such as `'en'`, `'hu'`, `'en-GB'`) or `'auto'` | Default | Spoken language tag, or `'auto'` to let the transcription model detect the language. |
| `sigmaAid.speech.vad` | `string` | `'server_vad'` | `'server_vad'`, `'semantic_vad'` | Default | Utterance end detection mode. `'server_vad'` uses the silence timer (`sigmaAid.speech.silenceDurationMs`); `'semantic_vad'` uses model-based turn detection and ignores the timer. |
| `sigmaAid.speech.silenceDurationMs` | `number` | `700` | `200` to `10000` (milliseconds) | Default | Silence duration in milliseconds that ends a spoken turn when `sigmaAid.speech.vad` is `'server_vad'`. Values outside `200`–`10000` are clamped by the daemon. |
| `sigmaAid.speech.autoSubmit` | `boolean` | `false` | `true`, `false` | Default | Automatically submits the prompt when dictation stops. Disabled by default so you can review transcribed text before sending. |
| `sigmaAid.speech.maxSessionMinutes` | `number` | `10` | `1` to `10` (minutes) | Default | Maximum duration of a single dictation session, matching the 10-minute lifetime of the ephemeral credential minted by the daemon. |
| `sigmaAid.speech.silenceStopSeconds` | `number` | `45` | Minimum `1` (seconds) | Default | Automatically stops dictation after this many seconds of continuous silence so an idle session does not leave the microphone open. The on-screen indicator fades during the final 10 seconds before stopping. |

No API keys or provider credentials are ever stored in Theia preferences (`settings.json`). Provider credentials are managed exclusively by `sigma-aid` through the **AI Configuration** view or the **Sigma AI Setup Wizard**.

## Default workbench preferences

`config/settings.json` and the application manifests (`applications/browser/package.json` and `applications/electron/package.json`) configure the following workbench defaults:

| Preference name | Default value | Source |
|---|---|---|
| `window.menuBarVisibility` | `'compact'` | `applications/*/package.json` (mounts the compact application menu icon at the top of the left Activity Bar) |
| `files.autoSave` | `'afterDelay'` | `config/settings.json` |
| `files.enableTrash` | `false` | `applications/*/package.json` |
| `workbench.editor.closeOnFileDelete` | `true` | `config/settings.json` |
| `security.workspace.trust.enabled` | `false` | `applications/*/package.json` |
| `terminal.integrated.defaultLocation` | `'editor'` | `applications/*/package.json` |
| `git.autoRepositoryDetection` | `true` | `config/settings.json` |
| `git.openRepositoryInParentFolders` | `'always'` | `config/settings.json` |
| `ai-features.AiEnable.enableAI` | `true` | `config/settings.json` and `applications/*/package.json` |
| `workbench.colorTheme` | `'light-modern'` | `config/settings.json` and `applications/*/package.json` |

When a workspace folder is opened and does not yet have a `.theia/settings.json` file, `SigmaWorkspaceSettingsContribution` creates `.theia/settings.json` with `{"workbench.colorTheme": "light-modern"}`. If `.theia/settings.json` already exists, `sigma-ide` leaves it unchanged.

## Curated color themes

`SigmaThemeService` (`packages/sigma-aid-theia/src/browser/sigma-theme-service.ts`) restricts the theme picker (`Ctrl+K Ctrl+T`) to a curated set of themes:

- `Default Light Modern`
- `Default Dark Modern`
- `Quiet Light`
- `Solarized Light`
- `Solarized Dark`
- `Monokai`
- `light-theia` and `dark-theia` (built-in fallbacks when bundled theme plugins are not present)

Theme selection is persisted per browser session in `localStorage` under `sigma-ide:theme:<sessionId>` (with a global fallback at `sigma-ide:theme`), so multiple browser windows on the same origin can use different themes without overwriting one another.

## User configuration directory

By default, the `sigma-ide` launcher sets `THEIA_CONFIG_DIR` to `~/.sigma-ide` instead of `~/.theia` so user preferences (`~/.sigma-ide/settings.json`) and keymaps remain isolated from any stock Eclipse Theia installation. If `THEIA_CONFIG_DIR` is already set in the environment, `sigma-ide` preserves that directory.

## Default VS Code keybindings

`SigmaVSCodeKeybindingContribution` (`packages/sigma-aid-theia/src/browser/sigma-vscode-keybindings.ts`) and `SigmaConsoleContribution` register standard VS Code keyboard shortcuts:

| Shortcut | Command |
|---|---|
| `Ctrl+Shift+P` or `F1` | Command Palette (`workbench.action.showCommands`) |
| `Ctrl+P` | Quick Open file (`workbench.action.quickOpen`) |
| `Ctrl+Shift+A` (`Cmd+Shift+A`) | **Sigma AI: New Console** (`sigma-console:new`) |
| `Ctrl+A` | **Toggle Activity Bar Visibility** (`workbench.action.toggleActivityBarVisibility`) |
| `Ctrl+B` or `Ctrl+Shift+E` | Toggle Explorer view (`workbench.view.explorer`) |
| `Ctrl+Shift+F` | Search in Workspace (`workbench.view.search` / `search-in-workspace.open`) |
| `Ctrl+Shift+G` | Source Control view (`workbench.view.scm`) |
| `Ctrl+Shift+D` | Debug view (`workbench.view.debug`) |
| `Ctrl+\`` | Toggle Terminal (`workbench.action.terminal.toggleTerminal`) |
| `Ctrl+Shift+\`` | New Terminal (`terminal:new`) |
| `Ctrl+Shift+V` (`Cmd+Shift+V`) | Open Markdown Preview (`preview:open`) |
| `Ctrl+,` | Open Preferences (`preferences:open`) |
| `Ctrl+K Ctrl+S` | Open Keyboard Shortcuts (`keymaps:open`) |
| `Ctrl+K Ctrl+T` | Select Color Theme (`workbench.action.selectTheme`) |
| `Ctrl+K O` | Add Folder to Workspace (`workspace:addFolder`) |
| `Ctrl+=` / `Ctrl+-` / `Ctrl+Numpad0` | Per-window UI and editor zoom in, zoom out, and reset (`workbench.action.zoomIn`, `workbench.action.zoomOut`, `workbench.action.zoomReset`) |
