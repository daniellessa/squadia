import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Bot } from 'lucide-react'

type Step = 1 | 2 | 3

export function Onboarding() {
  const [step, setStep] = useState<Step>(1)
  const { user, setCompanyId } = useAuthStore()
  const navigate = useNavigate()

  // Step 1: Company
  const [companyData, setCompanyData] = useState({
    name: '',
    sector: '',
  })

  // Step 2: First Agent
  const [agentData, setAgentData] = useState({
    name: '',
    role: '',
    personality: '',
  })

  // Step 3: Channel
  const [channelData, setChannelData] = useState({
    type: 'whatsapp' as const,
    name: '',
  })

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handleChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single()

    if (companyError || !company) {
      console.error('Error creating company:', companyError)
      return
    }

    // Update user profile with company_id
    await supabase
      .from('user_profiles')
      .update({ company_id: company.id })
      .eq('id', user.id)

    setCompanyId(company.id)

    // Create first agent
    await supabase.from('agents').insert([
      {
        ...agentData,
        company_id: company.id,
        status: 'idle',
        channel: null,
      },
    ])

    // Create channel
    await supabase.from('channels').insert([
      {
        ...channelData,
        company_id: company.id,
        is_connected: false,
      },
    ])

    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <CardTitle>Configuração Inicial</CardTitle>
          <CardDescription>
            Passo {step} de 3 - {step === 1 ? 'Sua Empresa' : step === 2 ? 'Primeiro Agente' : 'Canal de Comunicação'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nome da Empresa
                </label>
                <Input
                  value={companyData.name}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, name: e.target.value })
                  }
                  placeholder="Ex: Minha Empresa LTDA"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Setor</label>
                <Input
                  value={companyData.sector}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, sector: e.target.value })
                  }
                  placeholder="Ex: E-commerce, Educação, Saúde..."
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Próximo
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleAgentSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nome do Agente
                </label>
                <Input
                  value={agentData.name}
                  onChange={(e) =>
                    setAgentData({ ...agentData, name: e.target.value })
                  }
                  placeholder="Ex: Assistente de Vendas"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Função</label>
                <Input
                  value={agentData.role}
                  onChange={(e) =>
                    setAgentData({ ...agentData, role: e.target.value })
                  }
                  placeholder="Ex: Atendimento e vendas"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Personalidade
                </label>
                <Textarea
                  value={agentData.personality}
                  onChange={(e) =>
                    setAgentData({
                      ...agentData,
                      personality: e.target.value,
                    })
                  }
                  placeholder="Ex: Amigável, prestativo e objetivo"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Voltar
                </Button>
                <Button type="submit" className="w-full">
                  Próximo
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleChannelSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tipo de Canal
                </label>
                <Select
                  value={channelData.type}
                  onChange={(e) =>
                    setChannelData({
                      ...channelData,
                      type: e.target.value as any,
                    })
                  }
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="email">Email</option>
                  <option value="instagram">Instagram</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nome do Canal
                </label>
                <Input
                  value={channelData.name}
                  onChange={(e) =>
                    setChannelData({ ...channelData, name: e.target.value })
                  }
                  placeholder="Ex: WhatsApp Principal"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  Voltar
                </Button>
                <Button type="submit" className="w-full">
                  Finalizar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
