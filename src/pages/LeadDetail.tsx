import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ArrowLeft, ExternalLink, CalendarIcon, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit states
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [nextActionDate, setNextActionDate] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchLeadDetails() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLead(data);
        // Set initial edit values
        setName(data.name);
        setStatus(data.status);
        if (data.next_action_date) setNextActionDate(new Date(data.next_action_date));
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Lead not found");
      } finally {
        setLoading(false);
      }
    }
    fetchLeadDetails();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name,
          status,
          next_action_date: format(nextActionDate, 'yyyy-MM-dd')
        })
        .eq('id', id);

      if (error) throw error;
      toast.success("Lead updated successfully");
      setIsEditing(false);
      setLead({ ...lead, name, status, next_action_date: format(nextActionDate, 'yyyy-MM-dd') });
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!lead) return <div className="p-10 text-center">Lead not found. <Button onClick={() => navigate('/dashboard')}>Back</Button></div>;

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mt-2 inline-block">
              Source: {lead.source}
            </span>
          </div>
          <a 
            href={lead.linkedin_url} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 text-primary hover:underline text-sm font-medium"
          >
            LinkedIn Profile <ExternalLink size={14} />
          </a>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Info</Label>
              <p className="p-2 bg-gray-50 rounded border text-sm">{lead.contact}</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              {isEditing ? (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 bg-gray-50 rounded border text-sm">{lead.status}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Next Action Date</Label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(nextActionDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={nextActionDate} onSelect={(d) => d && setNextActionDate(d)} />
                </PopoverContent>
              </Popover>
            ) : (
              <p className="p-2 bg-gray-50 rounded border text-sm">{lead.next_action_date || 'Not set'}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate} className="flex-1"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="flex-1">Edit Lead Details</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}