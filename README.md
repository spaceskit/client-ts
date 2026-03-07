# @spaceskit/client

TypeScript client SDK for connecting to a Spaceskit Gateway.

## Usage

```ts
import { GatewayClient, generateAuthKeyPair } from "@spaceskit/client";

const keyPair = await generateAuthKeyPair();
const client = new GatewayClient({
  url: "ws://127.0.0.1:9320",
  clientType: "my-app",
  clientVersion: "1.0.0",
});

client.setAuthKeyPair(keyPair);

await client.connectAndBootstrapMainSpace({
  spaceId: "main-space",
  resourceId: "resource:main",
  name: "Main Space",
});
```

### Workspace APIs

```ts
const created = await client.createSpace({
  resourceId: `resource:${crypto.randomUUID()}`,
  name: "Workspace demo",
  workspaceRoot: "/absolute/path/on/gateway/host", // optional
});

const workspace = await client.getSpaceWorkspace(created.id);
console.log(workspace.effectiveWorkspaceRoot);
console.log(workspace.metadataStatus);
console.log(workspace.metaPath); // all workspace metadata now lives under .space

await client.setSpaceWorkspace({
  spaceId: created.id,
  workspaceRoot: "/another/absolute/path", // bind the space to a folder on the gateway host
});

await client.setSpaceWorkspace({
  spaceId: created.id,
  workspaceRoot: null, // clear the folder binding and return to managed mode
});
```

## Development

```bash
bun install
bun run build
bun run typecheck
bun run typecheck:examples
```

## Examples

```bash
bun run example:basic
bun run example:adapter
bun run example:workspace
```

`example:workspace` supports:

- `GATEWAY_URL` (default: `ws://127.0.0.1:9320`)
- `SPACE_ID` (optional; create a new space if omitted)
- `WORKSPACE_ROOT` (optional repo-bound or folder-bound workspace root on the gateway host)
- `WORKSPACE_CLEAR_AFTER_SET=1` (optional clear after setting a folder-bound root)

## License

See [LICENSE](./LICENSE).
