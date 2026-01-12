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
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Force convert every field to a safe type to prevent Error #130
        const safeData = (data || []).map(lead => {
          let dateObj = new Date();
          if (lead.next_action_date) {
            const parsed = parseISO(lead.next_action_date);
            if (isValid(parsed)) dateObj = parsed;
          }

          return {
            id: String(lead.id || Math.random()),
            name: String(lead.name || 'Unnamed'),
            primaryContact: String(lead.contact || 'No Contact'),
            linkedinUrl: String(lead.linkedin_url || ''),
            status: String(lead.status || 'New'),
            source: String(lead.source || 'Other'),
            nextActionDate: dateObj,
            tags: [] 
          };
        });

        setLeads(safeData);
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.primaryContact.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  const sections = useMemo(() => {
    return {
      overdue: filteredLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isPast(l.nextActionDate) && !isToday(l.nextActionDate)),
      today: filteredLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isToday(l.nextActionDate)),
      upcoming: filteredLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isFuture(l.nextActionDate) && !isToday(l.nextActionDate)),
      closed: filteredLeads.filter(l => ['closed', 'dropped'].includes(l.status.toLowerCase()))
    };
  }, [filteredLeads]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /> Loading...</div>;

  // Final safety check: if everything else fails, render a simple list to prove connection
  if (leads.length > 0 && filteredLeads.length === 0 && searchQuery === '') {
     return <div className="p-10">Data loaded but filtering failed. Total leads: {leads.length}</div>;
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Daily Review</h1>
      <Input 
        placeholder="Search..." 
        className="mb-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="space-y-10">
        {sections.overdue.length > 0 && <LeadSection title="Overdue" icon={<AlertCircle />} leads={sections.overdue} variant="overdue" />}
        <LeadSection title="Today" icon={<Clock />} leads={sections.today} variant="today" />
        <LeadSection title="Upcoming" icon={<Zap />} leads={sections.upcoming} variant="active" />
        {sections.closed.length > 0 && <LeadSection title="Archive" icon={<CheckCircle2 />} leads={sections.closed} variant="closed" />}
      </div>
    </div>
  );
}