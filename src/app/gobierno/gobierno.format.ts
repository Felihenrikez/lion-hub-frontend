import { HttpErrorResponse } from '@angular/common/http';
import {
  AuditAction,
  ComponentRole,
  Criticality,
  DataSource,
  DependencyKind,
  Environment,
  EnvironmentConfig,
  ExecutionMode,
  FlowStatus,
  GovernanceDraft,
  IntegrationFlow,
  ReceiverConfig,
  UpdateGovernance
} from './gobierno.types';

export const ENVIRONMENTS: readonly Environment[] = ['DEV', 'QAS', 'PRD'];

export const FLOW_STATUSES: readonly FlowStatus[] = [
  'borrador',
  'en_desarrollo',
  'en_pruebas',
  'activa',
  'suspendida',
  'deprecada',
  'retirada'
];

export const CRITICALITIES: readonly Criticality[] = ['critica', 'alta', 'media', 'baja'];

export const EXECUTION_MODES: readonly ExecutionMode[] = [
  'tiempo_real',
  'calendarizada',
  'por_evento',
  'manual',
  'a_demanda'
];

export const DEPENDENCY_KINDS: readonly DependencyKind[] = [
  'DATABASE',
  'API',
  'SAP_SYSTEM',
  'INTEGRATION_FLOW',
  'CREDENTIAL',
  'CLOUD_CONNECTOR',
  'OTHER'
];

export const COMPONENT_TYPES: readonly string[] = [
  'HTTP',
  'SOAP',
  'OData',
  'JDBC',
  'RFC',
  'SFTP',
  'Mail',
  'JMS',
  'IDoc',
  'ProcessDirect',
  'Timer',
  'Groovy',
  'mapping'
];

export const HUB_CLIENTS: readonly { id: string; name: string }[] = [
  { id: 'embonor', name: 'Embonor' },
  { id: 'embol', name: 'Embol' },
  { id: 'polpaico', name: 'Polpaico' },
  { id: 'cial', name: 'CIAL' }
];

const STATUS_LABEL: Record<FlowStatus, string> = {
  borrador: 'Borrador',
  en_desarrollo: 'En desarrollo',
  en_pruebas: 'En pruebas',
  activa: 'Activa',
  suspendida: 'Suspendida',
  deprecada: 'Deprecada',
  retirada: 'Retirada'
};

const CRITICALITY_LABEL: Record<Criticality, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja'
};

const EXECUTION_LABEL: Record<ExecutionMode, string> = {
  tiempo_real: 'Tiempo real',
  calendarizada: 'Calendarizada',
  por_evento: 'Por evento',
  manual: 'Manual',
  a_demanda: 'A demanda'
};

const DEPENDENCY_LABEL: Record<DependencyKind, string> = {
  DATABASE: 'Base de datos',
  API: 'API',
  SAP_SYSTEM: 'Sistema SAP',
  INTEGRATION_FLOW: 'Interfaz',
  CREDENTIAL: 'Credencial',
  CLOUD_CONNECTOR: 'Cloud Connector',
  OTHER: 'Otra'
};

const ROLE_LABEL: Record<ComponentRole, string> = {
  sender: 'Inicio',
  receiver: 'Salida',
  step: 'Paso'
};

const SOURCE_LABEL: Record<DataSource, string> = {
  automatic: 'Automático',
  manual: 'Manual'
};

const ACTION_LABEL: Record<AuditAction, string> = {
  create: 'Creación',
  update: 'Actualización',
  retire: 'Retiro',
  restore: 'Restauración'
};

const FIELD_LABEL: Record<string, string> = {
  businessName: 'Nombre de negocio',
  functionalDescription: 'Descripción funcional',
  technicalDescription: 'Descripción técnica',
  businessProcess: 'Proceso de negocio',
  sourceSystem: 'Sistema origen',
  targetSystem: 'Sistema destino',
  transportedData: 'Información transportada',
  owner: 'Responsable',
  reviewer: 'Revisor',
  criticality: 'Criticidad',
  businessImpact: 'Impacto de negocio',
  slaResponseMinutes: 'SLA (minutos)',
  notes: 'Notas',
  supportDocumentation: 'Documentación de soporte',
  helpdeskObservations: 'Observaciones de mesa de ayuda',
  project: 'Proyecto',
  guideline: 'Lineamiento',
  status: 'Estado',
  executionMode: 'Modo de ejecución',
  executionFrequency: 'Frecuencia',
  manualDependencies: 'Dependencias manuales',
  receiverHosts: 'Hosts de Cloud Connector'
};

export interface CountItem {
  key: string;
  count: number;
}

export interface ArchitectureNode {
  role: 'origen' | 'sender' | 'paso' | 'receiver' | 'destino';
  label: string;
  detail: string;
}

const ARCHITECTURE_ROLE_LABEL: Record<ArchitectureNode['role'], string> = {
  origen: 'Origen',
  sender: 'Inicio',
  paso: 'Paso',
  receiver: 'Salida',
  destino: 'Destino'
};

