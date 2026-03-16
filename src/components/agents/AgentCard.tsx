import type { Agent } from '@/types';
import { StatusBadge, type AgentStatus } from '@/components/ui/status-badge';
import { Avatar } from '@/components/ui/avatar';
import { MessageCircle, MoreVertical, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgentCardProps {
  agent: Agent;
}

const statusTextMap: Record<Agent['status'], { key: string; status: AgentStatus }> = {
  idle: { key: 'agentDetail.inactive', status: 'offline' },
  active: { key: 'agentDetail.active', status: 'active' },
  blocked: { key: 'agentDetail.blocked', status: 'error' },
  paused: { key: 'agentDetail.paused', status: 'paused' },
};

export function AgentCard({ agent }: AgentCardProps) {
  const { t } = useTranslation();
  const statusInfo = statusTextMap[agent.status];

  return (
    <Link to={`/agents/${agent.id}`}>
      <div
        className="group relative rounded-lg border p-4 transition-all hover:shadow-md"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={agent.name} size="md" />
            <div>
              <h3 className="label-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                {agent.name}
              </h3>
              <p className="label-md" style={{ color: 'var(--text-secondary)' }}>
                {agent.role}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-6 w-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.preventDefault()}
                style={{ color: 'var(--text-tertiary)' }}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t('agentDetail.edit')}</DropdownMenuItem>
              <DropdownMenuItem>{t('common.delete')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Divider */}
        <div className="mb-3 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StatusBadge status={statusInfo.status} text={t(statusInfo.key)} />
            <div className="flex items-center gap-1.5 label-md" style={{ color: 'var(--text-tertiary)' }}>
              <MessageCircle className="h-3.5 w-3.5" />
              <span>0 {t('agentCard.conversations')}</span>
            </div>
          </div>

          {agent.channel && (
            <div className="flex items-center gap-1 label-sm" style={{ color: 'var(--status-active)' }}>
              <Zap className="h-3 w-3" />
              <span>{t('agentCard.channelConnected')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
