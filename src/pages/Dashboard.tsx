import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ filter = 'all' }: { filter?: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      
      const todayStr = new Date().toISOString().split('T')[0];
      let filteredData = data || [];

      // Category logic based on URL/Filter prop
      if (filter === 'overdue') {
        filteredData = filteredData.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
      } else if (filter === 'today' || filter === 'followups') {
        filteredData = filteredData.filter(l => l.next_action_date === todayStr);
      } else if (filter === 'active') {
        filteredData = filteredData.filter(l => l.status !== 'Closed' && l.status !== 'Dropped');
      } else if (filter === 'closed') {
        filteredData = filteredData.filter(l => l.status === 'Closed' || l.status === 'Dropped');
      }

      setLeads(filteredData);
      setLoading(false);
    };
    fetchLeads();
  }, [filter]); // Filter change ayinappudu data refresh avthundi

  const finalLeads = leads.filter(l => 
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 capitalize">{filter.replace('all', 'Dashboard')} View</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              placeholder="Search leads..." 
              className="pl-9 pr-4 py-2 bg-gray-50 border rounded-lg text-sm outline-none w-64 focus:ring-2 focus:ring-primary/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => navigate('/create')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all">
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Lead Details</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Follow-up</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {finalLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => navigate(`/lead/${lead.id}`)}>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{lead.name}</div>
                  <div className="text-[11px] text-gray-400 uppercase font-medium">{lead.company || 'Personal'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tight">
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium">{lead.source}</td>
                <td className="px-6 py-4 text-gray-500">{lead.next_action_date || 'Not Set'}</td>
                <td className="px-6 py-4 text-right">
                  <ExternalLink size={14} className="inline text-gray-300 hover:text-primary transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {finalLeads.length === 0 && (
          <div className="p-20 text-center text-gray-400 italic">No leads found in this category.</div>
        )}
      </div>
    </div>
  );
}