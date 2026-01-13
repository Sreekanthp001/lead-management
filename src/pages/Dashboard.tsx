import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, Calendar, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const navigate = useNavigate();

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

    // Sidebar Category Filter
    if (filter === 'overdue') {
      list = list.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
    } else if (filter === 'today' || filter === 'followups') {
      list = list.filter(l => l.next_action_date === todayStr);
    } else if (filter === 'active') {
      list = list.filter(l => l.status !== 'Closed' && l.status !== 'Dropped');
    } else if (filter === 'closed') {
      list = list.filter(l => l.status === 'Closed' || l.status === 'Dropped');
    }

    // New Dropdown Filters (Under Add Lead)
    if (statusFilter !== 'All Statuses') {
      list = list.filter(l => l.status === statusFilter);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => (l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q));
    }
    return list;
  }, [allLeads, filter, searchQuery, statusFilter]);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Main Filters Area */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard View</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Total Records: {filteredLeads.length}</p>
          </div>
          <button 
            onClick={() => navigate('/create')} 
            className="bg-[#00a389] hover:bg-[#008f78] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Plus size={20} /> Add Lead
          </button>
        </div>

        {/* Filters Row - Exact placement as per your requirement */}
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search leads instantly..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-white transition-all"
          >
            <option>All Statuses</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Interested</option>
            <option>Follow-up</option>
            <option>Closed</option>
            <option>Dropped</option>
          </select>

          <select 
            className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-white transition-all"
          >
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-10 py-6">Lead Information</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6">Source</th>
              <th className="px-10 py-6">Next Follow-up</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/50 cursor-pointer transition-all group" onClick={() => navigate(`/lead/${lead.id}`)}>
                <td className="px-10 py-6">
                  <div className="font-bold text-slate-900 group-hover:text-[#00a389] transition-colors text-base">{lead.name}</div>
                  <div className="text-[11px] text-slate-400 font-black uppercase tracking-tighter">{lead.company || 'Direct Client'}</div>
                </td>
                <td className="px-10 py-6">
                  <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase shadow-sm">
                    {lead.status}
                  </span>
                </td>
                <td className="px-10 py-6 text-slate-500 font-bold">{lead.source}</td>
                <td className="px-10 py-6 text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-300" />
                    {lead.next_action_date || 'TBD'}
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 group-hover:bg-[#00a389] group-hover:text-white transition-all shadow-inner">
                    →
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}