import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Plus, User } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create', label: 'Create', icon: Plus },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isCreate = item.path === '/create';

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors',
                isCreate
                  ? 'bg-primary text-primary-foreground -mt-4 shadow-lg'
                  : isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isCreate && 'h-6 w-6')} />
              <span className={cn('text-xs', isCreate && 'sr-only')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}