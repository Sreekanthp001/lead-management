import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, Calendar as CalendarIcon, Link as LinkIcon, AlertCircle, Clock } from 'lucide-react';
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
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Logic to separate leads into categories
  const overdueLeads = leads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
  const todayLeads = leads.filter(l => l.next_action_date === todayStr);
  const otherLeads = leads.filter(l => l.next_action_date > todayStr || !l.next_action_date || l.status === 'Closed');

  const filteredLeads = (list: any[]) => list.filter(l => 
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{leads.length} leads total</p>
        </div>
        <button onClick={() => navigate('/create')} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus size={18} /> Add Lead
        </button>
      </header>

      {/* Overdue Section - Replacing Core Principles */}
      {overdueLeads.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <AlertCircle size={20} /> Overdue <span className="bg-red-100 px-2 py-0.5 rounded-full text-xs">{overdueLeads.length}</span>
          </div>
          {filteredLeads(overdueLeads).map(lead => (
            <LeadCard key={lead.id} lead={lead} type="overdue" onClick={() => navigate(`/lead/${lead.id}`)} />
          ))}
        </section>
      )}

      {/* Today's Follow-ups Section */}
      {todayLeads.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-orange-600 font-bold">
            <Clock size={20} /> Today's Follow-ups <span className="bg-orange-100 px-2 py-0.5 rounded-full text-xs">{todayLeads.length}</span>
          </div>
          {filteredLeads(todayLeads).map(lead => (
            <LeadCard key={lead.id} lead={lead} type="today" onClick={() => navigate(`/lead/${lead.id}`)} />
          ))}
        </section>
      )}

      {/* All Other Leads */}
      <section className="space-y-4 pt-4 border-t">
        <h2 className="text-lg font-semibold text-gray-700">All Leads</h2>
        {filteredLeads(otherLeads).length > 0 ? (
          filteredLeads(otherLeads).map(lead => (
            <LeadCard key={lead.id} lead={lead} type="normal" onClick={() => navigate(`/lead/${lead.id}`)} />
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No other leads to show.</p>
        )}
      </section>
    </div>
  );
}

// Sub-component for the Card UI
function LeadCard({ lead, type, onClick }: any) {
  const borderColors: any = {
    overdue: "border-l-red-500",
    today: "border-l-orange-500",
    normal: "border-l-blue-400"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white border-y border-r border-l-4 ${borderColors[type]} rounded-r-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{lead.name}</h3>
            {type === 'overdue' && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-black">Overdue</span>}
            {type === 'today' && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-black">Today</span>}
          </div>
          <div className="flex gap-3 items-center text-xs">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold">{lead.status}</span>
            <span className="text-muted-foreground flex items-center gap-1 italic"><LinkIcon size={12} /> {lead.source}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <CalendarIcon size={14} />
            <span>Next action: <b>{lead.next_action_date || 'Not set'}</b></span>
          </div>
        </div>
        <button className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">VIEW DETAILS →</button>
      </div>
    </div>
  );
}