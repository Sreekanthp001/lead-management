import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TableView from '@/components/TableView';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';

export default function TableViewPage() {
  const { leads, loading, fetchLeads } = useLeads();
  const { role, session } = useAuth();
  const userId = session?.user?.id;
  const isAdmin = role === 'admin' || role === 'super_admin';

  useEffect(() => {
    if (userId) {
      fetchLeads(userId);
    }
  }, [userId, fetchLeads]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f1f5f9] dark:bg-[#0b0f1a]">
      <Loader2 className="animate-spin text-[#00a389]" size={32} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight italic uppercase text-[#00a389]">VentureMond</h1>
            <span className="text-slate-300 dark:text-slate-700 text-2xl font-light">/</span>
            <h2 className="text-xl font-bold text-slate-500 uppercase tracking-tight">Table View</h2>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Master View of All Leads</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TableView leads={leads} isAdmin={isAdmin} userId={userId} />
      </div>
    </div>
  );
}