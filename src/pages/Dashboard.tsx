import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Search, Plus, Calendar, Moon, Sun, 
  ArrowRight, Link2, FileText, Paperclip, Building2,
  TrendingUp, CheckCircle2
} from 'lucide-react';
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
      <div className="max-w-7xl mx-auto space-y-10">
        
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
              Lead Intel Central — <span className="text-[#00a389] underline decoration-wavy decoration-2 underline-offset-4">{filteredLeads.length} total leads</span>
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

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className={cn("px-8 py-5 rounded-[1.8rem] text-sm font-black outline-none cursor-pointer appearance-none", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
            <option>All Priorities</option>
            {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Leads Grid */}
        <div className="grid gap-6">
          {filteredLeads.map((lead) => (
            <div 
              key={lead.id} 
              onClick={() => navigate(`/lead/${lead.id}`)}
              className={cn(
                "group p-8 rounded-[3rem] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden",
                isDarkMode ? "bg-slate-900 border-slate-800 hover:border-[#00a389]/50" : "bg-white border-slate-100 hover:border-[#00a389]/30 hover:shadow-2xl hover:shadow-[#00a389]/5"
              )}
            >
              {/* Card Decoration */}
              <div className="absolute top-0 left-0 w-2 h-full bg-[#00a389] opacity-0 group-hover:opacity-100 transition-all" />

              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#00a389] to-[#00816d] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#00a389]/20 transition-transform group-hover:scale-110">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-[#00a389] transition-colors">{lead.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg", isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>
                      <Building2 size={12} /> {lead.company || 'Direct Client'}
                    </span>
                    
                    {/* Activity Badges */}
                    <div className="flex items-center gap-2">
                        {lead.portfolio_url && <Link2 size={14} className="text-[#00a389]" />}
                        {lead.meeting_notes && <FileText size={14} className="text-blue-500" />}
                        {lead.document_url && <Paperclip size={14} className="text-orange-500" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 md:gap-14">
                <div className="hidden sm:block text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead Status</p>
                  <span className={cn(
                    "px-6 py-2 rounded-2xl text-[10px] font-black uppercase border tracking-widest block transition-all",
                    lead.status === 'Interested' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    lead.status === 'Closed' ? "bg-blue-50 text-blue-600 border-blue-100" :
                    isDarkMode ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                  )}>
                    {lead.status}
                  </span>
                </div>

                <div className="hidden sm:block text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Step</p>
                  <div className="flex items-center justify-center gap-2 text-sm font-black text-slate-700">
                    <Calendar size={16} className="text-[#00a389]" />
                    <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                        {lead.next_action_date || 'No Date Set'}
                    </span>
                  </div>
                </div>

                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:bg-[#00a389] group-hover:text-white group-hover:rotate-[-45deg] shadow-sm",
                  isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-50 text-slate-300"
                )}>
                  <ArrowRight size={24} strokeWidth={3} />
                </div>
              </div>
            </div>
          ))}

          {filteredLeads.length === 0 && !loading && (
            <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <Search size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-800">No leads found</h3>
                <p className="text-slate-400 font-bold">Try adjusting your filters or add a new lead.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}