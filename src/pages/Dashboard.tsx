import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Trash2, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      setLoading(true);
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
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      toast.success("Lead deleted successfully");
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (err: any) {
      toast.error("Error deleting lead: " + err.message);
    }
  };

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };

  const filteredLeads = leads.filter(l => 
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.contact || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Venturemond CRM</h1>
          <p className="text-muted-foreground">Lead Management System</p>
        </div>
        <button 
          onClick={() => navigate('/create-lead')}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add New Lead
        </button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input 
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          placeholder="Search by name or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-sm">Company/Name</th>
              <th className="p-4 font-semibold text-sm">Contact</th>
              <th className="p-4 font-semibold text-sm">Next Action Date</th>
              <th className="p-4 font-semibold text-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr 
                key={lead.id} 
                className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${isOverdue(lead.next_action_date) ? 'bg-red-50/30' : ''}`}
                onClick={() => navigate(`/lead/${lead.id}`)}
              >
                <td className="p-4">
                  <div className="font-medium text-gray-900">{lead.name || 'N/A'}</div>
                  {isOverdue(lead.next_action_date) && (
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Overdue</span>
                  )}
                </td>
                <td className="p-4 text-gray-600 text-sm">{lead.contact || 'No contact'}</td>
                <td className="p-4 text-sm text-gray-600">{lead.next_action_date || 'Not set'}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-4">
                    <button className="text-primary hover:text-primary/80 transition-colors" title="View Details">
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(lead.id, e)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Lead"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="p-12 text-center text-gray-500">No leads found in your database.</div>
        )}
      </div>
    </div>
  );
}