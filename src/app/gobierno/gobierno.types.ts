export type Environment = 'DEV' | 'QAS' | 'PRD';

export type FlowStatus =
  | 'borrador'
  | 'en_desarrollo'
  | 'en_pruebas'
  | 'activa'
  | 'suspendida'
  | 'deprecada'
  | 'retirada';

export type Criticality = 'critica' | 'alta' | 'media' | 'baja';

export type ExecutionMode =
  | 'tiempo_real'
  | 'calendarizada'
  | 'por_evento'
  | 'manual'
  | 'a_demanda';

export type DependencyKind =
  | 'DATABASE'
  | 'API'
  | 'SAP_SYSTEM'
  | 'INTEGRATION_FLOW'
  | 'CREDENTIAL'
  | 'CLOUD_CONNECTOR'
  | 'OTHER';

export type ComponentRole = 'sender' | 'receiver' | 'step';

export type DataSource = 'automatic' | 'manual';

export type AuditAction = 'create' | 'update' | 'retire' | 'restore';

export interface IntegrationFlow {
  _id: string;
  clientId: string;
  packageKey: string;
  artifactId: string;
  name: string;
  businessName: string;
  functionalDescription: string;
  technicalDescription: string;
  businessProcess: string;
  sourceSystem: string;
  targetSystem: string;
  transportedData: string;
  owner: string;
  reviewer: string;
  criticality: Criticality | null;
  businessImpact: string;
  slaResponseMinutes: number | null;
  notes: string;
  supportDocumentation: string;
  helpdeskObservations: string;
  project: string;
  guideline: string;
  status: FlowStatus;
  retirement: {
    manual: boolean;
    statusBefore: FlowStatus;
    reason: string;
    at: string;
  } | null;
  environments: EnvironmentConfig[];
  components: FlowComponent[];
  dependencies: Dependency[];
  execution: {
    mode: ExecutionMode | null;
    frequency: string;
    timeZone: string;
    source: DataSource;
  };
  versionHistory: {
    version: string;
    environment: Environment;
    recordedAt: string;
    recordedBy: string;
    reason: string;
    source: DataSource;
  }[];
  provenance: {
    lastZip: string;
    lastImportedAt: string;
    importedBy: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentConfig {
  environment: Environment;
  packageName: string;
  version: string;
  present: boolean;
  sourceZip: string;
  sender: {
    adapterType: string;
    address: string;
    timeZone: string;
    timeZoneIana: string;
    observesDaylightSaving: boolean;
    scheduleDescription: string;
  };
  receivers: ReceiverConfig[];
  source: DataSource;
  syncedAt: string;
}

export interface ReceiverConfig {
  adapterType: string;
  address: string;
  proxyType: string;
  rfc: string;
  locationId: string;
  credentialName: string;
  inExceptionSubprocess: boolean;
  hostCloudConnector: string;
}

export interface FlowComponent {
  type: string;
  role: ComponentRole;
  name: string;
  adapterType: string;
  environment: Environment | '';
  source: DataSource;
  config: Record<string, string>;
}

export interface Dependency {
  kind: DependencyKind;
  name: string;
  reference: string;
  environment: Environment | '';
  source: DataSource;
}

export interface AuditLog {
  _id: string;
  entity: 'integration_flow';
  entityId: string;
  clientId: string;
  artifactId: string;
  user: string;
  at: string;
  action: AuditAction;
  reason: string;
  changes: {
    field: string;
    previousValue: unknown;
    newValue: unknown;
  }[];
}

export interface FlowListQuery {
  clientId?: string;
  environment?: Environment;
  status?: FlowStatus;
  componentType?: string;
  sender?: string;
  receiver?: string;
  dependencyKind?: DependencyKind;
  q?: string;
  page?: number;
  limit?: number;
}

export interface FlowListResponse {
  page: number;
  limit: number;
  total: number;
  items: IntegrationFlow[];
}

export interface FlowSummary {
  byStatus: Record<string, number>;
  byClient: Record<string, number>;
  byComponentType: Record<string, number>;
}

export interface UpdateGovernance {
  businessName?: string;
  functionalDescription?: string;
  technicalDescription?: string;
  businessProcess?: string;
  sourceSystem?: string;
  targetSystem?: string;
  transportedData?: string;
  owner?: string;
  reviewer?: string;
  criticality?: Criticality;
  businessImpact?: string;
  slaResponseMinutes?: number;
  notes?: string;
  supportDocumentation?: string;
  helpdeskObservations?: string;
  project?: string;
  guideline?: string;
  status?: FlowStatus;
  executionMode?: ExecutionMode;
  executionFrequency?: string;
  changeReason?: string;
  user?: string;
  manualDependencies?: {
    kind: DependencyKind;
    name: string;
    reference?: string;
  }[];
  receiverHosts?: {
    environment: Environment;
    receiverKey: string;
    hostCloudConnector: string;
  }[];
}

export interface RetireFlow {
  user?: string;
  reason?: string;
}

export interface ImportResult {
  clientId: string;
  environment: Environment | null;
  packages: string[];
  artifacts: number;
  created: number;
  updated: number;
  unchanged: number;
  restored: number;
  retired: number;
  errors: {
    packageName: string;
    artifactId: string;
    message: string;
  }[];
}

export interface ManualDependencyDraft {
  kind: DependencyKind;
  name: string;
  reference: string;
}

export interface ReceiverHostDraft {
  environment: Environment;
  receiverKey: string;
  hostCloudConnector: string;
  label: string;
}

export interface GovernanceDraft {
  businessName: string;
  functionalDescription: string;
  technicalDescription: string;
  businessProcess: string;
  sourceSystem: string;
  targetSystem: string;
  transportedData: string;
  owner: string;
  reviewer: string;
  criticality: Criticality | '';
  businessImpact: string;
  slaResponseMinutes: string;
  notes: string;
  supportDocumentation: string;
  helpdeskObservations: string;
  project: string;
  guideline: string;
  status: FlowStatus;
  executionMode: ExecutionMode | '';
  executionFrequency: string;
  changeReason: string;
  user: string;
  manualDependencies: ManualDependencyDraft[];
  receiverHosts: ReceiverHostDraft[];
}
