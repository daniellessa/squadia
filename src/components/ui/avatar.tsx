import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string | null;
  imageUrl?: string | null;
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#6366F1','#8B5CF6','#EC4899','#EF4444','#F59E0B','#10B981','#06B6D4','#3B82F6'];
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function dicebearUrl(name: string): string {
  const seed = encodeURIComponent(name)
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${seed}&backgroundColor=transparent`
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

export function Avatar({ name, size = 'md', className, color, imageUrl }: AvatarProps) {
  const src = imageUrl || dicebearUrl(name)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg overflow-hidden font-medium text-white flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: imageUrl ? 'transparent' : (color || stringToColor(name)) }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback para iniciais se a imagem falhar
            const el = e.currentTarget
            el.style.display = 'none'
            const parent = el.parentElement
            if (parent) {
              parent.style.backgroundColor = color || stringToColor(name)
              parent.textContent = getInitials(name)
            }
          }}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
