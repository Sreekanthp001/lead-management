import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Overdue', icon: AlertCircle, path: '/overdue', color: 'text-red-500' },
    { name: 'Today', icon: Calendar, path: '/today', color: 'text-orange-500' },
    { name: 'Active', icon: Users, path: '/active' },
    { name: "Today's Follow-ups", icon: Clock, path: '/followups' },
    { name: 'Closed', icon: CheckCircle, path: '/closed' },
  ];

  return (
    <div className="w-64 border-r bg-white h-screen flex flex-col p-4 shadow-sm z-10">
      {/* Branding */}
      <div className="font-bold text-xl mb-8 flex items-center gap-2 px-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="bg-[#00a389] text-white p-1.5 rounded-lg text-xs font-black">VM</div> 
        <span className="tracking-tight text-slate-800 font-bold">Venturemond</span>
      </div>

      {/* Main Menu Only */}
      <nav className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
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
    </div>
  );
}