export function clientLabel(clientId: string): string {
  return HUB_CLIENTS.find((client) => client.id === clientId)?.name ?? clientId;
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status as FlowStatus] ?? status;
}

export function criticalityLabel(criticality: string): string {
  return CRITICALITY_LABEL[criticality as Criticality] ?? criticality;
}

export function executionLabel(mode: string): string {
  return EXECUTION_LABEL[mode as ExecutionMode] ?? mode;
}

export function dependencyLabel(kind: string): string {
  return DEPENDENCY_LABEL[kind as DependencyKind] ?? kind;
}

export function roleLabel(role: string): string {
  return ROLE_LABEL[role as ComponentRole] ?? role;
}

export function sourceLabel(source: string): string {
  return SOURCE_LABEL[source as DataSource] ?? source;
}

export function actionLabel(action: string): string {
  return ACTION_LABEL[action as AuditAction] ?? action;
}

export function fieldLabel(field: string): string {
  return FIELD_LABEL[field] ?? field;
}

export function architectureRoleLabel(role: ArchitectureNode['role']): string {
  return ARCHITECTURE_ROLE_LABEL[role];
}

export function statusTone(status: string): string {
  switch (status) {
    case 'activa':
      return 'bg-[#e8f7ee] text-[#18773d]';
    case 'retirada':
    case 'deprecada':
      return 'bg-[#fdeaea] text-[#9f1b1b]';
    case 'suspendida':
      return 'bg-[#fff5e9] text-[#8a5a07]';
    default:
      return 'bg-[#eef3f9] text-[#4f5f73]';
  }
}

export function criticalityTone(criticality: string): string {
  switch (criticality) {
    case 'critica':
    case 'alta':
      return 'bg-[#fdeaea] text-[#9f1b1b]';
    case 'media':
      return 'bg-[#fff5e9] text-[#8a5a07]';
    default:
      return 'bg-[#eef3f9] text-[#4f5f73]';
  }
}

export function orderedCounts(
  counts: Record<string, number> | undefined,
  preferred: readonly string[] = []
): CountItem[] {
  const source = counts ?? {};
  const seen = new Set<string>();
  const items: CountItem[] = [];

  for (const key of preferred) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      seen.add(key);
      items.push({ key, count: source[key] ?? 0 });
    }
  }

  for (const key of Object.keys(source)) {
    if (!seen.has(key)) {
      items.push({ key, count: source[key] ?? 0 });
    }
  }

  return items;
}

export function isEnvironmentPresent(flow: IntegrationFlow, environment: Environment): boolean {
  return flow.environments.some((item) => item.environment === environment && item.present);
}

export function environmentConfig(
  flow: IntegrationFlow,
  environment: Environment
): EnvironmentConfig | null {
  return flow.environments.find((item) => item.environment === environment) ?? null;
}

export function preferredEnvironment(flow: IntegrationFlow): Environment {
  const present = flow.environments.filter((item) => item.present);
  return present.find((item) => item.environment === 'PRD')?.environment ?? present[0]?.environment ?? 'PRD';
}

export function receiverKey(receiver: ReceiverConfig): string {
  return [
    text(receiver.adapterType),
    text(receiver.address),
    receiver.inExceptionSubprocess ? '1' : '0',
    text(receiver.rfc)
  ].join('|');
}

export function receiverLabel(environment: Environment, receiver: ReceiverConfig): string {
  const adapter = text(receiver.adapterType) || 'Salida';
  const address = text(receiver.address);
  const rfc = text(receiver.rfc);
  const endpoint = address && address.toLowerCase() !== adapter.toLowerCase() ? address : rfc || address;
  const parts = [environment, adapter, endpoint];
  if (receiver.inExceptionSubprocess) {
    parts.push('excepción');
  }
  return parts.filter(Boolean).join(' · ');
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
}

