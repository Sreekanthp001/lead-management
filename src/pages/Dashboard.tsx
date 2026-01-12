import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Calendar as CalendarIcon, Link as LinkIcon, AlertCircle, Clock, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardProps {
  filter?: 'all' | 'overdue' | 'today' | 'active' | 'closed';
}

export default function Dashboard({ filter = 'all' }: DashboardProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Logic
  const getFilteredData = () => {
    if (filter === 'overdue') return leads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
    if (filter === 'today') return leads.filter(l => l.next_action_date === todayStr);
    if (filter === 'active') return leads.filter(l => l.status !== 'Closed' && l.status !== 'Dropped');
    if (filter === 'closed') return leads.filter(l => l.status === 'Closed' || l.status === 'Dropped');
    return leads;
  };

  const displayLeads = getFilteredData();
  const overdueLeads = displayLeads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
  const todayLeads = displayLeads.filter(l => l.next_action_date === todayStr);
  const regularLeads = displayLeads.filter(l => l.next_action_date > todayStr || !l.next_action_date || l.status === 'Closed' || l.status === 'Dropped');

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 capitalize">{filter} Dashboard</h1>
          <p className="text-sm text-muted-foreground">{displayLeads.length} leads total</p>
        </div>
        <button onClick={() => navigate('/create')} className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 font-bold shadow-md">
          <Plus size={20} /> Add Lead
        </button>
      </header>

      {/* Overdue Section */}
      {(filter === 'all' || filter === 'overdue') && overdueLeads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <AlertCircle size={20} /> Overdue <span className="bg-red-100 px-2 py-0.5 rounded-full text-xs">{overdueLeads.length}</span>
          </div>
          {overdueLeads.map(lead => <LeadCard key={lead.id} lead={lead} type="overdue" />)}
        </div>
      )}

      {/* Today Section */}
      {(filter === 'all' || filter === 'today') && todayLeads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-orange-500 font-bold">
            <Clock size={20} /> Today's Follow-ups <span className="bg-orange-100 px-2 py-0.5 rounded-full text-xs">{todayLeads.length}</span>
          </div>
          {todayLeads.map(lead => <LeadCard key={lead.id} lead={lead} type="today" />)}
        </div>
      )}

      {/* Others Section */}
      {regularLeads.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">All Leads</h2>
          {regularLeads.map(lead => <LeadCard key={lead.id} lead={lead} type="normal" />)}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, type }: any) {
  const navigate = useNavigate();
  const colors: any = {
    overdue: "border-l-red-500 bg-red-50/30",
    today: "border-l-blue-500 bg-blue-50/30",
    normal: "border-l-gray-300 bg-white"
  };

  return (
    <div className={`border rounded-xl p-5 shadow-sm transition-all hover:shadow-md ${colors[type]} border-l-4 mb-4`}>
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-xl text-gray-900">{lead.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase text-white ${type === 'overdue' ? 'bg-red-500' : 'bg-blue-600'}`}>
              {type === 'overdue' ? 'Overdue' : type === 'today' ? 'Today' : lead.status}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{lead.status}</span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <LinkIcon size={12} /> {lead.source}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center gap-2 font-medium text-primary">
               → {lead.last_note || "Follow up with client"}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon size={14} /> {lead.next_action_date}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => navigate(`/lead/${lead.id}`)} className="p-2 hover:bg-white rounded-full text-blue-600 border shadow-sm">
            <Eye size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}