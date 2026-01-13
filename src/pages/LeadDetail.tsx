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

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading...</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '16px', fontFamily: 'sans-serif' }}>
      
      {/* MODAL - Direct Style override */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: '10px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '350px', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>EDIT LEAD</span>
              <button onClick={() => setIsEditModalOpen(false)}><X size={14}/></button>
            </div>
            <div style={{ padding: '15px' }}>
              <input value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', marginBottom: '10px' }} placeholder="Name" />
              <button onClick={() => setIsEditModalOpen(false)} style={{ width: '100%', padding: '10px', backgroundColor: '#00a389', color: 'white', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>SAVE CHANGES</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <button onClick={() => navigate(-1)} style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={12}/> BACK
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsEditModalOpen(true)} style={{ fontSize: '10px', padding: '4px 10px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }}>EDIT</button>
            <span style={{ fontSize: '10px', padding: '4px 10px', backgroundColor: '#00a389', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>{lead.status}</span>
          </div>
        </div>

        {/* Info Card */}
        <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#00a389', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
            {lead.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{lead.name}</h1>
            <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, textTransform: 'uppercase' }}>{lead.company || 'Direct Client'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '15px' }}>
          {/* Main Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Quick note..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', minHeight: '60px', outline: 'none' }} />
              <button style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: '#00a389', color: 'white', padding: '6px', borderRadius: '4px' }}><Send size={12}/></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notes.map(note => (
                <div key={note.id} style={{ backgroundColor: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '12px', margin: 0, color: '#334155' }}>{note.content}</p>
                  <span style={{ fontSize: '8px', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', color: 'white' }}>
              <span style={{ fontSize: '9px', opacity: 0.6, textTransform: 'uppercase' }}>Next Action</span>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '2px' }}>{lead.next_action_date || 'TBD'}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#94a3b8' }}>FILES</span>
                <Upload size={12} color="#cbd5e1"/>
              </div>
              {lead.document_url ? (
                <a href={lead.document_url} target="_blank" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '4px', textDecoration: 'none', color: '#475569', fontSize: '11px', fontWeight: 'bold' }}>
                  <FileText size={12}/> BRIEF <ChevronRight size={10}/>
                </a>
              ) : <div style={{ fontSize: '10px', color: '#cbd5e1', textAlign: 'center' }}>No Files</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}