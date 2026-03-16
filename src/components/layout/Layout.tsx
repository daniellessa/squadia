import { Outlet, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bot, CheckSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Layout() {
  const { isAuthenticated, companyId } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  console.log('[Layout]', { isAuthenticated, companyId })

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (companyId === null) {
    return <Navigate to="/onboarding" replace />;
  }

  const navigation = [
    { name: t('dashboard.title'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('agents.title'), href: '/agents', icon: Bot },
    { name: t('tasks.title'), href: '/tasks', icon: CheckSquare },
    { name: t('settings.title'), href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            {/* Logo */}
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex h-9 items-center gap-2.5 rounded-md px-3 transition-bg label-lg',
                      isActive ? 'font-medium' : ''
                    )}
                    style={{
                      backgroundColor: isActive ? 'var(--brand-primary-subtle)' : 'transparent',
                      color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
