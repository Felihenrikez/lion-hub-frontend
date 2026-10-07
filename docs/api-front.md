# IS_gob — contrato para el front

API de catálogo de iFlows de SAP Integration Suite. El front consume estas rutas para listar, filtrar, ver el detalle, editar gobierno e importar un ZIP.

Base local: `http://localhost:8090/api`

Swagger: `http://localhost:8090/api/docs`

No hay autenticación. Todas las rutas cuelgan de `/api`.

El navegador en otro origen necesita proxy o CORS. Esta API todavía no habilita CORS.

## Errores

Cuerpo típico de Nest:

```json
{
  "statusCode": 400,
  "message": "Adjunte el ZIP de artefactos en el campo file",
  "error": "Bad Request"
}
```

En validación, `message` es un arreglo de strings.

| Status | Cuándo |
|---|---|
| 400 | Body o query inválido, ZIP ausente o que no es `.zip` |
| 404 | No existe la ficha (`No existe la ficha`) |
| 201 | `POST` que terminó. No significa que se hayan creado fichas |
| 200 | `GET` y `PATCH` |

## Enums

```ts
type Environment = 'DEV' | 'QAS' | 'PRD';

type FlowStatus =
  | 'borrador'
  | 'en_desarrollo'
  | 'en_pruebas'
  | 'activa'
  | 'suspendida'
  | 'deprecada'
  | 'retirada';

type Criticality = 'critica' | 'alta' | 'media' | 'baja';

type ExecutionMode =
  | 'tiempo_real'
  | 'calendarizada'
  | 'por_evento'
  | 'manual'
  | 'a_demanda';

type DependencyKind =
  | 'DATABASE'
  | 'API'
  | 'SAP_SYSTEM'
  | 'INTEGRATION_FLOW'
  | 'CREDENTIAL'
  | 'CLOUD_CONNECTOR'
  | 'OTHER';

type ComponentRole = 'sender' | 'receiver' | 'step';

type DataSource = 'automatic' | 'manual';

type AuditAction = 'create' | 'update' | 'retire' | 'restore';
```

`clientId` siempre viaja y vuelve en minúsculas (`cial`, `embonor`). Solo `[a-z0-9_-]`.

## Ficha

Cada iFlow es un documento. DEV, QAS y PRD viven en `environments[]` de la misma ficha. El inicio está en `environments[].sender`. Las salidas están en `environments[].receivers[]`.

```ts
interface IntegrationFlow {
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
  components: Component[];
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

interface EnvironmentConfig {
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
  receivers: {
    adapterType: string;
    address: string;
    proxyType: string;
    rfc: string;
    locationId: string;
    credentialName: string;
    inExceptionSubprocess: boolean;
    hostCloudConnector: string;
  }[];
  source: DataSource;
  syncedAt: string;
}

interface Component {
  type: string;
  role: ComponentRole;
  name: string;
  adapterType: string;
  environment: Environment | '';
  source: DataSource;
  config: Record<string, string>;
}

interface Dependency {
  kind: DependencyKind;
  name: string;
  reference: string;
  environment: Environment | '';
  source: DataSource;
}
```

`sender` es el inicio. `receivers` son los endpoints de salida. `components` repite inicio, receivers y pasos, con `role`. `HTTPS` se normaliza a tipo `HTTP`.

Tipos de catálogo habituales: `HTTP`, `SOAP`, `OData`, `JDBC`, `RFC`, `SFTP`, `Mail`, `JMS`, `IDoc`, `ProcessDirect`, `Timer`, `Groovy`, `mapping`.

La clave de un receiver, para editar `hostCloudConnector`, es:

```txt
adapterType|address|excepcion|rfc
```

`excepcion` es `1` si `inExceptionSubprocess` es true, si no `0`. Ejemplo: `RFC|RFC_S4|0|ZRFC_PEDIDO`.

## Servicios

### Listar fichas

`GET /api/integration-flows`

Query, todos opcionales. Se combinan con AND.

| Param | Tipo | Notas |
|---|---|---|
| `clientId` | string | Se pasa a minúsculas |
| `environment` | `DEV` \| `QAS` \| `PRD` | |
| `status` | `FlowStatus` | |
| `componentType` | string | Cualquier rol: inicio, receiver o paso. Ejemplo: `JDBC`, `Groovy` |
| `sender` | string | Solo el inicio. `sender=JDBC` no incluye un JDBC que sea paso o receiver. `HTTPS` equivale a `HTTP` |
| `receiver` | string | Algún receiver. `receiver=RFC` |
| `dependencyKind` | `DependencyKind` | |
| `q` | string | Texto libre, sin distinguir mayúsculas. Nombre, artefacto, package, descripción, componente y dependencia |
| `page` | number | Default `1`. Mínimo `1` |
| `limit` | number | Default `50`. Máximo `200` |

Ejemplos:

