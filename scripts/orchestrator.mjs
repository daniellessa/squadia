/**
 * SquadIA Orchestrator
 *
 * A cada ciclo (30s):
 * 1. pending → match tags/specialties → assigned
 * 2. assigned → in_progress (agente livre)
 * 3. in_progress → agente executa via OpenClaw → review
 * 4. review → sênior valida via OpenClaw → done | rejected (volta pending)
 */

import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://127.0.0.1:19789'
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || process.env.VITE_OPENCLAW_GATEWAY_TOKEN

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios')
  process.exit(1)
}
if (!OPENCLAW_TOKEN) {
  console.error('❌ OPENCLAW_TOKEN é obrigatório')
  process.exit(1)
}
const INTERVAL_MS = 10_000
const ANALYST_EVERY_N_CYCLES = 5   // roda o analista a cada 5 ciclos (~2.5 min)
const ANALYST_SESSION = 'agent:main:squadia-analyst'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
let cycleCount = 0
const executingTasks = new Set() // lock para evitar execuções paralelas da mesma task
let analystRunning = false // lock para evitar execuções paralelas do analista

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchScore(taskTags, agentSpecialties) {
  if (!taskTags?.length || !agentSpecialties?.length) return 0
  const taskNorm = taskTags.map(t => t.toLowerCase())
  let score = 0
  for (const specialty of agentSpecialties) {
    const s = specialty.toLowerCase()
    for (const tag of taskNorm) {
      if (tag === s || tag.includes(s) || s.includes(tag)) { score++; break }
    }
  }
  return score
}

async function callAgent(agentSessionKey, systemPrompt, userMessage, timeoutMs = 120_000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'x-openclaw-session-key': agentSessionKey,
      },
      body: JSON.stringify({
        model: 'openclaw:main',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })
    if (!res.ok) throw new Error(`OpenClaw error: ${res.status}`)
    const data = await res.json()
    return data.choices[0].message.content
  } finally {
    clearTimeout(timer)
  }
}

// ── Analista de gaps ─────────────────────────────────────────────────────────

const WORKSPACE = '/Users/daniellessa/.openclaw-squadia/workspace'
const SYSTEM_FILES = new Set(['AGENTS.md','SOUL.md','TOOLS.md','MEMORY.md','USER.md','IDENTITY.md','HEARTBEAT.md','BOOTSTRAP.md','COMECE_AQUI.md'])

async function syncWorkspaceDocs(agents) {
  if (!existsSync(WORKSPACE)) return
  const { data: existing } = await supabase.from('documents').select('name')
  const existingNames = new Set((existing || []).map(d => d.name))
  const files = readdirSync(WORKSPACE).filter(f => f.endsWith('.md') && !SYSTEM_FILES.has(f) && statSync(join(WORKSPACE, f)).isFile())
  let created = 0
  for (const file of files) {
    const name = file.replace(/\.md$/, '').replace(/_/g, ' ').replace(/-/g, ' ')
    if (existingNames.has(name)) continue
    try {
      const content = readFileSync(join(WORKSPACE, file), 'utf-8')
      const agent = agents?.[0]
      if (!agent) continue
      await supabase.from('documents').insert({ agent_id: agent.id, name, url: `data:text/plain;charset=utf-8,${encodeURIComponent(content)}` })
      created++
    } catch { /* ignora */ }
  }
  if (created > 0) console.log(`📄 Synced ${created} new workspace doc(s)`)
}

