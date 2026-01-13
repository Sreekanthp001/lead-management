import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Calendar, Link2, FileText, ExternalLink, 
  Clock, Briefcase, ChevronRight, Upload, Loader2, Send, MessageSquare, X
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
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchLeadData(); }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const { data: leadData } = await supabase.from('leads').select('*').eq( 'id', id).single();
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
      }).eq('id', id);
      setIsEditModalOpen(false);
      fetchLeadData();
    } catch (error: any) { alert(error.message); } finally { setUpdating(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#00a389]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6 font-sans">
      
      {/* --- EDIT MODAL (SMALL SIZE) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-lg overflow-hidden border">
            <div className="px-4 py-2 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xs font-bold uppercase text-gray-500">Edit Lead</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X size={14}/></button>
            </div>
            <form onSubmit={handleUpdateLead} className="p-4 space-y-3">
              <input value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 border rounded text-sm outline-none" placeholder="Name" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={editFormData.next_action_date || ''} onChange={e => setEditFormData({...editFormData, next_action_date: e.target.value})} className="p-2 border rounded text-sm" />
                <select value={editFormData.priority} onChange={e => setEditFormData({...editFormData, priority: e.target.value})} className="p-2 border rounded text-sm">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <Button type="submit" disabled={updating} className="w-full h-9 bg-[#00a389] text-sm">Save</Button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Nav Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 font-bold text-[10px] uppercase hover:text-[#00a389]">
            <ArrowLeft size={12} /> Dashboard
          </button>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="h-7 px-3 text-[10px] font-bold rounded">Edit</Button>
            <div className="h-7 px-3 flex items-center bg-[#00a389] text-white text-[10px] font-bold rounded shadow-sm">{lead.status}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Header Card (Slimmed) */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#00a389] text-white flex items-center justify-center text-lg font-bold">{lead.name.charAt(0)}</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">{lead.name}</h1>
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">{lead.company || 'Direct Client'}</p>
              </div>
            </div>

            {/* Note Entry */}
            <div className="space-y-2">
              <div className="relative">
                <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Quick note..." className="w-full p-3 bg-white rounded-lg border border-gray-100 text-xs min-h-[60px] outline-none shadow-sm" />
                <button className="absolute bottom-2 right-2 bg-[#00a389] text-white p-1.5 rounded-md"><Send size={12} /></button>
              </div>
              
              {/* Activity List */}
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white p-3 rounded-md border border-gray-50 shadow-sm">
                    <p className="text-xs text-gray-700 leading-relaxed">{note.content}</p>
                    <span className="text-[8px] text-gray-300 font-bold mt-1 block uppercase">{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Compact) */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-900 text-white shadow-md border-l-4 border-[#00a389]">
              <span className="font-bold uppercase tracking-widest text-[8px] opacity-50 block mb-1">Target Date</span>
              <h3 className="text-sm font-bold">{lead.next_action_date || 'Not Set'}</h3>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase text-gray-400">Attached Files</span>
                <Upload size={12} className="text-gray-300" />
              </div>
              {lead.document_url ? (
                <a href={lead.document_url} target="_blank" className="flex items-center justify-between p-2 rounded bg-gray-50 text-[10px] font-bold text-gray-600 border border-gray-100">
                  <div className="flex items-center gap-2"><FileText size={12} /> Brief</div>
                  <ChevronRight size={10} />
                </a>
              ) : <p className="text-[9px] text-gray-300 italic text-center py-2">No documents</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}