import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bot, CheckSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('dashboard.title'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('agents.title'), href: '/agents', icon: Bot },
    { name: t('tasks.title'), href: '/tasks', icon: CheckSquare },
    { name: t('settings.title'), href: '/settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex min-h-[60px] min-w-[60px] flex-1 flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-tertiary)]'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <div
                  className="absolute top-0 h-0.5 w-12 rounded-b-full"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
