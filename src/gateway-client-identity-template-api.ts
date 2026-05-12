import type {
  AgentDefinitionArchiveResult,
  AgentDefinitionCreateResult,
  AgentDefinitionSummary,
  AgentDefinitionUpdateResult,
  CompiledInstructionsPreview,
  IdentityArchiveAgentDefinitionPayload,
  IdentityArchiveAgentDefinitionResponsePayload,
  IdentityArchivePersonaPayload,
  IdentityArchivePersonaResponsePayload,
  IdentityCreateAgentDefinitionPayload,
  IdentityCreateAgentDefinitionResponsePayload,
  IdentityCreatePersonaPayload,
  IdentityCreatePersonaResponsePayload,
  IdentityGetAgentDefinitionPayload,
  IdentityGetAgentDefinitionResponsePayload,
  IdentityGetPersonaPayload,
  IdentityGetPersonaResponsePayload,
  IdentityListAgentDefinitionsPayload,
  IdentityListAgentDefinitionsResponsePayload,
  IdentityListPersonasPayload,
  IdentityListPersonasResponsePayload,
  IdentityPreviewCompiledInstructionsPayload,
  IdentityPreviewCompiledInstructionsResponsePayload,
  IdentityPreviewRuntimeSystemPromptPayload,
  IdentityPreviewRuntimeSystemPromptResponsePayload,
  IdentityPreviewSystemPromptMatrixPayload,
  IdentityPreviewSystemPromptMatrixResponsePayload,
  IdentityUpdateAgentDefinitionPayload,
  IdentityUpdateAgentDefinitionResponsePayload,
  IdentityUpdatePersonaPayload,
  IdentityUpdatePersonaResponsePayload,
  PersonaArchiveResult,
  PersonaCreateResult,
  PersonaSummary,
  PersonaUpdateResult,
  RuntimeSystemPromptPreview,
  SpaceCreateFromTemplatePayload,
  SpaceCreateFromTemplateResult,
  SpacePreviewTemplatePayload,
  SpacePreviewTemplateResult,
  SpaceSaveTemplatePayload,
  SpaceSaveTemplateResult,
  SpaceTemplateArchivePayload,
  SpaceTemplateArchiveResponsePayload,
  SpaceTemplateArchiveResult,
  SpaceTemplateCreateSpacePayload,
  SpaceTemplateCreateSpaceResult,
  SpaceTemplateGetPayload,
  SpaceTemplateGetResponsePayload,
  SpaceTemplateListPayload,
  SpaceTemplateListResponsePayload,
  SpaceTemplatePreviewPayload,
  SpaceTemplatePreviewResult,
  SpaceTemplateRecord,
  SpaceTemplateSavePayload,
  SpaceTemplateSaveResult,
  SystemPromptMatrix,
} from "./gateway-protocol.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";

export function listAgentDefinitions(
  requests: GatewayClientRequestInvoker,
  payload: IdentityListAgentDefinitionsPayload = {},
): Promise<AgentDefinitionSummary[]> {
  return requests.requestField<
    IdentityListAgentDefinitionsPayload,
    IdentityListAgentDefinitionsResponsePayload,
    "agentDefinitions"
  >("identity.list_agent_definitions", payload, "agentDefinitions");
}

export function getAgentDefinition(
  requests: GatewayClientRequestInvoker,
  agentDefinitionId: string,
  apiVersion?: string,
): Promise<AgentDefinitionSummary> {
  const payload: IdentityGetAgentDefinitionPayload = { apiVersion, agentDefinitionId };
  return requests.requestField<
    IdentityGetAgentDefinitionPayload,
    IdentityGetAgentDefinitionResponsePayload,
    "agentDefinition"
  >("identity.get_agent_definition", payload, "agentDefinition");
}

export async function createAgentDefinition(
  requests: GatewayClientRequestInvoker,
  payload: IdentityCreateAgentDefinitionPayload,
): Promise<AgentDefinitionCreateResult> {
  const result = await requests.request<
    IdentityCreateAgentDefinitionPayload,
    IdentityCreateAgentDefinitionResponsePayload
  >("identity.create_agent_definition", payload);
  return {
    agentDefinition: result.agentDefinition,
    created: result.created,
  };
}

