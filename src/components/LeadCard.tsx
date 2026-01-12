import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Lead } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { SourceBadge } from './SourceBadge';
import { formatRelativeDate, getUrgencyLevel } from '@/lib/date-utils';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  showUrgency?: boolean;
}

export function LeadCard({ lead, showUrgency = true }: LeadCardProps) {
  const urgency = getUrgencyLevel(lead.nextActionDate);
  
  const urgencyStyles = {
    overdue: 'border-l-4 border-l-overdue bg-overdue/5',
    today: 'border-l-4 border-l-primary bg-primary/5',
    upcoming: 'border-l-4 border-l-transparent',
  };

  return (
    <Link
      to={`/lead/${lead.id}`}
      className={cn(
        'block p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200 group',
        showUrgency && urgencyStyles[urgency]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
              {lead.name}
            </h3>
            <SourceBadge source={lead.source} />
            {lead.linkedinUrl && (
              <a
                href={lead.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 truncate">
            {lead.nextAction}
          </p>
          
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'text-xs font-medium',
                urgency === 'overdue' && 'text-overdue',
                urgency === 'today' && 'text-primary',
                urgency === 'upcoming' && 'text-muted-foreground'
              )}
            >
              {formatRelativeDate(lead.nextActionDate)}
            </span>
            <StatusBadge status={lead.status} />
          </div>
        </div>
        
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}