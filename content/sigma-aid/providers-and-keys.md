---
title: Providers and keys
order: 30
summary: How to give the daemon your own provider credentials.
---

# Providers and keys

You bring your own provider accounts. The daemon stores each credential under the name of a connection and uses it for every request that routes to that connection. Every credential is shared: an administrator stores it once, and every user the socket admits runs on it.

## Where a credential comes from

The daemon looks for a credential in this order:

1. The credential stored in the daemon's database under the connection name.
2. The environment variable named by the connection's `token_env` key, read once at startup. This works for API keys only, not for OAuth subscriptions.

If neither is present, requests on that connection fail with `authentication required`.

## Store an API key

Credential writes go through the daemon's socket, so the daemon never needs to read your home directory. Only the daemon's own user and the users listed in `main.admin_uids` may write a credential.

With the Python client:

```python
from sigma_aid_client import Client

with Client("/run/sigma-aid/sigma-aid.sock") as ai:
    ai.credentials.submit_key(connection="codex", key="sk-...")
```

The `connection` value is the connection name from your configuration, not the vendor name. A key filed under `openai` when the connection is called `codex` is stored against a connection that does not exist.

The sigma-ide editor and the setup wizard write credentials through the same path.

## OAuth subscriptions

A product with subscription authentication is authorized in two steps. The first call starts a flow and returns a `flow_id`, a `verification_url` and, for a device flow, a `user_code`. Open the URL in a browser and sign in. For a flow that gives you a code to paste, send that code back with the same `flow_id`:

```python
    flow = ai.credentials.reauthorize(connection="gemini")
    print(flow["verification_url"])
    ai.credentials.complete_authorization(connection="gemini",
                                          flow_id=flow["flow_id"], code="...")
```

The daemon refreshes the stored token before it expires. `authorization_status(connection=...)` reports the current state and `remove_authorization(connection=...)` deletes the stored credential.

## What is never returned

The daemon does not echo a submitted key or code in its answers. The Python client also strips secret fields from every returned body, so a response object cannot carry a key into a log.