export async function updateAgentDefinition(
  requests: GatewayClientRequestInvoker,
  payload: IdentityUpdateAgentDefinitionPayload,
): Promise<AgentDefinitionUpdateResult> {
  const result = await requests.request<
    IdentityUpdateAgentDefinitionPayload,
    IdentityUpdateAgentDefinitionResponsePayload
  >("identity.update_agent_definition", payload);
  return {
    agentDefinition: result.agentDefinition,
    newRevision: result.newRevision,
  };
}

export async function archiveAgentDefinition(
  requests: GatewayClientRequestInvoker,
  payload: IdentityArchiveAgentDefinitionPayload,
): Promise<AgentDefinitionArchiveResult> {
  const result = await requests.request<
    IdentityArchiveAgentDefinitionPayload,
    IdentityArchiveAgentDefinitionResponsePayload
  >("identity.archive_agent_definition", payload);
  return {
    agentDefinition: result.agentDefinition,
    archived: result.archived,
  };
}

export function listPersonas(
  requests: GatewayClientRequestInvoker,
  payload: IdentityListPersonasPayload = {},
): Promise<PersonaSummary[]> {
  return requests.requestField<
    IdentityListPersonasPayload,
    IdentityListPersonasResponsePayload,
    "personas"
  >("identity.list_personas", payload, "personas");
}

export function getPersona(
  requests: GatewayClientRequestInvoker,
  personaId: string,
  apiVersion?: string,
): Promise<PersonaSummary> {
  const payload: IdentityGetPersonaPayload = { apiVersion, personaId };
  return requests.requestField<
    IdentityGetPersonaPayload,
    IdentityGetPersonaResponsePayload,
    "persona"
  >("identity.get_persona", payload, "persona");
}

export async function createPersona(
  requests: GatewayClientRequestInvoker,
  payload: IdentityCreatePersonaPayload,
): Promise<PersonaCreateResult> {
  const result = await requests.request<
    IdentityCreatePersonaPayload,
    IdentityCreatePersonaResponsePayload
  >("identity.create_persona", payload);
  return { persona: result.persona, created: result.created };
}

export async function updatePersona(
  requests: GatewayClientRequestInvoker,
  payload: IdentityUpdatePersonaPayload,
): Promise<PersonaUpdateResult> {
  const result = await requests.request<
    IdentityUpdatePersonaPayload,
    IdentityUpdatePersonaResponsePayload
  >("identity.update_persona", payload);
  return { persona: result.persona, newRevision: result.newRevision };
}

export async function archivePersona(
  requests: GatewayClientRequestInvoker,
  payload: IdentityArchivePersonaPayload,
): Promise<PersonaArchiveResult> {
  const result = await requests.request<
    IdentityArchivePersonaPayload,
    IdentityArchivePersonaResponsePayload
  >("identity.archive_persona", payload);
  return { persona: result.persona, archived: result.archived };
}

export function previewCompiledInstructions(
  requests: GatewayClientRequestInvoker,
  agentDefinitionId: string,
  apiVersion?: string,
  workspaceContext?: string,
): Promise<CompiledInstructionsPreview> {
  const payload: IdentityPreviewCompiledInstructionsPayload = {
    apiVersion,
    agentDefinitionId,
    workspaceContext,
  };
  return requests.requestField<
    IdentityPreviewCompiledInstructionsPayload,
    IdentityPreviewCompiledInstructionsResponsePayload,
    "preview"
  >("identity.preview_compiled_instructions", payload, "preview");
}

export function previewRuntimeSystemPrompt(
  requests: GatewayClientRequestInvoker,
  payload: IdentityPreviewRuntimeSystemPromptPayload,
): Promise<RuntimeSystemPromptPreview> {
  return requests.requestField<
    IdentityPreviewRuntimeSystemPromptPayload,
    IdentityPreviewRuntimeSystemPromptResponsePayload,
    "preview"
  >("identity.preview_runtime_system_prompt", payload, "preview");
}

export function previewSystemPromptMatrix(
  requests: GatewayClientRequestInvoker,
  payload: IdentityPreviewSystemPromptMatrixPayload,
): Promise<SystemPromptMatrix> {
  return requests.requestField<
    IdentityPreviewSystemPromptMatrixPayload,
    IdentityPreviewSystemPromptMatrixResponsePayload,
    "matrix"
  >("identity.preview_system_prompt_matrix", payload, "matrix");
}

