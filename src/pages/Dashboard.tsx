import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Database connection ikkada nundi vastundi
import { LeadSection } from '@/components/LeadSection';
import { isToday, isPast, isFuture, parseISO } from 'date-fns';
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
  // Database state
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // 1. Fetch data from Supabase
  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Supabase dates are strings, converting them for date-fns compatibility
        const formattedData = data?.map(lead => ({
          ...lead,
          // Database columns names correct ga undali
          nextActionDate: lead.next_action_date ? new Date(lead.next_action_date) : new Date(),
          primaryContact: lead.contact || '', // lead.contact from DB -> primaryContact for UI
          linkedinUrl: lead.linkedin_url // lead.linkedin_url from DB -> linkedinUrl for UI
        })) || [];

        setLeads(formattedData);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  // 2. Search and Filters logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.primaryContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.linkedinUrl.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSource = sourceFilter === 'all' || lead.source?.toLowerCase() === sourceFilter.toLowerCase();

      return matchesSearch && matchesSource;
    });
  }, [leads, searchQuery, sourceFilter]);

  // 3. Grouping logic for Sections
  const { overdue, today, upcoming, closed } = useMemo(() => {
    const overdue = filteredLeads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status?.toLowerCase()) &&
        isPast(lead.nextActionDate) &&
        !isToday(lead.nextActionDate)
    ).sort((a, b) => a.nextActionDate.getTime() - b.nextActionDate.getTime());

    const today = filteredLeads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status?.toLowerCase()) &&
        isToday(lead.nextActionDate)
    );

    const upcoming = filteredLeads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status?.toLowerCase()) &&
        isFuture(lead.nextActionDate) &&
        !isToday(lead.nextActionDate)
    ).sort((a, b) => a.nextActionDate.getTime() - b.nextActionDate.getTime());

    const closed = filteredLeads.filter((lead) =>
      ['closed', 'dropped'].includes(lead.status?.toLowerCase())
    );

    return { overdue, today, upcoming, closed };
  }, [filteredLeads]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Fetching leads...</span>
      </div>
    );
  }

  return (
    <div className="container py-8 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Daily Review</h1>
          <p className="text-muted-foreground">Focus on your immediate follow-ups</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Source" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-8">
          {overdue.length > 0 && (
            <LeadSection
              title={`Overdue (${overdue.length})`}
              icon={<AlertCircle className="h-5 w-5 text-destructive animate-pulse" />}
              leads={overdue}
              variant="overdue"
              defaultOpen={true}
            />
          )}

          <LeadSection
            title="Today's Tasks"
            icon={<Clock className="h-5 w-5 text-primary" />}
            leads={today}
            variant="today"
            defaultOpen={true}
          />

          <LeadSection
            title="Upcoming Pipeline"
            icon={<Zap className="h-5 w-5 text-orange-500" />}
            leads={upcoming}
            variant="active"
            defaultOpen={upcoming.length > 0}
          />

          {closed.length > 0 && (
            <LeadSection
              title="Archive (Closed/Dropped)"
              icon={<CheckCircle2 className="h-5 w-5 text-muted-foreground" />}
              leads={closed}
              variant="closed"
              defaultOpen={false}
              showUrgency={false}
            />
          )}

          {filteredLeads.length === 0 && leads.length > 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No leads match your search criteria.</p>
            </div>
          )}

          {leads.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl">
              <p className="text-muted-foreground">No leads in the database. Add some leads to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}