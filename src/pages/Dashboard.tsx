import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Search, Plus, Filter,
  ArrowRight, Building2, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { toast } from "sonner"; 

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('user-theme');
      return savedTheme === 'dark';
    }
    return false;
  });

  const navigate = useNavigate();

  const getPageTitle = () => {
    switch(filter) {
      case 'overdue': return 'Overdue Leads';
      case 'today': return 'Today\'s Follow-ups';
      case 'active': return 'Active Leads';
      case 'closed': return 'Closed / Dropped';
      default: return 'Main Dashboard';
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setAllLeads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (!error) {
        toast.success("Lead deleted successfully");
        setAllLeads(prev => prev.filter(l => l.id !== id));
      } else {
        toast.error("Error: Could not delete lead");
      }
    }
  };

  // DYNAMIC STATS LOGIC
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      { label: 'Total Leads', val: allLeads.length, color: 'text-blue-600' },
      { label: 'Today Followups', val: allLeads.filter(l => l.next_action_date === todayStr).length, color: 'text-orange-600' },
      { label: 'Overdue', val: allLeads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed').length, color: 'text-red-600' },
      { label: 'Active Leads', val: allLeads.filter(l => l.status !== 'Closed' && l.status !== 'Dropped').length, color: 'text-emerald-600' },
    ];
  }, [allLeads]);

  // FILTERING LOGIC
  // FILTERING LOGIC
  const filteredLeads = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let list = [...allLeads];
    
    // URL/Filter prop ni batti list ni filter chestunnam
    if (filter === 'overdue') {
      list = list.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
    } else if (filter === 'today' || filter === 'followups') {
      list = list.filter(l => l.next_action_date === todayStr);
    } else if (filter === 'active') {
      list = list.filter(l => l.status !== 'Closed' && l.status !== 'Dropped');
    } else if (filter === 'closed') {
      // IDHI MISS AYINDHI - Ippudu add chesa
      list = list.filter(l => l.status === 'Closed' || l.status === 'Dropped');
    }
    
    // User manual ga select chese filters (dropdowns)
    if (statusFilter !== 'All') list = list.filter(l => l.status === statusFilter);
    if (priorityFilter !== 'All') list = list.filter(l => l.priority === priorityFilter);
    if (sourceFilter !== 'All') list = list.filter(l => l.source === sourceFilter);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => (l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q));
    }
    return list;
  }, [allLeads, filter, searchQuery, statusFilter, priorityFilter, sourceFilter]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#0b0f1a]">
      <Loader2 className="animate-spin text-[#00a389]" size={40} />
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen p-4 lg:p-8 transition-colors duration-500", 
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-[#f1f5f9] text-slate-900"
    )}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight italic uppercase text-[#00a389]">Venturemond</h1>
              <span className="text-slate-300 dark:text-slate-700 text-2xl font-light">/</span>
              <h2 className="text-xl font-bold text-slate-500 uppercase tracking-tight">{getPageTitle()}</h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Lead Intel Central — {filteredLeads.length} Results
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* CLEAN HEADER: THEME TOGGLE REMOVED FROM HERE */}
            <button onClick={() => navigate('/create')} className="bg-[#00a389] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              <Plus size={18} /> Add Lead
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className="p-5 rounded-3xl border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
              <p className={cn("text-2xl font-black", s.color)}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                placeholder="Search leads, companies or tags..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white dark:bg-slate-900 dark:text-white text-sm shadow-sm focus:ring-2 focus:ring-[#00a389]/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-3.5 rounded-2xl border transition-all shadow-sm",
                showFilters ? "bg-slate-800 text-white" : "bg-white dark:bg-slate-900 text-slate-500"
              )}
            >
              <Filter size={20} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none dark:text-slate-200">
                  <option>All</option>
                  {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Priority</label>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none dark:text-slate-200">
                  <option>All</option>
                  {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Source</label>
                <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none dark:text-slate-200">
                  <option>All</option>
                  {['LinkedIn', 'WhatsApp', 'Referral', 'Website', 'Other'].map(src => <option key={src}>{src}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div 
              key={lead.id} 
              onClick={() => navigate(`/lead/${lead.id}`)}
              className="group p-4 rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 hover:border-[#00a389] hover:shadow-lg transition-all cursor-pointer flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00a389] text-white flex items-center justify-center font-bold text-sm">
                  {lead.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold dark:text-white group-hover:text-[#00a389] transition-colors">{lead.name}</h3>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">
                    <Building2 size={10} className="inline mr-1" /> {lead.company || 'Direct Client'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right mr-4">
                  <p className="text-[8px] uppercase font-bold text-slate-400 tracking-widest">Priority</p>
                  <span className={cn(
                    "text-[10px] font-black uppercase",
                    lead.priority === 'High' ? "text-red-500" : lead.priority === 'Medium' ? "text-orange-500" : "text-blue-500"
                  )}>{lead.priority || 'Low'}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl min-w-[80px] text-center border border-slate-100 dark:border-slate-700">
                  <span className="text-[9px] font-black text-[#00a389] uppercase tracking-tighter">{lead.status}</span>
                </div>
                <button 
                  onClick={(e) => handleDelete(lead.id, e)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-[#00a389] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}

          {filteredLeads.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No matching leads found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}