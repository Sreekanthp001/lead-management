import { useMemo, useState } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { LeadSection } from '@/components/LeadSection';
import { isToday, isPast, isFuture } from 'date-fns';
import { AlertCircle, Clock, Zap, CheckCircle2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const { leads } = useLeads();
  
  // State for Search and Filtering 
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Logic to apply Search and Filters first
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Rule: Search by Name, Contact, LinkedIn URL, or Tags 
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.primaryContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.linkedinUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.tags && lead.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      // Rule: Filter by Source (LinkedIn, WhatsApp, etc.) 
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

      return matchesSearch && matchesSource;
    });
  }, [leads, searchQuery, sourceFilter]);

  // Grouping logic based on filtered results
  const { overdue, today, upcoming, closed } = useMemo(() => {
    const overdue = filteredLeads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status) &&
        isPast(lead.nextActionDate) &&
        !isToday(lead.nextActionDate)
    ).sort((a, b) => a.nextActionDate.getTime() - b.nextActionDate.getTime());

    const today = filteredLeads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status) &&
        isToday(lead.nextActionDate)
    );

    const upcoming = filteredLeads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status) &&
        isFuture(lead.nextActionDate) &&
        !isToday(lead.nextActionDate)
    ).sort((a, b) => a.nextActionDate.getTime() - b.nextActionDate.getTime());

    const closed = filteredLeads.filter((lead) =>
      ['closed', 'dropped'].includes(lead.status)
    );

    return { overdue, today, upcoming, closed };
  }, [filteredLeads]);

  return (
    <div className="container py-8 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Daily Review</h1>
          <p className="text-muted-foreground">Focus on your immediate follow-ups [cite: 116, 117]</p>
        </div>

        {/* Search & Filter Bar Section  */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, contact, tags..."
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
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-8">
          {/* Overdue Section - High Priority [cite: 57-59, 68] */}
          {overdue.length > 0 && (
            <LeadSection
              title={`Overdue (${overdue.length})`}
              icon={<AlertCircle className="h-5 w-5 text-overdue animate-pulse" />}
              leads={overdue}
              variant="overdue"
              defaultOpen={true}
            />
          )}

          {/* Today's Tasks [cite: 69, 72] */}
          <LeadSection
            title="Today's Tasks"
            icon={<Clock className="h-5 w-5 text-primary" />}
            leads={today}
            variant="today"
            defaultOpen={true}
          />

          {/* Upcoming Pipeline [cite: 70, 74] */}
          <LeadSection
            title="Upcoming Pipeline"
            icon={<Zap className="h-5 w-5 text-warning" />}
            leads={upcoming}
            variant="active"
            defaultOpen={upcoming.length > 0}
          />

          {/* Archive Section [cite: 75, 96, 97] */}
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
              <p className="text-muted-foreground">No leads in the system. Start by adding one from LinkedIn[cite: 114].</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}