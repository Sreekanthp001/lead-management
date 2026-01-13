import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, FileText, ChevronRight, Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [newNote, setNewNote] = useState('');

  useEffect(() => { fetchLeadData(); }, [id]);

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

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-300">...</div>;

  return (
    <div className="min-h-screen bg-[#fcfdfe] p-3 font-sans antialiased text-slate-800">
      
      {/* COMPACT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white w-[300px] rounded-lg shadow-xl border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Edit Info</span>
              <button onClick={() => setIsEditModalOpen(false)}><X size={14}/></button>
            </div>
            <input value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 mb-2 text-xs border rounded outline-none bg-slate-50" placeholder="Name" />
            <Button onClick={() => setIsEditModalOpen(false)} className="w-full h-8 bg-[#00a389] text-[11px] font-bold">SAVE</Button>
          </div>
        </div>
      )}

      <div className="max-w-[650px] mx-auto space-y-3">
        {/* Nav Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-[10px] font-bold text-slate-400 flex items-center gap-1 hover:text-[#00a389]">
            <ArrowLeft size={12}/> BACK
          </button>
          <div className="flex gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] px-2 py-1 border rounded font-bold text-slate-500 hover:bg-slate-50 transition-all">EDIT</button>
            <div className="text-[10px] px-2 py-1 bg-[#00a389] text-white rounded font-bold shadow-sm">{lead.status}</div>
          </div>
        </div>

        {/* Header Card - Now Much Smaller */}
        <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-[#00a389] text-white rounded-md flex items-center justify-center text-sm font-black shadow-inner">
            {lead.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">{lead.name}</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{lead.company || 'Direct Client'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
          {/* Main Feed */}
          <div className="space-y-3">
            <div className="relative group">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Type a note..." className="w-full p-2 text-xs border border-slate-100 rounded-lg min-h-[50px] outline-none shadow-sm focus:border-[#00a389] transition-all bg-white" />
              <button className="absolute bottom-2 right-2 bg-[#00a389] text-white p-1 rounded-md opacity-80 hover:opacity-100"><Send size={12}/></button>
            </div>
            
            <div className="space-y-2">
              {notes.map(note => (
                <div key={note.id} className="bg-white p-2 rounded-md border border-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <p className="text-[11px] text-slate-600 leading-tight">{note.content}</p>
                  <span className="text-[8px] text-slate-300 font-bold mt-1 block uppercase">{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Compact Layout */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-lg text-white shadow-md border-b-2 border-[#00a389]">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Follow-up</span>
              <div className="text-[13px] font-bold">{lead.next_action_date || 'TBD'}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Files</span>
                <Upload size={10} className="text-slate-300"/>
              </div>
              {lead.document_url ? (
                <a href={lead.document_url} target="_blank" className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-500 hover:text-[#00a389] transition-colors">
                  <div className="flex items-center gap-2"><FileText size={10}/> Brief</div>
                  <ChevronRight size={10}/>
                </a>
              ) : <div className="text-[9px] text-slate-300 italic text-center py-1">No files attached</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}