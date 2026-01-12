import { cn } from '@/lib/utils';
import { LeadStatus, statusLabels } from '@/lib/types';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<LeadStatus, string> = {
    'new': 'bg-accent text-accent-foreground',
    'contacted': 'bg-primary/10 text-primary',
    'in-progress': 'bg-warning/10 text-warning',
    'closed': 'bg-success/10 text-success',
    'dropped': 'bg-muted text-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}