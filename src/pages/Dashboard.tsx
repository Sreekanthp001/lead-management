// src/pages/Dashboard.tsx
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

  // Search Logic
  const filtered = leads.filter(l => 
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overdue = filtered.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
  const today = filtered.filter(l => l.next_action_date === todayStr);
  const others = filtered.filter(l => l.next_action_date > todayStr || !l.next_action_date);

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium">{filtered.length} Leads found</p>
        </div>
        
        {/* Modern Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by name or company..."
              className="pl-10 pr-4 py-2.5 w-80 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => navigate('/create')} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus size={20} /> Add Lead
          </button>
        </div>
      </header>

      {/* Overdue Section - Light Red Tint */}
      {overdue.length > 0 && (
        <section className="bg-red-50/30 p-6 rounded-3xl border border-red-100">
          <div className="flex items-center gap-2 text-red-600 font-black text-sm uppercase tracking-widest mb-4">
            <AlertCircle size={18} /> Overdue Leads
          </div>
          <div className="grid gap-4">
            {overdue.map(lead => <LeadCard key={lead.id} lead={lead} type="overdue" />)}
          </div>
        </section>
      )}

      {/* Today Section - Light Blue Tint */}
      {today.length > 0 && (
        <section className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest mb-4">
            <Clock size={18} /> Today's Follow-ups
          </div>
          <div className="grid gap-4">
            {today.map(lead => <LeadCard key={lead.id} lead={lead} type="today" />)}
          </div>
        </section>
      )}

      {/* Regular List */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 px-1">All Leads</h2>
        <div className="grid gap-3">
          {others.map(lead => <LeadCard key={lead.id} lead={lead} type="normal" />)}
        </div>
      </section>
    </div>
  );
}

function LeadCard({ lead, type }: any) {
  const navigate = useNavigate();
  const styles: any = {
    overdue: "bg-white border-l-red-500 hover:shadow-red-100",
    today: "bg-white border-l-blue-500 hover:shadow-blue-100",
    normal: "bg-white border-l-slate-300 hover:shadow-slate-100"
  };

  return (
    <div 
      onClick={() => navigate(`/lead/${lead.id}`)}
      className={cn(
        "group p-5 rounded-2xl border border-slate-100 border-l-4 shadow-sm transition-all cursor-pointer flex justify-between items-center",
        styles[type]
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{lead.name}</h3>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-black uppercase",
            type === 'overdue' ? "bg-red-500 text-white" : "bg-blue-100 text-blue-700"
          )}>{type === 'overdue' ? 'Overdue' : 'Today'}</span>
        </div>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md"><Users size={12}/> {lead.status}</span>
          <span className="flex items-center gap-1.5"><LinkIcon size={12}/> {lead.source}</span>
          <span className="flex items-center gap-1.5"><Calendar size={12}/> {lead.next_action_date}</span>
        </div>
      </div>
      <ExternalLink size={20} className="text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
    </div>
  );
}