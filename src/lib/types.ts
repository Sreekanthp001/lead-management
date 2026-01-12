export type LeadStatus = 'new' | 'contacted' | 'in-progress' | 'closed' | 'dropped';

export type LeadSource = 'linkedin' | 'email' | 'referral' | 'website' | 'other';

export type LeadPriority = 'high' | 'medium' | 'low';

export interface LeadNote {
  id: string;
  content: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  source: LeadSource;
  primaryContact: string;
  linkedinUrl: string;
  status: LeadStatus;
  nextAction: string;
  nextActionDate: Date;
  contextNote?: string;
  priority?: LeadPriority;
  tags?: string[];
  valueEstimate?: string;
  notes: LeadNote[];
  createdAt: Date;
  updatedAt: Date;
}

export const statusLabels: Record<LeadStatus, string> = {
  'new': 'New',
  'contacted': 'Contacted',
  'in-progress': 'In Progress',
  'closed': 'Closed',
  'dropped': 'Dropped',
};

export const sourceLabels: Record<LeadSource, string> = {
  'linkedin': 'LinkedIn',
  'email': 'Email',
  'referral': 'Referral',
  'website': 'Website',
  'other': 'Other',
};

export const priorityLabels: Record<LeadPriority, string> = {
  'high': 'High',
  'medium': 'Medium',
  'low': 'Low',
};