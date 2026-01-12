import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LeadSection } from '@/components/LeadSection';
import { isToday, isPast, isFuture, parseISO, isValid } from 'date-fns';
import { AlertCircle, Clock, Zap, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        // Using the exact table name from your screenshot
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const safeData = (data || []).map(lead => {
          // 1. Safe Date Handling
          let dateObj = new Date();
          if (lead.next_action_date) {
            const parsed = parseISO(lead.next_action_date);
            if (isValid(parsed)) dateObj = parsed;
          }

          // 2. Exact Mapping from Database
          return {
            id: String(lead.id || Math.random()),
            name: String(lead.name || 'Unnamed Company'),
            primaryContact: String(lead.contact || 'No Contact'),
            linkedinUrl: String(lead.linkedin_url || ''),
            status: String(lead.status || 'New'),
            source: String(lead.source || 'Other'),
            nextActionDate: dateObj,
            tags: [] // Providing empty array to prevent map() crashes
          };
        });

        setLeads(safeData);
      } catch (err) {
        console.error("Supabase Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return leads.filter(l => 
      l.name.toLowerCase().includes(query) || 
      l.primaryContact.toLowerCase().includes(query)
    );
  }, [leads, searchQuery]);

  // Grouping logic with status-safe checks
  const { overdue, today, upcoming, closed } = useMemo(() => {
    return {
      overdue: filteredLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isPast(l.nextActionDate) && !isToday(l.nextActionDate)),
      today: filteredLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isToday(l.nextActionDate)),
      upcoming: filteredLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isFuture(l.nextActionDate) && !isToday(l.nextActionDate)),
      closed: filteredLeads.filter(l => ['closed', 'dropped'].includes(l.status.toLowerCase()))
    };
  }, [filteredLeads]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading database leads...
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Daily Review</h1>
        <p className="text-muted-foreground">Connected to Supabase: {leads.length} leads</p>
      </div>

      <Input 
        placeholder="Search name or contact..." 
        className="mb-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="space-y-6">
        {overdue.length > 0 && <LeadSection title="Overdue" icon={<AlertCircle />} leads={overdue} variant="overdue" />}
        <LeadSection title="Today" icon={<Clock />} leads={today} variant="today" />
        <LeadSection title="Upcoming" icon={<Zap />} leads={upcoming} variant="active" />
        {closed.length > 0 && <LeadSection title="Archive" icon={<CheckCircle2 />} leads={closed} variant="closed" />}
      </div>
    </div>
  );
}