---
title: Licensing & Runtime Enforcement
order: 60
summary: How sigma-aid verifies binary build validity, performs hourly licence checks, guarantees boot and data access on expiry, and scales across deployment modes.
---

# Licensing & Runtime Enforcement

`sigma-aid` enforces runtime licence and build validity locally through embedded compile timestamps and asymmetric token validation. The daemon guarantees local access to configuration, repositories, and historical session tapes even if a license lapses. For broad commercial terms, seat allowances, and pricing across the product family, consult the [Licensing & Deployment Editions](/sigma/licensing/) guide or visit [the VargaLABS Store](https://store-dev.vargalabs.com/).

## 1. Runtime Build Validity & Hourly Checks

Every `sigma-aid` binary contains an embedded build timestamp and a cryptographic validation routine.

### Binary Validity Windows and Startup Checks

At compilation time, the build system records the build date and an expiry window into the daemon binary. When `sigma-aid` boots, it reads this metadata and calculates whether the binary falls within its supported execution period.

During startup, the daemon logs the validity window to standard output and the systemd journal:

```text
sigma-aid[8412]: daemon: build 2.1.11 compiled 2025-02-15; valid until 2025-05-16
sigma-aid[8412]: licence: checking /etc/machine-id with install key 7K3QD-...
```

If the binary validity window has passed, the daemon logs a warning and proceeds with initialization. It binds the local UNIX domain socket at `/run/sigma-aid/sigma-aid.sock` and serves the web interface on `127.0.0.1:8742`.

### Hourly Background Re-Checks

While `sigma-aid` remains running, an internal background timer executes approximately once per hour. This check:

1. Compares the system monotonic clock and wall-clock time against the binary build expiration limit.
2. Inspects the cached signed token in `/var/lib/sigma-aid/` for expiration.
3. Automatically requests token renewal over HTTPS if an active network connection exists and the current token is within one hour of its expiration deadline.

### The Refuse-Chat-Not-Boot Guarantee

When a binary validity window, evaluation trial, or subscription lapses, `sigma-aid` enforces the refuse-chat-not-boot guarantee:

- **Startup is never blocked:** The service starts reliably under systemd and accepts local client connections.
- **Full configuration access:** Operators can open `http://127.0.0.1:8742/` to inspect service health, adjust model providers, update credentials, and install a new licence key.
- **Local data remains readable:** Stored session tapes in SQLite, vector memory databases, and git working trees in `/var/lib/ai/projects` remain intact. The daemon never locks, encrypts, or deletes local developer data.
- **Gated execution:** The daemon rejects only new conversational chat turns and delegated agent executions. All read operations and configuration tasks remain active.

## 2. Machine Fingerprinting & Node Limits

`sigma-aid` validates machine identity locally and manages workstation node limits through cryptographic hashing.

### Machine-ID Check-in and Node Tracking

To verify node usage against the licence allowance (`max_nodes`), `sigma-aid` reads `/etc/machine-id`.
The daemon computes a SHA-256 hash combining the host machine identifier with a vendor salt. It transmits this hash along with the install key during check-in.

- Repeated check-ins from the same machine hash reuse the existing node allocation.
- Inactive nodes drop from the active count after 30 days without check-in.
- Up to 2 workstation nodes are included in Core Harness, and 3 workstation nodes per seat in Complete Pro and Team Edition.

### Unlimited Passive SSH Targets (sigma-wsd)

When `sigma-aid` orchestrates operations on remote servers, it connects using the remote execution bridge `sigma-wsd`.

Because `sigma-wsd` executes as a passive process over the authenticated SSH stream (`ssh <host> sigma-wsd --stdio`) of a licensed workstation, it does not host an independent agent daemon or check in to the licensing service. Consequently, remote build servers, test runners, and container hosts managed through `sigma-wsd` do not consume `max_nodes` allocations. Operators can connect to unlimited remote SSH targets.

### Offline Operation and Ed25519 Signed Tokens

Check-in responses from the licence service deliver an Ed25519 cryptographic token signed with the vendor private key.

- Tokens feature a default validity period of 6 hours.
- `sigma-aid` verifies tokens locally against an embedded public key without making outbound internet requests during the validity window.
- If network access is unavailable, the daemon operates offline until the token expires.
- Account linking enforcement follows four administrative policies: `lax`, `remind`, `limit`, and `strict`.

## 3. Storage and Scaling: Local vs. Team vs. Enterprise

`sigma-aid` operates across three distinct architectural tiers depending on operational requirements.

### Local SQLite Workstation Mode

In standard workstation installations, `sigma-aid` runs as an isolated single-node daemon:

- **Database:** Local SQLite files store session tapes (`sessions.db`), long-term memories (`memory.db`), and credential mappings under `/var/lib/sigma-aid/`.
- **Authorization:** Direct POSIX file permissions and `SO_PEERCRED` socket peer credential verification restrict daemon control to the operator UID defined in `main.allow_uids`.
- **Execution:** Agent subtasks run as background processes managed by `exec_start` inside the `/var/lib/ai/projects` hierarchy.

### Team Redis, PostgreSQL & MySQL Mode

For collaborative engineering groups sharing daemons and agent workflows:

- **Centralized Persistence:** Replaces local SQLite with clustered Redis for live session caches and PostgreSQL or MySQL for shared session histories and memory indices.
- **Collaborative Access:** Supports multiple developer UIDs through `main.allow_uids` and `main.admin_uids`, with tool and repository privileges constrained by `roles.conf`.
- **Team Concierge:** Integrates with `sigma-relay` to accept agent dispatches from shared Slack or Discord channels.

### Enterprise SLURM, NSS & Blockchain RBAC Mode

For high-performance computing clusters and regulated enterprise environments:

- **Distributed Workload Scheduling:** Offloads resource-heavy build, test, and model tasks to SLURM-like workload managers across compute clusters and GPU nodes.
- **Unified Identity:** Links with `sigma-iam` and Linux Name Service Switch (`nsswitch.conf`) to authenticate enterprise LDAP or Active Directory users directly at the host boundary.
- **Verifiable Audit Logging:** Captures all tool invocations and administrative actions in an immutable private blockchain ledger with public cryptographic verification.
- **HPC Storage Integration:** Connects to S3-compatible hyperslab file arrays for distributed multi-gigabyte agent workspaces.

For complete deployment specifications and plan options, see the [Licensing & Deployment Editions](/sigma/licensing/) matrix or browse the [VargaLABS Store](https://store-dev.vargalabs.com/).
