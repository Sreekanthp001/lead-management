import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, X, Save, ChevronLeft, Loader2, Trash2
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';
import { cn } from "@/lib/utils";

export default function CreateLead() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { session, profile, role } = useAuth();
  const { addOptimisticLead, fetchLeads } = useLeads();
  const userId = session?.user?.id || null;

  // States
  const [links, setLinks] = useState([{ id: Date.now(), url: '' }]);
  const [followups, setFollowups] = useState([{ id: Date.now(), action: '', date: '2026-01-22' }]);
  const [meetings, setMeetings] = useState([{ id: Date.now(), notes: '', date: '2026-01-22', title: 'Meeting 1' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    source: 'LinkedIn',
    primaryContact: '',
    profileUrl: '',
    status: 'New',
    nextAction: 'Contact lead',
    nextActionDate: '2026-01-22',
    priority: 'Medium',
    estimate: '',
    context: ''
  });

  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const updateLink = (id: number, url: string) => setLinks(links.map(l => l.id === id ? { ...l, url } : l));
  const updateFollowup = (id: number, field: string, value: string) => setFollowups(followups.map(f => f.id === id ? { ...f, [field]: value } : f));
  const updateMeeting = (id: number, field: string, value: string) => setMeetings(meetings.map(m => m.id === id ? { ...m, [field]: value } : m));

  const removeLink = (id: number) => setLinks(links.filter(l => l.id !== id));
  const removeFollowup = (id: number) => setFollowups(followups.filter(f => f.id !== id));
  const removeMeeting = (id: number) => setMeetings(meetings.filter(m => m.id !== id));
  const addMeeting = () => setMeetings([...meetings, { id: Date.now(), notes: '', date: '2026-01-22', title: `Meeting ${meetings.length + 1}` }]);

  // LinkedIn Duplicate Check
  const checkDuplicate = async (url: string) => {
    if (!url || !url.includes('linkedin.com')) {
      setDuplicateError(null);
      return;
    }

    setCheckingDuplicate(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('created_by_name')
        .eq('linkedin_url', url.trim())
        .maybeSingle();

      if (data) {
        setDuplicateError(`This Lead is already added by ${data.created_by_name || 'another user'}`);
      } else {
        setDuplicateError(null);
      }
    } catch (err) {
      console.error("Duplicate check error:", err);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Safety check: Use userId immediately from context
    const currentUserId = session?.user?.id;
    if (!currentUserId || duplicateError) {
      if (duplicateError) toast.error(duplicateError);
      return;
    }

    const authUser = session.user;
    const finalStatus = formData.status || 'New';
    const currentTime = new Date().toISOString();

    const leadData = {
      name: formData.name,
      source: formData.source,
      contact: formData.primaryContact,
      linkedin_url: formData.profileUrl,
      status: finalStatus,
      next_action: formData.nextAction,
      next_action_date: formData.nextActionDate,
      priority: formData.priority,
      value_estimate: formData.estimate ? parseFloat(formData.estimate) : undefined,
      context: formData.context,
      links: links.filter(l => l.url),
      tags: tags,
      user_id: currentUserId,
      assigned_to: currentUserId,
      created_by_name: authUser.user_metadata?.full_name || authUser.email,
      created_by_email: authUser.email,
      created_by_role: role || 'user'
    };

    // OPTIMISTIC UI: Add to local state instantly
    addOptimisticLead({
      id: 'temp-' + Date.now(),
      created_at: currentTime,
      ...leadData
    } as any);

    // INSTANT REDIRECT: Do not wait for DB response
    toast.success("Lead Added (Syncing...)");
    navigate('/dashboard');

    // Background Insert (Fire & Forget)
    supabase.from('leads').insert([leadData]).then(({ error }) => {
      if (error) {
        console.error("Background Create Error:", error);
        toast.error("Background save failed.");
      } else {
        fetchLeads(currentUserId, true);
      }
    });
  };

  return (
    /* Alignment fixed: items-start and remove unnecessary centering */
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 font-['Outfit'] flex flex-col items-start overflow-x-hidden">

      {/* Container: Changed max-w-6xl to max-w-full to sit next to sidebar */}
      <div className="w-full max-w-full space-y-6">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-2 h-10">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#00a389] transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Intel</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20 w-full">
          {/* Section 1: Basic Info */}
          <div className="bg-card rounded-[32px] p-8 shadow-sm border border-border space-y-6">
            <h3 className="text-[12px] font-black text-[#00a389] uppercase tracking-widest border-b border-border pb-4">General Information</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">Name *</Label>
                <Input required placeholder="Name" className="h-12 rounded-xl bg-white border border-slate-300 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">Source *</Label>
                <select className="w-full h-12 rounded-xl bg-white border border-slate-300 dark:border-slate-800 px-4 font-bold outline-none text-slate-900 dark:text-slate-100" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                  <option>LinkedIn</option><option>Upwork</option><option>Referral</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">Primary Contact</Label>
                <Input placeholder="Email/Phone" className="h-12 rounded-xl bg-white border border-slate-300 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100" value={formData.primaryContact} onChange={e => setFormData({ ...formData, primaryContact: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">LinkedIn Profile URL</Label>
                <div className="space-y-1">
                  <Input
                    placeholder="URL"
                    className={cn(
                      "h-12 rounded-xl bg-white border font-bold text-slate-900 dark:text-slate-100",
                      duplicateError ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 dark:border-slate-800"
                    )}
                    value={formData.profileUrl}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ ...formData, profileUrl: val });
                      checkDuplicate(val);
                    }}
                  />
                  {duplicateError && <p className="text-[10px] font-black text-red-500 uppercase italic animate-pulse">{duplicateError}</p>}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">Status *</Label>
                <select className="w-full h-12 rounded-xl bg-white border border-slate-300 dark:border-slate-800 px-4 font-bold outline-none text-slate-900 dark:text-slate-100" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">In-Progress</option>
                  <option value="Lost">Lost</option>
                  <option value="Won">Won</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">Next Action *</Label>
                <Input className="h-12 rounded-xl bg-white border border-slate-300 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100" value={formData.nextAction} onChange={e => setFormData({ ...formData, nextAction: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">Next Action Date *</Label>
                <Input type="date" readOnly className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 cursor-not-allowed opacity-70" value={formData.nextActionDate} />
              </div>
            </div>
          </div>

          {/* Section 2: Details & Schedule */}
          <div className="bg-card rounded-[32px] p-8 shadow-sm border border-border space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">Relevant Links</Label>
                  <Button type="button" onClick={() => setLinks([...links, { id: Date.now(), url: '' }])} variant="outline" className="rounded-xl font-bold text-xs gap-2 border-slate-300 dark:border-slate-700 shadow-sm"><Plus size={14} /> Add Link</Button>
                </div>
                {links.map(link => (
                  <div key={link.id} className="flex gap-2">
                    <Input placeholder="URL" value={link.url} onChange={(e) => updateLink(link.id, e.target.value)} className="h-11 rounded-xl bg-white border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100" />
                    {links.length > 1 && <Button type="button" onClick={() => removeLink(link.id)} variant="ghost" className="text-red-500"><Trash2 size={18} /></Button>}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-400">Documents / Attachments</Label>
                <div className="flex items-center h-12 bg-white rounded-xl px-4 border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <input type="file" className="text-xs font-bold text-slate-600 dark:text-slate-400 w-full cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-200 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-200" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-400">Follow-up Schedule</Label>
                <Button type="button" onClick={() => setFollowups([...followups, { id: Date.now(), action: '', date: '2026-01-22' }])} variant="outline" className="rounded-xl font-bold text-xs gap-2 border-slate-300 dark:border-slate-700 shadow-sm"><Plus size={14} /> Add Follow-up</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {followups.map(f => (
                  <div key={f.id} className="flex gap-2">
                    <Input placeholder="Action item..." value={f.action} onChange={(e) => updateFollowup(f.id, 'action', e.target.value)} className="flex-1 h-11 rounded-xl bg-muted border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100" />
                    <Input type="date" value={f.date} readOnly className="w-40 h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[11px] font-bold text-slate-900 dark:text-slate-100 cursor-not-allowed opacity-70" />
                    {followups.length > 1 && <Button type="button" onClick={() => removeFollowup(f.id)} variant="ghost" className="text-red-500"><X size={18} /></Button>}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-400">Meeting Notes</Label>
                <Button type="button" onClick={addMeeting} variant="outline" className="rounded-xl font-bold text-xs gap-2 border-slate-300 dark:border-slate-700 shadow-sm"><Plus size={14} /> Add Meeting</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {meetings.map((m, index) => (
                  <div key={m.id} className="p-4 bg-muted rounded-2xl border border-slate-300 dark:border-slate-800 relative">
                    <button type="button" onClick={() => removeMeeting(m.id)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-red-500"><X size={20} /></button>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-[#00a389] bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">Meeting {index + 1}</span>
                        <Input type="date" value={m.date} readOnly className="h-8 w-32 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-bold rounded-lg shadow-sm text-slate-900 dark:text-slate-100 cursor-not-allowed opacity-70" />
                      </div>
                      <textarea placeholder="Discussion notes..." value={m.notes} onChange={(e) => updateMeeting(m.id, 'notes', e.target.value)} className="w-full h-24 rounded-xl bg-background border border-slate-300 dark:border-slate-700 p-4 text-sm font-medium outline-none resize-none shadow-sm text-slate-900 dark:text-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-400">Tags</Label>
              <div className="flex gap-2 max-w-md">
                <Input placeholder="Type tag & Enter..." className="flex-1 h-12 rounded-xl bg-muted border border-slate-300 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <Button type="button" onClick={addTag} className="h-12 w-12 rounded-xl bg-background border border-slate-300 dark:border-slate-700 shadow-sm text-slate-400"><Plus size={20} /></Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map(t => (
                  <span key={t} className="bg-muted px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2 border border-slate-300 dark:border-slate-700">
                    {t} <X size={12} className="cursor-pointer text-red-500" onClick={() => setTags(tags.filter(tag => tag !== t))} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start gap-8 py-10">
            <button type="button" onClick={() => navigate('/dashboard')} className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em] hover:text-[#00a389] transition-colors">CANCEL</button>
            <Button
              type="submit"
              disabled={loading || !!duplicateError || checkingDuplicate}
              className={cn(
                "h-11 px-10 rounded-full font-[900] text-[11px] uppercase italic tracking-tighter shadow-lg transition-all active:scale-95",
                duplicateError ? "bg-slate-400 cursor-not-allowed" : "bg-[#00a389] hover:bg-[#008f77] text-white shadow-emerald-100/50"
              )}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>ADD LEAD <Save size={14} className="ml-2" /></>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}