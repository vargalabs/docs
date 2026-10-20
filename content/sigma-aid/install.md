---
title: Install and run
order: 10
summary: How to build and start the sigma-aid daemon, and what it needs on the machine.
---

# Install and run

## Build from source

The daemon is built with CMake. Run these commands in the source directory:

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTING=OFF -Dsigma_ai_BUILD_DOCS=OFF
cmake --build build --parallel --target sigma-aid
```

The result is one binary, `build/sigma-aid`.

The source tree also builds a Debian package. That package installs the binary as `/usr/bin/sigma-aid`, the configuration directory as `/etc/sigma-aid`, and a systemd unit named `sigma-aid.service`. The unit starts the daemon with `/usr/bin/sigma-aid --config /etc/sigma-aid` and restarts it if it stops. See the [SIGMA section](/sigma/) for downloads.

## Start the daemon

```bash
sigma-aid --config <directory>
```

`--config` names a directory, not a file. The directory holds the configuration files that the [Configuration](/sigma-aid/configuration/) page describes. If you do not pass `--config`, the daemon reads `/etc/sigma-aid`.

The daemon checks the whole directory before it opens the socket. If a file has an unknown key or a bad value, the daemon prints the file and the key and exits with a non-zero code. You can use this to check a new configuration directory before you install it.

## Command line options

| Option | Effect |
|---|---|
| `--config <directory>` | Read the configuration from this directory. Default: `/etc/sigma-aid`. |
| `-h`, `--help` | Print the options and exit. |
| `-v`, `--version` | Print the version and exit. |
| `--export-connections <file>` | Write the connection definitions from the database to a new YAML file, without credentials, and exit. |
| `--import-connections <file>` | Read connection definitions from a YAML file into the database and exit. Add `--replace` to overwrite a table that is not empty. |

All other settings are keys in `config.conf`. There are no other command line flags.

## What the daemon needs

- A Linux or macOS machine. On Linux the daemon reports to systemd when it runs as a service.
- A directory for the socket. The shipped configuration uses `/run/sigma-aid/sigma-aid.sock`.
- Storage. The default is SQLite in one file (`/var/lib/sigma-aid/sigma-aid.db` in the shipped configuration). You need a Redis server only if you set `db_backend: redis` in `config.conf`.
- Outbound HTTPS to the AI providers that you enable.

The daemon can start with no provider connection enabled. In that state it opens the socket and accepts configuration and credential changes, but it does not answer chat requests until one connection is enabled and has a credential.

## Stop the daemon

When the daemon runs as a service, run `systemctl stop sigma-aid`.
