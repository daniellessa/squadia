/**
 * Sincroniza arquivos .md do workspace do OpenClaw com a tabela documents do Supabase.
 * Execução: node scripts/sync-workspace-docs.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, basename } from 'path'

const SUPABASE_URL = 'https://ytmkaujhzrfxkvzufppo.supabase.co'
const SUPABASE_SERVICE_KEY = '***REVOGADA***'
const WORKSPACE = '/Users/daniellessa/.openclaw-squadia/workspace'

// Arquivos do sistema — ignorar
const SYSTEM_FILES = new Set([
  'AGENTS.md', 'SOUL.md', 'TOOLS.md', 'MEMORY.md', 'USER.md',
  'IDENTITY.md', 'HEARTBEAT.md', 'BOOTSTRAP.md', 'COMECE_AQUI.md',
])

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  // Buscar agente mais ativo (Finley como revisor/sênior — representa a empresa)
  const { data: agents } = await db.from('agents').select('id, name').eq('status', 'active').limit(10)
  if (!agents?.length) { console.error('No agents found'); process.exit(1) }

  // Buscar documentos já importados (pelo nome)
  const { data: existingDocs } = await db.from('documents').select('name')
  const existingNames = new Set((existingDocs || []).map(d => d.name))

  // Tentar mapear arquivos para agentes pelo nome do arquivo
  const agentMap = {}
  for (const agent of agents) {
    agentMap[agent.name.toUpperCase()] = agent.id
  }

  function guessAgent(filename) {
    const upper = filename.toUpperCase()
    for (const [name, id] of Object.entries(agentMap)) {
      if (upper.includes(name)) return id
    }
    // Fallback: primeiro agente ativo
    return agents[0].id
  }

  // Ler arquivos do workspace
  const files = readdirSync(WORKSPACE).filter(f => {
    if (!f.endsWith('.md')) return false
    if (SYSTEM_FILES.has(f)) return false
    const path = join(WORKSPACE, f)
    return statSync(path).isFile()
  })

  console.log(`Found ${files.length} files to sync`)

  let created = 0
  let skipped = 0

  for (const file of files) {
    const name = file.replace(/\.md$/, '').replace(/_/g, ' ').replace(/-/g, ' ')

    if (existingNames.has(name)) {
      skipped++
      continue
    }

    try {
      const content = readFileSync(join(WORKSPACE, file), 'utf-8')
      const agentId = guessAgent(file)
      const url = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`

      const { error } = await db.from('documents').insert({
        agent_id: agentId,
        name,
        url,
      })

      if (error) {
        console.error(`❌ ${file}: ${error.message}`)
      } else {
        console.log(`✅ ${name}`)
        created++
      }
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`)
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`)
}

main()
