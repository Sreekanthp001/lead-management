import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/contexts/LeadContext';
import { LeadSource, LeadStatus, LeadPriority } from '@/lib/types';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CreateLead() {
  const navigate = useNavigate();
  const { addLead } = useLeads();
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);

  // Required fields
  const [name, setName] = useState('');
  const [source, setSource] = useState<LeadSource>('linkedin');
  const [primaryContact, setPrimaryContact] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [nextAction, setNextAction] = useState('Contact lead');
  const [nextActionDate, setNextActionDate] = useState<Date>(new Date());

  // Optional fields
  const [contextNote, setContextNote] = useState('');
  const [priority, setPriority] = useState<LeadPriority | undefined>();
  const [tags, setTags] = useState('');
  const [valueEstimate, setValueEstimate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !linkedinUrl.trim() || !primaryContact.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    addLead({
      name: name.trim(),
      source,
      primaryContact: primaryContact.trim(),
      linkedinUrl: linkedinUrl.trim(),
      status,
      nextAction: nextAction.trim(),
      nextActionDate,
      contextNote: contextNote.trim() || undefined,
      priority,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()) : undefined,
      valueEstimate: valueEstimate.trim() || undefined,
    });

    toast.success('Lead created successfully');
    navigate('/dashboard');
  };

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

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create Lead</h1>
          <p className="text-muted-foreground mt-1">
            Add a new lead to your pipeline
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Required Fields */}
          <div className="space-y-6 p-6 rounded-xl bg-card border">
            <h2 className="font-semibold text-card-foreground">Required Information</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Person / Company) *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Chen or TechCorp Inc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Primary Contact (Phone or Email) *</Label>
                <Input
                  id="contact"
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  placeholder="e.g. sarah@techcorp.io or +1 (555) 123-4567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextAction">Next Action *</Label>
                <Input
                  id="nextAction"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Send introductory message"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Next Action Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !nextActionDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextActionDate ? format(nextActionDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={nextActionDate}
                      onSelect={(date) => date && setNextActionDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <Collapsible open={isOptionalOpen} onOpenChange={setIsOptionalOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="font-medium text-foreground">Optional Details</span>
                <ChevronDown className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform',
                  isOptionalOpen && 'rotate-180'
                )} />
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-4 p-6 rounded-xl bg-card border mt-2">
                <div className="space-y-2">
                  <Label htmlFor="contextNote">Context Note</Label>
                  <Textarea
                    id="contextNote"
                    value={contextNote}
                    onChange={(e) => setContextNote(e.target.value)}
                    placeholder="How did you meet? What are they interested in?"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority || ''} onValueChange={(v) => setPriority(v as LeadPriority || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">Value Estimate</Label>
                    <Input
                      id="value"
                      value={valueEstimate}
                      onChange={(e) => setValueEstimate(e.target.value)}
                      placeholder="e.g. $50,000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. enterprise, tech, decision-maker"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1">
              Save Lead
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}