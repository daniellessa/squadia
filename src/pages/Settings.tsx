import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Channel, Company } from '@/types'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export function Settings() {
  const { companyId } = useAuthStore()

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

  if (companyLoading || channelsLoading) {
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
          <CardTitle>Plano Atual</CardTitle>
          <CardDescription>
            Informações sobre seu plano de assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Badge className="mb-2">Plano Gratuito</Badge>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Você está usando o plano gratuito com recursos limitados
              </p>
            </div>
            <Button>Fazer Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
