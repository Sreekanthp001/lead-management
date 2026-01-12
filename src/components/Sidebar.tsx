import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Calendar, Users, CheckCircle, ChevronDown, Moon, Sun } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Sidebar({ counts }: { counts: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', count: counts.all },
    { name: 'Overdue', icon: AlertCircle, path: '/overdue', count: counts.overdue, color: 'text-red-500' },
    { name: "Today's Follow-ups", icon: Calendar, path: '/today', count: counts.today, color: 'text-orange-500' },
    { name: 'Active Leads', icon: Users, path: '/active', count: counts.active },
    { name: 'Closed / Dropped', icon: CheckCircle, path: '/closed', count: counts.closed },
  ];

  return (
    <div className="w-64 border-r bg-white dark:bg-slate-900 h-screen flex flex-col p-4 shadow-sm transition-colors duration-500">
      <div className="font-bold text-2xl mb-8 flex items-center gap-2 px-2 text-primary">
        <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">VM</div> 
        <span className="tracking-tight text-slate-800 dark:text-white">Venturemond</span>
      </div>

      <nav className="space-y-1 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
              location.pathname === item.path 
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-4 w-4", location.pathname !== item.path && item.color)} />
              {item.name}
            </div>
            {item.count > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px]",
                location.pathname === item.path ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Interactive Filters */}
      <div className="space-y-3 px-2">
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Filters</p>
        
        <FilterSelect 
          label="All Statuses" 
          options={['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped']} 
          isOpen={openDropdown === 'status'}
          onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
        />
        <FilterSelect 
          label="All Sources" 
          options={['LinkedIn', 'WhatsApp', 'Referral', 'Website', 'Other']} 
          isOpen={openDropdown === 'source'}
          onToggle={() => setOpenDropdown(openDropdown === 'source' ? null : 'source')}
        />
        <FilterSelect 
          label="All Priorities" 
          options={['High', 'Medium', 'Low']} 
          isOpen={openDropdown === 'priority'}
          onToggle={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
        />
      </div>
    </div>
  );
}

function FilterSelect({ label, options, isOpen, onToggle }: any) {
  return (
    <div className="relative">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 border dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all"
      >
        {label} <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
          {options.map((opt: string) => (
            <button key={opt} className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}