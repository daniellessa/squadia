import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-shimmer rounded-md', className)}
      style={{
        backgroundColor: 'var(--bg-surface)',
        backgroundImage: `linear-gradient(
          to right,
          var(--bg-surface) 0%,
          var(--bg-elevated) 50%,
          var(--bg-surface) 100%
        )`,
        backgroundSize: '2000px 100%',
      }}
    />
  );
}
