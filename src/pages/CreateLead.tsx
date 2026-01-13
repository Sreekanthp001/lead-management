import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link2, FileText, Upload, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function CreateLead() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // States for all your custom fields
  const [formData, setFormData] = useState({
    name: '',
    source: '',
    portfolio_url: '',
    social_link: '',
    meeting_notes: '',
    next_action_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            name: formData.name,
            source: formData.source,
            portfolio_url: formData.portfolio_url,
            social_link: formData.social_link,
            meeting_notes: formData.meeting_notes,
            next_action_date: formData.next_action_date || null,
            status: 'New' // Default status
          }
        ]);

      if (error) throw error;

      toast({ title: "Success!", description: "Lead added to Venturemond." });
      navigate('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-['Outfit']">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-[#00a389] transition-colors">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Create Lead</h1>
          <p className="text-slate-500 font-bold mt-2 text-lg">Venturemond CRM — Full Context Mode</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Required Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 ml-1">Name (Person / Company) *</Label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Sarah Chen" 
                    className="rounded-2xl border-slate-200 py-7 font-bold focus:ring-[#00a389]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 ml-1">Source *</Label>
                  <Input 
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    placeholder="LinkedIn, Upwork, etc." 
                    className="rounded-2xl border-slate-200 py-7 font-bold" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Relevant Links */}
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <div className="flex items-center gap-3">
                <Link2 className="text-[#00a389]" size={20} />
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Relevant Links</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <Input 
                value={formData.portfolio_url}
                onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                placeholder="Portfolio URL" 
                className="rounded-2xl border-slate-200 py-7 font-bold" 
              />
              <Input 
                value={formData.social_link}
                onChange={(e) => setFormData({...formData, social_link: e.target.value})}
                placeholder="LinkedIn Profile / Social Link" 
                className="rounded-2xl border-slate-200 py-7 font-bold" 
              />
            </CardContent>
          </Card>

          {/* Section 3: Context & Meetings */}
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <div className="flex items-center gap-3">
                <FileText className="text-[#00a389]" size={20} />
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Context & Meeting Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <Textarea 
                value={formData.meeting_notes}
                onChange={(e) => setFormData({...formData, meeting_notes: e.target.value})}
                placeholder="1st Meeting: Discussed project scope...&#10;2nd Meeting: Shared quotation..." 
                className="rounded-2xl border-slate-200 min-h-[160px] font-bold p-6 text-lg" 
              />
            </CardContent>
          </Card>

          {/* Section 4: Document & Date */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                <div className="flex items-center gap-3">
                    <Upload className="text-[#00a389]" size={20} />
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Upload Document</CardTitle>
                </div>
                </CardHeader>
                <CardContent className="p-8">
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-slate-400 hover:border-[#00a389] hover:bg-slate-50 transition-all cursor-pointer group">
                    <Upload size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-sm text-center">Upload Proposal (PDF)</p>
                </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#00a389]" size={20} />
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Next Follow-up</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <Label className="font-bold text-slate-400 italic text-xs uppercase tracking-wider">Target: Next Meeting 26th Feb</Label>
                <Input 
                  type="date" 
                  value={formData.next_action_date}
                  onChange={(e) => setFormData({...formData, next_action_date: e.target.value})}
                  className="rounded-2xl border-slate-200 py-7 font-black text-slate-700" 
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-6 pb-20">
            <Button 
              type="submit"
              disabled={loading}
              className="bg-[#00a389] hover:bg-[#008f78] text-white px-16 py-9 rounded-[1.8rem] font-black text-xl shadow-2xl shadow-[#00a389]/40 transition-all hover:-translate-y-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Save Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}