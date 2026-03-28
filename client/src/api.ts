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
