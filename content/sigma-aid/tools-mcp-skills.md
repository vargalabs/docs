---
title: Tools, MCP and skills
order: 40
summary: Native tool grants, MCP servers and Agent Skills.
---

# Tools, MCP and skills

A model running in the daemon can call tools. There are three kinds: native tools that the daemon runs itself, tools served by MCP servers, and Agent Skills, which are instruction text rather than code.

## Native tools

Native tools read files, search, edit, run commands, work with git and GitHub, and read daemon state. Each group is a separate grant in the `main` section of `config.conf`. A grant that cannot take effect stops the daemon at startup instead of being ignored.

| Grant | Key | Enables |
|---|---|---|
| Worker pool | `daemon_tool_workers` greater than zero, with `read_root` | Read tools: `read_file`, `list_dir`, `glob`, `search`, `ripgrep_search`, `tag_search`, `file_tags`, `git_status`, `git_log`, `git_diff`, `git_show`. |
| Write root | `daemon_tool_write_root` | Write tools: `write_file`, `edit`, `multi_edit`, `multi_file_edit`, `apply_patch`. Files are written as the daemon's own user. |
| Exec root | `daemon_tool_exec_root` | Subprocess tools: `exec`, `evaluate_code`, `build`, `run_tests`, `run_linter`. Commands run as the daemon's own user with a clean environment. |
| Repository writes | `daemon_tool_repo_writes: true` | `git_commit`, `git_push`, `git_reset`, `git_checkout` and the GitHub write operations. |
| Background | `daemon_tool_background_exec: true` | `exec_start`, `exec_status`, `exec_output`, `exec_kill`. |
| Web fetch | `daemon_tool_web_fetch: true` | `web_fetch`. |
| Research | An enabled connection with `role: dataforseo` | `serp_search`. This tool spends the operator's search balance. |
| Language server | `daemon_tool_lsp_roots` | The language server tools, when a `clangd` executable is found or `daemon_tool_lsp_command` names one. |

The shipped configuration sets `daemon_tool_workers: 0`, so no native tool that touches the file system is advertised until you set a read root and raise the worker count together.

A tool call cannot change these grants. The model sees only the tools the configuration allows.

## MCP servers

The daemon is a Model Context Protocol (MCP) client. It starts each configured server as a child process and talks to it over standard input and output. HTTP transports are not supported.

List the servers in `config.conf`:

```yaml
main:
  daemon_tool_mcp_servers:
    - files=/usr/local/bin/mcp-files --root /srv/data
    - search=npx -y some-mcp-server
  daemon_tool_mcp_cwd: /srv
  daemon_tool_mcp_env:
    - SOME_API_TOKEN
```

Each entry is `name=program [arguments]`. The name may contain letters, digits, `-` and `_`, but not `__`. Arguments are split on spaces; quoting is not supported. `daemon_tool_mcp_env` lists the names of environment variables to pass to the servers; a variable that is not set is skipped. `daemon_tool_mcp_queue` and `daemon_tool_mcp_timeout` bound the call queue and the time limit per call.

Every tool a server declares is advertised to the model as `mcp__<server>__<tool>`. A server tool called `read_file` on the server `files` becomes `mcp__files__read_file`, so it can never replace the daemon's own `read_file`. The server list is deployment configuration: a model cannot add a server or change a command.

The daemon logs each server's connection state at startup. A server that dies is marked dead; its tools report the failure instead of hanging.

## Agent Skills

An Agent Skill is a directory that holds a `SKILL.md` file: YAML front matter, then Markdown instructions. The front matter must state a `name` and a `description`. Sibling directories such as `references/` may hold files the skill refers to.

A skill is instruction text only. It never grants a tool or a permission.

### Register skills

List the directories that hold skills in `skills.conf`, as absolute paths:

```yaml
skills:
  roots:
    - /srv/skills
```

Each skill is one directory directly under a root. The daemon scans nothing else. At startup it refuses a root with no `SKILL.md` and two roots that offer the same skill name.

### Attach skills to positions

In `roles.conf`, each position lists the skills it may use:

```yaml
roles:
  positions:
    coder:
      mode: edit
      skills:
        - release-notes
        - house-style: { pinned: true }
```

A listed skill appears in the position's system prompt as one line, its name and description. A pinned skill has its whole body rendered into the prompt instead.

### Load a skill during a turn

Two native tools serve skills. They need the worker pool (`daemon_tool_workers` greater than zero) and are advertised only when at least one skill is registered.

| Tool | Effect |
|---|---|
| `skill_load` | Returns the skill's instructions and the list of its reference files. Refused for a skill the calling position does not list. |
| `skill_read` | Returns one reference file from a loaded skill. Paths outside the skill directory and symlinks are refused. |
