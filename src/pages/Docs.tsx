import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useAgents } from '@/hooks/useAgents'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { DocumentViewer } from '@/components/documents/DocumentViewer'
import { formatRelativeTime } from '@/lib/utils'
import { FileText, Search, Clock, Sparkles } from 'lucide-react'
import type { Document, Agent } from '@/types'

type DocumentWithAgent = Document & {
  agents: Pick<Agent, 'id' | 'name' | 'avatar_color' | 'avatar_url'> | null
}

// Detectar tipo pelo prefixo/palavras no nome
function detectType(name: string): { label: string; color: string } {
  const n = name.toUpperCase()
  if (n.includes('DASHBOARD') || n.includes('ANALISE') || n.includes('SUMARIO') || n.includes('AUDITORIA'))
    return { label: 'Relatório', color: '#6366f1' }
  if (n.includes('PLAYBOOK') || n.includes('ESTRATEGIA') || n.includes('PLANO') || n.includes('RETENCAO'))
    return { label: 'Estratégia', color: '#8b5cf6' }
  if (n.includes('TEMPLATE') || n.includes('SCRIPT') || n.includes('EMAIL') || n.includes('COMUNICACAO'))
    return { label: 'Template', color: '#06b6d4' }
  if (n.includes('CHECKLIST') || n.includes('ONBOARDING') || n.includes('QUICK') || n.includes('INDEX'))
    return { label: 'Guia', color: '#10b981' }
  if (n.includes('FUNIL') || n.includes('VENDAS') || n.includes('QUALIFICACAO') || n.includes('OBJECTION'))
    return { label: 'Vendas', color: '#f59e0b' }
  if (n.includes('FINANC') || n.includes('PRECIFIC') || n.includes('KPI') || n.includes('METRICA'))
    return { label: 'Financeiro', color: '#22c55e' }
  return { label: 'Documento', color: '#9ca3af' }
}

// Extrair preview do conteúdo (primeiras 2 linhas não vazias)
function extractPreview(url: string): string {
  try {
    if (!url.startsWith('data:text/plain')) return ''
    const content = decodeURIComponent(url.split(',')[1] || '')
    const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    return lines.slice(0, 2).join(' · ').slice(0, 120)
  } catch { return '' }
}

// Formatar nome legível
function formatName(name: string): string {
  return name
    .replace(/([A-Z_]+)/g, (m) => m.charAt(0) + m.slice(1).toLowerCase())
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .trim()
}