export function previewTemplate(
  requests: GatewayClientRequestInvoker,
  payload: SpacePreviewTemplatePayload,
): Promise<SpacePreviewTemplateResult> {
  return requests.request<SpacePreviewTemplatePayload, SpacePreviewTemplateResult>(
    "space.preview_template",
    payload,
  );
}

export function createSpaceFromTemplate(
  requests: GatewayClientRequestInvoker,
  payload: SpaceCreateFromTemplatePayload,
): Promise<SpaceCreateFromTemplateResult> {
  return requests.request<SpaceCreateFromTemplatePayload, SpaceCreateFromTemplateResult>(
    "space.create_from_template",
    payload,
  );
}

export function saveSpaceTemplate(
  requests: GatewayClientRequestInvoker,
  payload: SpaceSaveTemplatePayload,
): Promise<SpaceSaveTemplateResult> {
  return requests.request<SpaceSaveTemplatePayload, SpaceSaveTemplateResult>(
    "space.save_template",
    payload,
  );
}

export function listSpaceTemplates(
  requests: GatewayClientRequestInvoker,
  payload: SpaceTemplateListPayload = {},
): Promise<SpaceTemplateRecord[]> {
  return requests.requestField<
    SpaceTemplateListPayload,
    SpaceTemplateListResponsePayload,
    "templates"
  >("space.list_templates", payload, "templates");
}

export function getSpaceTemplate(
  requests: GatewayClientRequestInvoker,
  templateId: string,
  apiVersion?: string,
): Promise<SpaceTemplateRecord> {
  const payload: SpaceTemplateGetPayload = { apiVersion, templateId };
  return requests.requestField<
    SpaceTemplateGetPayload,
    SpaceTemplateGetResponsePayload,
    "template"
  >("space.get_template", payload, "template");
}

export async function previewSpaceTemplateRecord(
  requests: GatewayClientRequestInvoker,
  payload: SpaceTemplatePreviewPayload,
): Promise<SpaceTemplatePreviewResult> {
  const [template, result] = await Promise.all([
    getSpaceTemplate(requests, payload.templateId, payload.apiVersion),
    previewTemplate(requests, {
      apiVersion: payload.apiVersion,
      templateId: payload.templateId,
      resourceId: payload.resourceId,
      name: payload.name,
      goal: payload.goal,
    }),
  ]);
  return {
    template,
    resolved: result.resolved,
    warnings: result.warnings,
  };
}

export async function createSpaceFromManagedTemplate(
  requests: GatewayClientRequestInvoker,
  payload: SpaceTemplateCreateSpacePayload,
): Promise<SpaceTemplateCreateSpaceResult> {
  const [template, result] = await Promise.all([
    getSpaceTemplate(requests, payload.templateId, payload.apiVersion),
    createSpaceFromTemplate(requests, {
      apiVersion: payload.apiVersion,
      idempotencyKey: payload.idempotencyKey,
      templateId: payload.templateId,
      spaceId: payload.spaceId,
      resourceId: payload.resourceId,
      name: payload.name,
      goal: payload.goal,
      visibility: payload.visibility,
      workspaceRoot: payload.workspaceRoot,
    }),
  ]);
  return {
    template,
    space: result.space,
  };
}

export async function saveManagedSpaceTemplate(
  requests: GatewayClientRequestInvoker,
  payload: SpaceTemplateSavePayload,
): Promise<SpaceTemplateSaveResult> {
  const result = await saveSpaceTemplate(requests, {
    apiVersion: payload.apiVersion,
    templateId: payload.templateId,
    title: payload.name,
    description: payload.description,
    communicationMode: payload.communicationMode,
    conversationTopology: payload.conversationTopology,
    promptPackId: payload.promptPackId,
    baseAgents: payload.baseAgents,
    sourceSpaceId: payload.sourceSpaceId,
  });
  const template = await getSpaceTemplate(requests, result.template.templateId, payload.apiVersion);
  return {
    template,
    created: result.created,
  };
}

export async function archiveSpaceTemplate(
  requests: GatewayClientRequestInvoker,
  payload: SpaceTemplateArchivePayload,
): Promise<SpaceTemplateArchiveResult> {
  const result = await requests.request<
    SpaceTemplateArchivePayload,
    SpaceTemplateArchiveResponsePayload
  >("space.archive_template", payload);
  return {
    template: result.template,
    archived: result.archived,
  };
}
