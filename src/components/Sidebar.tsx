import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarCheck, 
  Users, 
  Archive, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', color: 'text-blue-600' },
    { icon: Clock, label: 'Overdue', path: '/overdue', color: 'text-red-500' },
    { icon: CalendarCheck, label: 'Today\'s Follow-ups', path: '/today', color: 'text-emerald-500' },
    { icon: Users, label: 'Active Leads', path: '/active', color: 'text-amber-500' },
    { icon: Archive, label: 'Closed / Dropped', path: '/closed', color: 'text-slate-500' },
  ];

  return (
    <div className="w-60 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 font-['Inter',sans-serif]">
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-50 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          V
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 leading-tight">VentureMond</h2>
          <p className="text-[10px] text-slate-400 font-medium">Lead Management</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group",
                isActive 
                  ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={cn(isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-blue-400" />}
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-3 border-t border-slate-100">
        <button 
          onClick={() => {/* logout logic */}}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={18} />
          <span className="text-xs font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
}