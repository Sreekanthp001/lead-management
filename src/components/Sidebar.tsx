import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, TableProperties, Clock, CalendarCheck, 
  Users, Archive, LogOut, Sun, Moon, Menu, X 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Sidebar({ counts }: { counts: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('vm-theme', newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };


  // MENU ITEMS SYNCED WITH APP ROUTES
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'text-blue-600' },
    { icon: TableProperties, label: 'Table View', path: '/table', color: 'text-indigo-600' },
    { icon: Clock, label: 'Overdue', path: '/overdue', color: 'text-red-500', badge: counts.overdue },
    { icon: CalendarCheck, label: "Today's Follow-ups", path: '/today', color: 'text-emerald-500', badge: counts.today },
    { icon: Users, label: 'Active Leads', path: '/active', color: 'text-amber-500', badge: counts.active },
    { icon: Archive, label: 'Closed / Dropped', path: '/closed', color: 'text-slate-500', badge: counts.closed },
  ];

  return (
    <>
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 z-[60] transform-gpu transition-colors duration-200">
        <div className="flex items-center gap-2">
          <img src="/logo-vm.png" alt="VM" className="h-8 w-auto object-contain" />
          <span className="text-lg font-[1000] tracking-tighter text-slate-800 dark:text-white uppercase italic">
            Venture<span className="text-[#00a389]">mond</span>
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-600 dark:text-slate-300 active:scale-90 transition-transform duration-150"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- SIDEBAR ASIDE --- */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-[100] transition-all duration-300 ease-out transform-gpu lg:w-64",
        isOpen ? "w-72 translate-x-0 shadow-2xl" : "w-64 -translate-x-full lg:translate-x-0"
      )}>
        
        <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-vm.png" alt="Logo" className="w-10 h-10 object-contain shadow-sm" />
            <div>
              <h2 className="text-lg font-[1000] text-slate-900 dark:text-white leading-none tracking-tighter uppercase italic">
                VENTURE<span className="text-[#00a389]">MOND</span>
              </h2>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Lead Intelligence</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            className="hidden lg:flex p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-[#00a389] active:scale-90 transition-all duration-150"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-none">
          <p className="px-4 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.25em] mb-4 mt-4">Main Menu</p>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { 
                  setIsOpen(false); 
                  navigate(item.path); 
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 transform-gpu active:scale-[0.97] group",
                  isActive 
                    ? "bg-slate-900 dark:bg-[#00a389] text-white shadow-lg shadow-slate-200 dark:shadow-none translate-x-1" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon 
                    size={19} 
                    className={cn(
                      "transition-colors duration-200", 
                      isActive ? "text-[#00a389] dark:text-white" : cn("group-hover:", item.color)
                    )} 
                  />
                  <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-lg transition-colors duration-200", 
                    isActive ? "bg-white/20 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-500"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50 dark:border-slate-800/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-200 active:scale-[0.97] group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-xs font-black uppercase tracking-widest">Logout System</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[90] lg:hidden transition-opacity duration-300" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}