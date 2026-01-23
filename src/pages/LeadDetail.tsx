import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Send, Building2, Calendar,
  MessageSquare, History
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [interactionType, setInteractionType] = useState('Meeting');
  const [nextActionDate, setNextActionDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const { role, session, isAdmin } = useAuth();
  const { updateOptimisticLead } = useLeads();
  const userId = session?.user?.id;

  const fetchLeadData = async () => {
    if (!id) return;
    try {
      setLoading(true);

      // EMERGENCY TIMEOUT: Force stop spinner after 2 seconds
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 2000);

      let query = supabase.from('leads').select('*').eq('id', id);

      // If user is not admin or USER role, they see restricted
      if (!isAdmin && role?.toLowerCase() !== 'user' && userId) {
        query = query.or(`user_id.eq.${userId},assigned_to.eq.${userId}`);
      }

      const { data: leadData, error } = await query.maybeSingle();

      clearTimeout(timeout);
      if (error) throw error;
      setLead(leadData);
      if (leadData?.priority) setPriority(leadData.priority);
    } catch (error) {
      console.error("Error fetching lead:", error);
      toast.error("Could not find the lead details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && role !== null) fetchLeadData();
  }, [id, isAdmin, userId, role]);

  const updateStatus = async (newStatus: string) => {
    const canEdit = !!userId && lead?.user_id === userId;
    if (!canEdit) {
      toast.error("You can only update your own leads.");
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setLead((prev: any) => ({ ...prev, status: newStatus }));
      toast.success(`Moved to ${newStatus}`);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Please enter log details");
      return;
    }
    const canEdit = !!userId && (lead?.user_id === userId || isAdmin); // Admins can also update
    if (!canEdit) {
      toast.error("Access denied.");
      return;
    }

    const currentNotes = Array.isArray(lead?.meeting_notes) ? lead.meeting_notes : [];
    const updatedMeetings = [...currentNotes, {
      notes: newNote,
      interaction: interactionType,
      date: new Date().toISOString().split('T')[0],
      title: interactionType
    }];

    const updatePayload: any = {
      meeting_notes: updatedMeetings,
      updated_at: new Date().toISOString()
    };

    // If a new next action date or priority is set, update it globally
    if (nextActionDate) updatePayload.next_action_date = nextActionDate;
    if (priority) updatePayload.priority = priority;

    const { error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', id);

    if (!error) {
      const updates = {
        meeting_notes: updatedMeetings,
        next_action_date: nextActionDate || lead.next_action_date,
        priority: priority || lead.priority
      };

      setLead((prev: any) => ({ ...prev, ...updates }));

      // INSTANT GLOBAL SYNC: Update dashboard and sidebar state
      if (id) updateOptimisticLead(id, updates);

      setNewNote('');
      toast.success("Timeline updated!");
    } else {
      console.error("Update error:", error);
      toast.error("Failed to sync log");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-xs font-bold text-[#00a389] animate-pulse tracking-widest uppercase italic border-b-2 border-[#00a389]/20 pb-1">Loading Lead Intel...</div>
    </div>
  );

  if (!lead) return (
    <div className="flex flex-col h-screen items-center justify-center bg-background gap-4">
      <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Lead intelligence not found</p>
      <button onClick={() => navigate('/dashboard')} className="text-[#00a389] font-black text-xs uppercase border-b-2 border-[#00a389] hover:opacity-80 transition-opacity">Go back to Intel</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-6 font-['Outfit',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-4">

        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-[#00a389] transition-all uppercase tracking-tighter">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className="flex gap-2">
            <select
              value={lead.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="px-4 py-2 text-[10px] font-black bg-white dark:bg-card text-[#00a389] rounded-xl uppercase border border-slate-300 dark:border-border shadow-sm outline-none cursor-pointer hover:border-[#00a389] transition-all"
            >
              {[
                { label: 'New', value: 'New' },
                { label: 'Contacted', value: 'Contacted' },
                { label: 'In-Progress', value: 'Qualified' },
                { label: 'Lost', value: 'Lost' },
                { label: 'Won', value: 'Won' }
              ].map(s => (
                <option key={s.value} value={s.value} className="bg-white dark:bg-card text-slate-900 dark:text-foreground">{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#00a389]/20" />
              <div className="w-20 h-20 bg-muted border-4 border-[#00a389]/10 text-[#00a389] rounded-[1.5rem] mx-auto flex items-center justify-center text-3xl font-black mb-4 shadow-inner relative">
                <div className="absolute inset-0 bg-[#00a389]/5" />
                <span className="relative z-10">{lead.name?.charAt(0)}</span>
              </div>
              <h1 className="text-xl font-black text-foreground italic uppercase tracking-tight">{lead.name}</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 bg-muted py-1.5 px-3 rounded-full inline-block border border-border">
                <Building2 size={12} className="inline mr-1 text-[#00a389]" /> {lead.company || 'Direct Client'}
              </p>
            </div>

            <div className="bg-card p-5 rounded-[2rem] border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3 text-[11px]">
                <span className="font-bold text-slate-900 dark:text-muted-foreground uppercase flex items-center gap-2"><Calendar size={14} /> Next Date</span>
                <span className="font-black text-slate-900 dark:text-foreground">{lead.next_action_date || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-900 dark:text-muted-foreground uppercase flex items-center gap-2"><History size={14} /> Priority</span>
                <span className={cn("font-black uppercase", lead.priority === 'High' ? "text-red-500" : "text-blue-500")}>
                  {lead.priority || 'Normal'}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card p-10 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00a389]/5 rounded-bl-full -mr-12 -mt-12 pointer-events-none" />

              <div className="flex items-center gap-5 border-b-2 border-slate-100 dark:border-slate-800 pb-8">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-[1.5rem] shadow-inner">
                  <Calendar className="text-[#00a389]" size={28} />
                </div>
                <div>
                  <h3 className="font-black text-2xl uppercase italic text-foreground tracking-tight">Schedule Next Interaction</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase opacity-70 tracking-widest mt-1">Plan your next touchpoint with precision</p>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {/* Vertical Stack of large inputs */}
                <div className="space-y-4">
                  <label className="text-[12px] font-black uppercase text-[#00a389] ml-1 tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare size={16} /> Interaction Type
                  </label>
                  <div className="relative">
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value)}
                      className="w-full h-16 px-6 text-sm font-black bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#00a389]/20 focus:border-[#00a389] transition-all cursor-pointer appearance-none text-foreground uppercase tracking-widest shadow-sm"
                    >
                      <option className="bg-white dark:bg-slate-900">Meeting</option>
                      <option className="bg-white dark:bg-slate-900">Call</option>
                      <option className="bg-white dark:bg-slate-900">Follow-up</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#00a389]">
                      <ArrowLeft className="rotate-[-90deg]" size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[12px] font-black uppercase text-[#00a389] ml-1 tracking-[0.2em] flex items-center gap-2">
                    <Calendar size={16} /> Next Meeting Date
                  </label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="w-full h-16 px-6 text-sm font-black bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#00a389]/20 focus:border-[#00a389] transition-all text-foreground shadow-sm"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[12px] font-black uppercase text-[#00a389] ml-1 tracking-[0.2em] flex items-center gap-2">
                    <History size={16} /> Priority Level
                  </label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full h-16 px-6 text-sm font-black bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-[#00a389]/20 focus:border-[#00a389] transition-all cursor-pointer appearance-none text-foreground uppercase tracking-widest shadow-sm"
                    >
                      <option className="bg-white dark:bg-slate-900">High</option>
                      <option className="bg-white dark:bg-slate-900">Medium</option>
                      <option className="bg-white dark:bg-slate-900">Low</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#00a389]">
                      <ArrowLeft className="rotate-[-90deg]" size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[12px] font-black uppercase text-[#00a389] ml-1 tracking-[0.2em]">Discussion Summary</label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Capture the key points and outcomes of your discussion..."
                    className="w-full p-8 text-base rounded-[2.5rem] min-h-[320px] outline-none bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-foreground placeholder:opacity-30 focus:ring-4 focus:ring-[#00a389]/20 focus:border-[#00a389] transition-all resize-none shadow-sm font-medium leading-relaxed"
                  />
                </div>
              </div>

              <button
                onClick={handleAddNote}
                className="w-full bg-[#00a389] hover:bg-[#008f78] text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-[#00a389]/40 flex items-center justify-center gap-4 active:scale-[0.98] transition-all border-b-8 border-[#007a67] mt-6"
              >
                Sync with Intelligence <Send size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.3em] flex items-center gap-2 px-2">
              <History size={14} className="text-[#00a389]" /> Interaction History
            </h3>
            {Array.isArray(lead?.meeting_notes) && lead.meeting_notes.length > 0 ? (
              lead.meeting_notes.slice().reverse().map((m: any, index: number) => (
                <div key={index} className="bg-card p-5 rounded-[2rem] border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#00a389] font-black uppercase bg-[#00a389]/10 px-2 py-0.5 rounded-md">
                        {m.date}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase italic">{m.interaction || 'Note'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground font-medium">{m.notes}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card rounded-[2rem] border-2 border-dashed border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
                No history recorded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
