import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Plus, Calendar, Link as LinkIcon, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'today' | 'closed'>('all');
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

  // Counts for the 4 Cards
  const counts = {
    all: leads.length,
    overdue: leads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed').length,
    today: leads.filter(l => l.next_action_date === todayStr).length,
    closed: leads.filter(l => l.status === 'Closed' || l.status === 'Dropped').length,
  };

  // Filter Logic based on selected card
  const getFilteredLeads = () => {
    let list = leads;
    if (activeFilter === 'overdue') {
      list = leads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed');
    } else if (activeFilter === 'today') {
      list = leads.filter(l => l.next_action_date === todayStr);
    } else if (activeFilter === 'closed') {
      list = leads.filter(l => l.status === 'Closed' || l.status === 'Dropped');
    }
    
    return list.filter(l => (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const displayLeads = getFilteredLeads();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 1. Pakka Pakkana 4 Filter Cards  */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FilterCard 
          label="Dashboard" icon={AlertCircle} count={counts.all} color="blue" 
          active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} 
        />
        <FilterCard 
          label="Overdue" icon={AlertCircle} count={counts.overdue} color="red" 
          active={activeFilter === 'overdue'} onClick={() => setActiveFilter('overdue')} 
        />
        <FilterCard 
          label="Today" icon={Clock} count={counts.today} color="orange" 
          active={activeFilter === 'today'} onClick={() => setActiveFilter('today')} 
        />
        <FilterCard 
          label="Closed" icon={CheckCircle} count={counts.closed} color="green" 
          active={activeFilter === 'closed'} onClick={() => setActiveFilter('closed')} 
        />
      </div>

      {/* 2. Search and Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            placeholder="Search leads..." 
            className="w-full pl-10 pr-4 py-2 border-none focus:ring-0 text-sm outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => navigate('/create')} className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all w-full md:w-auto justify-center">
          <Plus size={20} /> Add Lead
        </button>
      </div>

      {/* 3. Dynamic Leads List (Kinda vasthundi) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 capitalize px-2">{activeFilter} Leads</h2>
        {displayLeads.length > 0 ? (
          <div className="grid gap-3">
            {displayLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} onClick={() => navigate(`/lead/${lead.id}`)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
            <p className="text-slate-400">No leads found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for the 4 Top Cards
function FilterCard({ label, icon: Icon, count, color, active, onClick }: any) {
  const colors: any = {
    blue: active ? "bg-blue-600 text-white shadow-blue-200" : "bg-white text-blue-600",
    red: active ? "bg-red-600 text-white shadow-red-200" : "bg-white text-red-600",
    orange: active ? "bg-orange-600 text-white shadow-orange-200" : "bg-white text-orange-600",
    green: active ? "bg-green-600 text-white shadow-green-200" : "bg-white text-green-600",
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-5 rounded-3xl border cursor-pointer transition-all shadow-sm flex flex-col items-center text-center gap-2 hover:-translate-y-1",
        colors[color]
      )}
    >
      <Icon size={24} />
      <span className="text-xs font-black uppercase tracking-widest opacity-80">{label}</span>
      <span className="text-2xl font-black">{count}</span>
    </div>
  );
}

function LeadCard({ lead, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
    >
      <div className="space-y-2">
        <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{lead.name}</h3>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <span className="bg-slate-100 px-2 py-1 rounded-md">{lead.status}</span>
          <span className="flex items-center gap-1"><LinkIcon size={12}/> {lead.source}</span>
          <span className="flex items-center gap-1"><Calendar size={12}/> {lead.next_action_date || 'No Date'}</span>
        </div>
      </div>
      <div className="text-primary font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">VIEW →</div>
    </div>
  );
}