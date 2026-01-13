import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, Calendar, Moon, Sun, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme) return savedTheme === 'dark';
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18; 
  });

  const navigate = useNavigate();

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
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

  // Filter Logic remains the same...
  const filteredLeads = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let list = [...allLeads];
    if (filter === 'overdue') list = list.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
    else if (filter === 'today' || filter === 'followups') list = list.filter(l => l.next_action_date === todayStr);
    else if (filter === 'active') list = list.filter(l => l.status !== 'Closed' && l.status !== 'Dropped');
    else if (filter === 'closed') list = list.filter(l => l.status === 'Closed' || l.status === 'Dropped');

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
      "min-h-screen transition-all duration-700 p-6 lg:p-10",
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-[#f8fafc] text-slate-900"
    )}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">Dashboard</h1>
            <p className={cn("text-sm font-medium tracking-wide", isDarkMode ? "text-slate-400" : "text-slate-500")}>
              Showing <span className="text-[#00a389] font-bold">{filteredLeads.length}</span> leads in this view
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={cn(
              "p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 shadow-sm",
              isDarkMode ? "bg-slate-800 border-slate-700 text-yellow-400" : "bg-white border-slate-200 text-slate-600"
            )}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => navigate('/create')} className="bg-[#00a389] hover:bg-[#008f78] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#00a389]/20 transition-all hover:-translate-y-1">
              <Plus size={20} strokeWidth={2.5} /> Add Lead
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className={cn(
          "p-2 rounded-[2rem] flex flex-wrap gap-2 transition-all",
          isDarkMode ? "bg-slate-900/50" : "bg-slate-200/50"
        )}>
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search by name, company..." 
              className={cn(
                "w-full pl-14 pr-6 py-4 rounded-[1.5rem] text-sm font-semibold outline-none transition-all border-none",
                isDarkMode ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-slate-900 placeholder:text-slate-400"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className={cn("px-6 py-4 rounded-[1.5rem] text-sm font-bold outline-none cursor-pointer border-none appearance-none", isDarkMode ? "bg-slate-800" : "bg-white")}>
            <option>All Statuses</option>
            {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped'].map(s => <option key={s}>{s}</option>)}
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className={cn("px-6 py-4 rounded-[1.5rem] text-sm font-bold outline-none cursor-pointer border-none", isDarkMode ? "bg-slate-800" : "bg-white")}>
            <option>All Priorities</option>
            {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Leads Grid/Table */}
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <div 
              key={lead.id} 
              onClick={() => navigate(`/lead/${lead.id}`)}
              className={cn(
                "group p-6 rounded-[2rem] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-[#00a389]/50",
                isDarkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800/80" : "bg-white border-slate-100 hover:bg-slate-50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00a389]/10 flex items-center justify-center text-[#00a389] font-bold text-xl">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-[#00a389] transition-colors">{lead.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md", isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>
                      {lead.company || 'Direct Client'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs font-semibold text-slate-500">{lead.source}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 md:gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Status</p>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold border",
                    isDarkMode ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600 shadow-sm"
                  )}>
                    {lead.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Next Follow-up</p>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Calendar size={14} className="text-[#00a389]" />
                    {lead.next_action_date || 'TBD'}
                  </div>
                </div>

                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:translate-x-1",
                  isDarkMode ? "bg-slate-800 text-slate-500 group-hover:bg-[#00a389] group-hover:text-white" : "bg-slate-50 text-slate-400 group-hover:bg-[#00a389] group-hover:text-white"
                )}>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}