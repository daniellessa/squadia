/**
 * Classifier — chama o agente classificador no OpenClaw.
 * O classificador decide se a mensagem é simples (responde on-the-fly)
 * ou complexa (cria task com tags).
 */

import { supabase } from './supabase'

const CLASSIFIER_SESSION = 'agent:main:squadia-classifier'

async function buildSystemPrompt(companyId: string | null | undefined): Promise<string> {
  let memoryBlock = ''

  if (companyId) {
    try {
      const { data: memories } = await supabase
        .from('agent_memories')
        .select('content, tags')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (memories?.length) {
        memoryBlock = `\n\n## Conhecimento acumulado sobre o negócio:\n${memories.map(m => `- ${m.content}`).join('\n')}\n\nUse este conhecimento para responder com mais precisão e contexto.`
      }
    } catch { /* ignora erros de fetch */ }
  }

  return `Você é um assistente inteligente de atendimento.

Ao receber uma mensagem, analise e decida:

1. Se for simples (saudação, pergunta rápida, conversa casual, dúvida que você consegue responder com o conhecimento disponível) → responda diretamente em texto puro.

2. Se for complexa (problema técnico, solicitação de serviço, reclamação, processo que exige trabalho de um especialista) → responda APENAS com um JSON válido no formato:
{
  "type": "task",
  "title": "Título curto da task",
  "description": "Descrição detalhada do que precisa ser feito",
  "tags": ["tag1", "tag2"],
  "priority": "low|medium|high"
}

Tags devem representar áreas de conhecimento como: suporte, vendas, financeiro, técnico, jurídico, marketing, rh, logística, etc.

Não inclua nenhum texto fora do JSON quando for uma task. Não use markdown.${memoryBlock}`
}

export interface ClassifierResult {
  type: 'reply' | 'task'
  reply?: string
  task?: {
    title: string
    description: string
    tags: string[]
    priority: 'low' | 'medium' | 'high'
  }
}

export async function classifyMessage(message: string, companyId?: string | null): Promise<ClassifierResult> {
  const token = import.meta.env.VITE_OPENCLAW_GATEWAY_TOKEN
  const baseUrl = import.meta.env.VITE_OPENCLAW_GATEWAY_HTTP_URL || '/openclaw'

  const systemPrompt = await buildSystemPrompt(companyId)

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-openclaw-session-key': CLASSIFIER_SESSION,
    },
    body: JSON.stringify({
      model: 'openclaw:main',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    }),
  })

  if (!response.ok) throw new Error('Classifier request failed')

  const data = await response.json()
  const content: string = data.choices[0].message.content.trim()

  // Tenta parsear como JSON (task) — extrai JSON mesmo que venha com markdown
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.type === 'task' && parsed.title) {
        return {
          type: 'task',
          task: {
            title: parsed.title,
            description: parsed.description || '',
            tags: Array.isArray(parsed.tags) ? parsed.tags : [],
            priority: parsed.priority || 'medium',
          },
        }
      }
    }
  } catch {
    // não é JSON — é uma resposta simples
  }

  return { type: 'reply', reply: content }
}
