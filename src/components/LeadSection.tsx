import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Lead } from '@/lib/types';
import { LeadCard } from './LeadCard';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface LeadSectionProps {
  title: string;
  icon?: ReactNode;
  leads: Lead[];
  variant?: 'overdue' | 'today' | 'active' | 'closed';
  defaultOpen?: boolean;
  showUrgency?: boolean;
}

export function LeadSection({
  title,
  icon,
  leads,
  variant = 'active',
  defaultOpen = true,
  showUrgency = true,
}: LeadSectionProps) {
  const variantStyles = {
    overdue: 'border-l-overdue',
    today: 'border-l-primary',
    active: 'border-l-warning',
    closed: 'border-l-muted',
  };

  const headerStyles = {
    overdue: 'text-overdue',
    today: 'text-primary',
    active: 'text-foreground',
    closed: 'text-muted-foreground',
  };

  if (leads.length === 0) return null;

  return (
    <Collapsible defaultOpen={defaultOpen} className="space-y-3">
      <CollapsibleTrigger className="flex items-center justify-between w-full group">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className={cn('text-lg font-semibold', headerStyles[variant])}>
            {title}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({leads.length})
          </span>
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className={cn(
          'space-y-2 pl-4 border-l-2',
          variantStyles[variant]
        )}>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} showUrgency={showUrgency} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}