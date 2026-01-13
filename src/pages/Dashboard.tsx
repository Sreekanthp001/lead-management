import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Search, Plus, Calendar, Moon, Sun, 
  ArrowRight, Link2, FileText, Paperclip, Building2,
  TrendingUp, AlertCircle, LayoutGrid, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  
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
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      setAllLeads(data || []);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  // --- 1. ANALYTICS LOGIC ---
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      total: allLeads.length,
      active: allLeads.filter(l => l.status !== 'Closed' && l.status !== 'Dropped').length,
      hot: allLeads.filter(l => l.status === 'Interested' || l.priority === 'High').length,
      overdue: allLeads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed').length
    };
  }, [allLeads]);

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
      list = list.filter(l => 
        (l.name || '').toLowerCase().includes(q) || 
        (l.company || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allLeads, filter, searchQuery, statusFilter, priorityFilter]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#00a389]" size={48} />
        <p className="font-black text-slate-400 tracking-widest uppercase text-xs">Venturemond CRM</p>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 p-6 lg:p-10 font-['Outfit']",
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-[#f8fafc] text-slate-900"
    )}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-[#00a389] text-white p-2 rounded-xl shadow-lg shadow-[#00a389]/40">
                  <TrendingUp size={24} />
               </span>
               <h1 className="text-5xl font-black tracking-tight">Venturemond</h1>
            </div>
            <p className={cn("text-sm font-bold tracking-wide", isDarkMode ? "text-slate-500" : "text-slate-400")}>
              Lead Intel Central — <span className="text-[#00a389] underline decoration-wavy decoration-2 underline-offset-4">{filteredLeads.length} filtered leads</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={cn(
              "p-4 rounded-[1.5rem] border transition-all hover:scale-105 active:scale-95 shadow-sm",
              isDarkMode ? "bg-slate-800 border-slate-700 text-yellow-400" : "bg-white border-slate-200 text-slate-600"
            )}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => navigate('/create')} className="bg-[#00a389] hover:bg-[#008f78] text-white px-8 py-5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl shadow-[#00a389]/20 transition-all hover:-translate-y-1 uppercase text-xs tracking-widest">
              <Plus size={20} strokeWidth={3} /> Add Lead
            </button>
          </div>
        </div>

        {/* --- 2. ANALYTICS CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', val: stats.total, color: 'text-blue-500' },
            { label: 'Active', val: stats.active, color: 'text-[#00a389]' },
            { label: 'Hot Leads', val: stats.hot, color: 'text-orange-500' },
            { label: 'Overdue', val: stats.overdue, color: 'text-red-500' },
          ].map((s, idx) => (
            <div key={idx} className={cn(
              "p-6 rounded-[2.5rem] border transition-all",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm shadow-slate-200/50"
            )}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{s.label}</p>
              <p className={cn("text-3xl font-black", s.color)}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className={cn(
          "p-3 rounded-[2.5rem] flex flex-wrap gap-3 transition-all",
          isDarkMode ? "bg-slate-900/60 border border-slate-800" : "bg-white shadow-xl shadow-slate-200/50 border border-slate-100"
        )}>
          <div className="relative flex-[2] min-w-[300px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search leads, companies or tags..." 
              className={cn(
                "w-full pl-16 pr-6 py-5 rounded-[1.8rem] text-sm font-bold outline-none transition-all",
                isDarkMode ? "bg-slate-800 text-white placeholder:text-slate-600" : "bg-slate-50 text-slate-900 placeholder:text-slate-400"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className={cn("px-8 py-5 rounded-[1.8rem] text-sm font-black outline-none cursor-pointer appearance-none", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
            <option>All Statuses</option>
            {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped'].map(s => <option key={s}>{s}</option>)}
          </select>

          <div className={cn(
            "flex items-center p-1 rounded-[1.8rem]",
            isDarkMode ? "bg-slate-800" : "bg-slate-50"
          )}>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-4 rounded-[1.5rem] transition-all", viewMode === 'list' ? "bg-[#00a389] text-white shadow-lg" : "text-slate-400")}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('board')}
              className={cn("p-4 rounded-[1.5rem] transition-all", viewMode === 'board' ? "bg-[#00a389] text-white shadow-lg" : "text-slate-400")}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Leads Display */}
        {viewMode === 'list' ? (
          <div className="grid gap-6">
            {filteredLeads.map((lead) => {
              const isOverdue = lead.next_action_date && lead.next_action_date < new Date().toISOString().split('T')[0] && lead.status !== 'Closed';
              return (
                <div key={lead.id} onClick={() => navigate(`/lead/${lead.id}`)}
                  className={cn(
                    "group p-8 rounded-[3rem] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden",
                    isDarkMode ? "bg-slate-900 border-slate-800 hover:border-[#00a389]/50" : "bg-white border-slate-100 hover:border-[#00a389]/30 hover:shadow-2xl hover:shadow-[#00a389]/5",
                    isOverdue && !isDarkMode && "bg-red-50/30 border-red-100"
                  )}
                >
                  <div className={cn("absolute top-0 left-0 w-2 h-full opacity-0 group-hover:opacity-100", isOverdue ? "bg-red-500" : "bg-[#00a389]")} />
                  <div className="flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 transition-all", isOverdue ? "bg-red-500" : "bg-[#00a389]")}>
                      {lead.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black flex items-center gap-2">
                        {lead.name} {isOverdue && <AlertCircle size={18} className="text-red-500 animate-pulse" />}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        <Building2 size={12} className="inline mr-1" /> {lead.company || 'Direct Client'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest", isDarkMode ? "bg-slate-800" : "bg-slate-100")}>
                      {lead.status}
                    </span>
                    <div className="text-right hidden sm:block">
                      <p className={cn("text-[10px] font-black uppercase", isOverdue ? "text-red-500" : "text-slate-400")}>Follow-up</p>
                      <p className="text-sm font-black">{lead.next_action_date || 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-[#00a389] group-hover:text-white transition-all">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Kanban Board Placeholder for next step */
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
             {['New', 'Interested', 'Contacted'].map(col => (
               <div key={col} className={cn("p-6 rounded-[3rem] min-h-[400px]", isDarkMode ? "bg-slate-900/40" : "bg-slate-100/50")}>
                  <h4 className="font-black uppercase tracking-[0.2em] text-xs mb-6 text-slate-400 flex items-center justify-between">
                    {col} <span>{filteredLeads.filter(l => l.status === col).length}</span>
                  </h4>
                  <div className="space-y-4">
                    {filteredLeads.filter(l => l.status === col).map(l => (
                      <div key={l.id} onClick={() => navigate(`/lead/${l.id}`)} className={cn("p-5 rounded-3xl bg-white shadow-sm border border-slate-100 hover:scale-[1.02] transition-all cursor-pointer", isDarkMode && "bg-slate-800 border-slate-700")}>
                        <p className="font-black text-sm">{l.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">{l.company || 'Direct'}</p>
                      </div>
                    ))}
                  </div>
               </div>
             ))}
          </div>
        )}

        {filteredLeads.length === 0 && (
          <div className="text-center py-20 opacity-50 font-black tracking-widest uppercase text-slate-400">No matching leads found</div>
        )}
      </div>
    </div>
  );
}