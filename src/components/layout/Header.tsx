import { useAuth } from '@/hooks/useAuth';
import { Menu, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <header
      className="flex h-16 items-center justify-between border-b px-4 md:px-6"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Left side - Mobile menu button + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-all hover:bg-[var(--bg-elevated)] active:scale-95 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
        </button>

        <div className="heading-sm" style={{ color: 'var(--text-primary)' }}>
          {t('common.welcome')}
        </div>
      </div>

      {/* Right side - Language, Theme, User */}
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-md transition-all hover:bg-[var(--bg-elevated)] active:scale-95"
              aria-label="User menu"
            >
              <Avatar name={user?.email || 'User'} size="sm" />
              <span className="label-md hidden md:block" style={{ color: 'var(--text-secondary)' }}>
                {user?.email?.split('@')[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="label-md" style={{ color: 'var(--text-primary)' }}>
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('auth.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
