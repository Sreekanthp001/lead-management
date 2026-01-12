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
    <div className="w-64 border-r bg-white h-screen flex flex-col p-4 shadow-sm overflow-y-auto">
      <div className="font-bold text-xl mb-8 flex items-center gap-2 px-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="bg-primary text-white p-1 rounded-md text-sm">VM</div> Venturemond
      </div>

      <nav className="space-y-1 mb-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Main Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
              location.pathname === item.path ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={cn(location.pathname !== item.path && item.color)} />
              {item.name}
            </div>
          </button>
        ))}
      </nav>

      <div className="space-y-4 px-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Filters</p>
        
        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-xs font-medium text-gray-600 bg-gray-50 hover:bg-white transition-all"
          >
            All Statuses <ChevronDown size={14} className={cn("transition-transform", isStatusOpen && "rotate-180")} />
          </button>
          {isStatusOpen && (
            <div className="mt-1 bg-white border rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-1">
              {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed'].map(opt => (
                <button key={opt} className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600">
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
            className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-xs font-medium text-gray-600 bg-gray-50 hover:bg-white transition-all"
          >
            All Priorities <ChevronDown size={14} className={cn("transition-transform", isPriorityOpen && "rotate-180")} />
          </button>
          {isPriorityOpen && (
            <div className="mt-1 bg-white border rounded-md shadow-lg py-1">
              {['High', 'Medium', 'Low'].map(opt => (
                <button key={opt} className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600">
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