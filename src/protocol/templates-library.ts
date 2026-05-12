/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
import type { ManagedRecordStatus } from "./identity.js";
import type { SpaceAssignmentRole, SpaceSummary } from "./spaces-admin.js";

export type CommunicationMode = 'async_notes' | 'chat_first' | 'structured_handoff';

export type TemplateAgentProfileBinding = 'explicit' | 'gateway_default_main';

export interface TemplateAgentDefinition {
  agentId: string;
  agentDefinitionId?: string;
  profileId?: string;
  profileBinding?: TemplateAgentProfileBinding;
  role?: SpaceAssignmentRole;
  turnOrder?: number;
  isPrimary?: boolean;
}

export interface SpaceTemplateSummary {
  templateId: string;
  title: string;
  communicationMode: CommunicationMode;
  conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
  promptPackId?: string;
  agentPresetIds: string[];
  createdBy: string;
  updatedAt: string;
}

export interface SpacePreviewTemplatePayload {
  apiVersion?: string;
  templateId: string;
  resourceId?: string;
  name?: string;
  goal?: string;
}

export interface SpacePreviewTemplateResult {
  template: SpaceTemplateSummary;
  resolved: {
    templateId: string;
    templateRevision: number;
    name: string;
    goal?: string;
    resourceId: string;
    communicationMode: CommunicationMode;
    turnModel: string;
    initialAgents: TemplateAgentDefinition[];
  };
  warnings: string[];
}

export interface SpaceCreateFromTemplatePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  templateId: string;
  spaceId?: string;
  resourceId: string;
  name?: string;
  goal?: string;
  visibility?: 'shared' | 'private';
  workspaceRoot?: string;
}

export interface SpaceCreateFromTemplateResult {
  template: SpaceTemplateSummary;
  space: SpaceSummary;
}

export interface SpaceSaveTemplatePayload {
  apiVersion?: string;
  templateId?: string;
  title: string;
  description?: string;
  communicationMode?: CommunicationMode;
  conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
  promptPackId?: string;
  baseAgents?: TemplateAgentDefinition[];
  agentPresetIds?: string[];
  sourceSpaceId?: string;
  tags?: string[];
}

export interface SpaceSaveTemplateResult {
  template: SpaceTemplateSummary;
  created: boolean;
}

export interface SpaceTemplateListPayload {
  apiVersion?: string;
  includeArchived?: boolean;
}

export interface SpaceTemplateGetPayload {
  apiVersion?: string;
  templateId: string;
}

export interface SpaceTemplatePreviewPayload {
  apiVersion?: string;
  templateId: string;
  resourceId?: string;
  name?: string;
  goal?: string;
}

export interface SpaceTemplateCreateSpacePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  templateId: string;
  spaceId?: string;
  resourceId: string;
  name?: string;
  goal?: string;
  visibility?: 'shared' | 'private';
  workspaceRoot?: string;
}

export interface SpaceTemplateSavePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  templateId?: string;
  name: string;
  description?: string;
  communicationMode?: CommunicationMode;
  conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
  promptPackId?: string;
  baseAgents?: TemplateAgentDefinition[];
  sourceSpaceId?: string;
}

export interface SpaceTemplateArchivePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  templateId: string;
}

export interface SpaceTemplatePreviewResolved {
  templateId: string;
  templateRevision: number;
  name: string;
  goal?: string;
  resourceId: string;
  communicationMode: CommunicationMode;
  conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
  promptPackId?: string;
  turnModel: string;
  initialAgents: TemplateAgentDefinition[];
}

