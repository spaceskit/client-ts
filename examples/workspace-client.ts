import { GatewayClient, generateAuthKeyPair } from "../src/index.js";

const runtimeProcess = (globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
    exit?: (code?: number) => void;
  };
}).process;
const env = runtimeProcess?.env ?? {};
const gatewayUrl = env.GATEWAY_URL ?? "ws://127.0.0.1:9320";
const requestedSpaceId = env.SPACE_ID?.trim() || undefined;
const explicitWorkspaceRoot = env.WORKSPACE_ROOT?.trim() || undefined;
const clearExplicitRootAfterSet = env.WORKSPACE_CLEAR_AFTER_SET === "1";

async function main(): Promise<void> {
  const keyPair = await generateAuthKeyPair();
  const client = new GatewayClient({
    url: gatewayUrl,
    clientType: "sdk-workspace-example",
    clientVersion: "1.0.0",
  });
  client.setAuthKeyPair(keyPair);

  await client.connect();
  console.log(`Connected to ${gatewayUrl}`);

  let spaceId = requestedSpaceId;
  if (!spaceId) {
    const created = await client.createSpace({
      resourceId: `resource:${crypto.randomUUID()}`,
      name: "Workspace Example",
      goal: "Demonstrate per-space workspace APIs from the TypeScript SDK",
      workspaceRoot: explicitWorkspaceRoot,
    });
    spaceId = created.id;
    console.log(`Created example space: ${created.id} (${created.spaceUid})`);
  }

  const initialWorkspace = await client.getSpaceWorkspace(spaceId);
  console.log("Initial workspace");
  console.log(`  mode: ${initialWorkspace.mode}`);
  console.log(`  root: ${initialWorkspace.effectiveWorkspaceRoot}`);
  console.log(`  .space: ${initialWorkspace.metaPath}`);
  console.log(`  shared-context: ${initialWorkspace.sharedContextPath}`);
  console.log(`  scratchpads: ${initialWorkspace.scratchpadsPath}`);
  console.log(`  metadata-status: ${initialWorkspace.metadataStatus}`);
  console.log(`  git-repo-detected: ${initialWorkspace.gitRepoDetected}`);

  if (explicitWorkspaceRoot) {
    const updated = await client.setSpaceWorkspace({
      spaceId,
      workspaceRoot: explicitWorkspaceRoot,
    });
    console.log("Bound the space to a folder");
    console.log(`  mode: ${updated.mode}`);
    console.log(`  explicit: ${updated.explicitWorkspaceRoot ?? "<none>"}`);
    console.log(`  effective: ${updated.effectiveWorkspaceRoot}`);

    if (clearExplicitRootAfterSet) {
      const reverted = await client.setSpaceWorkspace({
        spaceId,
        workspaceRoot: null,
      });
      console.log("Cleared the folder binding");
      console.log(`  mode: ${reverted.mode}`);
      console.log(`  effective: ${reverted.effectiveWorkspaceRoot}`);
    }
  }

  await client.disconnect();
  console.log("Disconnected");
}

main().catch((error) => {
  console.error("Workspace example failed:", error);
  runtimeProcess?.exit?.(1);
});