async function runAnalyst() {
  if (analystRunning) { console.log('🧠 Analyst already running, skipping.'); return }
  analystRunning = true
  console.log('🧠 Analyst cycle starting...')

  // Buscar tasks sem match (nunca foram assigned) — indicam gap de cobertura
  const { data: unmatchedTasks } = await supabase
    .from('tasks')
    .select('tags, title, description')
    .eq('status', 'pending')
    .limit(20)

  const { data: allAgents } = await supabase
    .from('agents')
    .select('name, role, specialties, status')

  const { data: recentDone } = await supabase
    .from('tasks')
    .select('tags, title')
    .eq('status', 'done')
    .order('updated_at', { ascending: false })
    .limit(20)

  if (!unmatchedTasks?.length && !recentDone?.length) {
    console.log('🧠 Analyst: nothing to analyze.')
    return
  }

  // Montar contexto para o analista
  const agentSummary = (allAgents || [])
    .map(a => `- ${a.name} (${a.role}): especialidades [${(a.specialties || []).join(', ')}], status: ${a.status}`)
    .join('\n')

  const unmatchedSummary = (unmatchedTasks || [])
    .map(t => `- "${t.title}" [tags: ${(t.tags || []).join(', ')}]`)
    .join('\n')

  const doneSummary = (recentDone || [])
    .map(t => `- "${t.title}" [tags: ${(t.tags || []).join(', ')}]`)
    .join('\n')

  const systemPrompt = `Você é um analista estratégico de times de agentes de IA.
Sua função é analisar o padrão de demanda e identificar se novos agentes especializados são necessários.

Ao identificar um gap, responda APENAS com JSON no formato:
{
  "action": "create_agent",
  "name": "Nome do agente",
  "role": "Cargo/função do agente",
  "personality": "Descrição da personalidade e forma de trabalhar",
  "specialties": ["tag1", "tag2", "tag3"],
  "justification": "Por que este agente é necessário"
}

Se o time atual já cobre bem a demanda, responda APENAS com:
{"action": "none", "reason": "motivo"}`

  const userMessage = `Analise o estado atual do time e as demandas:

**Agentes existentes:**
${agentSummary || 'Nenhum agente cadastrado'}

**Tasks pendentes sem cobertura:**
${unmatchedSummary || 'Nenhuma'}

**Tasks concluídas recentes (padrão de demanda):**
${doneSummary || 'Nenhuma'}

Existe algum gap de especialidade que justifique criar um novo agente?`

  try {
    const response = await callAgent(ANALYST_SESSION, systemPrompt, userMessage)
    console.log('🧠 Analyst response:', response.slice(0, 200))

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return

    const parsed = JSON.parse(jsonMatch[0])

    if (parsed.action !== 'create_agent') {
      console.log(`🧠 Analyst: no new agent needed (${parsed.reason})`)
      return
    }

    // Buscar company_id de um agente existente
    const { data: anyAgent } = await supabase.from('agents').select('company_id').limit(1).single()
    if (!anyAgent?.company_id) { console.log('🧠 Analyst: no company_id found.'); return }

    // Verificar plano da empresa — criação automática só no Pro/Enterprise
    const { data: company } = await supabase
      .from('companies')
      .select('plan')
      .eq('id', anyAgent.company_id)
      .single()

    const plan = company?.plan || 'free'
    if (plan === 'free') {
      console.log(`🧠 Analyst: auto-agent creation requires Pro/Enterprise plan (current: ${plan}). Skipping.`)
      return
    }

    // Verificar se já existe agente com especialidades muito similares (ignora agentes sem specialties)
    const existingSimilar = (allAgents || []).find(a => {
      if (!a.specialties?.length) return false
      const existingSet = new Set((a.specialties || []).map(s => s.toLowerCase()))
      const newSet = new Set((parsed.specialties || []).map(s => s.toLowerCase()))
      if (newSet.size === 0) return false
      const overlap = [...newSet].filter(s => existingSet.has(s)).length
      return overlap >= Math.min(newSet.size, existingSet.size) * 0.7
    })

    if (existingSimilar) {
      console.log(`🧠 Analyst: similar agent already exists (${existingSimilar.name}), skipping.`)
      return
    }

    // Verificar se já existe agente com o mesmo nome (double-creation prevention)
    const nameExists = (allAgents || []).some(a => a.name.toLowerCase() === parsed.name.toLowerCase())
    if (nameExists) {
      console.log(`🧠 Analyst: agent named "${parsed.name}" already exists, skipping.`)
      return
    }

    // Criar o agente
    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert({
        company_id: anyAgent.company_id,
        name: parsed.name,
        role: parsed.role,
        personality: parsed.personality,
        specialties: parsed.specialties,
        status: 'active',
        avatar_color: ['#6366F1','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4'][Math.floor(Math.random()*6)],
      })
      .select()
      .single()

    if (error) { console.error('🧠 Analyst: error creating agent:', error.message); return }

    // Gerar session key
    await supabase
      .from('agents')
      .update({ openclaw_session_key: `agent:main:squadia-${newAgent.id}` })
      .eq('id', newAgent.id)

    console.log(`🤖 NEW AGENT CREATED: ${newAgent.name} (${newAgent.role}) — ${parsed.justification}`)
    console.log(`   Specialties: ${parsed.specialties?.join(', ')}`)

    // Sincronizar novos arquivos do workspace
    const { data: activeAgents } = await supabase.from('agents').select('id').eq('status', 'active').limit(1)
    await syncWorkspaceDocs(activeAgents)
  } catch (err) {
    console.error('🧠 Analyst error:', err.message)
  } finally {
    analystRunning = false
  }
}

