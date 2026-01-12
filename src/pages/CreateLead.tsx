import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; // Import Supabase client
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
import { CalendarIcon, ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CreateLead() {
  const navigate = useNavigate();
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [source, setSource] = useState('LinkedIn');
  const [primaryContact, setPrimaryContact] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [status, setStatus] = useState('New');
  const [nextAction, setNextAction] = useState('Contact lead');
  const [nextActionDate, setNextActionDate] = useState<Date>(new Date());
  const [contextNote, setContextNote] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [valueEstimate, setValueEstimate] = useState('');

  const isValidLinkedInUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i;
    return pattern.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !primaryContact.trim() || !linkedinUrl.trim()) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    if (!isValidLinkedInUrl(linkedinUrl.trim())) {
      toast.error('Invalid LinkedIn URL');
      return;
    }

    try {
      setIsSubmitting(true);

      // Save to Supabase
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            name: name.trim(),
            source: source,
            contact: primaryContact.trim(), // Maps to 'contact' in DB
            linkedin_url: linkedinUrl.trim(), // Maps to 'linkedin_url' in DB
            status: status,
            next_action: nextAction.trim(),
            next_action_date: format(nextActionDate, 'yyyy-MM-dd'),
            priority: priority,
            value_estimate: parseFloat(valueEstimate) || 0,
          },
        ]);

      if (error) throw error;

      toast.success('Lead saved to database successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving lead:', error);
      toast.error(error.message || 'Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold">Create Lead</h1>
          <p className="text-muted-foreground mt-1">Add a new lead to Venturemond CRM</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6 p-6 rounded-xl bg-card border">
            <h2 className="font-semibold">Required Information</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Person / Company) *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Chen" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Interested">Interested</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Primary Contact *</Label>
                <Input id="contact" value={primaryContact} onChange={(e) => setPrimaryContact(e.target.value)} placeholder="email or phone" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
                <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nextAction">Next Action *</Label>
                  <Input id="nextAction" value={nextAction} onChange={(e) => setNextAction(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Next Action Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextActionDate ? format(nextActionDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={nextActionDate} onSelect={(date) => date && setNextActionDate(date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Lead'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}