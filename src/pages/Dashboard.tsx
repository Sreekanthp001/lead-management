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
      setLeads(data || []);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const filtered = leads.filter(l => 
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Search leads..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => navigate('/create')} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
          <Plus size={18} /> Add Lead
        </button>
      </header>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Name/Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Next Action</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/lead/${lead.id}`)}>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{lead.name}</div>
                  <div className="text-xs text-gray-400">{lead.company || 'No Company'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{lead.source}</td>
                <td className="px-6 py-4 text-gray-500">{lead.next_action_date || 'N/A'}</td>
                <td className="px-6 py-4 text-right">
                  <ExternalLink size={16} className="inline text-gray-300 group-hover:text-primary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}