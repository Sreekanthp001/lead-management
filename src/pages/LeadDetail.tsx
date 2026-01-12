import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLeads } from '@/contexts/LeadContext';
import { LeadStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { SourceBadge } from '@/components/SourceBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ExternalLink,
  CalendarIcon,
  MessageSquarePlus,
  Phone,
  Mail,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeDate, formatTimestamp, getUrgencyLevel } from '@/lib/date-utils';
import { toast } from 'sonner';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLeadById, updateLead, addNote } = useLeads();

  const lead = getLeadById(id || '');

  const [isEditing, setIsEditing] = useState(false);
  const [editedNextAction, setEditedNextAction] = useState(lead?.nextAction || '');
  const [editedNextActionDate, setEditedNextActionDate] = useState<Date>(
    lead?.nextActionDate || new Date()
  );
  const [editedStatus, setEditedStatus] = useState<LeadStatus>(lead?.status || 'new');
  const [newNote, setNewNote] = useState('');

  if (!lead) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Lead Not Found</h1>
        <Button asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }

  // Documentation Rule: Closed/Dropped leads are locked (Read-Only)
  const isLocked = lead.status === 'closed' || lead.status === 'dropped';
  const urgency = getUrgencyLevel(lead.nextActionDate);

  const handleSaveChanges = () => {
    if (isLocked) return;
    updateLead(lead.id, {
      nextAction: editedNextAction,
      nextActionDate: editedNextActionDate,
      status: editedStatus,
    });
    setIsEditing(false);
    toast.success('Lead updated successfully');
  };

  const handleAddNote = () => {
    if (!newNote.trim() || isLocked) return;
    // Documentation Rule: Append-only, timestamped bullet notes
    addNote(lead.id, newNote.trim());
    setNewNote('');
    toast.success('Note added');
  };

  const contactIsEmail = lead.primaryContact.includes('@');

  return (
    <div className="container py-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className={cn('p-6 rounded-xl border mb-6 relative', isLocked ? 'bg-muted/50 opacity-90' : 'bg-card')}>
          {isLocked && (
            <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Lock className="h-3 w-3" /> Read Only
            </div>
          )}
          
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{lead.name}</h1>
                <SourceBadge source={lead.source} showLabel />
              </div>
              <StatusBadge status={lead.status} />
            </div>
            <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary text-sm font-medium border p-2 rounded-md hover:bg-primary/5">
              View LinkedIn <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="text-sm text-muted-foreground flex gap-4">
             <span className="flex items-center gap-1.5">
               {contactIsEmail ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
               {lead.primaryContact}
             </span>
          </div>
        </div>

        {/* Next Action Card */}
        <div className={cn(
          'p-6 rounded-xl border mb-6',
          !isLocked && urgency === 'overdue' && 'border-l-4 border-l-overdue bg-overdue/5',
          isLocked && 'bg-muted/30'
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Follow-up Details</h2>
            {!isLocked && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Action</Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Action Required</Label>
                <Input value={editedNextAction} onChange={(e) => setEditedNextAction(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Next Action Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editedNextActionDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editedNextActionDate} onSelect={(date) => date && setEditedNextActionDate(date)} /></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editedStatus} onValueChange={(v) => setEditedStatus(v as LeadStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveChanges}>Save</Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">{lead.nextAction}</p>
              <p className={cn('text-sm font-bold mt-1', urgency === 'overdue' ? 'text-overdue' : 'text-primary')}>
                {formatRelativeDate(lead.nextActionDate)} ({format(lead.nextActionDate, 'MMM d')})
              </p>
            </div>
          )}
        </div>

        {/* Notes Section - Documentation: Append-only */}
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h2 className="font-semibold mb-4">Conversation Log</h2>

          {!isLocked && (
            <div className="flex gap-2 mb-6">
              <Textarea 
                value={newNote} 
                onChange={(e) => setNewNote(e.target.value)} 
                placeholder="Type a bullet point note..." 
                className="resize-none"
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim()} className="self-end"><MessageSquarePlus /></Button>
            </div>
          )}

          <div className="space-y-4">
            {lead.notes.length > 0 ? (
              [...lead.notes].reverse().map((note) => (
                <div key={note.id} className="border-l-2 border-primary/30 pl-4 py-1">
                  <p className="text-sm">• {note.content}</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">{formatTimestamp(note.createdAt)}</p>
                </div>
              ))
            ) : <p className="text-sm text-muted-foreground">No history available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}