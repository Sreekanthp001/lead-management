import { cn } from '@/lib/utils';
import { LeadSource, sourceLabels } from '@/lib/types';
import { Linkedin, Mail, Users, Globe, MoreHorizontal } from 'lucide-react';

interface SourceBadgeProps {
  source: LeadSource;
  className?: string;
  showLabel?: boolean;
}

const sourceIcons: Record<LeadSource, React.ElementType> = {
  'linkedin': Linkedin,
  'email': Mail,
  'referral': Users,
  'website': Globe,
  'other': MoreHorizontal,
};

export function SourceBadge({ source, className, showLabel = false }: SourceBadgeProps) {
  const Icon = sourceIcons[source];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-muted-foreground',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      {showLabel && <span className="text-xs">{sourceLabels[source]}</span>}
    </span>
  );
}