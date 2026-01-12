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

  const counts = {
    all: leads.length,
    overdue: leads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed').length,
    today: leads.filter(l => l.next_action_date === todayStr).length,
    closed: leads.filter(l => l.status === 'Closed' || l.status === 'Dropped').length,
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* 1. Venturemond Top Headline */}
      <header className="bg-white border-b py-6 text-center shadow-sm">
        <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Venturemond</h1>
        <p className="text-slate-400 text-xs font-bold tracking-widest mt-1">LEAD MANAGEMENT SYSTEM</p>
      </header>

      <div className="max-w-6xl mx-auto p-8 space-y-10">
        {/* 2. Middle Navigation Cards (Pakkapakkana 4) */}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <NavCard 
            label="All Leads" icon={AlertCircle} count={counts.all} color="blue" 
            active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} 
          />
          <NavCard 
            label="Overdue" icon={AlertCircle} count={counts.overdue} color="red" 
            active={activeFilter === 'overdue'} onClick={() => setActiveFilter('overdue')} 
          />
          <NavCard 
            label="Today" icon={Clock} count={counts.today} color="orange" 
            active={activeFilter === 'today'} onClick={() => setActiveFilter('today')} 
          />
          <NavCard 
            label="Closed" icon={CheckCircle} count={counts.closed} color="green" 
            active={activeFilter === 'closed'} onClick={() => setActiveFilter('closed')} 
          />
        </div>

        {/* 3. Search and Add Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              placeholder="Search by name or company..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate('/create')} 
            className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus size={20} /> Add New Lead
          </button>
        </div>

        {/* 4. Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {activeFilter === 'all' ? 'Overall' : activeFilter} Leads
            </h2>
            <span className="text-slate-400 font-bold text-sm">{displayLeads.length} Total</span>
          </div>

          <div className="grid gap-4">
            {displayLeads.length > 0 ? (
              displayLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onClick={() => navigate(`/lead/${lead.id}`)} />
              ))
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No leads found in this section.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern Navigation Card Component
function NavCard({ label, icon: Icon, count, color, active, onClick }: any) {
  const activeStyles: any = {
    blue: "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20",
    red: "border-red-500 bg-red-50 text-red-600 ring-2 ring-red-500/20",
    orange: "border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-500/20",
    green: "border-green-500 bg-green-50 text-green-600 ring-2 ring-green-500/20",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-3 bg-white hover:shadow-xl",
        active ? activeStyles[color] : "border-slate-100 text-slate-400 hover:border-slate-200"
      )}
    >
      <Icon size={28} className={active ? "text-inherit" : "text-slate-300"} />
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      <span className={cn("text-3xl font-black", active ? "text-slate-900" : "text-slate-300")}>{count}</span>
    </button>
  );
}

function LeadCard({ lead, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer flex justify-between items-center group"
    >
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-xl group-hover:text-primary transition-colors">{lead.name}</h3>
        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{lead.status}</span>
          <span className="flex items-center gap-1.5"><LinkIcon size={14}/> {lead.source}</span>
          <span className="flex items-center gap-1.5"><Calendar size={14}/> {lead.next_action_date || 'TBD'}</span>
        </div>
      </div>
      <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
        →
      </div>
    </div>
  );
}