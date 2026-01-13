import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Calendar, Link2, FileText, Paperclip, 
  ExternalLink, Clock, User, Briefcase, ChevronRight 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeadDetails = async () => {
      setLoading(true);
      const { data } = await supabase.from('leads').select('*').eq('id', id).single();
      setLead(data);
      setLoading(false);
    };
    fetchLeadDetails();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
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
            <Button className="bg-white text-slate-900 border-none shadow-sm font-black rounded-2xl px-6 hover:bg-slate-100">Edit Lead</Button>
            <Button className="bg-[#00a389] text-white font-black rounded-2xl px-6 shadow-lg shadow-[#00a389]/20">Update Status</Button>
          </div>
        </div>

        {/* Hero Section: Status & Main Info */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Main Profile Card */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <span className="px-6 py-2 rounded-2xl bg-[#00a389]/10 text-[#00a389] text-xs font-black uppercase tracking-widest border border-[#00a389]/20">
                        {lead.status}
                    </span>
                </div>
                
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-[#00a389] text-white flex items-center justify-center text-4xl font-black">
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900">{lead.name}</h1>
                        <p className="text-slate-400 font-bold flex items-center gap-2 mt-1 uppercase text-xs tracking-tighter">
                           <Briefcase size={14} /> {lead.company || 'Direct Client'} • Source: {lead.source}
                        </p>
                    </div>
                </div>

                {/* Quick Action Links (1st Point - Portfolio/Social) */}
                <div className="grid grid-cols-2 gap-4">
                    {lead.portfolio_url && (
                        <a href={lead.portfolio_url} target="_blank" className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#00a389] transition-all group">
                            <div className="flex items-center gap-3">
                                <Link2 className="text-[#00a389]" />
                                <span className="font-black text-sm text-slate-700">Portfolio</span>
                            </div>
                            <ExternalLink size={16} className="text-slate-300 group-hover:text-[#00a389]" />
                        </a>
                    )}
                    {lead.social_link && (
                        <a href={lead.social_link} target="_blank" className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#00a389] transition-all group">
                            <div className="flex items-center gap-3">
                                <User className="text-blue-500" />
                                <span className="font-black text-sm text-slate-700">LinkedIn / Social</span>
                            </div>
                            <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500" />
                        </a>
                    )}
                </div>
            </div>

            {/* Timeline View (2nd Point - Meeting Notes) */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 px-4">
                    <Clock className="text-[#00a389]" /> Interaction Timeline
                </h2>
                
                <div className="space-y-4">
                    {lead.meeting_notes ? (
                        <div className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative">
                                <div className="absolute -left-[27px] top-8 w-4 h-4 rounded-full bg-[#00a389] border-4 border-[#f8fafc]" />
                                <div className="flex items-center gap-2 mb-4 text-[#00a389]">
                                    <FileText size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">Meeting Notes</span>
                                </div>
                                <div className="text-slate-600 font-bold whitespace-pre-wrap leading-relaxed text-lg">
                                    {lead.meeting_notes}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-10 bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                            No meeting notes added yet.
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Right Sidebar: Follow-ups & Docs */}
          <div className="space-y-8">
            {/* Follow-up Card */}
            <div className="bg-[#0b0f1a] p-8 rounded-[3rem] text-white shadow-2xl shadow-blue-900/20">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="text-[#00a389]" />
                    <span className="font-black uppercase tracking-widest text-xs text-slate-400">Next Follow-up</span>
                </div>
                <h3 className="text-3xl font-black mb-2">{lead.next_action_date || 'No Date Set'}</h3>
                <p className="text-slate-500 text-sm font-bold">Remember to follow up on this date.</p>
            </div>

            {/* Documents Section (3rd Point) */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-6">
                    <Paperclip className="text-[#00a389]" />
                    <span className="font-black uppercase tracking-widest text-xs text-slate-400">Documents</span>
                </div>
                {lead.document_url ? (
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
                        <span className="font-black text-sm text-slate-700">Proposal.pdf</span>
                        <ChevronRight size={18} className="text-[#00a389]" />
                    </button>
                ) : (
                    <p className="text-slate-400 text-sm font-bold text-center py-4 italic">No documents uploaded</p>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}