// ── Memória ───────────────────────────────────────────────────────────────────

async function extractMemories(agent, task, result) {
  try {
    const systemPrompt = `Você é um extrator de conhecimento.
Analise a tarefa executada e extraia fatos importantes sobre o negócio, cliente ou padrões que você aprendeu.
Responda APENAS com um array JSON (máximo 3 itens):
[
  { "content": "fato aprendido em uma frase objetiva", "tags": ["tag1", "tag2"] }
]
Se não houver nada relevante para memorizar, responda: []`

    const userMessage = `Tarefa: ${task.title}
Descrição: ${task.description?.slice(0, 500)}
Resultado produzido: ${result?.slice(0, 800)}

O que você aprendeu sobre o negócio ou cliente com esta tarefa?`

    const response = await callAgent(agent.openclaw_session_key, systemPrompt, userMessage)

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return

    const memories = JSON.parse(jsonMatch[0])
    if (!memories.length) return

    const rows = memories.map(m => ({
      agent_id: agent.id,
      company_id: task.company_id,
      content: m.content,
      tags: Array.isArray(m.tags) ? m.tags : [],
      source_task_id: task.id,
    }))

    await supabase.from('agent_memories').insert(rows)
    console.log(`🧩 ${agent.name} memorizou ${rows.length} fato(s) da task "${task.title}"`)
  } catch (err) {
    console.error(`Memory extraction error:`, err.message)
  }
}

async function loadMemoriesForTask(agentId, taskTags) {
  // Busca memórias do agente com tags relevantes para a task
  const { data } = await supabase
    .from('agent_memories')
    .select('content, tags')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!data?.length) return []

  // Filtra por relevância de tags (mesmo critério do matchScore)
  const taskNorm = (taskTags || []).map(t => t.toLowerCase())
  const relevant = data.filter(m =>
    m.tags?.some(tag => taskNorm.some(t => t === tag || t.includes(tag) || tag.includes(t)))
  )

  // Retorna as 5 mais recentes relevantes (ou 3 gerais se não tiver match)
  return relevant.slice(0, 5).length ? relevant.slice(0, 5) : data.slice(0, 3)
}

// ── Sub-agent spawning ────────────────────────────────────────────────────────

async function spawnSubAgent(spawn, parentAgent, parentTask, companyId) {
  console.log(`🤖 Spawning sub-agent "${spawn.name}" for task "${parentTask.title}"...`)

  // Criar agente temporário
  const { data: newAgent, error: agentError } = await supabase
    .from('agents')
    .insert({
      company_id: companyId,
      name: spawn.name,
      role: spawn.role,
      personality: spawn.personality,
      specialties: spawn.specialties || [],
      status: 'active',
      is_temp: true,
      created_by_agent_id: parentAgent.id,
      avatar_color: ['#6366F1','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4'][Math.floor(Math.random()*6)],
    })
    .select()
    .single()

  if (agentError) { console.error('Failed to spawn agent:', agentError.message); return }

  // Salvar session key
  await supabase.from('agents').update({
    openclaw_session_key: `agent:main:squadia-${newAgent.id}`
  }).eq('id', newAgent.id)

  // Criar sub-task vinculada à task pai
  const { error: taskError } = await supabase.from('tasks').insert({
    company_id: companyId,
    title: spawn.subtask_title,
    description: spawn.subtask_description,
    tags: spawn.subtask_tags || spawn.specialties || [],
    priority: parentTask.priority,
    status: 'assigned',
    assigned_to: newAgent.id,
    parent_task_id: parentTask.id,
    source: parentTask.source || 'manual',
  })

  if (taskError) { console.error('Failed to create sub-task:', taskError.message); return }

  console.log(`✅ Sub-agent "${spawn.name}" spawned and sub-task "${spawn.subtask_title}" created`)
}

// ── Ciclo principal ───────────────────────────────────────────────────────────

