import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Calendar, Users, CheckCircle, Search } from 'lucide-react';
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
    <div className="w-64 border-r bg-white h-screen flex flex-col sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary text-white p-1.5 rounded-lg font-bold text-xl">VM</div>
          <div className="font-bold text-lg leading-none">Venturemond <br/><span className="text-[10px] text-muted-foreground font-normal">Lead Management System</span></div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search leads..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-md text-sm outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-4 w-4", location.pathname !== item.path && item.color)} />
                {item.name}
              </div>
              {item.count > 0 && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px]",
                  location.pathname === item.path ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                )}>{item.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t">
         <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Filters</p>
         <div className="space-y-2">
            <select className="w-full bg-gray-50 border-none text-xs p-2 rounded focus:ring-1 focus:ring-primary">
               <option>All Statuses</option>
            </select>
            <select className="w-full bg-gray-50 border-none text-xs p-2 rounded focus:ring-1 focus:ring-primary">
               <option>All Sources</option>
            </select>
         </div>
      </div>
    </div>
  );
}