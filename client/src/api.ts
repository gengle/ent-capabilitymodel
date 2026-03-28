export interface ModelSummary {
  id: string
  name: string
  description: string | null
  modelType: string | null
}

export interface SubCapability {
  id: string
  name: string
  description: string | null
  owner: string | null
  level: number
  properties: Record<string, unknown>
}

export interface Capability {
  id: string
  name: string
  description: string | null
  owner: string | null
  level: number
  kind: string | null
  properties: Record<string, unknown>
  subCapabilities: SubCapability[]
}

export interface Group {
  id: string
  name: string
  description: string | null
  level: number
  capabilities: Capability[]
}

export interface Domain {
  id: string
  name: string
  description: string | null
  level: number
  groups: Group[]
}

export interface ModelTree {
  id: string
  name: string
  description: string | null
  modelType: string
  domains: Domain[]
}

export interface ModelType {
  id: string
  name: string
}

export interface NodeKind {
  id: string
  name: string
}

export interface CreateNodeInput {
  name: string
  description?: string
  owner?: string
  level: number
  parentId?: string
  kindId?: string
  properties?: Record<string, unknown>
}

export async function fetchModelTypes(): Promise<ModelType[]> {
  const res = await fetch('/api/model-types')
  if (!res.ok) throw new Error(`Failed to load model types: ${res.statusText}`)
  return res.json()
}

export async function fetchNodeKinds(): Promise<NodeKind[]> {
  const res = await fetch('/api/node-kinds')
  if (!res.ok) throw new Error(`Failed to load node kinds: ${res.statusText}`)
  return res.json()
}

export async function createModel(name: string, description: string | undefined, modelTypeId: string): Promise<ModelSummary> {
  const res = await fetch('/api/models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, modelTypeId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json()
}

export async function updateModel(id: string, patch: { name?: string; description?: string }): Promise<ModelSummary> {
  const res = await fetch(`/api/models/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json()
}

export async function deleteModel(id: string): Promise<void> {
  const res = await fetch(`/api/models/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
}

export async function createNode(modelId: string, input: CreateNodeInput): Promise<unknown> {
  const res = await fetch(`/api/models/${modelId}/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json()
}

export async function updateNode(id: string, patch: { name?: string; description?: string; owner?: string }): Promise<unknown> {
  const res = await fetch(`/api/nodes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json()
}

export async function deleteNode(id: string): Promise<void> {
  const res = await fetch(`/api/nodes/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
}

export async function fetchModels(): Promise<ModelSummary[]> {
  const res = await fetch('/api/models')
  if (!res.ok) throw new Error(`Failed to load models: ${res.statusText}`)
  return res.json()
}

export async function fetchModelTree(id: string): Promise<ModelTree> {
  const res = await fetch(`/api/models/${id}/tree`)
  if (res.status === 404) throw new Error(`Model not found`)
  if (!res.ok) throw new Error(`Failed to load model tree: ${res.statusText}`)
  return res.json()
}
