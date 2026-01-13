import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Calendar, Link2, FileText, 
  ExternalLink, Clock, Briefcase, ChevronRight,
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
      setEditFormData(leadData);
      setNotes(notesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      await supabase.from('lead_notes').insert([{ lead_id: id, content: `🛠 Updated Lead Intel` }]);
      setIsEditModalOpen(false);
      fetchLeadData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      await supabase.from('lead_notes').insert([{ lead_id: id, content: `⚡ Status: ${newStatus.toUpperCase()}` }]);
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
      const fileName = `${id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('lead-documents').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('lead-documents').getPublicUrl(fileName);
      await supabase.from('leads').update({ document_url: publicUrl }).eq('id', id);
      fetchLeadData();
    } catch (error: any) { alert(error.message); } finally { setUploading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#00a389] animate-pulse">VENTUREMOND...</div>;
  if (!lead) return <div className="p-10 text-center font-bold">Lead not found!</div>;

  const isOverdue = lead.next_action_date && lead.next_action_date < new Date().toISOString().split('T')[0] && lead.status !== 'Closed';

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-['Outfit']">
      
      {/* --- MODAL (Scaled Down) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                 <Settings2 size={18} className="text-[#00a389]" />
                 <h2 className="text-lg font-bold text-slate-900">Edit Lead Intel</h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-all"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleUpdateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Name</label>
                  <input value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#00a389]/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Company</label>
                  <input value={editFormData.company} onChange={e => setEditFormData({...editFormData, company: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#00a389]/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Follow-up Date</label>
                  <input type="date" value={editFormData.next_action_date || ''} onChange={e => setEditFormData({...editFormData, next_action_date: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Priority</label>
                    <select value={editFormData.priority} onChange={e => setEditFormData({...editFormData, priority: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                </div>
              </div>

              <Button type="submit" disabled={updating} className="w-full py-6 bg-[#00a389] hover:bg-[#008f78] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#00a389]/10">
                {updating ? <Loader2 className="animate-spin" /> : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* --- CONTENT --- */}
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#00a389] text-sm transition-all">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div className="flex gap-2">
            <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200">Edit</Button>
            <select onChange={(e) => handleStatusUpdate(e.target.value)} value={lead.status} className="h-9 px-4 text-xs font-bold rounded-xl bg-[#00a389] text-white outline-none cursor-pointer shadow-sm shadow-[#00a389]/20">
              {['New', 'Contacted', 'Interested', 'Proposal Sent', 'Closed', 'Dropped'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
                <div className="absolute top-6 right-6">
                  <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                      lead.priority === 'High' ? "bg-red-50 text-red-500 border-red-100" : "bg-[#00a389]/10 text-[#00a389] border-[#00a389]/20"
                  )}>
                      {lead.priority || 'Normal'}
                  </span>
                </div>
                
                <div className="flex items-center gap-5 mb-6">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl text-white flex items-center justify-center text-2xl font-black shadow-md",
                        isOverdue ? "bg-red-500" : "bg-gradient-to-br from-[#00a389] to-[#00816d]"
                    )}>
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            {lead.name}
                            {isOverdue && <AlertTriangle size={18} className="text-red-500" />}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-tight flex items-center gap-1.5">
                           <Briefcase size={12} /> {lead.company || 'Direct Client'} • {lead.source}
                        </p>
                    </div>
                </div>

                {lead.portfolio_url && (
                    <div className="pt-4 border-t border-slate-50">
                      <a href={lead.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-600 hover:text-[#00a389] transition-all border border-slate-100">
                          <Link2 size={14} className="text-[#00a389]" /> Portfolio <ExternalLink size={12} className="opacity-40" />
                      </a>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 px-2 uppercase tracking-widest opacity-70"><MessageSquare size={16} /> Activity</h2>
                <form onSubmit={handleAddNote} className="relative">
                  <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Type update..." className="w-full p-4 bg-white rounded-xl border border-slate-100 shadow-sm outline-none font-medium text-sm text-slate-600 min-h-[100px]" />
                  <button disabled={sendingNote || !newNote.trim()} className="absolute bottom-3 right-3 bg-[#00a389] text-white p-2 rounded-lg hover:scale-105 transition-all shadow-md"><Send size={16} /></button>
                </form>

                <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                          <p className={cn("text-sm font-semibold leading-snug", (note.content.includes('🛠') || note.content.includes('⚡')) ? "text-slate-400 italic" : "text-slate-700")}>{note.content}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic"><Clock size={10} /> {new Date(note.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={cn(
                "p-6 rounded-2xl text-white shadow-lg",
                isOverdue ? "bg-red-600" : "bg-slate-900"
            )}>
                <div className="flex items-center gap-2 mb-3 opacity-70">
                    <Calendar size={14} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Follow-up</span>
                </div>
                <h3 className="text-xl font-bold">{lead.next_action_date || 'TBD'}</h3>
                <p className="text-[10px] font-bold opacity-60 mt-1">{isOverdue ? 'URGENT: ACTION NEEDED' : 'Upcoming milestone'}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Files</span>
                    <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-[#00a389] transition-all">
                        {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    </button>
                </div>
                {lead.document_url ? (
                    <a href={lead.document_url} target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-transparent hover:border-[#00a389]/20 transition-all group">
                        <div className="flex items-center gap-2 overflow-hidden"><FileText className="text-[#00a389]" size={14} /><span className="font-bold text-xs text-slate-700 truncate">Proposal / Brief</span></div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-[#00a389]" />
                    </a>
                ) : <p className="text-center py-2 text-slate-300 text-[10px] font-bold italic">No attachments</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}