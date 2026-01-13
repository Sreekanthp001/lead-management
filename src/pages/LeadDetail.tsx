import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Send, Building2, Calendar, 
  MoreHorizontal, User, Mail, Phone, 
  MessageSquare, History 
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const { data } = await supabase.from('lead_notes').insert([{ lead_id: id, content: newNote }]).select();
    if (data) {
      setNotes([data[0], ...notes]);
      setNewNote('');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-xs font-bold text-slate-400 animate-pulse tracking-widest uppercase">Loading Lead Details...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6 font-['Inter',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Navigation & Actions */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-all">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
          </button>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white hover:bg-slate-50 transition-all">Edit Profile</button>
            <div className="px-3 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-lg uppercase tracking-wider border border-emerald-200">
              {lead.status}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column: Lead Profile */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-3 shadow-lg shadow-blue-100">
                {lead.name.charAt(0)}
              </div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">{lead.name}</h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center justify-center gap-1 mt-1">
                <Building2 size={12}/> {lead.company || 'Direct Client'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Quick Info</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Calendar size={14}/> Follow-up</span>
                <span className="font-bold text-slate-800">{lead.next_action_date || 'Not Set'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><History size={14}/> Priority</span>
                <span className={cn("font-bold", lead.priority === 'High' ? "text-red-500" : "text-blue-500")}>{lead.priority || 'Normal'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interaction & Notes */}
          <div className="lg:col-span-2 space-y-4">
            {/* Note Input */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm">
                <MessageSquare size={16} className="text-blue-500"/> Activity Feed
              </div>
              <div className="relative">
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Log an update or add a note..." 
                  className="w-full p-3 text-sm border border-slate-200 rounded-lg min-h-[80px] outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50/50" 
                />
                <button 
                  onClick={handleAddNote}
                  className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-md"
                >
                  <Send size={14}/>
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {new Date(note.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <MoreHorizontal size={14} className="text-slate-300"/>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{note.content}</p>
                </div>
              ))}
              
              {notes.length === 0 && (
                <div className="text-center py-10 bg-slate-50 border-2 border-dashed rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest">
                  No activity logged yet
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}