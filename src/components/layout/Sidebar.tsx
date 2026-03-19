import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CheckSquare, Settings, MessageSquare, Bot, CreditCard, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('dashboard.title'), href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: t('tasks.title'), href: '/tasks', icon: CheckSquare },
    { name: 'Docs', href: '/docs', icon: BookOpen },
    { name: 'Faturamento', href: '/billing', icon: CreditCard },
    { name: t('settings.title'), href: '/settings', icon: Settings },
  ];

  return (
    <div
      className="hidden h-screen w-60 flex-col border-r md:flex"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Logo/Brand */}
      <div
        className="flex h-16 items-center border-b px-6"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary) 0%, #8B5CF6 100%)',
            }}
          >
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="heading-sm" style={{ color: 'var(--text-primary)' }}>
            SquadIA
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex h-9 items-center gap-2.5 rounded-md px-3 transition-bg label-lg',
                isActive
                  ? 'font-medium'
                  : ''
              )}
              style={{
                backgroundColor: isActive ? 'var(--brand-primary-subtle)' : 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
