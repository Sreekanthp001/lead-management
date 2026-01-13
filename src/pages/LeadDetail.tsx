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
      const { data: notesData } = await supabase.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false });
      setLead(leadData);
      setEditFormData(leadData);
      setNotes(notesData || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await supabase.from('leads').update({
        name: editFormData.name,
        company: editFormData.company,
        priority: editFormData.priority,
        next_action_date: editFormData.next_action_date,
        portfolio_url: editFormData.portfolio_url
      }).eq('id', id);
      setIsEditModalOpen(false);
      fetchLeadData();
    } catch (error: any) { alert(error.message); } finally { setUpdating(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#00a389] animate-pulse">VENTUREMOND...</div>;
  if (!lead) return <div className="p-10 text-center font-bold">Lead not found!</div>;

  const isOverdue = lead.next_action_date && lead.next_action_date < new Date().toISOString().split('T')[0] && lead.status !== 'Closed';

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6 font-['Outfit']">
      
      {/* --- MODAL (COMPACT SIZE) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-bold text-slate-900">Edit Lead Intel</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdateLead} className="p-5 space-y-4">
              <input value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#00a389]/20" placeholder="Name" />
              <input value={editFormData.company} onChange={e => setEditFormData({...editFormData, company: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#00a389]/20" placeholder="Company" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={editFormData.next_action_date || ''} onChange={e => setEditFormData({...editFormData, next_action_date: e.target.value})} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none" />
                <select value={editFormData.priority} onChange={e => setEditFormData({...editFormData, priority: e.target.value})} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <Button type="submit" disabled={updating} className="w-full py-5 bg-[#00a389] rounded-xl font-bold text-sm shadow-md">
                {updating ? <Loader2 className="animate-spin" /> : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#00a389] text-xs">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="h-8 px-3 text-[10px] font-bold rounded-lg">Edit</Button>
            <div className="h-8 px-3 flex items-center bg-[#00a389] text-white text-[10px] font-bold rounded-lg shadow-sm">
              {lead.status}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Main Info Card (Reduced Padding) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-xl text-white flex items-center justify-center text-xl font-black shadow-sm", isOverdue ? "bg-red-500" : "bg-[#00a389]")}>
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">{lead.name}</h1>
                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">{lead.company || 'Direct Client'}</p>
                    </div>
                </div>
            </div>

            {/* Activity (Compact) */}
            <div className="space-y-3">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Activity Feed</h2>
                <div className="relative">
                  <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Quick update..." className="w-full p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm min-h-[80px]" />
                  <button onClick={handleAddNote} className="absolute bottom-2 right-2 bg-[#00a389] text-white p-1.5 rounded-lg shadow-md"><Send size={14} /></button>
                </div>
                <div className="space-y-2">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <p className="text-xs font-semibold text-slate-700 leading-snug">{note.content}</p>
                          <span className="text-[9px] text-slate-300 font-bold mt-1 block">{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Sidebar (Slimmer) */}
          <div className="space-y-5">
            <div className={cn("p-5 rounded-2xl text-white shadow-md", isOverdue ? "bg-red-600" : "bg-slate-900")}>
                <span className="font-bold uppercase tracking-widest text-[9px] opacity-60">Next Follow-up</span>
                <h3 className="text-lg font-bold mt-1">{lead.next_action_date || 'No Date'}</h3>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Documents</span>
                    <button onClick={() => fileInputRef.current?.click()} className="p-1 rounded-md bg-slate-50 text-slate-400 hover:text-[#00a389]"><Upload size={14}/></button>
                </div>
                {lead.document_url ? (
                    <a href={lead.document_url} target="_blank" className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px] font-bold text-slate-600 border border-slate-100">
                        <FileText size={14} className="text-[#00a389]" /> View Brief <ChevronRight size={12} />
                    </a>
                ) : <p className="text-center text-[10px] text-slate-300 italic">No files</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}