```txt
GET /api/integration-flows?clientId=cial&environment=PRD&page=1&limit=50
GET /api/integration-flows?sender=JDBC
GET /api/integration-flows?receiver=RFC
GET /api/integration-flows?clientId=cial&environment=PRD&sender=JDBC&receiver=RFC
GET /api/integration-flows?clientId=embonor&componentType=JDBC
GET /api/integration-flows?dependencyKind=SAP_SYSTEM&q=ZRFC
```

`200`

```json
{
  "page": 1,
  "limit": 50,
  "total": 1,
  "items": []
}
```

`items` es `IntegrationFlow[]`, ordenado por `name`.

### Resumen

`GET /api/integration-flows/resumen`

`GET /api/integration-flows/resumen?clientId=cial`

`200`

```json
{
  "byStatus": { "borrador": 4, "activa": 2 },
  "byClient": { "cial": 6 },
  "byComponentType": { "HTTP": 3, "RFC": 2, "Groovy": 8 }
}
```

Conteos, no fichas. Sin `clientId` agrupa todo el catálogo.

### Detalle

`GET /api/integration-flows/:id`

`:id` es el `_id` de Mongo que devolvió el listado.

`200`: un `IntegrationFlow`.

`404`: no existe.

### Auditoría

`GET /api/integration-flows/:id/audit`

`200`: arreglo, el más nuevo primero, máximo 200.

```ts
interface AuditLog {
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
```

### Editar gobierno

`PATCH /api/integration-flows/:id`

`Content-Type: application/json`

Todos los campos son opcionales. Solo se actualizan los que vengan en el body. La importación de un ZIP no pisa estos textos.

```ts
interface UpdateGovernance {
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
```

`manualDependencies`, si se envía, reemplaza todas las dependencias manuales. Las automáticas se conservan.

`receiverHosts` escribe el host de Cloud Connector del receiver cuya clave coincida. Si la clave no existe, ese ítem se ignora.

`200`: la ficha actualizada (`IntegrationFlow`).

`404`: no existe.

Ejemplo:

```json
{
  "businessName": "Despacho SD",
  "owner": "mesa.integracion",
  "criticality": "alta",
  "status": "activa",
  "user": "front",
  "changeReason": "Pasa a activa",
  "receiverHosts": [
    {
      "environment": "PRD",
      "receiverKey": "RFC|RFC_S4|0|ZRFC_PEDIDO",
      "hostCloudConnector": "cc.cliente.cl"
    }
  ]
}
```

### Retirar

`POST /api/integration-flows/:id/retirar`

No borra la ficha. Pasa `status` a `retirada`.

```json
{
  "user": "front",
  "reason": "Ya no se usa"
}
```

Los dos campos son opcionales. Sin `user` queda `is_gob`. Sin `reason` queda `Retiro manual`.

`201`: la ficha actualizada.

`404`: no existe.

### Importar ZIP

`POST /api/imports/zip`

`multipart/form-data`. No fijar `Content-Type` a mano: el cliente tiene que armar el boundary.

| Campo | Obligatorio | Valor |
|---|---|---|
| `file` | sí | archivo `.zip`. Máximo 250 MB. El nombre del campo es `file` |
| `clientId` | sí | slug en minúsculas |
| `environment` | sí | `DEV`, `QAS` o `PRD` |
| `user` | no | quién queda en la auditoría. Default `is_gob` |
| `retireMissing` | no | `true`, `false` o `1`. Si se omite, los iFlows de ese package que ya no vienen en el ZIP se marcan ausentes en ese ambiente. No se borra la ficha |

`201`

```ts
interface ImportResult {
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
```

`created` es la cantidad de fichas nuevas. Un `201` con `created: 0` y `errors` lleno significa que el ZIP se leyó y no se guardó nada. Hay que mostrar `errors` al usuario.

```json
{
  "clientId": "cial",
  "environment": "PRD",
  "packages": ["CIAL_SD_DISPATCH"],
  "artifacts": 8,
  "created": 8,
  "updated": 0,
  "unchanged": 0,
  "restored": 0,
  "retired": 0,
  "errors": []
}
```

## Mapa sugerido de servicios

| Función | HTTP |
|---|---|
| `listFlows(query)` | `GET /api/integration-flows` |
| `getSummary(clientId?)` | `GET /api/integration-flows/resumen` |
| `getFlow(id)` | `GET /api/integration-flows/:id` |
| `getFlowAudit(id)` | `GET /api/integration-flows/:id/audit` |
| `updateFlow(id, body)` | `PATCH /api/integration-flows/:id` |
| `retireFlow(id, body)` | `POST /api/integration-flows/:id/retirar` |
| `importZip(formData)` | `POST /api/imports/zip` |

Para el formulario de importación, `FormData` con `file` en tipo archivo y el resto como texto. No serializar el ZIP en JSON.
