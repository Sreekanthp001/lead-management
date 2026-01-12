import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Calendar, Users, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Sidebar({ counts }: { counts: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Overdue', icon: AlertCircle, path: '/overdue', color: 'text-red-500' },
    { name: 'Today', icon: Calendar, path: '/today', color: 'text-orange-500' },
    { name: 'Active', icon: Users, path: '/active' },
    { name: "Today's Follow-ups", icon: Clock, path: '/followups' },
    { name: 'Closed', icon: CheckCircle, path: '/closed' },
  ];

  return (
    <div className="w-64 border-r bg-white h-screen flex flex-col p-4 shadow-sm overflow-y-auto z-10">
      {/* Branding */}
      <div className="font-bold text-xl mb-8 flex items-center gap-2 px-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="bg-primary text-white p-1.5 rounded-lg text-xs font-black">VM</div> 
        <span className="tracking-tight text-slate-800">Venturemond</span>
      </div>

      {/* Main Menu */}
      <nav className="space-y-1 mb-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
              location.pathname === item.path 
                ? "bg-blue-50 text-blue-600 shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={cn(location.pathname !== item.path && item.color)} />
              {item.name}
            </div>
          </button>
        ))}
      </nav>

      {/* Interactive Filters */}
      <div className="space-y-4 px-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Filters</p>
        
        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-white transition-all shadow-sm"
          >
            All Statuses <ChevronDown size={14} className={cn("transition-transform duration-300", isStatusOpen && "rotate-180")} />
          </button>
          {isStatusOpen && (
            <div className="mt-2 bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed'].map(opt => (
                <button key={opt} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsPriorityOpen(!isPriorityOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-white transition-all shadow-sm"
          >
            All Priorities <ChevronDown size={14} className={cn("transition-transform duration-300", isPriorityOpen && "rotate-180")} />
          </button>
          {isPriorityOpen && (
            <div className="mt-2 bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {['High', 'Medium', 'Low'].map(opt => (
                <button key={opt} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}