async function runCycle() {
  console.log(`[${new Date().toISOString()}] Cycle starting...`)

  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name, role, personality, system_prompt, specialties, is_senior, status, openclaw_session_key')
    .eq('status', 'active')

  if (agentsError || !agents?.length) {
    console.log('No active agents.')
    return
  }

  const { data: busyTasks } = await supabase
    .from('tasks').select('assigned_to').eq('status', 'in_progress').not('assigned_to', 'is', null)
  const busyAgentIds = new Set((busyTasks || []).map(t => t.assigned_to))
  const availableAgents = agents.filter(a => !busyAgentIds.has(a.id))
  const seniorAgent = agents.find(a => a.is_senior)

  // 1. pending → assigned
  const { data: pendingTasks } = await supabase.from('tasks').select('*').eq('status', 'pending').order('created_at', { ascending: true })
  for (const task of pendingTasks || []) {
    if (!availableAgents.length) break
    const scores = availableAgents.map(a => ({ agent: a, score: matchScore(task.tags, a.specialties) })).sort((a, b) => b.score - a.score)
    const best = scores[0]
    if (best.score === 0) { console.log(`No match for "${task.title}"`); continue }
    await supabase.from('tasks').update({ status: 'assigned', assigned_to: best.agent.id }).eq('id', task.id)
    console.log(`✅ "${task.title}" → assigned to ${best.agent.name} (score: ${best.score})`)
    availableAgents.splice(availableAgents.findIndex(a => a.id === best.agent.id), 1)
  }

  // 2. assigned → in_progress
  const { data: assignedTasks } = await supabase.from('tasks').select('*').eq('status', 'assigned').not('assigned_to', 'is', null)
  for (const task of assignedTasks || []) {
    if (busyAgentIds.has(task.assigned_to)) continue
    await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', task.id)
    const agent = agents.find(a => a.id === task.assigned_to)
    console.log(`🚀 "${task.title}" → in_progress (${agent?.name})`)
    busyAgentIds.add(task.assigned_to)
  }

  // 2.5. waiting com resposta → volta para in_progress
  const { data: waitingTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'waiting')
    .not('clarification_answer', 'is', null)

  for (const task of waitingTasks || []) {
    await supabase.from('tasks').update({
      status: 'in_progress',
      description: task.description + `\n\n---\n**Resposta do usuário à pergunta "${task.clarification_question}":**\n${task.clarification_answer}`,
      clarification_question: null,
      clarification_answer: null,
    }).eq('id', task.id)
    console.log(`🔄 "${task.title}" → in_progress (resposta recebida, retomando)`)
  }

  // 2.7. watchdog — tasks presas em in_progress por mais de 10min → reset para assigned
  const stuckThreshold = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { data: stuckTasks } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('status', 'in_progress')
    .lt('updated_at', stuckThreshold)
    .not('assigned_to', 'is', null)

  for (const task of stuckTasks || []) {
    if (executingTasks.has(task.id)) continue // ainda está rodando neste processo
    await supabase.from('tasks').update({ status: 'assigned' }).eq('id', task.id)
    console.log(`⚠️  Watchdog: "${task.title}" presa em in_progress, resetada para assigned`)
  }

  // 3. in_progress → agente executa → review
  const { data: inProgressTasks } = await supabase.from('tasks').select('*').eq('status', 'in_progress').not('assigned_to', 'is', null)
  for (const task of inProgressTasks || []) {
    const agent = agents.find(a => a.id === task.assigned_to)
    if (!agent?.openclaw_session_key) continue

    if (executingTasks.has(task.id)) continue // já está sendo executada neste processo
    executingTasks.add(task.id)
    console.log(`⚙️  Executing "${task.title}" with ${agent.name}...`)
    try {
      // Buscar memórias relevantes do agente
      const memories = await loadMemoriesForTask(agent.id, task.tags)
      const memoryBlock = memories.length
        ? `\n\n## Conhecimento acumulado relevante:\n${memories.map(m => `- ${m.content}`).join('\n')}`
        : ''

      // Verificar se há sub-tasks concluídas para injetar na task pai
      const { data: completedSubTasks } = await supabase
        .from('tasks')
        .select('title, description')
        .eq('parent_task_id', task.id)
        .eq('status', 'done')

      const subTaskBlock = completedSubTasks?.length
        ? `\n\n## Resultados de sub-tarefas concluídas:\n${completedSubTasks.map(st => {
            const parts = st.description.split('\n\n---\n')
            const result = parts[parts.length - 1].replace(/^\*\*Resultado do agente:\*\*\n/, '').trim()
            return `### ${st.title}\n${result}`
          }).join('\n\n')}`
        : ''

      const systemPrompt = (agent.system_prompt || `Você é ${agent.name}, ${agent.role}. ${agent.personality || ''}`) +
        `\nSua tarefa é executar o trabalho descrito e retornar um resultado detalhado e completo.\nResponda em português, de forma clara e objetiva.` +
        memoryBlock +
        `\n\n## Criação de sub-agentes\nSe você precisar de um especialista que não existe no time para executar parte da tarefa, pode solicitar a criação de um sub-agente retornando APENAS este JSON (sem mais texto):\n{"action":"spawn_agent","name":"Nome do agente","role":"Cargo","personality":"Personalidade","specialties":["tag1","tag2"],"subtask_title":"Título da sub-tarefa","subtask_description":"Descrição detalhada","subtask_tags":["tag1","tag2"]}\nUse isso apenas quando realmente necessário e o trabalho não puder ser feito por você mesmo.` +
        subTaskBlock

      const userMessage = `Execute esta tarefa:

**${task.title}**
${task.description}

Tags: ${task.tags?.join(', ')}

Forneça um resultado completo e detalhado.`

      const result = await callAgent(agent.openclaw_session_key, systemPrompt, userMessage, 300_000)

      // Verificar se o agente precisa de esclarecimento
      try {
        const jsonMatch = result.match(/\{[\s\S]*"action"\s*:\s*"clarification_needed"[\s\S]*\}/)
        if (jsonMatch) {
          const clarif = JSON.parse(jsonMatch[0])
          await supabase.from('tasks').update({
            status: 'waiting',
            clarification_question: clarif.question,
            assigned_to: agent.id,
          }).eq('id', task.id)
          executingTasks.delete(task.id)
          console.log(`❓ "${task.title}" → waiting (${agent.name} perguntou: ${clarif.question})`)
          continue
        }
      } catch { /* não é clarification, continua */ }

      // Verificar se o agente quer criar um sub-agente
      try {
        const jsonMatch = result.match(/\{[\s\S]*"action"\s*:\s*"spawn_agent"[\s\S]*\}/)
        if (jsonMatch) {
          const spawn = JSON.parse(jsonMatch[0])

          // Verificar limite de agentes do plano
          const { data: anyAgent } = await supabase.from('agents').select('company_id').limit(1).single()
          const { data: company } = await supabase.from('companies').select('plan').eq('id', anyAgent.company_id).single()
          const plan = company?.plan || 'free'
          const planLimits = { free: 3, pro: null, enterprise: null }
          const agentLimit = planLimits[plan]

          if (agentLimit !== null) {
            const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true }).eq('company_id', anyAgent.company_id)
            if (count >= agentLimit) {
              console.log(`⚠️  Agent limit reached (${count}/${agentLimit}), cannot spawn sub-agent for "${task.title}"`)
              // Continua com o resultado parcial
            } else {
              await spawnSubAgent(spawn, agent, task, anyAgent.company_id)
              // Task fica em in_progress aguardando sub-task
              return
            }
          } else {
            // Plano sem limite
            await spawnSubAgent(spawn, agent, task, anyAgent.company_id)
            return
          }
        }
      } catch { /* não é spawn, continua normalmente */ }

      // Escolher revisor: sênior com maior match nas tags (excluindo quem executou)
      const seniors = agents.filter(a => a.is_senior && a.id !== agent.id && a.openclaw_session_key)
      let reviewer = null
      if (seniors.length > 0) {
        reviewer = seniors
          .map(a => ({ agent: a, score: matchScore(task.tags, a.specialties) }))
          .sort((a, b) => b.score - a.score)[0].agent
      } else {
        // Nenhum outro sênior — o próprio agente revisa
        reviewer = agent
      }

      await supabase.from('tasks').update({
        status: 'review',
        description: task.description + '\n\n---\n**Resultado do agente:**\n' + result,
        executed_by: agent.id,
        assigned_to: reviewer.id,
      }).eq('id', task.id)

      executingTasks.delete(task.id)
      console.log(`✅ "${task.title}" → review (${agent.name} concluiu, revisor: ${reviewer.name})`)

      // Extrair e memorizar aprendizados
      await extractMemories(agent, task, result)
    } catch (err) {
      executingTasks.delete(task.id)
      console.error(`❌ Error executing "${task.title}":`, err.message)
    }
  }

  // 4. review → revisor valida → done | rejected
  const { data: reviewTasks } = await supabase.from('tasks').select('*').eq('status', 'review').not('assigned_to', 'is', null)
  for (const task of reviewTasks || []) {
    const reviewer = agents.find(a => a.id === task.assigned_to)
    if (!reviewer?.openclaw_session_key) continue
    {
      console.log(`🔍 Reviewing "${task.title}" with ${reviewer.name}...`)
      try {
        const systemPrompt = reviewer.system_prompt ||
          `Você é ${reviewer.name}, responsável por validar resultados de tarefas.
Avalie se o resultado entregue está completo, correto e de qualidade.
Responda APENAS com JSON: {"decision": "approved" | "rejected", "feedback": "sua avaliação"}`

        const userMessage = `Valide este resultado:

**Tarefa:** ${task.title}
**Conteúdo completo:**
${task.description}`

        const response = await callAgent(reviewer.openclaw_session_key, systemPrompt, userMessage)

        let decision = 'approved'
        let feedback = response
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            decision = parsed.decision || 'approved'
            feedback = parsed.feedback || response
          }
        } catch { /* usa defaults */ }

        if (decision === 'approved') {
          await supabase.from('tasks').update({ status: 'done', review_feedback: feedback }).eq('id', task.id)
          console.log(`✅ "${task.title}" → done (aprovado por ${reviewer.name})`)

          // Salvar resultado como documento
          try {
            const parts = task.description.split('\n\n---\n')
            const resultContent = parts[parts.length - 1]
              .replace(/^\*\*Resultado do agente:\*\*\n/, '')
              .trim()
            if (resultContent && resultContent !== task.description.trim()) {
              const { data: executorData } = task.executed_by
              ? await supabase.from('agents').select('id').eq('id', task.executed_by).single()
              : { data: null }
            const executorAgent = executorData || reviewer
              await supabase.from('documents').insert({
                agent_id: executorAgent.id,
                name: task.title,
                url: `data:text/plain;charset=utf-8,${encodeURIComponent(resultContent)}`,
              })
              console.log(`📄 Documento criado: "${task.title}"`)
            }
          } catch (docErr) {
            console.error('Failed to create document:', docErr.message)
          }
        } else {
          await supabase.from('tasks').update({
            status: 'pending',
            review_feedback: feedback,
            assigned_to: null,
            description: task.description + `\n\n---\n**Feedback de ${reviewer.name}:** ${feedback}`,
          }).eq('id', task.id)
          console.log(`🔄 "${task.title}" → pending (rejeitado por ${reviewer.name})`)
        }
      } catch (err) {
        console.error(`❌ Error reviewing "${task.title}":`, err.message)
      }
    }
  }

  console.log(`[${new Date().toISOString()}] Cycle complete.\n`)
}

