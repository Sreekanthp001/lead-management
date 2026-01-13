import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Calendar, Link2, FileText, Paperclip, 
  ExternalLink, Clock, User, Briefcase, ChevronRight,
  Upload, Loader2, Send, MessageSquare, X, Save, AlertTriangle, Settings2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Edit Modal States ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  
  const [newNote, setNewNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const { data: leadData } = await supabase.from('leads').select('*').eq('id', id).single();
      const { data: notesData } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });

      setLead(leadData);
      setEditFormData(leadData); // Initialize form with lead data
      setNotes(notesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Update Lead Function ---
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('leads')
        .update({
            name: editFormData.name,
            company: editFormData.company,
            priority: editFormData.priority,
            next_action_date: editFormData.next_action_date,
            portfolio_url: editFormData.portfolio_url
        })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('lead_notes').insert([{
        lead_id: id,
        content: `🛠 Lead Intel Updated: ${editFormData.name} (${editFormData.priority} Priority)`
      }]);

      setIsEditModalOpen(false);
      fetchLeadData();
      alert("Changes saved mawa! 🚀");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      await supabase.from('lead_notes').insert([{ lead_id: id, content: `⚡ Status changed to: ${newStatus.toUpperCase()}` }]);
      fetchLeadData();
    } catch (error: any) { alert(error.message); }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSendingNote(true);
    const { data, error } = await supabase.from('lead_notes').insert([{ lead_id: id, content: newNote.trim() }]).select();
    if (!error && data) { setNotes([data[0], ...notes]); setNewNote(''); }
    setSendingNote(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;
      const fileName = `${id}/${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('lead-documents').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('lead-documents').getPublicUrl(fileName);
      await supabase.from('leads').update({ document_url: publicUrl }).eq('id', id);
      fetchLeadData();
      alert("Document attached! 📎");
    } catch (error: any) { alert(error.message); } finally { setUploading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#00a389] animate-pulse text-2xl">VENTUREMOND LOADING...</div>;
  if (!lead) return <div className="p-10 text-center font-black">Lead not found!</div>;

  const isOverdue = lead.next_action_date && lead.next_action_date < new Date().toISOString().split('T')[0] && lead.status !== 'Closed';

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-['Outfit'] relative">
      
      {/* --- 1. EDIT MODAL (POPUP) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#00a389] rounded-xl text-white"><Settings2 size={20} /></div>
                 <h2 className="text-2xl font-black tracking-tight text-slate-900">Edit Lead Intel</h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X /></button>
            </div>
            
            <form onSubmit={handleUpdateLead} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Client Name</label>
                  <input value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-[#00a389]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Company</label>
                  <input value={editFormData.company} onChange={e => setEditFormData({...editFormData, company: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-[#00a389]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Next Action Date</label>
                  <input type="date" value={editFormData.next_action_date || ''} onChange={e => setEditFormData({...editFormData, next_action_date: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-[#00a389]" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Priority Level</label>
                    <select value={editFormData.priority} onChange={e => setEditFormData({...editFormData, priority: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-[#00a389] appearance-none cursor-pointer">
                    <option value="High">🔥 High Priority</option>
                    <option value="Medium">⚡ Medium Priority</option>
                    <option value="Low">🧊 Low Priority</option>
                    </select>
                </div>
              </div>

              <Button type="submit" disabled={updating} className="w-full py-8 bg-[#00a389] hover:bg-[#008f78] text-white rounded-[1.8rem] font-black text-lg shadow-xl shadow-[#00a389]/20 transition-all hover:scale-[1.02]">
                {updating ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" size={20} /> Update Record</>}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* --- UI Content --- */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-slate-500 font-black transition-all hover:text-[#00a389]">
            <div className="p-2 rounded-xl bg-white shadow-sm group-hover:bg-[#00a389] group-hover:text-white transition-all"><ArrowLeft size={20} /></div>
            Back to Dashboard
          </button>
          
          <div className="flex gap-3">
            <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="bg-white text-slate-900 border-none shadow-sm font-black rounded-2xl px-6 hover:bg-slate-100">Edit Lead</Button>
            <select onChange={(e) => handleStatusUpdate(e.target.value)} value={lead.status} className="bg-[#00a389] text-white border-none shadow-lg shadow-[#00a389]/20 font-black rounded-2xl px-6 outline-none cursor-pointer appearance-none">
              {['New', 'Contacted', 'Interested', 'Proposal Sent', 'Closed', 'Dropped'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Profile Card */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 relative overflow-hidden border border-slate-100">
                <div className="absolute top-0 right-0 p-8">
                    <span className={cn(
                        "px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border",
                        lead.priority === 'High' ? "bg-red-50 text-red-500 border-red-100" : "bg-[#00a389]/10 text-[#00a389] border-[#00a389]/20"
                    )}>
                        {lead.priority || 'Normal'} Priority
                    </span>
                </div>
                
                <div className="flex items-center gap-6 mb-8">
                    <div className={cn(
                        "w-20 h-20 rounded-[2.5rem] text-white flex items-center justify-center text-4xl font-black shadow-lg",
                        isOverdue ? "bg-red-500" : "bg-gradient-to-br from-[#00a389] to-[#00816d]"
                    )}>
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
                            {lead.name}
                            {isOverdue && <AlertTriangle size={24} className="text-red-500 animate-pulse" />}
                        </h1>
                        <p className="text-slate-400 font-bold flex items-center gap-2 mt-1 uppercase text-xs tracking-tighter">
                           <Briefcase size={14} /> {lead.company || 'Direct Client'} • Source: {lead.source}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {lead.portfolio_url && (
                        <a href={lead.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#00a389] transition-all group">
                            <div className="flex items-center gap-3"><Link2 className="text-[#00a389]" /><span className="font-black text-sm text-slate-700">Portfolio</span></div>
                            <ExternalLink size={16} className="text-slate-300 group-hover:text-[#00a389]" />
                        </a>
                    )}
                </div>
            </div>

            {/* Interaction Timeline */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 px-4"><MessageSquare className="text-[#00a389]" /> Activity Feed</h2>
                <form onSubmit={handleAddNote} className="relative group">
                  <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add meeting notes or updates..." className="w-full p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm focus:ring-4 focus:ring-[#00a389]/5 outline-none font-bold text-slate-600 min-h-[120px] transition-all" />
                  <button disabled={sendingNote || !newNote.trim()} className="absolute bottom-6 right-6 bg-[#00a389] text-white p-4 rounded-2xl shadow-lg shadow-[#00a389]/20 hover:scale-110 active:scale-95 transition-all"><Send size={20} /></button>
                </form>

                <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative">
                              <div className={cn("absolute -left-[27px] top-6 w-4 h-4 rounded-full border-4 border-[#f8fafc]", (note.content.includes('🛠') || note.content.includes('⚡')) ? "bg-amber-400" : "bg-[#00a389]")} />
                              <p className={cn("font-bold whitespace-pre-wrap leading-relaxed", (note.content.includes('🛠') || note.content.includes('⚡')) ? "text-slate-400 italic text-sm" : "text-slate-600")}>{note.content}</p>
                              <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Clock size={12} /> {new Date(note.created_at).toLocaleString()}</div>
                          </div>
                      </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className={cn(
                "p-8 rounded-[3rem] text-white shadow-2xl transition-all",
                isOverdue ? "bg-red-600 shadow-red-900/20" : "bg-[#0b0f1a] shadow-blue-900/20"
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className={isOverdue ? "text-white" : "text-[#00a389]"} />
                    <span className="font-black uppercase tracking-widest text-xs opacity-60">Next Follow-up</span>
                </div>
                <h3 className="text-3xl font-black mb-2">{lead.next_action_date || 'No Date'}</h3>
                <p className="text-sm font-bold opacity-60">{isOverdue ? 'URGENT: Action Overdue!' : 'Upcoming Milestone'}</p>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3"><Paperclip className="text-[#00a389]" /><span className="font-black uppercase tracking-widest text-xs text-slate-400">Documents</span></div>
                    <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-2 rounded-xl bg-slate-50 hover:bg-[#00a389] hover:text-white transition-all text-slate-400">
                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    </button>
                </div>
                {lead.document_url ? (
                    <a href={lead.document_url} target="_blank" className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#00a389] transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden"><FileText className="text-[#00a389]" size={18} /><span className="font-black text-sm text-slate-700 truncate">Proposal / Brief</span></div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-[#00a389]" />
                    </a>
                ) : <p className="text-center py-4 text-slate-300 text-xs font-bold italic">No files attached</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}