---
title: Features
order: 20
summary: Console, sessions, fleet, configuration, Git graph, commands, status bar items, and IDE tools.
---

# Features

`sigma-ide` integrates AI conversation, agent fleet monitoring, daemon configuration, and repository-aware Git tools into the Eclipse Theia workbench.

## Sigma Console

**Sigma Console** (`packages/sigma-aid-console`) is a multi-instance AI console widget that docks in the bottom panel. Each console instance maintains its own conversation stream with `sigma-aid`.

- Open a new console instance with **Sigma AI: New Console** (`Ctrl+Shift+A` or `Cmd+Shift+A`).
- Show, focus, or collapse the console panel with **Sigma AI: Toggle Console**.

### Rich Markdown, math, and diagrams

Assistant responses render live as they stream. The console supports:

- **Thinking blocks:** Expandable reasoning blocks that show the model's intermediate steps while a turn is running or after it completes.
- **Syntax-highlighted code blocks:** Rendered through `highlight.js` and synchronized with the active light or dark workbench theme.
- **Mathematical notation:** Inline (`$...$`) and display (`$$...$$`) equations rendered with `KaTeX`.
- **Inline diagrams and charts:** Fenced `mermaid`, `dot` / `graphviz` (`@hpcc-js/wasm`), and `vega-lite` (`vega-embed`) blocks render inline once the closing fence arrives.
- **Console status header:** Displays active provider/model routing, reasoning effort setting, input/output tokens, live context-window meter, weekly subscription quota, and elapsed turn wall clock.

![Sigma Console showing real-time token counters, context window meters, and live mathematical derivations](/img/sigma-ide/console-math-derivation.png)

![Sigma Console executing a multi-session workflow with tensor and metric derivations in general relativity](/img/sigma-ide/console-schwarzschild-metric.png)

### Input, mentions, and attachments

- **Send policy:** Press `Shift+Enter` to send a message and `Enter` to insert a line break. Slash commands (lines starting with `/`) send immediately when you press `Enter`.
- **History navigation:** Press `Up` and `Down` to browse previous prompts in the current console.
- **Fleet agent mentions:** Start a message with `@<agent>` to route the request to a specific fleet agent and pin that agent for subsequent turns in the console until you clear it with `/agent off`.
- **Context and image attachments:** Attach the active editor selection or files using `#selection` or `#file` syntax, or paste and drag-and-drop images (`PNG`, `JPEG`, `GIF`, `WebP`) into the input box.
- **Context menus:** Right-click the transcript to **Copy** the current selection or **Copy All**. Right-click the input box to **Cut**, **Copy**, or **Paste** text.

### Agent Activity panel

While agents invoke tools or delegate subtasks, the console records each call in the expandable **Agent Activity** overlay panel:

- Displays a hierarchical tree of root tool calls and sub-agent delegations per turn, along with execution status (`pending`, `queued`, `running`, `done`, `error`) and elapsed time.
- Retains tool activity across turns (up to an 8 MB rolling history budget) separated by turn headings and housekeeper summaries.
- Provides a header slider to adjust background opacity (`sigmaAid.console.activityPanelOpacity`) and a draggable edge to resize the panel width (`sigmaAid.console.activityPanelWidth`).

![Agent Activity overlay showing hierarchical tool invocations, files inspected, search queries, and memory updates with elapsed execution times](/img/sigma-ide/agent-activity-tool-calls.png)

### Voice dictation

When `sigmaAid.speech.enabled` is `true` and the `speech-to-text` system connection has a valid OpenAI credential, the console displays a microphone button. Dictation streams audio directly from your browser to OpenAI using a short-lived session credential minted by `sigma-aid`.

### Console slash commands

Type `/` in the console input box to open the command completion popup. The console registers the following slash commands:

