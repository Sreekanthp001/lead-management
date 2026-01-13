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
  
  // Theme Logic: Auto + Manual
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. Check if user already manually set a preference before
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme) return savedTheme === 'dark';

    // 2. If no manual preference, use automatic time logic
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18; // Dark mode between 6 PM to 6 AM
  });

  const navigate = useNavigate();

  // Function to handle manual theme toggle
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    // Save user preference so it doesn't auto-change on next refresh
    localStorage.setItem('user-theme', newMode ? 'dark' : 'light');
  };

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

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[#00a389]" size={40} /></div>;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 p-4 lg:p-8 font-sans",
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Main Filters Area */}
        <div className={cn(
          "p-8 rounded-[2.5rem] border shadow-sm space-y-8 transition-all duration-500",
          isDarkMode ? "bg-[#161e2d] border-slate-800 shadow-blue-900/10" : "bg-white border-slate-100 shadow-slate-200/50"
        )}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight leading-tight uppercase italic">Dashboard View</h2>
              <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] mt-2", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                Total Records: <span className="text-[#00a389] font-black">{filteredLeads.length}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Manual Override Button */}
              <button 
                onClick={toggleTheme}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className={cn(
                  "p-4 rounded-2xl transition-all duration-300 shadow-md border active:scale-90 group",
                  isDarkMode ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {isDarkMode ? <Sun size={24} fill="currentColor" className="group-hover:rotate-45 transition-transform" /> : <Moon size={24} fill="currentColor" className="group-hover:-rotate-12 transition-transform" />}
              </button>

              <button 
                onClick={() => navigate('/create')} 
                className="flex-1 md:flex-none bg-[#00a389] hover:bg-[#008f78] text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00a389]/30 transition-all active:scale-95 uppercase tracking-[0.2em]"
              >
                <Plus size={20} strokeWidth={4} /> Add Lead
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                placeholder="Search leads instantly..." 
                className={cn(
                  "w-full pl-14 pr-6 py-4 rounded-2xl text-sm font-black outline-none transition-all border",
                  isDarkMode ? "bg-[#0b0f1a] border-slate-700 text-white focus:border-[#00a389]" : "bg-slate-50 border-slate-100 text-slate-800 focus:ring-4 focus:ring-[#00a389]/10 focus:border-[#00a389]"
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
          "rounded-[2.5rem] border shadow-xl overflow-hidden transition-all duration-500",
          isDarkMode ? "bg-[#161e2d] border-slate-800 shadow-black/20" : "bg-white border-slate-100 shadow-slate-200/50"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={cn(
                  "border-b uppercase text-[10px] font-black tracking-[0.25em]",
                  isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-500" : "bg-slate-50/50 border-slate-100 text-slate-400"
                )}>
                  <th className="px-10 py-8">Lead Information</th>
                  <th className="px-10 py-8">Status</th>
                  <th className="px-10 py-8">Source</th>
                  <th className="px-10 py-8">Next Follow-up</th>
                  <th className="px-10 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-slate-800" : "divide-slate-50")}>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className={cn(
                    "group cursor-pointer transition-all duration-300",
                    isDarkMode ? "hover:bg-[#1c2638]" : "hover:bg-slate-50/80"
                  )} onClick={() => navigate(`/lead/${lead.id}`)}>
                    <td className="px-10 py-8">
                      <div className={cn("font-black text-xl tracking-tight mb-1 transition-colors group-hover:text-[#00a389]", isDarkMode ? "text-white" : "text-slate-900")}>{lead.name}</div>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-block", isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>
                        {lead.company || 'Direct Client'}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={cn(
                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm border",
                        isDarkMode ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                      )}>
                        {lead.status}
                      </span>
                    </td>
                    <td className={cn("px-10 py-8 font-black text-xs tracking-wider", isDarkMode ? "text-slate-400" : "text-slate-500")}>{lead.source}</td>
                    <td className="px-10 py-8">
                      <div className={cn("flex items-center gap-2 font-black italic", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                        <Calendar size={18} className="text-[#00a389]" />
                        {lead.next_action_date || 'TBD'}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className={cn(
                        "inline-flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-md",
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