import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Send, ArrowLeft, Circle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

const statusConfig = {
  idle: { label: 'Inativo', color: 'bg-gray-400' },
  active: { label: 'Ativo', color: 'bg-green-500' },
  blocked: { label: 'Bloqueado', color: 'bg-red-500' },
  paused: { label: 'Pausado', color: 'bg-yellow-500' },
}

export function Chat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { agent, messages, isLoading, isTyping, sendMessage, isSending } =
    useChat(id!)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSending) return

    const message = inputValue
    setInputValue('')

    try {
      await sendMessage(message)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (isLoading || !agent) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>
    )
  }

  const status = statusConfig[agent.status]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardHeader className="border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/agents/${id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {agent.role}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Circle className={`h-3 w-3 fill-current ${status.color}`} />
              <span className="text-sm">{status.label}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: 'var(--text-secondary)' }}>
                Nenhuma mensagem ainda. Inicie a conversa!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.direction === 'in' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.direction === 'out' ? (
                    <div className="flex items-end gap-2 justify-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {agent.name}
                        </span>
                        <div className="max-w-[70%] rounded-lg p-3 bg-gray-800">
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p className="text-xs mt-1 text-gray-400">
                            {formatRelativeTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="max-w-[70%] rounded-lg p-3 bg-indigo-600 text-white"
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p className="text-xs mt-1 text-indigo-200">
                        {formatRelativeTime(message.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2 justify-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {agent.name}
                      </span>
                      <div className="max-w-[70%] rounded-lg p-3 bg-gray-800">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        <div
          className="border-t p-4"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              disabled={isSending}
              className="flex-1"
            />
            <Button type="submit" disabled={isSending || !inputValue.trim()}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
