import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, Calendar, Link as LinkIcon, AlertCircle, Clock, ExternalLink } from 'lucide-react';
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

  const todayStr = new Date().toISOString().split('T')[0];

  // Search Logic (Name or Company search)
  const filtered = leads.filter(l => 
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overdue = filtered.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
  const todayLeads = filtered.filter(l => l.next_action_date === todayStr);
  const regular = filtered.filter(l => l.next_action_date > todayStr || !l.next_action_date);

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Modern Search Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium">{filtered.length} leads in this view</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              placeholder="Search by name, contact, or company..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => navigate('/create')} className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus size={20} /> Add Lead
          </button>
        </div>
      </header>

      {/* Sections with Tints */}
      <div className="space-y-8">
        {/* Overdue Section - Light Red Tint */}
        {overdue.length > 0 && (
          <section className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100/50 shadow-sm">
            <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-widest mb-4 ml-2">
              <AlertCircle size={16} /> Overdue Leads <span className="bg-red-100 px-2 py-0.5 rounded-full">{overdue.length}</span>
            </div>
            <div className="grid gap-3">
              {overdue.map(lead => <LeadCard key={lead.id} lead={lead} type="overdue" />)}
            </div>
          </section>
        )}

        {/* Today Section - Light Blue Tint */}
        {todayLeads.length > 0 && (
          <section className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest mb-4 ml-2">
              <Clock size={16} /> Today's Follow-ups <span className="bg-blue-100 px-2 py-0.5 rounded-full">{todayLeads.length}</span>
            </div>
            <div className="grid gap-3">
              {todayLeads.map(lead => <LeadCard key={lead.id} lead={lead} type="today" />)}
            </div>
          </section>
        )}

        {/* List for All Other Leads */}
        <section className="space-y-4 px-2">
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
          <div className="grid gap-3">
            {regular.map(lead => <LeadCard key={lead.id} lead={lead} type="normal" />)}
          </div>
        </section>
      </div>
    </div>
  );
}

function LeadCard({ lead, type }: any) {
  const navigate = useNavigate();
  const colors: any = {
    overdue: "border-l-red-500 hover:shadow-red-100/50",
    today: "border-l-blue-500 hover:shadow-blue-100/50",
    normal: "border-l-slate-300 hover:shadow-slate-100"
  };

  return (
    <div 
      onClick={() => navigate(`/lead/${lead.id}`)}
      className={`bg-white p-5 rounded-2xl border border-slate-100 border-l-4 shadow-sm transition-all cursor-pointer flex justify-between items-center group ${colors[type]}`}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{lead.name}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
            type === 'overdue' ? "bg-red-500 text-white" : type === 'today' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
          }`}>
            {type === 'overdue' ? 'Overdue' : type === 'today' ? 'Today' : lead.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{lead.status}</span>
          <span className="flex items-center gap-1.5"><LinkIcon size={14} className="text-slate-400"/> {lead.source}</span>
          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {lead.next_action_date || 'No Date'}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-primary font-bold text-xs opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
        VIEW DETAILS <ExternalLink size={16} />
      </div>
    </div>
  );
}