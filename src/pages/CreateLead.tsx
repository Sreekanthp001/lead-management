// CreateLead.tsx updated with your note features
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link2, FileText, Upload, Calendar, ArrowLeft } from 'lucide-react';

export default function CreateLead() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-['Outfit']">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-[#00a389] transition-colors">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Create Lead</h1>
          <p className="text-slate-500 font-bold mt-2">Add a new lead to Venturemond CRM with full context</p>
        </div>

        <form className="space-y-8">
          {/* Section 1: Basic Info */}
          <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Required Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Name (Person / Company) *</Label>
                  <Input placeholder="e.g. Sarah Chen" className="rounded-xl border-slate-200 py-6 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Source *</Label>
                  <Input placeholder="LinkedIn, Upwork, etc." className="rounded-xl border-slate-200 py-6 font-bold" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Relevant Links (Nuvvu adigina 1st point) */}
          <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <div className="flex items-center gap-3">
                <Link2 className="text-[#00a389]" size={20} />
                <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Relevant Links</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <Input placeholder="Portfolio URL" className="rounded-xl border-slate-200 py-6 font-bold" />
              <Input placeholder="LinkedIn Profile / Social Link" className="rounded-xl border-slate-200 py-6 font-bold" />
            </CardContent>
          </Card>

          {/* Section 3: Context & Meetings (Nuvvu adigina 2nd point) */}
          <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <div className="flex items-center gap-3">
                <FileText className="text-[#00a389]" size={20} />
                <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Context & Meeting Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <Textarea 
                placeholder="1st Meeting: Discussed project scope...&#10;2nd Meeting: Shared quotation..." 
                className="rounded-xl border-slate-200 min-h-[150px] font-bold p-6" 
              />
            </CardContent>
          </Card>

          {/* Section 4: Document Upload & Dates (Nuvvu adigina 3rd & 4th points) */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                <div className="flex items-center gap-3">
                  <Upload className="text-[#00a389]" size={20} />
                  <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Upload Document</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-400 hover:border-[#00a389] hover:bg-slate-50 transition-all cursor-pointer">
                  <Upload size={32} className="mb-2" />
                  <p className="font-bold text-sm text-center">Click to upload proposal or requirements (PDF)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/60 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#00a389]" size={20} />
                  <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Next Follow-up</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <Label className="font-bold text-slate-700 italic">Example: Next Meeting 26th Feb</Label>
                <Input type="date" className="rounded-xl border-slate-200 py-6 font-bold" />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-6">
            <Button className="bg-[#00a389] hover:bg-[#008f78] text-white px-12 py-8 rounded-2xl font-black text-lg shadow-lg shadow-[#00a389]/20 transition-all hover:-translate-y-1">
              Save Lead to Venturemond
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}