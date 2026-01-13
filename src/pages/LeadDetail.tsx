import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, FileText, ChevronRight, Upload, X } from 'lucide-react';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => { 
    const fetchLeadData = async () => {
      try {
        setLoading(true);
        const { data: leadData } = await supabase.from('leads').select('*').eq('id', id).single();
        const { data: notesData } = await supabase.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false });
        setLead(leadData);
        setNotes(notesData || []);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchLeadData(); 
  }, [id]);

  if (loading) return <div className="p-4 text-center text-xs font-bold text-gray-400">LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-2 font-sans overflow-x-hidden">
      
      {/* 50% SHRUNK CONTAINER */}
      <div className="max-w-[500px] mx-auto space-y-2">
        
        {/* SMALL HEADER */}
        <div className="flex justify-between items-center px-1">
          <button onClick={() => navigate(-1)} className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
            <ArrowLeft size={10}/> BACK
          </button>
          <div className="flex gap-1">
            <button onClick={() => setIsEditModalOpen(true)} className="text-[9px] px-2 py-0.5 border rounded bg-white font-bold text-slate-500">EDIT</button>
            <div className="text-[9px] px-2 py-0.5 bg-[#00a389] text-white rounded font-bold uppercase">{lead.status}</div>
          </div>
        </div>

        {/* COMPACT LEAD CARD */}
        <div className="bg-white p-2 rounded-md border border-slate-200 flex items-center gap-2 shadow-sm">
          <div className="w-7 h-7 bg-[#00a389] text-white rounded flex items-center justify-center text-xs font-bold shrink-0">
            {lead.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold text-slate-900 truncate">{lead.name}</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase truncate">{lead.company || 'Direct Client'}</p>
          </div>
        </div>

        {/* TWO COLUMN COMPACT GRID */}
        <div className="grid grid-cols-1 gap-2">
          {/* FOLLOW UP BOX */}
          <div className="p-2 bg-slate-900 rounded-md text-white flex justify-between items-center">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Follow-up:</span>
            <div className="text-[10px] font-bold">{lead.next_action_date || 'TBD'}</div>
          </div>

          {/* NOTES AREA */}
          <div className="space-y-1.5">
            <div className="relative">
              <textarea placeholder="Quick note..." className="w-full p-2 text-[10px] border border-slate-200 rounded-md min-h-[40px] outline-none bg-white" />
              <button className="absolute bottom-1.5 right-1.5 bg-[#00a389] text-white p-1 rounded-sm"><Send size={8}/></button>
            </div>
            
            <div className="space-y-1">
              {notes.map(note => (
                <div key={note.id} className="bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-600 m-0 leading-tight">{note.content}</p>
                  <span className="text-[7px] text-slate-300 font-bold block mt-0.5 uppercase">{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}