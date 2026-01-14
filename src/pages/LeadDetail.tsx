import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Send, Building2, Calendar, 
  MessageSquare, History 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const { data: leadData, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setLead(leadData);
    } catch (error) { 
      console.error("Error fetching lead:", error);
      toast.error("Could not find the lead details");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (id) fetchLeadData(); 
  }, [id]);

  const updateStatus = async (newStatus: string) => {
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
    if (!newNote.trim()) return;
    
    // Safety check for meeting_notes array
    const currentNotes = Array.isArray(lead?.meeting_notes) ? lead.meeting_notes : [];
    
    const updatedMeetings = [...currentNotes, { 
      notes: newNote, 
      date: new Date().toISOString().split('T')[0],
      title: 'Manual Update'
    }];
    
    const { error } = await supabase
      .from('leads')
      .update({ 
        meeting_notes: updatedMeetings,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) {
      setLead((prev: any) => ({...prev, meeting_notes: updatedMeetings}));
      setNewNote('');
      toast.success("Note added");
    } else {
      console.error("Note error:", error);
      toast.error("Failed to add note");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-xs font-bold text-[#00a389] animate-pulse tracking-widest uppercase italic">Loading...</div>
    </div>
  );

  if (!lead) return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Lead not found</p>
      <button onClick={() => navigate('/dashboard')} className="text-[#00a389] font-black text-xs uppercase border-b-2 border-[#00a389]">Go back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 lg:p-6 font-['Outfit',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-4">
        
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-black text-slate-500 hover:text-[#00a389] transition-all uppercase tracking-tighter">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back
          </button>
          
          <div className="flex gap-2">
            <select 
              value={lead.status} 
              onChange={(e) => updateStatus(e.target.value)}
              className="px-4 py-2 text-[10px] font-black bg-white dark:bg-slate-900 text-[#00a389] rounded-xl uppercase border border-slate-100 dark:border-slate-800 shadow-sm outline-none cursor-pointer hover:border-[#00a389] transition-all"
            >
              {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed', 'Dropped'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <div className="w-20 h-20 bg-[#00a389] text-white rounded-[1.5rem] mx-auto flex items-center justify-center text-3xl font-black mb-4">
                {lead.name?.charAt(0)}
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white italic uppercase">{lead.name}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                <Building2 size={12} className="inline mr-1 text-[#00a389]"/> {lead.company || 'Direct Client'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3 text-[11px]">
                <span className="font-bold text-slate-400 uppercase flex items-center gap-2"><Calendar size={14}/> Next Date</span>
                <span className="font-black text-slate-800 dark:text-slate-200">{lead.next_action_date || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-400 uppercase flex items-center gap-2"><History size={14}/> Priority</span>
                <span className={cn("font-black uppercase", lead.priority === 'High' ? "text-red-500" : "text-blue-500")}>
                  {lead.priority || 'Normal'}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white font-black text-xs uppercase italic">
                <MessageSquare size={16} className="text-[#00a389]"/> Timeline Logs
              </div>
              <div className="relative">
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type an update..." 
                  className="w-full p-4 text-sm border-none rounded-2xl min-h-[100px] outline-none bg-slate-50 dark:bg-slate-800/50 dark:text-white" 
                />
                <button 
                  onClick={handleAddNote}
                  className="absolute bottom-3 right-3 bg-[#00a389] text-white p-3 rounded-xl shadow-lg"
                >
                  <Send size={16}/>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {Array.isArray(lead?.meeting_notes) && lead.meeting_notes.length > 0 ? (
                lead.meeting_notes.slice().reverse().map((m: any, index: number) => (
                  <div key={index} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-50 dark:border-slate-800/50 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] text-[#00a389] font-black uppercase bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                        {m.date}
                      </span>
                      <span className="text-[9px] text-slate-300 font-bold uppercase italic">{m.title || 'Update'}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{m.notes}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
                  No history recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}