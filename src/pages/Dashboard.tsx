import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Search, Plus, Moon, Sun, 
  ArrowRight, Building2, TrendingUp, AlertCircle, 
  LayoutGrid, List, Calendar
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
    return false;
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

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-[#00a389]" size={32} />
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen p-4 lg:p-6 font-['Inter',sans-serif] transition-colors", 
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-[#f1f5f9] text-slate-900"
    )}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Compact Header */}
        <div className="flex justify-between items-center border-b pb-4 border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">{filteredLeads.length} leads</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg border bg-white hover:bg-slate-50 text-slate-600 transition-all">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => navigate('/create')} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition-all">
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>

        {/* --- Small Analytics Cards --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Leads', val: stats.total, color: 'text-blue-600' },
            { label: 'Active', val: stats.active, color: 'text-emerald-600' },
            { label: 'Hot Leads', val: stats.hot, color: 'text-orange-600' },
            { label: 'Overdue', val: stats.overdue, color: 'text-red-600' },
          ].map((s, idx) => (
            <div key={idx} className={cn(
              "p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-center",
              isDarkMode && "bg-slate-900 border-slate-800"
            )}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className={cn("text-2xl font-bold", s.color)}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Compact Filters Section */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              placeholder="Search leads..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm font-medium bg-white outline-none cursor-pointer">
            <option>All Statuses</option>
            {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped'].map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex bg-white border rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md", viewMode === 'list' ? "bg-slate-100 text-blue-600" : "text-slate-400")}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode('board')} className={cn("p-1.5 rounded-md", viewMode === 'board' ? "bg-slate-100 text-blue-600" : "text-slate-400")}>
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {/* Leads Display - Compact Card Style */}
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const isOverdue = lead.next_action_date && lead.next_action_date < new Date().toISOString().split('T')[0] && lead.status !== 'Closed';
            return (
              <div key={lead.id} onClick={() => navigate(`/lead/${lead.id}`)}
                className={cn(
                  "group p-4 rounded-xl border bg-white hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between gap-4",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "border-slate-200 shadow-sm",
                  isOverdue && "border-l-4 border-l-red-500"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner", isOverdue ? "bg-red-500" : "bg-slate-700")}>
                    {lead.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">{lead.name}</h3>
                      {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Overdue</span>}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Building2 size={12} /> {lead.company || 'Direct Client'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden md:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</p>
                    <span className="text-xs font-semibold text-blue-600">{lead.status}</span>
                  </div>
                  <div className="text-right hidden sm:block border-l pl-6 border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Follow-up</p>
                    <p className="text-xs font-bold text-slate-700">{lead.next_action_date || 'N/A'}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm font-medium italic">No matching leads found</div>
        )}
      </div>
    </div>
  );
}