export interface SpaceTemplateRecord {
  templateId: string;
  name: string;
  description?: string;
  status: ManagedRecordStatus;
  activeRevision: number;
  communicationMode: CommunicationMode;
  conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
  promptPackId?: string;
  turnModel: string;
  agentDefinitions: TemplateAgentDefinition[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceTemplateListResponsePayload {
  templates: SpaceTemplateRecord[];
}

export interface SpaceTemplateGetResponsePayload {
  template: SpaceTemplateRecord;
}

export interface SpaceTemplatePreviewResponsePayload {
  template: SpaceTemplateRecord;
  resolved: SpaceTemplatePreviewResolved;
  warnings: string[];
}

export interface SpaceTemplateCreateSpaceResponsePayload {
  template: SpaceTemplateRecord;
  space: SpaceSummary;
}

export interface SpaceTemplateSaveResponsePayload {
  template: SpaceTemplateRecord;
  created: boolean;
}

export interface SpaceTemplateArchiveResponsePayload {
  template: SpaceTemplateRecord;
  archived: boolean;
}

export interface SpaceTemplatePreviewResult {
  template: SpaceTemplateRecord;
  resolved: SpaceTemplatePreviewResolved;
  warnings: string[];
}

export interface SpaceTemplateCreateSpaceResult {
  template: SpaceTemplateRecord;
  space: SpaceSummary;
}

export interface SpaceTemplateSaveResult {
  template: SpaceTemplateRecord;
  created: boolean;
}

export interface SpaceTemplateArchiveResult {
  template: SpaceTemplateRecord;
  archived: boolean;
}

export type LibrarySourceKind = 'installed' | 'scanned' | 'verified' | 'system';
export type LibraryEntryStatus = 'enabled' | 'disabled' | 'archived';

export interface LibraryEntry {
  entryId: string;
  skillId?: string;
  name: string;
  description?: string;
  contentMarkdown?: string;
  sourceKind: LibrarySourceKind;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  tags: string[];
  status: LibraryEntryStatus;
  importable: boolean;
  importedSkillId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryListEntriesPayload {
  apiVersion?: string;
  query?: string;
  sourceKinds?: LibrarySourceKind[];
  includeArchived?: boolean;
  includeContent?: boolean;
  limit?: number;
}

export interface LibraryListEntriesResponsePayload {
  entries: LibraryEntry[];
}

export interface LibraryGetEntryPayload {
  apiVersion?: string;
  entryId: string;
  includeContent?: boolean;
}

export interface LibraryGetEntryResponsePayload {
  entry: LibraryEntry;
}

export interface LibrarySaveSkillPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  entryId?: string;
  skillId?: string;
  name: string;
  description?: string;
  contentMarkdown: string;
  tags?: string[];
  sourceKind?: LibrarySourceKind;
  sourceRef?: string;
  enabled?: boolean;
}

export interface LibrarySaveSkillResponsePayload {
  entry: LibraryEntry;
  created: boolean;
}

export interface LibraryImportEntryPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  entryId: string;
  skillId?: string;
  name?: string;
}

export interface LibraryImportEntryResponsePayload {
  entry: LibraryEntry;
  created: boolean;
}

export interface LibraryArchiveEntryPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  entryId: string;
}

export interface LibraryArchiveEntryResponsePayload {
  entry: LibraryEntry;
  archived: boolean;
}

export interface LibrarySetEntryEnabledPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  entryId: string;
  enabled: boolean;
}

export interface LibrarySetEntryEnabledResponsePayload {
  entry: LibraryEntry;
}

export interface LibraryDeleteEntryPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  entryId: string;
}

export interface LibraryDeleteEntryResponsePayload {
  entryId: string;
  deleted: boolean;
}

export interface LibraryScanEntriesPayload {
  apiVersion?: string;
}

export interface LibraryScanEntriesResponsePayload {
  entries: LibraryEntry[];
  scannedAt: string;
}

export interface SkillDraft {
  draftId: string;
  name: string;
  description?: string;
  requestPrompt: string;
  contentMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryListSkillDraftsPayload {
  apiVersion?: string;
}

export interface LibraryListSkillDraftsResponsePayload {
  drafts: SkillDraft[];
}

export interface LibraryGetSkillDraftPayload {
  apiVersion?: string;
  draftId: string;
}

export interface LibraryGetSkillDraftResponsePayload {
  draft: SkillDraft;
}

export interface LibraryCreateSkillDraftPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  draftId?: string;
  name?: string;
  description?: string;
  requestPrompt: string;
}

export interface LibraryCreateSkillDraftResponsePayload {
  draft: SkillDraft;
  created: boolean;
}

export interface LibraryDeleteSkillDraftPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  draftId: string;
}

export interface LibraryDeleteSkillDraftResponsePayload {
  draftId: string;
  deleted: boolean;
}
