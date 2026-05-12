/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
export interface ProfileModelConfig {
  preferredModels: string[];
  fallbackModels?: string[];
  constraints?: Record<string, unknown>;
}

export type ManagedRecordStatus = 'active' | 'archived';

export interface AgentDefinitionSummary {
  agentDefinitionId: string;
  personaId?: string;
  name: string;
  description: string;
  instructions: string;
  defaultSkillIds: string[];
  providerHint?: string;
  modelHint?: string;
  modelConfig?: ProfileModelConfig;
  isDefault: boolean;
  status: ManagedRecordStatus;
  activeRevision: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDefinitionCreateResult {
  agentDefinition: AgentDefinitionSummary;
  created: boolean;
}

export interface AgentDefinitionUpdateResult {
  agentDefinition: AgentDefinitionSummary;
  newRevision: number;
}

export interface AgentDefinitionArchiveResult {
  agentDefinition: AgentDefinitionSummary;
  archived: boolean;
}

export interface PersonaSummary {
  personaId: string;
  name: string;
  description: string;
  tone?: string;
  style?: string;
  emotionalLayer?: string;
  constraints: string[];
  instructions: string;
  isDefault: boolean;
  status: ManagedRecordStatus;
  activeRevision: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaCreateResult {
  persona: PersonaSummary;
  created: boolean;
}

export interface PersonaUpdateResult {
  persona: PersonaSummary;
  newRevision: number;
}

export interface PersonaArchiveResult {
  persona: PersonaSummary;
  archived: boolean;
}

export type CompiledInstructionSectionKey =
  | 'system_scaffold'
  | 'agent_definition'
  | 'persona'
  | 'skills'
  | 'policy_appendices'
  | 'workspace_context';

export interface CompiledInstructionSection {
  key: CompiledInstructionSectionKey;
  title: string;
  content: string;
}

export interface CompiledInstructionsPreview {
  agentDefinitionId: string;
  personaId?: string;
  sections: CompiledInstructionSection[];
  compiledText: string;
  generatedAt: string;
}

export type RuntimeSystemPromptSectionKey =
  | "agent_definition"
  | "persona"
  | "active_skill_context"
  | "workspace_context"
  | "conversation_prompt"
  | "assignment_context";

export interface RuntimeSystemPromptSection {
  key: RuntimeSystemPromptSectionKey;
  title: string;
  content: string;
}

export interface RuntimeSystemPromptPreview {
  spaceId: string;
  agentId?: string;
  profileId: string;
  personaId?: string;
  targetKind: "agent_assignment" | "space_profile";
  conversationTopology?: "direct" | "shared_team_chat" | "broadcast_team";
  promptPackId?: string;
  sections: RuntimeSystemPromptSection[];
  compiledText: string;
  generatedAt: string;
}

export interface IdentityListAgentDefinitionsPayload {
  apiVersion?: string;
  includeArchived?: boolean;
}

export interface IdentityListAgentDefinitionsResponsePayload {
  agentDefinitions: AgentDefinitionSummary[];
}

export interface IdentityGetAgentDefinitionPayload {
  apiVersion?: string;
  agentDefinitionId: string;
}

export interface IdentityGetAgentDefinitionResponsePayload {
  agentDefinition: AgentDefinitionSummary;
}

export interface IdentityCreateAgentDefinitionPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  agentDefinitionId?: string;
  personaId?: string;
  name: string;
  description?: string;
  instructions?: string;
  defaultSkillIds?: string[];
  providerHint?: string;
  modelHint?: string;
  modelConfig?: ProfileModelConfig;
  isDefault?: boolean;
}

export interface IdentityCreateAgentDefinitionResponsePayload {
  agentDefinition: AgentDefinitionSummary;
  created: boolean;
}

export interface IdentityUpdateAgentDefinitionPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  agentDefinitionId: string;
  personaId?: string;
  name?: string;
  description?: string;
  instructions?: string;
  defaultSkillIds?: string[];
  providerHint?: string;
  modelHint?: string;
  modelConfig?: ProfileModelConfig;
  isDefault?: boolean;
}

export interface IdentityUpdateAgentDefinitionResponsePayload {
  agentDefinition: AgentDefinitionSummary;
  newRevision: number;
}

export interface IdentityArchiveAgentDefinitionPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  agentDefinitionId: string;
}

export interface IdentityArchiveAgentDefinitionResponsePayload {
  agentDefinition: AgentDefinitionSummary;
  archived: boolean;
}

export interface IdentityListPersonasPayload {
  apiVersion?: string;
  includeArchived?: boolean;
}

export interface IdentityListPersonasResponsePayload {
  personas: PersonaSummary[];
}

export interface IdentityGetPersonaPayload {
  apiVersion?: string;
  personaId: string;
}

export interface IdentityGetPersonaResponsePayload {
  persona: PersonaSummary;
}

export interface IdentityCreatePersonaPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  personaId?: string;
  name: string;
  description?: string;
  tone?: string;
  style?: string;
  emotionalLayer?: string;
  constraints?: string[];
  instructions?: string;
  isDefault?: boolean;
}

export interface IdentityCreatePersonaResponsePayload {
  persona: PersonaSummary;
  created: boolean;
}

export interface IdentityUpdatePersonaPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  personaId: string;
  name?: string;
  description?: string;
  tone?: string;
  style?: string;
  emotionalLayer?: string;
  constraints?: string[];
  instructions?: string;
  isDefault?: boolean;
}

export interface IdentityUpdatePersonaResponsePayload {
  persona: PersonaSummary;
  newRevision: number;
}

export interface IdentityArchivePersonaPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  personaId: string;
}

export interface IdentityArchivePersonaResponsePayload {
  persona: PersonaSummary;
  archived: boolean;
}

export interface IdentityPreviewCompiledInstructionsPayload {
  apiVersion?: string;
  agentDefinitionId: string;
  workspaceContext?: string;
}

export interface IdentityPreviewCompiledInstructionsResponsePayload {
  preview: CompiledInstructionsPreview;
}

export interface IdentityPreviewRuntimeSystemPromptPayload {
  apiVersion?: string;
  spaceId: string;
  agentId?: string;
  profileId?: string;
}

export interface IdentityPreviewRuntimeSystemPromptResponsePayload {
  preview: RuntimeSystemPromptPreview;
}

export interface IdentityPreviewSystemPromptMatrixPayload {
  apiVersion?: string;
  agentDefinitionId: string;
  spaceId?: string;
  agentId?: string;
}

export type PromptBudgetClass = 'full' | 'compact' | 'minimal' | 'cli';

export interface SystemPromptVariant {
  budgetClass: PromptBudgetClass;
  label: string;
  tokenEstimate: number;
  sections: CompiledInstructionSection[];
  compiledText: string;
}

export interface SystemPromptMatrix {
  agentDefinitionId: string;
  personaId?: string;
  generatedAt: string;
  variants: SystemPromptVariant[];
}

export interface IdentityPreviewSystemPromptMatrixResponsePayload {
  matrix: SystemPromptMatrix;
}
