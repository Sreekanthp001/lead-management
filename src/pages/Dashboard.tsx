import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search } from 'lucide-react';

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        // Direct fetch from your leads table
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(l => 
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.contact || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Branding Fix: Changed to Venturemond */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Venturemond CRM</h1>
        <p className="text-muted-foreground">Lead Management System</p>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input 
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Company Name</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Source</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium">{lead.name || 'N/A'}</td>
                <td className="p-4 text-gray-600">{lead.contact || 'No Contact'}</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{lead.source}</span></td>
                <td className="p-4"><span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">{lead.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="p-10 text-center text-gray-500">No leads found in database.</div>
        )}
      </div>
    </div>
  );
}