| Slash command | Description |
|---|---|
| `/help` | List console commands. |
| `/clear` | Clear this console transcript. |
| `/explain` | Explain the active editor selection or file. |
| `/fix` | Find and fix bugs in the selection. |
| `/tests`, `/test` | Generate unit tests for the selection. |
| `/edit <instruction>` | Apply a targeted edit to the selection. |
| `/commit` | Draft a commit message from staged changes. |
| `/doc`, `/docs` | Generate documentation for the current symbol. |
| `/review` | Code-review the current diff or selection. |
| `/ask <question>` | Ask with active editor context. |
| `/plan [goal]` | Make an implementation plan. |
| `/debug` | Debug the current error, selection, or file. |
| `/refactor [goal]` | Refactor the selection or file. |
| `/summarize` | Summarize the current file or selection. |
| `/search <query>` | Search or explain where to look in the workspace. |
| `/context` | Summarize current IDE context. |
| `/diff` | Review or summarize the current diff. |
| `/lint` | Inspect likely lint or build issues. |
| `/run <command>` | Plan or analyze a command run. |
| `/undo` | Plan how to safely undo the last change. |
| `/rename <new name> [session-id]` | Rename a session (defaults to the current session). |
| `/delete [session-id]` | Delete a session (defaults to the current session). |
| `/new [topic]`, `/newtask [topic]` | Start a fresh task prompt. |
| `/compact [focus]` | Compact or summarize this conversation. |
| `/smol` | Produce a concise version of the current answer or context. |
| `/web <query>` | Prepare a web-research request. |
| `/fork` | Plan a parallel or forked investigation. |
| `/rewind` | Review recent steps and propose a rewind point. |
| `/deep-planning [goal]` | Make a deeper multi-step plan. |
| `/smell` | Look for code smells in the selection or file. |
| `/provider [id]` | Show providers, or pin one for this session. |
| `/providers` | List available providers. |
| `/model [id]` | Pin a model for this session. |
| `/system [text]` | Set or clear the system prompt. |
| `/rules` | Show active project or user coding rules. |
| `/tools` | List available tools. |
| `/mcp` | List or inspect MCP servers. |
| `/memory` | Show relevant remembered project context. |
| `/agents` | List fleet agents. |
| `/agent [name\|off]` | Show, pin, or clear the sticky fleet agent. |
| `/status` | Show daemon status. |
| `/sessions` | List daemon sessions. |
| `/resume <session-id> [lines]` | Resume a daemon session. |

## Sigma Sessions and Sigma Fleet widgets

`packages/sigma-aid-chat` provides two right-sidebar panels for inspecting daemon state:

- **Sigma Sessions** (opened with **Open Sigma Sessions**): Lists persisted daemon sessions ordered from most recently updated to oldest. Each entry shows its name (or short session ID), `Created` and `Updated` timestamps, and **Resume**, **Rename**, and **Delete** buttons.
- **Sigma Fleet** (opened with **Open Sigma Fleet**): Shows a **Daemon** section (`Version` and live `Uptime`) and an **Agents** section listing every agent configured on the daemon (display name, agent ID, and description).

## AI Configuration and Setup Wizard

`packages/sigma-aid-theia` provides two main-area editors for configuring the connected daemon:

- **AI Configuration** (opened with **Sigma AI: Open AI Configuration** or from the Activity Bar bottom settings menu):
  - **Header bar:** Shows the editable **Sigma Aid socket path** input, daemon version, active configuration revision, and connection status badge.
  - **`connections` tab:** Manages `system` connections (**Speech to text**, **Memory**, and **Web search** via DataForSEO) and `chat` provider connections (enable/disable, add connection, remove connection, API key entry, and OAuth authorization).
  - **`prompts` tab:** Edits the daemon authoring `System prompt` (`prompts.system_discipline`), `Memory injection header` (`prompts.memory_injection_header`), and named prompt `fragments`, and displays a read-only notice for the local workspace `AGENTS.md` file.
  - **`personalities` tab:** Edits or clears the refinement text (`personality`) on existing agent rows.
  - **`agents` tab:** Adds, edits, or removes daemon agent definitions (`name`, `model`, `mode`, `prompts`, `effort`, and `personality`).
  - **`general` tab:** Edits general daemon configuration fields validated and applied with compare-and-swap revision checks.

![AI Configuration panel showing daemon socket connection status, system connections (speech, memory, web search), and provider pricing/token limits](/img/sigma-ide/ai-configuration.png)

