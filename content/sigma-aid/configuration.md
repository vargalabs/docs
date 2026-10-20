---
title: Configuration
order: 20
summary: The files in the configuration directory and the main keys that control the daemon.
---

# Configuration

The daemon reads one directory. Every file in it is YAML. An unknown key or a malformed value stops the daemon at startup with a message that names the file and the key.

## The files

| File | Content | Required |
|---|---|---|
| `config.conf` | The `main`, `engine`, `tools`, `health`, `timings` and `memory` sections. | Yes |
| `products.conf` | The catalogue of providers and models the daemon can speak to. The shipped file is complete. | Yes |
| `prompts.conf` | The prompt library. | Yes |
| `personalities.conf` | One personality per agent, keyed by agent name. | Yes |
| `agents.conf` | The agent roster. Each agent names a connection and a model as `<connection>/<model>`. | Yes |
| `roles.conf` | The virtual office: positions, staff and users. An absent file means an empty office. | No |
| `skills.conf` | The Agent Skills registry. An absent file means no skills. | No |

Agents and personalities are one unit. Every agent in `agents.conf` needs an entry with the same name in `personalities.conf`, and every personality needs an agent. The same rule applies to staff members in `roles.conf`. A name may appear in `agents.conf` or in `roles.conf`, but not in both.

## Connections

A connection is one account on one product. Its name is the identity the daemon routes on: credentials are filed under the connection name, `engine.default_provider` names a connection, and an agent's model is `<connection>/<model>`.

Connections are stored in the daemon's database. A `connections:` section in `config.conf` is imported into the database the first time the daemon starts with it; after that, remove the section from the file. Use `sigma-aid --export-connections <file>` to write the stored definitions to a file.

Each connection has these keys:

| Key | Meaning |
|---|---|
| `product` | A product from `products.conf`, for example `openai.bearer`. |
| `enabled` | `true` or `false`. A disabled connection is never used. |
| `token_env` | The name of an environment variable that holds the API key. Leave it empty to use a stored credential only. |
| `timeout` | The request time limit, for example `1min`. |
| `default_model` | The model used when a request names none. |
| `role` | Optional. A system role such as `dataforseo`, `speech-to-text` or `memory`. A connection with a role is never a chat backend. |

## The `main` section

Every key is optional. The shipped `config.conf` shows the default values.

| Key | Meaning |
|---|---|
| `socket` | Path of the Unix domain socket. |
| `socket_mode` | File mode of the socket, as a quoted string such as `"0660"`. |
| `allow_uids` | Extra user ids that may connect. Empty means only the daemon's own user. |
| `admin_uids` | User ids that may change the configuration and the shared provider credentials. The daemon's own user is always allowed. |
| `db_backend` | `sqlite` or `redis`. |
| `sqlite_path` | The SQLite database file. |
| `redis_url` | The Redis URL, when `db_backend` is `redis`. |
| `config_write_policy` | `deny` or `owner`. With `deny`, no client can change the configuration. |
| `workspace` | The root that client-hosted tools work in. |
| `read_root` | The root that daemon-hosted tools may read. Required when `daemon_tool_workers` is greater than zero. |
| `tool_shards`, `tool_timeout` | Tool concurrency and the time limit per tool call. |
| `agents`, `agent_max_in_flight`, `agent_timeout` | Ad hoc agents added to the roster, the delegation limit, and the time limit for a delegated task. |
| `daemon_tool_workers` | Worker threads for daemon-hosted tools. Zero turns those tools off. |
| `daemon_tool_write_root` | The root that daemon-hosted tools may write in. |
| `daemon_tool_exec_root` | The root that daemon-hosted subprocess tools run in. |
| `daemon_tool_repo_writes` | `true` lets the daemon run git and GitHub write operations. |
| `daemon_tool_background_exec` | `true` lets tools start background processes. |
| `daemon_tool_web_fetch` | `true` enables the `web_fetch` tool. |
| `daemon_tool_mcp_servers`, `daemon_tool_mcp_cwd`, `daemon_tool_mcp_env`, `daemon_tool_mcp_queue`, `daemon_tool_mcp_timeout` | The MCP server list and its settings. See [Tools, MCP and skills](/sigma-aid/tools-mcp-skills/). |
| `daemon_tool_lsp_roots`, `daemon_tool_lsp_command` | Project roots and the server executable for the language server tools. |
| `heart_beat_s` | The heartbeat interval in seconds. |
| `housekeeper` | Summaries of completed work. Off by default. |

The `allow_uids` and `admin_uids` keys are read at startup only. They cannot be changed through a running daemon.

## The `engine` section

`engine.default_provider` and `engine.default_model` name the connection and model used when a request names none. `default_provider` is a connection name, not a vendor name. As an alternative, `engine.default` takes a selector such as `openai sol`; it cannot be combined with the two legacy keys.

## Selectors in `roles.conf`

A position in the office lists the models it may run under `candidates`. A candidate can be a connection name (`codex`), a connection and model family (`codex/sol`), or a selector:

```text
<provider> <family>[,<family>...] [<effort>[,<effort>...]]
```

The provider is the vendor from `products.conf`, such as `anthropic` or `google`, not a connection name. Families are tried in the written order. The optional effort list names the preferred reasoning effort. Example:

```yaml
director:
  mode: edit
  rule: sticky
  candidates:
    - anthropic opus,sonnet high,max
    - google argon high
    - codex/sol
```

A selector matches every enabled chat connection of that vendor, so a connection rename does not need an edit here. A vendor or family that is not in the catalogue produces a warning at startup. A position with no usable candidate and no company default stops the daemon.

The same selector syntax works in `main.housekeeper.models` and in `engine.default`.
