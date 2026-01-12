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
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Lead Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This lead may have been deleted or doesn't exist.
          </p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isReadOnly = lead.status === 'closed' || lead.status === 'dropped';
  const urgency = getUrgencyLevel(lead.nextActionDate);

  const handleSaveChanges = () => {
    updateLead(lead.id, {
      nextAction: editedNextAction,
      nextActionDate: editedNextActionDate,
      status: editedStatus,
    });
    setIsEditing(false);
    toast.success('Lead updated successfully');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote(lead.id, newNote.trim());
    setNewNote('');
    toast.success('Note added');
  };

  const contactIsEmail = lead.primaryContact.includes('@');

  return (
    <div className="container py-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className={cn(
          'p-6 rounded-xl border mb-6',
          isReadOnly ? 'bg-muted/30' : 'bg-card'
        )}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{lead.name}</h1>
                <SourceBadge source={lead.source} showLabel />
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={lead.status} />
                {lead.priority && (
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded',
                    lead.priority === 'high' && 'bg-overdue/10 text-overdue',
                    lead.priority === 'medium' && 'bg-warning/10 text-warning',
                    lead.priority === 'low' && 'bg-muted text-muted-foreground'
                  )}>
                    {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                  </span>
                )}
              </div>
            </div>
            <a
              href={lead.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline text-sm"
            >
              LinkedIn
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a
              href={contactIsEmail ? `mailto:${lead.primaryContact}` : `tel:${lead.primaryContact}`}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              {contactIsEmail ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              {lead.primaryContact}
            </a>
          </div>

          {lead.contextNote && (
            <p className="mt-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {lead.contextNote}
            </p>
          )}

          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {lead.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {lead.valueEstimate && (
            <p className="mt-4 text-sm font-medium text-foreground">
              Estimated Value: {lead.valueEstimate}
            </p>
          )}
        </div>

        {/* Next Action Card */}
        <div className={cn(
          'p-6 rounded-xl border mb-6',
          !isReadOnly && urgency === 'overdue' && 'border-l-4 border-l-overdue bg-overdue/5',
          !isReadOnly && urgency === 'today' && 'border-l-4 border-l-primary bg-primary/5',
          !isReadOnly && urgency === 'upcoming' && 'bg-card',
          isReadOnly && 'bg-muted/30'
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Next Action</h2>
            {!isReadOnly && !isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nextAction">Action</Label>
                <Input
                  id="nextAction"
                  value={editedNextAction}
                  onChange={(e) => setEditedNextAction(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editedNextActionDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedNextActionDate}
                      onSelect={(date) => date && setEditedNextActionDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editedStatus} onValueChange={(v) => setEditedStatus(v as LeadStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-foreground mb-2">{lead.nextAction}</p>
              <p className={cn(
                'text-sm font-medium',
                urgency === 'overdue' && 'text-overdue',
                urgency === 'today' && 'text-primary',
                urgency === 'upcoming' && 'text-muted-foreground'
              )}>
                {formatRelativeDate(lead.nextActionDate)}
                <span className="text-muted-foreground font-normal ml-2">
                  · {format(lead.nextActionDate, 'MMM d, yyyy')}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className={cn(
          'p-6 rounded-xl border',
          isReadOnly ? 'bg-muted/30' : 'bg-card'
        )}>
          <h2 className="font-semibold text-foreground mb-4">Notes & Activity</h2>

          {!isReadOnly && (
            <div className="mb-6">
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  size="icon"
                  className="self-end"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {lead.notes.length > 0 ? (
            <div className="space-y-3">
              {[...lead.notes].reverse().map((note) => (
                <div
                  key={note.id}
                  className="flex gap-3 text-sm border-l-2 border-muted pl-4 py-1"
                >
                  <div className="flex-1">
                    <p className="text-foreground">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(note.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          )}
        </div>

        {/* Meta info */}
        <div className="mt-6 text-xs text-muted-foreground text-center">
          Created {formatTimestamp(lead.createdAt)} · Last updated {formatTimestamp(lead.updatedAt)}
        </div>
      </div>
    </div>
  );
}