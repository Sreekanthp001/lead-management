import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useMemo, memo, useEffect } from 'react';
import {
  LayoutDashboard, TableProperties, Clock, CalendarCheck,
  Users, Archive, LogOut, Menu, X, UserPlus
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

function Sidebar({ counts }: { counts: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, isAdmin, refreshProfile } = useAuth();

  if (!user) return null;

  // Optimistic State for instant UI response
  const [optimisticPath, setOptimisticPath] = useState(location.pathname);

  // Sync optimistic path with actual location changes
  useEffect(() => {
    setOptimisticPath(location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = useMemo(() => {
    const items = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'text-blue-600', badge: counts?.all },
      { icon: TableProperties, label: 'Table View', path: '/table', color: 'text-indigo-600' },
      { icon: Clock, label: 'Overdue', path: '/overdue', color: 'text-red-500', badge: counts?.overdue },
      { icon: CalendarCheck, label: "Today's Follow-ups", path: '/today', color: 'text-emerald-500', badge: counts?.today },
      { icon: Users, label: 'Active Leads', path: '/active', color: 'text-amber-500', badge: counts?.active },
      { icon: Archive, label: 'Closed / Dropped', path: '/closed', color: 'text-slate-500', badge: counts?.closed },
    ];

    if (isAdmin) {
      items.push({ icon: UserPlus, label: 'Manage Team', path: '/manage-team', color: 'text-cyan-600', badge: 0 });
    }

    return items;
  }, [isAdmin, counts]);


  try {
    return (
      <>
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-[60]">
          <img src="/logo-vm.png" alt="Logo" className="h-8 w-auto object-contain" />
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <aside className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-[100] transition-all duration-300 lg:w-64",
          isOpen ? "w-72 translate-x-0 shadow-2xl" : "w-64 -translate-x-full lg:translate-x-0"
        )}>
          <div className="p-8 border-b border-border/50 flex flex-col items-center">
            <img src="/logo-vm.png" alt="Logo" className="h-12 w-auto object-contain mb-2" />
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em]">Lead Intelligence</p>
            <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full">
              <div className={cn("w-1.5 h-1.5 rounded-full", isAdmin ? "bg-emerald-500" : "bg-amber-500")} />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                {isAdmin ? 'ADMIN' : 'USER'}
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto font-['Outfit']">
            {menuItems.map((item) => {
              try {
                const isActive = optimisticPath === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item?.path || item?.label}
                    onClick={() => {
                      if (!item?.path) return;
                      setOptimisticPath(item.path);
                      setIsOpen(false);
                      navigate(item.path);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                      isActive
                        ? "bg-[#00a389] text-white shadow-lg shadow-[#00a389]/20 scale-[1.02]"
                        : "text-slate-900 dark:text-emerald-400/90 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:translate-x-1"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <Icon size={19} className={cn(
                          "transition-colors",
                          isActive ? "text-white" : cn(item?.color?.replace('600', '700').replace('500', '600'), "dark:text-emerald-400")
                        )} />
                      )}
                      <span className={cn(
                        "text-[13px] font-bold",
                        isActive ? "text-white" : "text-slate-900 dark:text-emerald-50/90"
                      )}>{item?.label}</span>
                    </div>
                    {item?.badge !== undefined && item?.badge > 0 && (
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-lg",
                        isActive ? "bg-white/20 text-white" : "bg-red-900/20 text-red-500"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              } catch (e) {
                console.error("Error rendering sidebar item", e);
                return null;
              }
            })}
          </nav>

          <div className="p-4 border-t border-border/50">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 text-slate-600 dark:text-emerald-400/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">
              <LogOut size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Logout System</span>
            </button>
          </div>
        </aside >

        {isOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[90] lg:hidden" onClick={() => setIsOpen(false)} />
        )
        }
      </>
    );
  } catch (e) {
    console.error("Sidebar critical render error", e);
    return null;
  }
}

export default memo(Sidebar);