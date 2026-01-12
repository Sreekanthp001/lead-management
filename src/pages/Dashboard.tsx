import { useMemo } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { LeadSection } from '@/components/LeadSection';
import { isToday, isPast, isFuture } from 'date-fns';
import { AlertCircle, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { leads } = useLeads();

  const { overdue, today, active, closed } = useMemo(() => {
    const overdue = leads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status) &&
        isPast(lead.nextActionDate) &&
        !isToday(lead.nextActionDate)
    );

    const today = leads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status) &&
        isToday(lead.nextActionDate)
    );

    const active = leads.filter(
      (lead) =>
        !['closed', 'dropped'].includes(lead.status) &&
        isFuture(lead.nextActionDate) &&
        !isToday(lead.nextActionDate)
    );

    const closed = leads.filter((lead) =>
      ['closed', 'dropped'].includes(lead.status)
    );

    return { overdue, today, active, closed };
  }, [leads]);

  return (
    <div className="container py-8 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your daily lead follow-up view
          </p>
        </div>

        <div className="space-y-8">
          <LeadSection
            title="Overdue"
            icon={<AlertCircle className="h-5 w-5 text-overdue" />}
            leads={overdue}
            variant="overdue"
            defaultOpen={true}
          />

          <LeadSection
            title="Today's Follow-ups"
            icon={<Clock className="h-5 w-5 text-primary" />}
            leads={today}
            variant="today"
            defaultOpen={true}
          />

          <LeadSection
            title="Active Leads"
            icon={<Zap className="h-5 w-5 text-warning" />}
            leads={active}
            variant="active"
            defaultOpen={true}
          />

          <LeadSection
            title="Closed / Dropped"
            icon={<CheckCircle2 className="h-5 w-5 text-muted-foreground" />}
            leads={closed}
            variant="closed"
            defaultOpen={false}
            showUrgency={false}
          />

          {leads.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                No leads yet. Create your first lead to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}