import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Search, Plus, Moon, Sun, 
  ArrowRight, Building2, LayoutGrid, List,
  Clock, Flame, CheckCircle2, AlertCircle
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
    const savedTheme = localStorage.getItem('user-theme');
    return savedTheme === 'dark';
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
      { label: 'Total Leads', val: allLeads.length, color: 'text-blue-600', icon: LayoutGrid, bg: 'bg-blue-50' },
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
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen p-4 lg:p-8 transition-all duration-500", 
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-[#f8fafc] text-slate-900"
    )}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage your {filteredLeads.length} active leads efficiently.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl border bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-95">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => navigate('/create')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm">
              <Plus size={18} /> Add New Lead
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className={cn(
              "p-5 rounded-2xl border bg-white shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1",
              isDarkMode && "bg-slate-900 border-slate-800"
            )}>
              <div className={cn("p-3 rounded-xl", s.bg)}>
                <s.icon size={24} className={s.color} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className={cn("text-2xl font-black", s.color)}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-2xl border shadow-sm sm:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search by name or company..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:w-48 px-4 py-3 rounded-xl border bg-slate-50 text-sm font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option>All Statuses</option>
              {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed'].map(s => <option key={s}>{s}</option>)}
            </select>

            <div className="flex bg-slate-100 p-1.5 rounded-xl border">
              <button 
                onClick={() => setViewMode('list')} 
                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
              >
                <List size={20} />
              </button>
              <button 
                onClick={() => setViewMode('board')} 
                className={cn("p-2 rounded-lg transition-all", viewMode === 'board' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className={cn(
          "grid gap-4",
          viewMode === 'board' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredLeads.map((lead) => {
            const isOverdue = lead.next_action_date && lead.next_action_date < new Date().toISOString().split('T')[0] && lead.status !== 'Closed';
            
            return (
              <div 
                key={lead.id} 
                onClick={() => navigate(`/lead/${lead.id}`)}
                className={cn(
                  "group p-5 rounded-2xl border bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "border-slate-200 shadow-sm",
                  isOverdue && "border-l-4 border-l-red-500"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg transition-transform group-hover:rotate-6",
                    isOverdue ? "bg-red-500 shadow-lg shadow-red-100" : "bg-slate-800 shadow-lg shadow-slate-100"
                  )}>
                    {lead.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{lead.name}</h3>
                      {isOverdue && <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter italic animate-pulse">Overdue</span>}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5 uppercase tracking-wider">
                      <Building2 size={13} /> {lead.company || 'Direct Client'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Current Status</p>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">{lead.status}</span>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Follow-up</p>
                    <p className="text-xs font-black text-slate-700">{lead.next_action_date || 'N/A'}</p>
                  </div>
                  <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:translate-x-1">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching leads found</p>
          </div>
        )}
      </div>
    </div>
  );
}