import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2, Search, Plus, Filter,
  ArrowRight, Building2, Trash2, Users, Target, UserCheck, X, Copy, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLeads } from '@/contexts/LeadsContext';
import React, { memo } from 'react';
import { Sun, Moon } from 'lucide-react';

// Memoized Stat Card for Performance
const StatCard = memo(({ label, val, id, isActive, onClick }: {
  label: string, val: number, id: string, isActive: boolean, onClick: () => void
}) => (
  <div
    onClick={onClick}
    className={cn(
      "p-4 rounded-3xl border bg-white dark:bg-slate-900 cursor-pointer transition-all hover:border-[#00a389] group",
      isActive ? "border-[#00a389] ring-4 ring-[#00a389]/10" : "dark:border-slate-800"
    )}
  >
    <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1 group-hover:text-[#00a389] transition-colors">{label}</p>
    <p className="text-2xl font-black text-slate-900 dark:text-white">{val}</p>
  </div>
));

// Memoized Lead Row for Performance
const LeadRow = memo(({ lead, isAdmin, navigate, onClone, onDelete }: {
  lead: any, isAdmin: boolean, navigate: any, onClone: any, onDelete: any
}) => (
  <tr
    onClick={() => navigate(`/lead/${lead.id}`)}
    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group border-b border-slate-100 dark:border-slate-800"
  >
    <td className="px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-[#00a389] border-2 border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 group-hover:border-[#00a389] transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-[#00a389]/5 dark:bg-[#00a389]/10" />
          <span className="relative z-10">{lead.name?.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-black dark:text-white group-hover:text-[#00a389] transition-colors">{lead.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase">{lead.company || 'Direct'}</p>
            <span className="text-[10px] text-slate-400">•</span>
            <p className="text-[9px] text-[#00a389] font-black uppercase">@{lead.created_by_name?.split(' ')[0] || 'Me'}</p>
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={cn(
        "text-[9px] font-semibold uppercase px-2.5 py-1.5 rounded-lg shadow-sm border",
        lead.status === 'New' ? "bg-blue-600 text-white border-blue-700 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-900/30" :
          (lead.status === 'Contacted' || lead.status === 'Qualified' || lead.status === 'In-Progress') ? "bg-amber-500 text-white border-amber-600 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-900/30" :
            lead.status === 'Won' ? "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500/20 dark:text-[#52ffde] dark:border-emerald-900/30" :
              lead.status === 'Lost' ? "bg-red-600 text-white border-red-700 dark:bg-red-500/20 dark:text-red-400 dark:border-red-900/30" :
                "bg-slate-600 text-white border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
      )}>
        {lead.status === 'Qualified' ? 'In-Progress' : lead.status}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-col">
        <p className="text-xs font-bold dark:text-slate-300 truncate max-w-[220px]">{lead.next_action || 'Pending Contact'}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{lead.next_action_date || 'No Date'}</p>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-center gap-3">
        {isAdmin && (
          <button
            onClick={(e) => onClone(lead.id, e)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#00a389] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30"
            title="Clone"
          >
            <Copy size={16} />
          </button>
        )}
        <button onClick={(e) => onDelete(lead.id, e)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800/30">
          <Trash2 size={16} />
        </button>
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-[#00a389] group-hover:text-white transition-all border border-slate-200 dark:border-slate-700">
          <ArrowRight size={16} />
        </div>
      </div>
    </td>
  </tr>
));

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const { session, user, role, isAdmin } = useAuth();
  const { leads: allLeads, setLeads: setAllLeads, addOptimisticLead, removeOptimisticLead, fetchLeads, loading, lastFetched } = useLeads();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(() => {
    if (filter === 'overdue') return 'Overdue';
    if (filter === 'today') return 'Today Followups';
    if (filter === 'active') return 'Active Leads';
    if (filter === 'closed') return 'Closed / Dropped';
    return null;
  });

  const todayStr = new Date().toLocaleDateString('en-CA');

  // Sync activeStatFilter when filter prop changes
  useEffect(() => {
    if (filter === 'overdue') setActiveStatFilter('Overdue');
    else if (filter === 'today') setActiveStatFilter('Today Followups');
    else if (filter === 'active') setActiveStatFilter('Active Leads');
    else if (filter === 'closed') setActiveStatFilter('Closed / Dropped');
    else if (filter === 'all') setActiveStatFilter(null);
  }, [filter]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const userId = session?.user?.id;
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const init = async () => {
      if (userId) {
        try {
          await fetchLeads(userId);
        } catch (err) {
          console.error("Dashboard initial fetch error:", err);
        }
      }
    };
    init();

    // 1-second fallback to ensure the dashboard shows even if fetch is slow
    const timer = setTimeout(() => {
      // LeadsContext already handles resetting loading to false after 1s
    }, 1000);

    return () => clearTimeout(timer);
  }, [userId, fetchLeads]);



  // --- FILTERING LOGIC ---
  const filteredLeads = useMemo(() => {
    let list = [...allLeads];

    if (activeStatFilter === 'Overdue') {
      list = list.filter(l => l.next_action_date && l.next_action_date < todayStr && !['Lost', 'Won', 'Closed', 'Dropped'].includes(l.status));
    } else if (activeStatFilter === 'Today Followups') {
      list = list.filter(l => {
        const createdDate = l.created_at ? new Date(l.created_at).toLocaleDateString('en-CA') : null;
        return l.next_action_date === todayStr || createdDate === todayStr;
      });
    } else if (activeStatFilter === 'Active Leads') {
      list = list.filter(l => !['Lost', 'Won', 'Closed', 'Dropped'].includes(l.status));
    } else if (activeStatFilter === 'Closed / Dropped') {
      list = list.filter(l => ['Lost', 'Won', 'Closed', 'Dropped'].includes(l.status));
    }

    if (statusFilter !== 'All') {
      list = list.filter(l => l.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      list = list.filter(l => l.priority === priorityFilter);
    }

    if (sourceFilter !== 'All') {
      list = list.filter(l => l.source === sourceFilter);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.created_by_email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allLeads, debouncedSearch, statusFilter, priorityFilter, sourceFilter, activeStatFilter, todayStr]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (processingId) return;
    if (!window.confirm("Delete this lead?")) return;

    // Optimistic UI Update
    removeOptimisticLead(id);
    setProcessingId(id);

    try {
      // USE match instead of eq for multiple conditions to satisfy RLS and prevent failures
      const { error } = await supabase
        .from('leads')
        .delete()
        .match({ id: id, user_id: userId });

      if (error) throw error;
      toast.success("Lead Deleted");
    } catch (err: any) {
      console.error("Delete Lead Error:", err);
      toast.error("Failed to delete lead. Check permissions.");
      fetchLeads(userId); // Re-fetch to restore if needed
    } finally {
      setProcessingId(null);
    }
  };

  const handleCloneLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || processingId) return;

    setProcessingId(leadId);

    // Fetch original lead data
    const { data: original, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError) {
      console.error("Clone Fetch Error:", fetchError);
      toast.error("Failed to fetch lead data");
      setProcessingId(null);
      return;
    }

    // Destructure to remove system fields
    const { id, created_at, user_id, updated_at, ...rest } = original;

    const newLead = {
      ...rest,
      name: `${original.name} (Copy)`,
      user_id: userId,
      assigned_to: userId,
      created_by_name: user?.user_metadata?.full_name || user?.email || 'Admin',
      created_by_email: user?.email,
      created_by_role: role
    };

    // OPTIMISTIC UI: Add cloned lead immediately
    const optimisticLead = {
      id: 'temp-clone-' + Date.now(),
      created_at: new Date().toISOString(),
      ...newLead
    };

    addOptimisticLead(optimisticLead as any);
    toast.success("Lead cloned!");
    setProcessingId(null);

    // BACKGROUND SYNC: Insert to database
    supabase.from('leads').insert([newLead]).select().single().then(({ data: inserted, error: insertError }) => {
      if (insertError) {
        console.error("Background Clone Error:", insertError);
        // Remove optimistic entry on error
        removeOptimisticLead(optimisticLead.id);
        toast.error("Clone sync failed");
      } else if (inserted) {
        // Replace temp entry with real data
        setAllLeads(prev => prev.map(l => l.id === optimisticLead.id ? inserted : l));
      }
    });
  };

  // Bypass spinner if we already have cached data, even if loading is true
  // Also force show after 1 second if data is present
  if (loading && allLeads.length === 0) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 bg-card p-10 rounded-[40px] shadow-2xl border border-border animate-in zoom-in duration-300">
        <Loader2 className="animate-spin text-[#00a389]" size={48} />
        <div className="text-center">
          <p className="text-sm font-black text-foreground uppercase italic tracking-tighter">Synchronizing Intel</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Please wait...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-8 w-full bg-background text-foreground font-['Outfit']">
      <div className="max-w-full mx-auto space-y-6">

        {/* Header */}
        <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black italic uppercase text-[#00a389]">Venturemond</h1>
              <span className="text-slate-300 dark:text-slate-700 text-2xl font-light">/</span>
              <h2 className="text-xl font-bold text-slate-500 uppercase">{activeStatFilter || 'Dashboard'}</h2>
              {activeStatFilter && (
                <button
                  onClick={() => {
                    setActiveStatFilter(null);
                    setSearchQuery('');
                    setStatusFilter('All');
                    setPriorityFilter('All');
                    setSourceFilter('All');
                  }}
                  className="text-[9px] bg-red-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 ml-2 font-bold"
                > <X size={10} /> RESET</button>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Showing {filteredLeads.length} of {allLeads.length} Leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-card border border-border shadow-sm hover:border-[#00a389] transition-all duration-300 group active:scale-95"
              title={theme === 'dark' ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-yellow-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={18} className="text-[#222c3f]" />
              )}
            </button>
            <button onClick={() => navigate('/create')} className="bg-[#00a389] text-white px-5 py-3 rounded-xl font-black flex items-center gap-2 text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              <Plus size={18} /> Add Lead
            </button>
          </div>
        </div>



        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', val: allLeads.length, id: 'total' },
            {
              label: 'Today Followups',
              val: allLeads.filter(l => {
                const createdDate = l.created_at ? new Date(l.created_at).toLocaleDateString('en-CA') : null;
                return l.next_action_date === todayStr || createdDate === todayStr;
              }).length,
              id: 'today'
            },
            { label: 'Overdue', val: allLeads.filter(l => l.next_action_date && l.next_action_date < todayStr && !['Lost', 'Won', 'Closed', 'Dropped'].includes(l.status)).length, id: 'overdue' },
            { label: 'Active Leads', val: allLeads.filter(l => !['Lost', 'Won', 'Closed', 'Dropped'].includes(l.status)).length, id: 'active' }
          ].map((s) => (
            <StatCard
              key={s.id}
              label={s.label}
              val={s.val}
              id={s.id}
              isActive={activeStatFilter === s.label}
              onClick={() => setActiveStatFilter(s.label === activeStatFilter ? null : s.label)}
            />
          ))}
        </div>

        {/* Compact Search & Filter Section */}
        <div className="relative z-20 bg-white dark:bg-[#0b0f1a] p-3 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800/60 transition-all">
          <div className="flex flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" size={18} />
              <input
                placeholder="Search by name or company..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none outline-none font-bold text-sm dark:text-slate-200 focus:ring-2 focus:ring-[#00a389]/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-6 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
                showFilters
                  ? "bg-[#00a389] text-white border-[#00a389] shadow-lg shadow-[#00a389]/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#00a389] hover:text-[#00a389]"
              )}
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>

          {/* Expandable Filter Row */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t dark:border-slate-800/50">
              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 rounded-lg bg-slate-50 dark:bg-slate-950 border dark:border-slate-800/50 pl-3 pr-8 font-bold outline-none text-[11px] appearance-none cursor-pointer hover:ring-2 hover:ring-[#00a389]/20 transition-all dark:text-slate-300"
                >
                  <option value="All">All Statuses</option>
                  {['New', 'Contacted', 'Qualified', 'Won', 'Lost'].map(s => (
                    <option key={s} value={s}>{s === 'Qualified' ? 'In-Progress' : s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" size={14} />
              </div>

              {/* Priority Dropdown */}
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full h-10 rounded-lg bg-slate-50 dark:bg-slate-950 border dark:border-slate-800/50 pl-3 pr-8 font-bold outline-none text-[11px] appearance-none cursor-pointer hover:ring-2 hover:ring-[#00a389]/20 transition-all dark:text-slate-300"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" size={14} />
              </div>

              {/* Source Dropdown */}
              <div className="relative">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full h-10 rounded-lg bg-slate-50 dark:bg-slate-950 border dark:border-slate-800/50 pl-3 pr-8 font-bold outline-none text-[11px] appearance-none cursor-pointer hover:ring-2 hover:ring-[#00a389]/20 transition-all dark:text-slate-300"
                >
                  <option value="All">All Sources</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Upwork">Upwork</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" size={14} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#00a389] italic">My Leads Pipeline</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Lead Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Current Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Next Action</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      isAdmin={isAdmin}
                      navigate={navigate}
                      onClone={handleCloneLead}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-32 text-center bg-slate-50/30 dark:bg-slate-900/10">
                      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-800 mb-6 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-[#00a389]/5 group-hover:bg-[#00a389]/10 transition-colors" />
                          <Target className="text-slate-200 dark:text-slate-700 relative z-10 group-hover:scale-110 transition-transform" size={48} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Zero Leads Found</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 max-w-xs leading-relaxed">
                          Your pipeline is currently empty. Start growing your intelligence by adding your first lead.
                        </p>
                        <button
                          onClick={() => navigate('/create')}
                          className="mt-8 px-8 py-3 bg-[#00a389] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#00a389]/20 hover:scale-105 transition-all"
                        >
                          Add Your First Lead
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}