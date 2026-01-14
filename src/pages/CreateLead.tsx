import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, X, Upload, Save, ChevronLeft, Loader2, Trash2, Calendar, Link2, FileText
} from 'lucide-react';
import { toast } from "sonner";

// STEP 1: Supabase client path ni fix chesa (Nee folder structure prakaram)
import { supabase } from "@/lib/supabase"; 

export default function CreateLead() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Dynamic Lists States
  const [links, setLinks] = useState([{ id: Date.now(), url: '' }]);
  const [followups, setFollowups] = useState([{ id: Date.now(), action: '', date: '' }]);
  const [meetings, setMeetings] = useState([{ id: Date.now(), notes: '', date: '', title: 'Meeting 1' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    source: 'LinkedIn',
    primaryContact: '',
    profileUrl: '',
    status: 'New',
    nextAction: 'Contact lead',
    nextActionDate: '2026-01-14',
    priority: 'Medium',
    estimate: '',
    context: ''
  });

  // --- Handlers ---
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const updateLink = (id: number, url: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, url } : l));
  };

  const updateFollowup = (id: number, field: string, value: string) => {
    setFollowups(followups.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const updateMeeting = (id: number, field: string, value: string) => {
    setMeetings(meetings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeLink = (id: number) => setLinks(links.filter(l => l.id !== id));
  const removeFollowup = (id: number) => setFollowups(followups.filter(f => f.id !== id));
  const removeMeeting = (id: number) => setMeetings(meetings.filter(m => m.id !== id));

  const addMeeting = () => {
    setMeetings([...meetings, { id: Date.now(), notes: '', date: '', title: `Meeting ${meetings.length + 1}` }]);
  };

  // STEP 2: Database Submission (Updated with your NEW SQL columns)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation to avoid empty entries
      const filteredLinks = links.filter(l => l.url.trim() !== "");
      const filteredFollowups = followups.filter(f => f.action.trim() !== "");
      const filteredMeetings = meetings.filter(m => m.notes.trim() !== "");

      const { error } = await supabase
        .from('leads') 
        .insert([
          {
            name: formData.name,
            source: formData.source,
            contact: formData.primaryContact, 
            linkedin_url: formData.profileUrl, 
            status: formData.status,
            next_action: formData.nextAction,
            next_action_date: formData.nextActionDate,
            priority: formData.priority,
            value_estimate: formData.estimate ? parseFloat(formData.estimate) : null,
            context: formData.context,
            
            // --- DYNAMIC DATA MAPPING ---
            // Nuvvu okka link echina, ledha multiple links echina ee array loki velthayi
            links: filteredLinks, 
            
            // Follow-up dates and actions
            followup_schedule: filteredFollowups,
            
            // Tags array
            tags: tags,
            
            // Meeting notes logic
            meeting_notes: filteredMeetings,

            // Compatibility for old column (Single link string storage)
            portfolio_url: filteredLinks.length > 0 ? filteredLinks[0].url : null
          }
        ]);

      if (error) throw error;

      toast.success("Lead created successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Supabase Error:", error);
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 font-['Outfit']">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#00a389] transition-all">
            <ChevronLeft size={20} /> Back to Intel
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-[1000] italic uppercase text-slate-900 dark:text-white tracking-tighter">
              CREATE <span className="text-[#00a389]">NEW LEAD</span>
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400">Name *</Label>
                <Input required placeholder="Person or Company name" className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400">Source *</Label>
                <select className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 font-bold outline-none"
                  value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                  <option>LinkedIn</option>
                  <option>Upwork</option>
                  <option>Referral</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400">Primary Contact</Label>
                <Input placeholder="Email or Phone" className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                  value={formData.primaryContact} onChange={e => setFormData({...formData, primaryContact: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400">LinkedIn Profile URL</Label>
                <Input placeholder="linkedin.com/in/username" className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                  value={formData.profileUrl} onChange={e => setFormData({...formData, profileUrl: e.target.value})} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400">Status *</Label>
                <select className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 font-bold outline-none"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Interested</option>
                  <option>Follow-up</option>
                  <option>Closed</option>
                  <option>Dropped</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400">Next Action *</Label>
                <Input placeholder="Contact lead" className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                  value={formData.nextAction} onChange={e => setFormData({...formData, nextAction: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400">Next Action Date *</Label>
                <Input type="date" className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                  value={formData.nextActionDate} onChange={e => setFormData({...formData, nextActionDate: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-10">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase text-slate-400">Relevant Links</Label>
                <Button type="button" onClick={() => setLinks([...links, { id: Date.now(), url: '' }])} variant="outline" className="rounded-xl font-bold text-xs gap-2 h-9 px-4 border-slate-200"><Plus size={14} /> Add Link</Button>
              </div>
              {links.map(link => (
                <div key={link.id} className="flex gap-2 animate-in fade-in duration-300">
                  <Input 
                    placeholder="URL (Portfolio, LinkedIn, etc.)" 
                    value={link.url}
                    onChange={(e) => updateLink(link.id, e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 border-none text-sm font-medium" 
                  />
                  {links.length > 1 && <Button type="button" onClick={() => removeLink(link.id)} variant="ghost" className="text-slate-400 hover:text-red-500 h-11 w-11"><Trash2 size={18} /></Button>}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-400">Documents / Attachments</Label>
              <div className="flex items-center h-12 bg-slate-50 rounded-xl px-4 border-2 border-dashed border-slate-200">
                <input type="file" className="text-xs font-bold text-slate-500 w-full cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase text-slate-400">Follow-up Schedule</Label>
                <Button type="button" onClick={() => setFollowups([...followups, { id: Date.now(), action: '', date: '' }])} variant="outline" className="rounded-xl font-bold text-xs gap-2 h-9 px-4 border-slate-200"><Plus size={14} /> Add Follow-up</Button>
              </div>
              {followups.map(f => (
                <div key={f.id} className="flex gap-2 animate-in slide-in-from-right-2">
                  <Input 
                    placeholder="Action item / Note..." 
                    value={f.action}
                    onChange={(e) => updateFollowup(f.id, 'action', e.target.value)}
                    className="flex-1 h-11 rounded-xl bg-slate-50 border-none text-sm font-medium" 
                  />
                  <Input 
                    type="date" 
                    value={f.date}
                    onChange={(e) => updateFollowup(f.id, 'date', e.target.value)}
                    className="w-40 h-11 rounded-xl bg-slate-50 border-none text-[11px] font-bold" 
                  />
                  {followups.length > 1 && <Button type="button" onClick={() => removeFollowup(f.id)} variant="ghost" className="text-slate-400 hover:text-red-500 h-11 w-11"><X size={18} /></Button>}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase text-slate-400">Meeting Notes</Label>
                <Button type="button" onClick={addMeeting} variant="outline" className="rounded-xl font-bold text-xs gap-2 h-9 px-4 border-slate-200"><Plus size={14} /> Add Meeting</Button>
              </div>
              {meetings.map((m, index) => (
                <div key={m.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95">
                  <button type="button" onClick={() => removeMeeting(m.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-[#00a389] tracking-tighter bg-emerald-50 px-2 py-0.5 rounded">Meeting {index + 1}</span>
                        <Input 
                          type="date" 
                          value={m.date}
                          onChange={(e) => updateMeeting(m.id, 'date', e.target.value)}
                          className="h-8 w-32 bg-white border-none text-[10px] font-bold rounded-lg shadow-sm" 
                        />
                    </div>
                    <textarea 
                      placeholder="Brief summary of discussion..." 
                      value={m.notes}
                      onChange={(e) => updateMeeting(m.id, 'notes', e.target.value)}
                      className="w-full h-24 rounded-xl bg-white border-none p-4 text-sm font-medium outline-none resize-none shadow-sm" 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-400">Tags</Label>
              <div className="flex gap-2">
                <Input placeholder="Type tag & press Enter..." className="flex-1 h-12 rounded-xl bg-slate-50 border-none font-bold" 
                  value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <Button type="button" onClick={addTag} className="h-12 w-12 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400"><Plus size={20} /></Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map(t => (
                  <span key={t} className="bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-600 flex items-center gap-2 border border-slate-200">
                    {t} <X size={12} className="cursor-pointer text-red-400" onClick={() => setTags(tags.filter(tag => tag !== t))} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 py-10">
            <button type="button" onClick={() => navigate(-1)} className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] hover:text-slate-600">
              CANCEL
            </button>
            <Button type="submit" disabled={loading} className="h-11 px-10 rounded-full bg-[#00a389] hover:bg-[#008f77] text-white font-[900] text-[11px] uppercase italic tracking-tighter shadow-lg shadow-emerald-100/50 transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : <>ADD LEAD <Save size={14} className="ml-2" /></>}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}