import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Calendar, Users, CheckCircle } from 'lucide-react';
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
    <div className="w-64 border-r bg-white h-screen flex flex-col">
      <div className="p-6 flex-1">
        <div className="font-bold text-xl mb-8 flex items-center gap-2">
          <div className="bg-primary text-white p-1 rounded">VM</div> Venturemond
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium",
                location.pathname === item.path ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-4 w-4", location.pathname !== item.path && item.color)} />
                {item.name}
              </div>
              {item.count > 0 && <span>{item.count}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}