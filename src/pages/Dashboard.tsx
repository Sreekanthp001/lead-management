import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Search, Plus, Moon, Sun, 
  ArrowRight, Building2, LayoutGrid, List,
  Clock, Flame, CheckCircle2, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('user-theme');
      return savedTheme === 'dark';
    }
    return false;
  });

  const navigate = useNavigate();

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('user-theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
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

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      { label: 'Total Leads', val: allLeads.length, color: 'text-blue-600', icon: TrendingUp, bg: 'bg-blue-50' },
      { label: 'Active', val: allLeads.filter(l => l.status !== 'Closed' && l.status !== 'Dropped').length, color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-50' },
      { label: 'Hot Leads', val: allLeads.filter(l => l.status === 'Interested' || l.priority === 'High').length, color: 'text-orange-600', icon: Flame, bg: 'bg-orange-50' },
      { label: 'Overdue', val: allLeads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed').length, color: 'text-red-600', icon: Clock, bg: 'bg-red-50' },
    ];
  }, [allLeads]);

  const filteredLeads = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let list = [...allLeads];
    
    if (filter === 'overdue') list = list.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
    else if (filter === 'today' || filter === 'followups') list = list.filter(l => l.next_action_date === todayStr);
    else if (filter === 'active') list = list.filter(l => l.status !== 'Closed' && l.status !== 'Dropped');
    
    if (statusFilter !== 'All Statuses') list = list.filter(l => l.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => (l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q));
    }
    return list;
  }, [allLeads, filter, searchQuery, statusFilter]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen p-4 lg:p-8 transition-colors duration-500", 
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-[#f1f5f9] text-slate-900"
    )}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight italic uppercase">Venturemond</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lead Intel Central — {filteredLeads.length} Leads</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-3 rounded-2xl border bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-90">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => navigate('/create')} className="bg-[#00a389] hover:bg-[#008f78] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95 text-xs uppercase tracking-widest">
              <Plus size={18} /> Add Lead
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className={cn(
              "p-6 rounded-[2.5rem] border bg-white shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1",
              isDarkMode && "bg-slate-900 border-slate-800"
            )}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{s.label}</p>
              <p className={cn("text-3xl font-black", s.color)}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/50 backdrop-blur-md p-3 rounded-[2rem] border border-white shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              placeholder="Search leads, companies or tags..." 
              className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border-none bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto px-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 rounded-[1.5rem] border-none bg-white text-xs font-black uppercase tracking-widest outline-none cursor-pointer shadow-sm"
            >
              <option>All Statuses</option>
              {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed'].map(s => <option key={s}>{s}</option>)}
            </select>

            <div className="flex bg-white/80 p-1.5 rounded-[1.5rem] shadow-sm border">
              <button 
                onClick={() => setViewMode('list')} 
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-[#00a389] text-white shadow-md" : "text-slate-300")}
              >
                <List size={20} />
              </button>
              <button 
                onClick={() => setViewMode('board')} 
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'board' ? "bg-[#00a389] text-white shadow-md" : "text-slate-300")}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Leads Display */}
        <div className={cn(
          "grid gap-6",
          viewMode === 'board' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredLeads.map((lead) => {
            const isOverdue = lead.next_action_date && lead.next_action_date < new Date().toISOString().split('T')[0] && lead.status !== 'Closed';
            
            return (
              <div 
                key={lead.id} 
                onClick={() => navigate(`/lead/${lead.id}`)}
                className={cn(
                  "group p-6 rounded-[2.5rem] border bg-white hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "border-slate-100 shadow-sm",
                  viewMode === 'list' && "md:flex-row md:items-center",
                  isOverdue && "border-l-8 border-l-red-500"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner transition-all group-hover:scale-110 group-hover:rotate-6",
                    isOverdue ? "bg-red-500 shadow-red-200" : "bg-[#00a389] shadow-emerald-100"
                  )}>
                    {lead.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-[#00a389] transition-colors">{lead.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5 uppercase tracking-[0.1em]">
                      <Building2 size={12} className="text-slate-300" /> {lead.company || 'Direct Client'}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  "flex items-center justify-between gap-6 mt-6 md:mt-0",
                  viewMode === 'list' && "md:border-t-0 md:pt-0"
                )}>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Status</p>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{lead.status}</span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Follow-up</p>
                    <p className="text-[11px] font-black text-slate-700">{lead.next_action_date || 'N/A'}</p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#00a389] group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="text-center py-24 bg-white/50 rounded-[3rem] border-4 border-dashed border-slate-200">
             <Search size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">No matches found in center</p>
          </div>
        )}
      </div>
    </div>
  );
}