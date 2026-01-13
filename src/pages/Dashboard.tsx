import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, Calendar, Moon, Sun, ArrowRight, Link2, FileText, Paperclip } from 'lucide-react';
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
      // Fetches all fields including the new ones you requested
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

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[#00a389]" size={40} /></div>;

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 p-6 lg:p-10 font-['Outfit']",
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-[#f8fafc] text-slate-900"
    )}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section - Cleaned Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tight mb-2">Dashboard</h1>
            <p className={cn("text-sm font-bold tracking-wide", isDarkMode ? "text-slate-500" : "text-slate-400")}>
              Venturemond Lead Intel — <span className="text-[#00a389]">{filteredLeads.length} active leads</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={cn(
              "p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 shadow-sm",
              isDarkMode ? "bg-slate-800 border-slate-700 text-yellow-400" : "bg-white border-slate-200 text-slate-600"
            )}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => navigate('/create')} className="bg-[#00a389] hover:bg-[#008f78] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-[#00a389]/20 transition-all hover:-translate-y-1 uppercase text-xs tracking-widest">
              <Plus size={18} strokeWidth={3} /> Add Lead
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className={cn(
          "p-2 rounded-[2.5rem] flex flex-wrap gap-2 transition-all shadow-inner",
          isDarkMode ? "bg-slate-900/40" : "bg-slate-200/40"
        )}>
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search by lead name or company..." 
              className={cn(
                "w-full pl-16 pr-6 py-5 rounded-[1.8rem] text-sm font-bold outline-none transition-all border-none focus:ring-2 focus:ring-[#00a389]/20",
                isDarkMode ? "bg-slate-800 text-white placeholder:text-slate-600" : "bg-white text-slate-900 placeholder:text-slate-400"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className={cn("px-8 py-5 rounded-[1.8rem] text-sm font-black outline-none cursor-pointer border-none", isDarkMode ? "bg-slate-800" : "bg-white")}>
            <option>All Statuses</option>
            {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped'].map(s => <option key={s}>{s}</option>)}
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className={cn("px-8 py-5 rounded-[1.8rem] text-sm font-black outline-none cursor-pointer border-none", isDarkMode ? "bg-slate-800" : "bg-white")}>
            <option>All Priorities</option>
            {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Leads Grid - Updated with Info Icons from your notes */}
        <div className="grid gap-5">
          {filteredLeads.map((lead) => (
            <div 
              key={lead.id} 
              onClick={() => navigate(`/lead/${lead.id}`)}
              className={cn(
                "group p-8 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl hover:border-[#00a389]/40",
                isDarkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800/50" : "bg-white border-slate-100 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#00a389]/10 flex items-center justify-center text-[#00a389] font-black text-2xl shadow-inner">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter group-hover:text-[#00a389] transition-colors">{lead.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg", isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>
                      {lead.company || 'Direct Client'}
                    </span>
                    
                    {/* Visual Indicators for your new fields */}
                    <div className="flex items-center gap-2">
                        {lead.portfolio_url && <Link2 size={14} className="text-[#00a389]" title="Links attached" />}
                        {lead.meeting_notes && <FileText size={14} className="text-blue-500" title="Meeting notes available" />}
                        {lead.document_url && <Paperclip size={14} className="text-orange-500" title="Document uploaded" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 md:gap-14">
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Status</p>
                  <span className={cn(
                    "px-6 py-2 rounded-2xl text-[10px] font-black uppercase border tracking-widest block",
                    isDarkMode ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600 shadow-sm"
                  )}>
                    {lead.status}
                  </span>
                </div>

                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Follow-up</p>
                  <div className="flex items-center justify-center gap-2 text-sm font-black italic">
                    <Calendar size={16} className="text-[#00a389]" />
                    {lead.next_action_date || 'TBD'}
                  </div>
                </div>

                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:bg-[#00a389] group-hover:text-white group-hover:scale-110",
                  isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-300"
                )}>
                  <ArrowRight size={24} strokeWidth={3} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}