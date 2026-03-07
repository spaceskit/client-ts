# TypeScript Client Connection Examples

Minimal examples for connecting to a local Spaceskit instance.

## Prerequisites

1. Install dependencies:

```bash
bun install
```

2. Start the gateway (from repo root):

```bash
bun run --cwd gateway dev
```

## Example 1: Basic SDK Client

Connects, authenticates (Ed25519 challenge-response), sends a ping, and optionally executes a turn.

```bash
# Connection check only
bun run examples/basic-client.ts

# Optional turn execution
SPACE_ID=your-space-id PROMPT="Hello from example" bun run examples/basic-client.ts
```

## Example 2: Adapter Client

Connects as `clientType: "adapter"`, registers one provider, and waits for `capability.invoke` calls.

```bash
bun run examples/adapter-client.ts
```

## Example 3: Workspace Client

Creates or reuses a space, reads `.space` paths, binds the space to a folder when requested, and optionally clears the binding back to managed mode.

```bash
# Create a new space and read workspace info
bun run examples/workspace-client.ts

# Reuse an existing space and bind it to a folder
SPACE_ID=your-space-id WORKSPACE_ROOT=/tmp/spaces/your-space bun run examples/workspace-client.ts

# Clear the folder binding after setting it
SPACE_ID=your-space-id WORKSPACE_ROOT=/tmp/spaces/your-space WORKSPACE_CLEAR_AFTER_SET=1 bun run examples/workspace-client.ts
```

## Environment Variables

- `GATEWAY_URL` (default: `ws://127.0.0.1:9320`)
- `SPACE_ID` (optional, used by `basic-client.ts` for `execute_turn`)
- `PROMPT` (optional, used by `basic-client.ts`)
- `WORKSPACE_ROOT` (optional repo-bound or folder-bound workspace root on the gateway host)
- `WORKSPACE_CLEAR_AFTER_SET=1` (optional clear after setting the folder-bound root)

## Typecheck Examples

```bash
bun run typecheck:examples
```
