import { useAgents } from '@/hooks/useAgents';
import { AgentCard } from '@/components/agents/AgentCard';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Bot } from 'lucide-react';
import { useState } from 'react';
import { AgentModal } from '@/components/agents/AgentModal';
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { agents, isLoading } = useAgents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-xl" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.title')}
          </h1>
          <p className="body-md mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-9"
          style={{
            backgroundColor: 'var(--brand-primary)',
            color: 'white',
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('dashboard.newAgent')}
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Agents Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="heading-md" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.yourAgents')}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-lg" />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-lg border py-16"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-default)',
              }}
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--bg-muted)' }}
              >
                <Bot className="h-8 w-8" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p className="body-md mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.noAgents')}
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white',
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('dashboard.createFirstAgent')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {agents.slice(0, 4).map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      <AgentModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
