import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, ExternalLink, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Performance Optimization: Filtering in-memory
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

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => 
        (l.name || '').toLowerCase().includes(q) || 
        (l.company || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allLeads, filter, searchQuery]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 capitalize tracking-tight">
            {filter.replace('all', 'Dashboard')} View
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Total Records: {filteredLeads.length}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search leads instantly..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate('/create')} 
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus size={18} /> Add Lead
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-5">Lead Information</th>
                <th className="px-8 py-5">Current Status</th>
                <th className="px-8 py-5">Source</th>
                <th className="px-8 py-5">Next Follow-up</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-blue-50/20 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/lead/${lead.id}`)}
                >
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-900 group-hover:text-primary transition-colors text-base">{lead.name}</div>
                    <div className="text-[11px] text-slate-400 font-black uppercase tracking-tighter">{lead.company || 'Direct Client'}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase shadow-sm">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-semibold">{lead.source}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Calendar size={14} className="text-slate-300" />
                      {lead.next_action_date || 'No Date Set'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      →
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="py-32 text-center bg-white">
            <Filter className="mx-auto text-slate-100 mb-4" size={48} />
            <p className="text-slate-400 font-bold italic tracking-tight">No records matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}