- **Sigma AI Setup Wizard** (opened with **Sigma AI: Open Setup Wizard** or inside the browser Control Panel at `/wizard`): Three-step onboarding view (**1. Subscriptions & Credentials**, **2. Virtual Office** with Arthur's staff drafter and `roles.conf` / `personalities.conf` editor, and **3. Capabilities** for memory & vector recall, voice dictation, web search, source control, and `~/ai` workspace configuration).

## Source Control, Working Tree, and Commit Graph

`packages/sigma-aid-chat` replaces the empty stock Theia SCM views with repository-aware Git views backed by `SigmaGitService`:

- **Working Tree** (in the left Source Control sidebar): Displays the active branch, upstream ahead/behind counts, a flat list or directory tree toggle (**View as List** / **View as Tree**), a commit message box with **Commit** and **Amend** buttons, and collapsible sections for **Conflicted**, **Staged Changes**, **Changes**, and **Stashes**.
- **Commit Graph** (compact **Graph** in the left Source Control sidebar, or full **Commit Graph** in the main editor area via **Open Commit Graph**): Renders a multi-branch SVG topology graph with author monogram badges, lane focus dimming, branch/tag ref filtering, and a resizable commit details and file diff pane.
- **Trace and Filter Menus**: Offers granular display options including full ancestry tracing, merge commit filtering, upstream remote tracking, and lane dimming.
- **Worktrees**: Displays the active repository's main and linked Git worktrees with actions to create, move, remove, and prune worktrees.

![Commit Graph in Sigma IDE showing multi-lane branch topology, commit hashes, authors, and commit messages across parallel lanes](/img/sigma-ide/commit-graph-main.png)

![Commit Graph ancestry tracing and lane filtering menu with options for full ancestry, merge commits, and ref highlighting](/img/sigma-ide/commit-graph-trace-menu.png)

## Commands

### `View > Sigma AI` menu and workbench commands

| User-visible label | Command ID | Default shortcut | Description |
|---|---|---|---|
| **Sigma AI: Open AI Configuration** | `sigma-aid.configuration.open` | — | Open the AI Configuration editor. |
| **Sigma AI: Open Setup Wizard** | `sigma-aid.enroller.open` | — | Open the Sigma AI Setup Wizard. |
| **Sigma AI: New Console** | `sigma-console:new` | `Ctrl+Shift+A` (`Cmd+Shift+A`) | Open a new Sigma Console instance in the bottom panel. |
| **Sigma AI: Toggle Console** | `sigma-console:toggle` | — | Expand, focus, or collapse the Sigma Console panel. |
| **Open Sigma Sessions** | `sigma-ai:open-sessions` | — | Open the Sigma Sessions widget in the right panel. |
| **Open Sigma Fleet** | `sigma-ai:open-fleet` | — | Open the Sigma Fleet widget in the right panel. |
| **Open Commit Graph** | `sigma-ai:open-commit-graph` | — | Reveal or open the Commit Graph widget. |
| **Sigma AI: Connect** | `sigma-aid.connect` | — | Connect to the `sigma-aid` daemon socket. |
| **Sigma AI: Disconnect** | `sigma-aid.disconnect` | — | Disconnect from the `sigma-aid` daemon. |
| **Sigma AI: Reconnect** | `sigma-aid.reconnect` | — | Reconnect to the `sigma-aid` daemon socket. |
| **Sigma AI: Show Status** | `sigma-aid.showStatus` | — | Show the Sigma AI connection and provider health popup anchored to the status bar. |
| **Sigma AI: Show Providers** | `sigma-aid.showProviders` | — | Display available `sigma-aid` providers and models in a notification. |
| **Sigma AI: Show Agents** | `sigma-aid.showAgents` | — | Display available `sigma-aid` agents in a notification. |
| **Toggle Activity Bar Visibility** | `workbench.action.toggleActivityBarVisibility` | `Ctrl+A` | Show or hide the left Activity Bar icon strip. |

### Git and Commit Graph commands

The Working Tree toolbar and Commit Graph context menus register the following commands (shown only when invoked with a valid repository, commit, branch, tag, stash, or working-tree context):

| Context | User-visible command labels |
|---|---|
| Repository toolbar | **Git: Fetch**, **Git: Pull**, **Git: Push**, **Git: Undo Last Action**, **Git: Redo Last Undone Action** |
| Commit row | **Checkout Commit (detached)**, **Create Branch Here…**, **Create Tag Here…**, **Cherry-Pick Commit**, **Revert Commit**, **Reset Current Branch to Here** (**Soft — keep index and working tree**, **Mixed — reset index, keep working tree**, **Hard — discard all changes**), **Copy SHA** |
| Local branch | **Checkout**, **Merge into Current Branch**, **Rebase Current Branch onto This**, **Rename…**, **Delete Branch**, **Push**, **Pull**, **Fetch Remote** |
| Remote-tracking branch | **Checkout as Local Branch**, **Delete Remote-Tracking Ref**, **Delete Branch on Remote** |
| Tag | **Create Branch from Tag…**, **Delete Tag**, **Copy Tag Name** |
| Ref drag-and-drop | **Merge into Current Branch**, **Rebase Current Branch onto This**, **Cherry-Pick Tip Commit**, **Reset Current Branch to This** |
| Stash row | **Apply Stash**, **Apply and Drop Stash**, **Drop Stash**, **Copy SHA** |
| Working tree (WIP) row | **Stage All Changes**, **Unstage All**, **Stash All Changes…**, **Discard Unstaged Changes** |

## Status bar items

`sigma-ide` contributes the following left-aligned status bar entries:

| Status bar ID | Displayed text | Behavior |
|---|---|---|
| `sigma-aid.connection` | `Sigma AI: <provider> \| <N> session(s)` (or `Sigma AI: ready`), `Sigma AI: connecting…`, or `Sigma AI: disconnected` | Polls connection state and daemon summary every 5 seconds. Clicking the item executes **Sigma AI: Show Status**, which opens a hover card showing the socket path, **Subscription** quota meters (`5h left`, `weekly left`, `local`, `api`), and **API** balance/credit status for enabled connections. |
| `sigma-dictation:<widget-id>` | Live dictation phase and timer | Appears while a console's microphone dictation session is starting, listening, or stopping, even if that console tab is hidden. |
| `sigma-aid-status` | Custom text and optional icon | Set when the `theia.status.set` frontend tool handler runs. |

## IDE tools (`@sigma-ai/sigma-aid-tools`)

The `@sigma-ai/sigma-aid-tools` package defines frontend tool handlers in the `theia.*` namespace that operate on the open workbench:

| Tool name | Capability | Advertised | Description |
|---|---|---|---|
| `theia.workspace.roots` | `read-only` | `true` | Returns the list of workspace root URIs currently open in Theia. |
| `theia.editor.active` | `read-only` | `true` | Returns the URI, language ID, and selection range of the active editor. |
| `theia.editor.read_selection` | `read-only` | `true` | Returns the selected text and URI from the active editor. |
| `theia.diagnostics.list` | `read-only` | `true` | Returns problem markers (URI, severity, message, range) for the workspace or a specific `uri`. |
| `theia.symbols.search` | `read-only` | `true` | Executes `workbench.action.showAllSymbols` for a `query` string and returns matching symbols. |
| `theia.editor.open` | `mutating` | `true` | Opens a file `uri` in the editor, optionally navigating to a 0-based `line` and `col`. |
| `theia.editor.replace_selection` | `mutating` | `true` | Replaces the current selection in the open editor for `uri` with `text`. |
| `theia.status.set` | `mutating` | `true` | Updates the `sigma-aid-status` status bar item with `text` and an optional `icon`. |
| `theia.commands.execute` | `mutating` | `true` | Executes a registered Theia command by `command` ID with optional `args`. |
| `theia.views.markdown.create` | `mutating` | `false` | Stub handler for creating a Markdown preview panel (not yet implemented; not advertised). |
| `theia.views.markdown.update` | `mutating` | `false` | Stub handler for updating a Markdown preview panel (not yet implemented; not advertised). |

Note: In the current `@sigma-ai/sigma-aid-tools` implementation (`sigma-tool-executor.ts`), per-session `tool_use` dispatch and `tools` array advertisement to the daemon are not wired yet, and the Node.js backend executor (`NodeTheiaSigmaToolExecutorImpl`) is an intentional no-op boundary because `theia.*` tools require frontend DOM and workbench services.