async function mainCycle() {
  cycleCount++
  await runCycle()
  if (cycleCount % ANALYST_EVERY_N_CYCLES === 0) {
    await runAnalyst()
  }
}

// ── Servidor HTTP para trigger manual ────────────────────────────────────────
import { createServer } from 'http'

const TRIGGER_PORT = 19790
let lastAnalystTrigger = 0
const ANALYST_COOLDOWN_MS = 60_000

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  if (req.method === 'POST' && req.url === '/trigger-analyst') {
    const now = Date.now()
    const remaining = ANALYST_COOLDOWN_MS - (now - lastAnalystTrigger)

    if (remaining > 0) {
      res.writeHead(429)
      res.end(JSON.stringify({ ok: false, cooldownMs: remaining, message: `Aguarde ${Math.ceil(remaining / 1000)}s` }))
      return
    }

    lastAnalystTrigger = now
    console.log('🧠 Manual analyst trigger received...')
    runAnalyst().catch(err => console.error('Analyst error:', err.message))
    res.writeHead(200)
    res.end(JSON.stringify({ ok: true, message: 'Analista acionado' }))
    return
  }

  if (req.url === '/health') {
    res.writeHead(200)
    res.end(JSON.stringify({ ok: true }))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ ok: false }))
}).listen(TRIGGER_PORT, '127.0.0.1', () => {
  console.log(`Orchestrator HTTP trigger listening on http://127.0.0.1:${TRIGGER_PORT}`)
})

// ── Start ─────────────────────────────────────────────────────────────────────
mainCycle()
setInterval(mainCycle, INTERVAL_MS)
console.log(`SquadIA Orchestrator started (interval: ${INTERVAL_MS / 1000}s, analyst every ${ANALYST_EVERY_N_CYCLES} cycles)`)
