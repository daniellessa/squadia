import { cn } from '@/lib/utils';

export type AgentStatus = 'active' | 'processing' | 'paused' | 'error' | 'offline';

interface StatusBadgeProps {
  status: AgentStatus;
  text: string;
  className?: string;
}

const statusConfig = {
  active: {
    bg: 'var(--status-active-subtle)',
    border: 'var(--status-active-border)',
    text: 'var(--status-active)',
    dot: 'var(--status-active)',
    animated: false,
  },
  processing: {
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.30)',
    text: 'var(--brand-primary)',
    dot: 'var(--brand-primary)',
    animated: true,
  },
  paused: {
    bg: 'var(--status-idle-subtle)',
    border: 'var(--status-idle-border)',
    text: 'var(--status-idle)',
    dot: 'var(--status-idle)',
    animated: false,
  },
  error: {
    bg: 'var(--status-error-subtle)',
    border: 'var(--status-error-border)',
    text: 'var(--status-error)',
    dot: 'var(--status-error)',
    animated: false,
  },
  offline: {
    bg: 'var(--status-offline-subtle)',
    border: 'var(--status-offline-border)',
    text: 'var(--status-offline)',
    dot: 'var(--status-offline)',
    animated: false,
  },
};

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1 label-md',
        className
      )}
      style={{
        backgroundColor: config.bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: config.border,
        color: config.text,
        height: '22px',
      }}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          config.animated && 'animate-pulse'
        )}
        style={{ backgroundColor: config.dot }}
      />
      <span>{text}</span>
    </span>
  );
}
