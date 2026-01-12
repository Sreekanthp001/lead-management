import { Lead } from './types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

export const sampleLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    source: 'linkedin',
    primaryContact: 'sarah.chen@techcorp.io',
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    status: 'contacted',
    nextAction: 'Send proposal document',
    nextActionDate: twoDaysAgo,
    contextNote: 'Met at TechConnect conference. Interested in enterprise solutions.',
    priority: 'high',
    tags: ['enterprise', 'tech'],
    valueEstimate: '$50,000',
    notes: [
      { id: 'n1', content: 'Initial connection made via LinkedIn', createdAt: threeDaysAgo },
      { id: 'n2', content: 'Had intro call - very interested in our platform', createdAt: twoDaysAgo },
    ],
    createdAt: threeDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    source: 'linkedin',
    primaryContact: '+1 (555) 234-5678',
    linkedinUrl: 'https://linkedin.com/in/marcusjohnson',
    status: 'new',
    nextAction: 'Send introductory message',
    nextActionDate: yesterday,
    priority: 'medium',
    notes: [],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    source: 'linkedin',
    primaryContact: 'elena@startupventures.co',
    linkedinUrl: 'https://linkedin.com/in/elenarodriguez',
    status: 'in-progress',
    nextAction: 'Follow up on demo feedback',
    nextActionDate: today,
    contextNote: 'CEO of StartupVentures. Looking for growth tools.',
    priority: 'high',
    tags: ['startup', 'decision-maker'],
    valueEstimate: '$25,000',
    notes: [
      { id: 'n3', content: 'Connected via mutual contact', createdAt: nextWeek },
      { id: 'n4', content: 'Completed product demo - positive response', createdAt: yesterday },
    ],
    createdAt: nextWeek,
    updatedAt: yesterday,
  },
  {
    id: '4',
    name: 'David Park',
    source: 'referral',
    primaryContact: 'david.park@innovate.io',
    linkedinUrl: 'https://linkedin.com/in/davidpark',
    status: 'contacted',
    nextAction: 'Schedule discovery call',
    nextActionDate: today,
    priority: 'medium',
    notes: [
      { id: 'n5', content: 'Referred by Sarah Chen', createdAt: yesterday },
    ],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: '5',
    name: 'Amanda Foster',
    source: 'linkedin',
    primaryContact: 'amanda@growthpartners.com',
    linkedinUrl: 'https://linkedin.com/in/amandafoster',
    status: 'new',
    nextAction: 'Research company background',
    nextActionDate: tomorrow,
    priority: 'low',
    notes: [],
    createdAt: today,
    updatedAt: today,
  },
  {
    id: '6',
    name: 'James Wilson',
    source: 'linkedin',
    primaryContact: 'jwilson@enterprise.com',
    linkedinUrl: 'https://linkedin.com/in/jameswilson',
    status: 'closed',
    nextAction: 'Contract signed',
    nextActionDate: yesterday,
    contextNote: 'Enterprise deal closed. Implementation starting next month.',
    priority: 'high',
    tags: ['enterprise', 'won'],
    valueEstimate: '$75,000',
    notes: [
      { id: 'n6', content: 'Initial outreach', createdAt: threeDaysAgo },
      { id: 'n7', content: 'Demo completed successfully', createdAt: twoDaysAgo },
      { id: 'n8', content: 'Contract negotiation finalized', createdAt: yesterday },
    ],
    createdAt: threeDaysAgo,
    updatedAt: yesterday,
  },
  {
    id: '7',
    name: 'Lisa Thompson',
    source: 'email',
    primaryContact: 'lisa.t@smallbiz.net',
    linkedinUrl: 'https://linkedin.com/in/lisathompson',
    status: 'dropped',
    nextAction: 'No further action',
    nextActionDate: twoDaysAgo,
    contextNote: 'Budget constraints - not a fit at this time.',
    priority: 'low',
    notes: [
      { id: 'n9', content: 'Inbound inquiry via website', createdAt: threeDaysAgo },
      { id: 'n10', content: 'Discovery call - budget too small for our solution', createdAt: twoDaysAgo },
    ],
    createdAt: threeDaysAgo,
    updatedAt: twoDaysAgo,
  },
];