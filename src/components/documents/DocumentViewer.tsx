import ReactMarkdown from 'react-markdown'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface DocumentViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  url: string
}

function getContent(url: string): string {
  if (url.startsWith('data:text/plain')) {
    try {
      return decodeURIComponent(url.split(',')[1] || '')
    } catch { return '' }
  }
  return url
}

export function DocumentViewer({ open, onOpenChange, name, url }: DocumentViewerProps) {
  const isDataUrl = url.startsWith('data:')
  const isExternalUrl = url.startsWith('http')
  const content = getContent(url)
  const isMarkdown = name.endsWith('.md') || content.includes('\n#') || content.includes('\n**') || content.includes('\n-')

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.md`
    a.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="truncate">{name}</span>
            {isDataUrl && (
              <Button variant="outline" size="sm" onClick={handleDownload} className="flex-shrink-0">
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto rounded-lg p-4" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          {isExternalUrl ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline text-sm">
              {url}
            </a>
          ) : isMarkdown ? (
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-strong:text-white
              prose-li:text-gray-300
              prose-code:text-indigo-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
              prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
              prose-blockquote:border-indigo-500 prose-blockquote:text-gray-400
              prose-hr:border-gray-700
              prose-a:text-indigo-400
              prose-table:text-sm
              prose-th:text-white prose-th:font-semibold
              prose-td:text-gray-300
            ">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <pre className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)', fontFamily: 'inherit', lineHeight: '1.6' }}>
              {content}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
