import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, Calendar, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  
  // Theme logic: System time batti auto-detect, or user manual change
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18; 
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      setAllLeads(data || []);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let list = [...allLeads];

    if (filter === 'overdue') {
      list = list.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
    } else if (filter === 'today' || filter === 'followups') {
      list = list.filter(l => l.next_action_date === todayStr);
    } else if (filter === 'active') {
      list = list.filter(l => l.status !== 'Closed' && l.status !== 'Dropped');
    } else if (filter === 'closed') {
      list = list.filter(l => l.status === 'Closed' || l.status === 'Dropped');
    }

    if (statusFilter !== 'All Statuses') list = list.filter(l => l.status === statusFilter);
    if (priorityFilter !== 'All Priorities') list = list.filter(l => l.priority === priorityFilter);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => (l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q));
    }
    return list;
  }, [allLeads, filter, searchQuery, statusFilter, priorityFilter]);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 p-4 lg:p-8 font-sans",
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Main Filters Area */}
        <div className={cn(
          "p-8 rounded-[2.5rem] border shadow-sm space-y-8 transition-all duration-500",
          isDarkMode ? "bg-[#161e2d] border-slate-800 shadow-blue-900/5" : "bg-white border-slate-100"
        )}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight leading-tight">Dashboard View</h2>
              <p className={cn("text-xs font-black uppercase tracking-[0.2em] mt-2", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                Total Records: <span className="text-[#00a389]">{filteredLeads.length}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Theme Toggle Button */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={cn(
                  "p-3.5 rounded-2xl transition-all duration-300 shadow-sm border active:scale-90",
                  isDarkMode ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-white"
                )}
              >
                {isDarkMode ? <Sun size={22} fill="currentColor" /> : <Moon size={22} fill="currentColor" />}
              </button>

              <button 
                onClick={() => navigate('/create')} 
                className="flex-1 md:flex-none bg-[#00a389] hover:bg-[#008f78] text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00a389]/20 transition-all active:scale-95 uppercase tracking-widest"
              >
                <Plus size={20} strokeWidth={3} /> Add Lead
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Search leads instantly..." 
                className={cn(
                  "w-full pl-14 pr-6 py-4 rounded-2xl text-sm font-bold outline-none transition-all border",
                  isDarkMode ? "bg-[#0b0f1a] border-slate-700 text-white focus:border-[#00a389]" : "bg-slate-50 border-slate-100 text-slate-800 focus:ring-4 focus:ring-[#00a389]/5 focus:border-[#00a389]"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(
                "border rounded-2xl px-6 py-4 text-sm font-black outline-none cursor-pointer transition-all",
                isDarkMode ? "bg-[#0b0f1a] border-slate-700 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white"
              )}
            >
              <option>All Statuses</option>
              {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped'].map(s => <option key={s}>{s}</option>)}
            </select>

            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={cn(
                "border rounded-2xl px-6 py-4 text-sm font-black outline-none cursor-pointer transition-all",
                isDarkMode ? "bg-[#0b0f1a] border-slate-700 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white"
              )}
            >
              <option>All Priorities</option>
              {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className={cn(
          "rounded-[2.5rem] border shadow-sm overflow-hidden transition-all duration-500",
          isDarkMode ? "bg-[#161e2d] border-slate-800" : "bg-white border-slate-100"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={cn(
                  "border-b uppercase text-[10px] font-black tracking-[0.2em]",
                  isDarkMode ? "bg-slate-900/40 border-slate-800 text-slate-500" : "bg-slate-50/50 border-slate-100 text-slate-400"
                )}>
                  <th className="px-10 py-7">Lead Information</th>
                  <th className="px-10 py-7">Status</th>
                  <th className="px-10 py-7">Source</th>
                  <th className="px-10 py-7">Next Follow-up</th>
                  <th className="px-10 py-7 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-slate-800" : "divide-slate-50")}>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className={cn(
                    "group cursor-pointer transition-all duration-300",
                    isDarkMode ? "hover:bg-[#1c2638]" : "hover:bg-slate-50/80"
                  )} onClick={() => navigate(`/lead/${lead.id}`)}>
                    <td className="px-10 py-7">
                      <div className={cn("font-black text-lg tracking-tight mb-1 transition-colors", isDarkMode ? "text-white group-hover:text-[#00a389]" : "text-slate-900 group-hover:text-[#00a389]")}>{lead.name}</div>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block", isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>
                        {lead.company || 'Direct Client'}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm border",
                        isDarkMode ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                      )}>
                        {lead.status}
                      </span>
                    </td>
                    <td className={cn("px-10 py-7 font-black text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>{lead.source}</td>
                    <td className="px-10 py-7">
                      <div className={cn("flex items-center gap-2 font-bold", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                        <Calendar size={16} className="opacity-40" />
                        {lead.next_action_date || 'TBD'}
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className={cn(
                        "inline-flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-sm",
                        isDarkMode ? "bg-slate-800 text-slate-500 group-hover:bg-[#00a389] group-hover:text-white" : "bg-slate-50 text-slate-300 group-hover:bg-[#00a389] group-hover:text-white"
                      )}>
                        <span className="text-xl font-black">→</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}