import { useRef } from 'react'
import { Avatar, dicebearUrl } from './avatar'
import { Upload, RefreshCw } from 'lucide-react'

const COLORS = [
  '#6366F1','#8B5CF6','#EC4899','#EF4444',
  '#F59E0B','#10B981','#06B6D4','#3B82F6',
  '#84CC16','#F97316','#14B8A6','#A855F7',
]

interface AvatarPickerProps {
  name: string
  color?: string | null
  avatarUrl?: string | null
  onColorChange: (color: string) => void
  onAvatarUrlChange: (url: string | null) => void
}

export function AvatarColorPicker({ name, color, avatarUrl, onColorChange, onAvatarUrlChange }: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onAvatarUrlChange(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const resetToGenerated = () => {
    onAvatarUrlChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="flex items-center gap-3">
        <Avatar name={name || '?'} size="lg" color={color} imageUrl={avatarUrl} />
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
          >
            <Upload className="h-3 w-3" />
            Upload imagem
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={resetToGenerated}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              <RefreshCw className="h-3 w-3" />
              Usar gerado
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Cor de fundo (só quando não tem imagem customizada) */}
      {!avatarUrl && (
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(c)}
              className="h-6 w-6 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: color === c ? '2px solid white' : 'none',
                outlineOffset: '1px',
                boxShadow: color === c ? `0 0 0 3px ${c}` : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
