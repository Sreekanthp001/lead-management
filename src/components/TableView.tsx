import { Download, Trash2 } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Lead } from '@/contexts/LeadsContext';

export default function TableView({ leads = [], isAdmin, userId }: { leads: Lead[]; isAdmin?: boolean; userId?: string | null }) {
  const navigate = useNavigate();

  // DELETE FUNCTION
  const deleteLead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Row click trigger avvakunda stop chestundi
    const lead = leads.find(l => l.id === id);
    const canManage = isAdmin || (!!userId && (lead?.assigned_to === userId || lead?.user_id === userId));

    if (!canManage) {
      toast.error("You can only delete your own leads.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this lead?")) {
      const { error } = await supabase.from('leads').delete().match({ id });
      if (error) toast.error(error.message);
      else toast.success("Lead deleted successfully!");
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) return alert("Export cheyadaniki data ledhu mawa!");
    const headers = "Name,Company,Source,Status,Priority,Next Action\n";
    const rows = leads.map(l =>
      `${l.name || 'N/A'},${l.company || 'Direct'},${l.source || 'Other'},${l.status},${l.priority},${l.next_action_date || 'N/A'}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Venturemond_Leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Lead Database</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Total: {leads.length} Records</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#00a389] text-white rounded-xl text-[10px] font-black uppercase hover:opacity-90 transition-all shadow-md"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
              {['Lead Info', 'Source', 'Status', 'Priority', 'Next Action', 'Actions'].map(header => (
                <th key={header} className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
            {leads.map(lead => (
              <tr
                key={lead.id}
                onClick={() => navigate(`/lead/${lead.id}`)} // Detail page navigation
                className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <td className="p-4">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{lead.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">{lead.company || 'Direct Client'}</p>
                </td>
                <td className="p-4 uppercase text-[10px] font-bold text-slate-500">{lead.source || 'Other'}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-[#00a389] text-[10px] font-black uppercase">
                    {lead.status}
                  </span>
                </td>
                <td className="p-4 font-bold text-[10px] uppercase">
                  <span className={lead.priority === 'High' ? "text-red-500" : lead.priority === 'Medium' ? "text-orange-500" : "text-blue-500"}>
                    {lead.priority}
                  </span>
                </td>
                <td className="p-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  {lead.next_action_date || 'N/A'}
                </td>
                {/* DELETE BUTTON COLUMN */}
                <td className="p-4 text-center">
                  <button onClick={(e) => deleteLead(e, lead.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}