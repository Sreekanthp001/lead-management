// src/components/Sidebar.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Calendar, Users, CheckCircle, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Sidebar({ counts }: { counts: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', count: counts.all },
    { name: 'Overdue', icon: AlertCircle, path: '/overdue', count: counts.overdue, color: 'text-red-500' },
    { name: 'Today\'s Follow-ups', icon: Calendar, path: '/today', count: counts.today, color: 'text-orange-500' },
    { name: 'Active Leads', icon: Users, path: '/active', count: counts.active },
    { name: 'Closed / Dropped', icon: CheckCircle, path: '/closed', count: counts.closed },
  ];

  return (
    <div className="w-64 border-r bg-white h-screen flex flex-col p-4 shadow-sm">
      <div className="font-bold text-2xl mb-8 flex items-center gap-2 px-2 text-primary">
        <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">VM</div> 
        <span className="tracking-tight text-slate-800">Venturemond</span>
      </div>

      <nav className="space-y-1 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
              location.pathname === item.path 
                ? "bg-blue-50 text-blue-600 shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-4 w-4", location.pathname !== item.path && item.color)} />
              {item.name}
            </div>
            {item.count > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px]",
                location.pathname === item.path ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              )}>{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Premium Filters Section */}
      <div className="space-y-4 px-2">
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Filters</p>
        
        <FilterDropdown label="All Statuses" options={['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped']} />
        <FilterDropdown label="All Sources" options={['LinkedIn', 'WhatsApp', 'Referral', 'Website', 'Other']} />
        <FilterDropdown label="All Priorities" options={['High', 'Medium', 'Low']} />
      </div>
    </div>
  );
}

function FilterDropdown({ label, options }: { label: string, options: string[] }) {
  return (
    <div className="group relative">
      <button className="w-full flex items-center justify-between px-3 py-2 border rounded-lg text-xs font-medium text-slate-600 bg-slate-50/50 hover:bg-white transition-colors">
        {label} <ChevronDown size={14} className="text-slate-400" />
      </button>
      {/* Logic to show options on click can be added with state */}
    </div>
  );
}