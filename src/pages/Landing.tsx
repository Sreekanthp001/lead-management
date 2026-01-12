import { useNavigate } from "react-router-dom";
import { LayoutDashboard, AlertCircle, Calendar, PlusCircle } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", desc: "View all leads and analytics", color: "bg-blue-500" },
    { name: "Overdue", icon: AlertCircle, path: "/overdue", desc: "Check pending follow-ups", color: "bg-red-500" },
    { name: "Today's Task", icon: Calendar, path: "/today", desc: "Tasks scheduled for today", color: "bg-orange-500" },
    { name: "Create Lead", icon: PlusCircle, path: "/create", desc: "Add new business lead", color: "bg-green-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800">Lead Control Center</h2>
        <p className="text-slate-500 mt-2">Manage your sales funnel efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navItems.map((item) => (
          <div 
            key={item.name}
            onClick={() => navigate(item.path)}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
            <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}