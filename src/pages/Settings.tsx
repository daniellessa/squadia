import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { Channel, Company } from '@/types'
import { Loader2, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react'
import { useLlmConnections } from '@/hooks/useLlmConnections'

export function Settings() {
  const { companyId } = useAuthStore()
  const { connections, isLoading: connectionsLoading, createConnection, deleteConnection } = useLlmConnections()

  const [showAddConnection, setShowAddConnection] = useState(false)
  const [newConnection, setNewConnection] = useState({
    name: '',
    provider: 'openai' as const,
    model: '',
    api_key: '',
  })

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      if (!companyId) return null

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (error) throw error
      return data as Company
    },
    enabled: !!companyId,
  })

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['channels', companyId],
    queryFn: async () => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Channel[]
    },
    enabled: !!companyId,
  })

  const handleAddConnection = async () => {
    try {
      await createConnection.mutateAsync(newConnection)
      setNewConnection({
        name: '',
        provider: 'openai',
        model: '',
        api_key: '',
      })
      setShowAddConnection(false)
    } catch (error) {
      console.error('Error creating connection:', error)
    }
  }

  const handleDeleteConnection = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conexão?')) return
    try {
      await deleteConnection.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting connection:', error)
    }
  }

  if (companyLoading || channelsLoading || connectionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--text-secondary)" }} />
      </div>
    )
  }

  const channelTypeLabels: Record<Channel['type'], string> = {
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    email: 'Email',
    instagram: 'Instagram',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Gerencie sua conta e integrações
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Dados cadastrais da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <p style={{ color: "var(--text-secondary)" }}>{company?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Setor</label>
            <p style={{ color: "var(--text-secondary)" }}>{company?.sector}</p>
          </div>
          <Button variant="outline">Editar Informações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Canais Conectados</CardTitle>
          <CardDescription>
            Gerencie suas integrações com canais de comunicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <div className="text-center py-8">
              <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                Nenhum canal conectado ainda
              </p>
              <Button>Conectar Primeiro Canal</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {channel.is_connected ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {channelTypeLabels[channel.type]}
                      </p>
                    </div>
                  </div>
                  <Badge variant={channel.is_connected ? 'default' : 'secondary'}>
                    {channel.is_connected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conexões de IA</CardTitle>
          <CardDescription>
            Gerencie suas credenciais de LLM para agentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 && !showAddConnection ? (
            <div className="text-center py-8">
              <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                Nenhuma conexão configurada ainda
              </p>
              <Button onClick={() => setShowAddConnection(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Conexão
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{connection.name}</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {connection.provider} / {connection.model}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                    disabled={deleteConnection.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {showAddConnection && (
                <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                  <div>
                    <Label htmlFor="connection-name">Nome</Label>
                    <Input
                      id="connection-name"
                      value={newConnection.name}
                      onChange={(e) =>
                        setNewConnection({ ...newConnection, name: e.target.value })
                      }
                      placeholder="Ex: OpenAI GPT-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="connection-provider">Provider</Label>
                    <Select
                      id="connection-provider"
                      value={newConnection.provider}
                      onChange={(e) =>
                        setNewConnection({
                          ...newConnection,
                          provider: e.target.value as 'openai' | 'anthropic' | 'google',
                        })
                      }
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="connection-model">Model</Label>
                    <Input
                      id="connection-model"
                      value={newConnection.model}
                      onChange={(e) =>
                        setNewConnection({ ...newConnection, model: e.target.value })
                      }
                      placeholder="Ex: gpt-4-turbo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="connection-api-key">API Key</Label>
                    <Input
                      id="connection-api-key"
                      type="password"
                      value={newConnection.api_key}
                      onChange={(e) =>
                        setNewConnection({ ...newConnection, api_key: e.target.value })
                      }
                      placeholder="sk-..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddConnection}
                      disabled={
                        !newConnection.name ||
                        !newConnection.model ||
                        !newConnection.api_key ||
                        createConnection.isPending
                      }
                    >
                      {createConnection.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddConnection(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {!showAddConnection && connections.length > 0 && (
                <Button onClick={() => setShowAddConnection(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Conexão
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}
