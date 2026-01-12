import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LeadSection } from '@/components/LeadSection';
import { isToday, isPast, isFuture, parseISO, isValid } from 'date-fns';
import { AlertCircle, Clock, Zap, CheckCircle2, Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedData = (data || []).map(lead => {
          // Ensure nextActionDate is always a valid Date object
          let dateObj = new Date();
          if (lead.next_action_date) {
            const parsed = parseISO(lead.next_action_date);
            if (isValid(parsed)) dateObj = parsed;
          }

          return {
            ...lead,
            id: lead.id,
            name: lead.name || 'Unnamed Company',
            nextActionDate: dateObj, // Crucial for date-fns functions
            primaryContact: lead.contact || 'No Contact Info',
            linkedinUrl: lead.linkedin_url || '',
            status: lead.status || 'New',
            source: lead.source || 'Other',
            tags: [] // Adding empty array to prevent crashes if LeadSection maps over tags
          };
        });

        setLeads(formattedData);
      } catch (error) {
        console.error("Database Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const name = lead.name?.toLowerCase() || '';
      const contact = lead.primaryContact?.toLowerCase() || '';
      const search = searchQuery.toLowerCase();

      const matchesSearch = name.includes(search) || contact.includes(search);
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

      return matchesSearch && matchesSource;
    });
  }, [leads, searchQuery, sourceFilter]);

  const { overdue, today, upcoming, closed } = useMemo(() => {
    const safeLeads = filteredLeads || [];
    
    return {
      overdue: safeLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isPast(l.nextActionDate) && !isToday(l.nextActionDate)),
      today: safeLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isToday(l.nextActionDate)),
      upcoming: safeLeads.filter(l => !['closed', 'dropped'].includes(l.status.toLowerCase()) && isFuture(l.nextActionDate) && !isToday(l.nextActionDate)),
      closed: safeLeads.filter(l => ['closed', 'dropped'].includes(l.status.toLowerCase()))
    };
  }, [filteredLeads]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading leads...</span>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Daily Review</h1>
          <p className="text-muted-foreground">Managing {leads.length} total leads from database.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-8">
          {overdue.length > 0 && <LeadSection title="Overdue" icon={<AlertCircle className="text-destructive" />} leads={overdue} variant="overdue" />}
          <LeadSection title="Today" icon={<Clock className="text-primary" />} leads={today} variant="today" />
          <LeadSection title="Upcoming" icon={<Zap className="text-orange-500" />} leads={upcoming} variant="active" />
          {closed.length > 0 && <LeadSection title="Archive" icon={<CheckCircle2 />} leads={closed} variant="closed" />}
          
          {leads.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <p>No data found in Supabase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}