import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Calendar, Link2, FileText, Paperclip, 
  ExternalLink, Clock, User, Briefcase, ChevronRight,
  Upload, Loader2, Send, MessageSquare
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]); // New state for multi-notes
  const [newNote, setNewNote] = useState(''); // New state for input
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    setLoading(true);
    // 1. Fetch Lead Details
    const { data: leadData } = await supabase.from('leads').select('*').eq('id', id).single();
    
    // 2. Fetch Related Notes from lead_notes table
    const { data: notesData } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false });

    setLead(leadData);
    setNotes(notesData || []);
    setLoading(false);
  };

  // Note saving function
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSendingNote(true);
    const { data, error } = await supabase
      .from('lead_notes')
      .insert([{ lead_id: id, content: newNote.trim() }])
      .select();

    if (!error && data) {
      setNotes([data[0], ...notes]);
      setNewNote('');
    }
    setSendingNote(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lead-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lead-documents')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('leads')
        .update({ document_url: publicUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      fetchLeadData();
      alert("File uploaded successfully!");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#00a389] animate-pulse">Loading Venturemond Data...</div>;
  if (!lead) return <div className="p-10 text-center font-black">Lead not found!</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-['Outfit']">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-slate-500 font-black transition-all hover:text-[#00a389]">
            <div className="p-2 rounded-xl bg-white shadow-sm group-hover:bg-[#00a389] group-hover:text-white transition-all">
                <ArrowLeft size={20} />
            </div>
            Back to Dashboard
          </button>
          
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white text-slate-900 border-none shadow-sm font-black rounded-2xl px-6 hover:bg-slate-100">Edit Lead</Button>
            <Button className="bg-[#00a389] text-white font-black rounded-2xl px-6 shadow-lg shadow-[#00a389]/20">Update Status</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Main Profile Card */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 relative overflow-hidden border border-slate-100">
                <div className="absolute top-0 right-0 p-8">
                    <span className="px-6 py-2 rounded-2xl bg-[#00a389]/10 text-[#00a389] text-xs font-black uppercase tracking-widest border border-[#00a389]/20">
                        {lead.status}
                    </span>
                </div>
                
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-[#00a389] to-[#00816d] text-white flex items-center justify-center text-4xl font-black shadow-lg shadow-[#00a389]/30">
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900">{lead.name}</h1>
                        <p className="text-slate-400 font-bold flex items-center gap-2 mt-1 uppercase text-xs tracking-tighter">
                           <Briefcase size={14} /> {lead.company || 'Direct Client'} • Source: {lead.source}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {lead.portfolio_url && (
                        <a href={lead.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#00a389] transition-all group">
                            <div className="flex items-center gap-3">
                                <Link2 className="text-[#00a389]" />
                                <span className="font-black text-sm text-slate-700">Portfolio</span>
                            </div>
                            <ExternalLink size={16} className="text-slate-300 group-hover:text-[#00a389]" />
                        </a>
                    )}
                    {lead.linkedin_url && (
                        <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#00a389] transition-all group">
                            <div className="flex items-center gap-3">
                                <User className="text-blue-500" />
                                <span className="font-black text-sm text-slate-700">LinkedIn Profile</span>
                            </div>
                            <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500" />
                        </a>
                    )}
                </div>
            </div>

            {/* Step 1: Interaction Timeline (Activity Notes) */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 px-4">
                    <MessageSquare className="text-[#00a389]" /> Activity Notes
                </h2>
                
                {/* Note Input Box */}
                <form onSubmit={handleAddNote} className="relative group">
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type what happened in the meeting..."
                    className="w-full p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm focus:ring-4 focus:ring-[#00a389]/5 outline-none font-bold text-slate-600 min-h-[150px] transition-all"
                  />
                  <button 
                    disabled={sendingNote || !newNote.trim()}
                    className="absolute bottom-6 right-6 bg-[#00a389] text-white p-4 rounded-2xl shadow-lg shadow-[#00a389]/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                  >
                    {sendingNote ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>

                {/* Dynamic Notes List */}
                <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative">
                              <div className="absolute -left-[27px] top-6 w-4 h-4 rounded-full bg-[#00a389] border-4 border-[#f8fafc]" />
                              <p className="text-slate-600 font-bold whitespace-pre-wrap leading-relaxed">
                                  {note.content}
                              </p>
                              <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Clock size={12} /> {new Date(note.created_at).toLocaleString()}
                              </div>
                          </div>
                      </div>
                    ))}

                    {notes.length === 0 && (
                        <div className="text-center p-10 bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                            No activity notes yet. Start by adding one above!
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <div className="bg-[#0b0f1a] p-8 rounded-[3rem] text-white shadow-2xl shadow-blue-900/20">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="text-[#00a389]" />
                    <span className="font-black uppercase tracking-widest text-xs text-slate-400">Next Follow-up</span>
                </div>
                <h3 className="text-3xl font-black mb-2">{lead.next_action_date || 'No Date Set'}</h3>
                <p className="text-slate-500 text-sm font-bold">Stay updated for Venturemond progress.</p>
            </div>

            {/* Documents Section */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Paperclip className="text-[#00a389]" />
                        <span className="font-black uppercase tracking-widest text-xs text-slate-400">Documents</span>
                    </div>
                    <input 
                      type="file" 
                      hidden 
                      ref={fileInputRef} 
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.png,.jpg"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-[#00a389] hover:text-white transition-all text-slate-400"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    </button>
                </div>

                {lead.document_url ? (
                    <div className="space-y-3">
                        <a 
                          href={lead.document_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#00a389] transition-all group"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText className="text-[#00a389] shrink-0" size={18} />
                                <span className="font-black text-sm text-slate-700 truncate">View Proposal / Doc</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-[#00a389]" />
                        </a>
                    </div>
                ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-slate-400 text-xs font-bold italic">No documents uploaded</p>
                    </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}