export function readApiError(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const body = error.error as { message?: unknown } | null;
  const message = body?.message;

  if (Array.isArray(message)) {
    const textMessage = message.map(String).filter(Boolean).join(' ');
    return textMessage || fallback;
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
}

export function displayText(value: string | null | undefined): string {
  const clean = text(value);
  return clean || '—';
}

export function buildArchitecture(flow: IntegrationFlow, environment: Environment): ArchitectureNode[] {
  const config = environmentConfig(flow, environment);
  const nodes: ArchitectureNode[] = [];
  const sourceSystem = text(flow.sourceSystem);
  const targetSystem = text(flow.targetSystem);

  if (sourceSystem) {
    nodes.push({ role: 'origen', label: sourceSystem, detail: '' });
  }

  const sender = config?.sender;
  if (sender && (text(sender.adapterType) || text(sender.address))) {
    nodes.push({
      role: 'sender',
      label: text(sender.adapterType) || 'Inicio',
      detail: text(sender.address)
    });
  }

  const steps = flow.components.filter(
    (component) =>
      component.role === 'step' &&
      (component.environment === '' || component.environment === environment)
  );

  for (const step of steps) {
    const label = text(step.type) || text(step.adapterType) || text(step.name) || 'Paso';
    const name = text(step.name);
    nodes.push({
      role: 'paso',
      label,
      detail: name && name !== label ? name : ''
    });
  }

  const receivers = config?.receivers ?? [];
  if (receivers.length) {
    for (const receiver of receivers) {
      const adapter = text(receiver.adapterType);
      const address = text(receiver.address);
      const rfc = text(receiver.rfc);
      const detail = address && address.toLowerCase() !== adapter.toLowerCase() ? address : rfc || address;
      nodes.push({
        role: 'receiver',
        label: adapter || 'Salida',
        detail
      });
    }
  } else {
    for (const receiver of flow.components.filter(
      (component) =>
        component.role === 'receiver' &&
        (component.environment === '' || component.environment === environment)
    )) {
      nodes.push({
        role: 'receiver',
        label: text(receiver.adapterType) || text(receiver.type) || 'Salida',
        detail: text(receiver.name)
      });
    }
  }

  if (targetSystem) {
    nodes.push({ role: 'destino', label: targetSystem, detail: '' });
  }

  return nodes;
}

export function toGovernanceDraft(flow: IntegrationFlow, user = ''): GovernanceDraft {
  return {
    businessName: flow.businessName ?? '',
    functionalDescription: flow.functionalDescription ?? '',
    technicalDescription: flow.technicalDescription ?? '',
    businessProcess: flow.businessProcess ?? '',
    sourceSystem: flow.sourceSystem ?? '',
    targetSystem: flow.targetSystem ?? '',
    transportedData: flow.transportedData ?? '',
    owner: flow.owner ?? '',
    reviewer: flow.reviewer ?? '',
    criticality: flow.criticality ?? '',
    businessImpact: flow.businessImpact ?? '',
    slaResponseMinutes:
      flow.slaResponseMinutes === null || flow.slaResponseMinutes === undefined
        ? ''
        : String(flow.slaResponseMinutes),
    notes: flow.notes ?? '',
    supportDocumentation: flow.supportDocumentation ?? '',
    helpdeskObservations: flow.helpdeskObservations ?? '',
    project: flow.project ?? '',
    guideline: flow.guideline ?? '',
    status: flow.status,
    executionMode: flow.execution?.mode ?? '',
    executionFrequency: flow.execution?.frequency ?? '',
    changeReason: '',
    user,
    manualDependencies: (flow.dependencies ?? [])
      .filter((item) => item.source === 'manual')
      .map((item) => ({
        kind: item.kind,
        name: item.name ?? '',
        reference: item.reference ?? ''
      })),
    receiverHosts: (flow.environments ?? []).flatMap((environment) =>
      (environment.receivers ?? []).map((receiver) => ({
        environment: environment.environment,
        receiverKey: receiverKey(receiver),
        hostCloudConnector: receiver.hostCloudConnector ?? '',
        label: receiverLabel(environment.environment, receiver)
      }))
    )
  };
}

export function toUpdateGovernance(draft: GovernanceDraft): UpdateGovernance {
  const body: UpdateGovernance = {
    businessName: draft.businessName.trim(),
    functionalDescription: draft.functionalDescription.trim(),
    technicalDescription: draft.technicalDescription.trim(),
    businessProcess: draft.businessProcess.trim(),
    sourceSystem: draft.sourceSystem.trim(),
    targetSystem: draft.targetSystem.trim(),
    transportedData: draft.transportedData.trim(),
    owner: draft.owner.trim(),
    reviewer: draft.reviewer.trim(),
    businessImpact: draft.businessImpact.trim(),
    notes: draft.notes.trim(),
    supportDocumentation: draft.supportDocumentation.trim(),
    helpdeskObservations: draft.helpdeskObservations.trim(),
    project: draft.project.trim(),
    guideline: draft.guideline.trim(),
    executionFrequency: draft.executionFrequency.trim(),
    status: draft.status,
    manualDependencies: draft.manualDependencies
      .filter((item) => item.name.trim())
      .map((item) => ({
        kind: item.kind,
        name: item.name.trim(),
        ...(item.reference.trim() ? { reference: item.reference.trim() } : {})
      }))
  };

  if (draft.criticality) {
    body.criticality = draft.criticality;
  }

  if (draft.executionMode) {
    body.executionMode = draft.executionMode;
  }

  if (draft.slaResponseMinutes.trim()) {
    const minutes = Number(draft.slaResponseMinutes);
    if (!Number.isNaN(minutes)) {
      body.slaResponseMinutes = minutes;
    }
  }

  if (draft.changeReason.trim()) {
    body.changeReason = draft.changeReason.trim();
  }

  if (draft.user.trim()) {
    body.user = draft.user.trim();
  }

  if (draft.receiverHosts.length) {
    body.receiverHosts = draft.receiverHosts.map((item) => ({
      environment: item.environment,
      receiverKey: item.receiverKey,
      hostCloudConnector: item.hostCloudConnector.trim()
    }));
  }

  return body;
}

function text(value: string | null | undefined): string {
  return (value ?? '').trim();
}