export function Docs() {
  const { companyId } = useAuthStore()
  const { agents } = useAgents()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [viewingDoc, setViewingDoc] = useState<{ name: string; url: string } | null>(null)

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', companyId],
    queryFn: async () => {
      if (!companyId) return []
      const agentIds = agents.map(a => a.id)
      if (agentIds.length === 0) return []
      const { data, error } = await supabase
        .from('documents')
        .select('*, agents(id, name, avatar_color, avatar_url)')
        .in('agent_id', agentIds)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as DocumentWithAgent[]
    },
    enabled: !!companyId && agents.length > 0,
    refetchInterval: 30000,
  })

  const recentDocs = documents.slice(0, 5)

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery.trim() || doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAgent = !selectedAgentId || doc.agent_id === selectedAgentId
    const matchesType = !selectedType || detectType(doc.name).label === selectedType
    return matchesSearch && matchesAgent && matchesType
  })

  const agentsWithDocs = Array.from(new Set(documents.map(d => d.agent_id)))
    .map(id => agents.find(a => a.id === id)).filter(Boolean) as Agent[]

  const allTypes = Array.from(new Set(documents.map(d => detectType(d.name).label)))

  const isFiltering = !!searchQuery || !!selectedAgentId || !!selectedType

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base de Conhecimento</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {documents.length} documento{documents.length !== 1 ? 's' : ''} gerado{documents.length !== 1 ? 's' : ''} pelos agentes
          </p>
        </div>
      </div>

      {/* Recentes — só quando não está filtrando */}
      {!isFiltering && recentDocs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Recentes</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentDocs.map(doc => {
              const agent = agents.find(a => a.id === doc.agent_id)
              const type = detectType(doc.name)
              return (
                <button
                  key={doc.id}
                  onClick={() => setViewingDoc({ name: doc.name, url: doc.url })}
                  className="flex-shrink-0 w-48 rounded-lg border p-3 text-left space-y-2 hover:shadow-md transition-shadow"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: type.color + '22', color: type.color }}>
                      {type.label}
                    </span>
                    <Sparkles className="h-3 w-3" style={{ color: type.color }} />
                  </div>
                  <p className="text-xs font-medium line-clamp-2">{formatName(doc.name)}</p>
                  {agent && (
                    <div className="flex items-center gap-1">
                      <Avatar name={agent.name} size="sm" color={agent.avatar_color} imageUrl={agent.avatar_url} className="h-4 w-4 text-[10px]" />
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{agent.name}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Busca e filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-sm"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Filtros: tipo + agente */}
        <div className="flex flex-wrap gap-2">
          {/* Tipos */}
          {allTypes.map(type => {
            const color = detectType(type).color
            return (
              <button key={type} onClick={() => setSelectedType(selectedType === type ? null : type)}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors font-medium"
                style={{
                  borderColor: selectedType === type ? color : 'var(--border-default)',
                  backgroundColor: selectedType === type ? color + '22' : 'transparent',
                  color: selectedType === type ? color : 'var(--text-secondary)',
                }}>
                {type}
              </button>
            )
          })}

          {allTypes.length > 0 && agentsWithDocs.length > 0 && (
            <span className="text-xs self-center" style={{ color: 'var(--border-default)' }}>|</span>
          )}

          {/* Agentes */}
          {agentsWithDocs.map(agent => (
            <button key={agent.id} onClick={() => setSelectedAgentId(agent.id === selectedAgentId ? null : agent.id)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={{
                borderColor: selectedAgentId === agent.id ? 'var(--brand-primary)' : 'var(--border-default)',
                backgroundColor: selectedAgentId === agent.id ? 'var(--brand-primary-subtle)' : 'transparent',
                color: selectedAgentId === agent.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}>
              <Avatar name={agent.name} size="sm" color={agent.avatar_color} imageUrl={agent.avatar_url} className="h-3.5 w-3.5 text-[9px]" />
              {agent.name}
            </button>
          ))}

          {isFiltering && (
            <button onClick={() => { setSearchQuery(''); setSelectedAgentId(null); setSelectedType(null) }}
              className="text-xs px-2.5 py-1 rounded-full border"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}>
              ✕ Limpar
            </button>
          )}
        </div>
      </div>

      {/* Contagem */}
      {isFiltering && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {filteredDocuments.length} resultado{filteredDocuments.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 mb-3" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => {
            const agent = agents.find(a => a.id === doc.agent_id)
            const type = detectType(doc.name)
            const preview = extractPreview(doc.url)
            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setViewingDoc({ name: doc.name, url: doc.url })}>
                <CardContent className="pt-4 space-y-3">
                  {/* Tipo + data */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: type.color + '22', color: type.color }}>
                      {type.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatRelativeTime(doc.created_at)}
                    </span>
                  </div>

                  {/* Nome */}
                  <h3 className="font-semibold text-sm leading-snug group-hover:text-indigo-400 transition-colors">
                    {formatName(doc.name)}
                  </h3>

                  {/* Preview */}
                  {preview && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {preview}
                    </p>
                  )}

                  {/* Agente */}
                  {agent && (
                    <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <Avatar name={agent.name} size="sm" color={agent.avatar_color} imageUrl={agent.avatar_url} className="h-5 w-5 text-[10px]" />
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{agent.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {viewingDoc && (
        <DocumentViewer
          open={!!viewingDoc}
          onOpenChange={(open) => !open && setViewingDoc(null)}
          name={viewingDoc.name}
          url={viewingDoc.url}
        />
      )}
    </div>
  )
}
