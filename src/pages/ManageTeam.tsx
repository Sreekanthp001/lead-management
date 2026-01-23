import { useEffect, useState, memo, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { UserPlus, Users, Loader2, Trash2, X, Linkedin, Copy, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useLeads } from '@/contexts/LeadsContext';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ... (existing types remain the same, simplified for brevity in replacement if possible, but easier to just invoke the function below)

type Lead = {
  id: string;
  name: string;
  email?: string;
  status?: string;
  linkedin_url?: string; // Standardize this naming if needed, assuming DB column is likely 'linkedin_url' or similar, strict generic type for now
  user_id?: string;
  assigned_to?: string;
  [key: string]: any;
};

type TeamMember = {
  id: string;
  email?: string | null;
  name?: string | null;
  full_name?: string | null;
  role?: string | null;
  leadCount?: number;
  activeCount?: number;
  statusSummary?: Record<string, number>;
  leads?: Lead[];
};

const TeamMemberCard = memo(({ member, onSelect, onDelete, isAdmin, processingId }: {
  member: TeamMember,
  onSelect: (m: TeamMember) => void,
  onDelete: (id: string, e: React.MouseEvent) => void,
  isAdmin: boolean,
  processingId: string | null
}) => (
  <div
    onClick={() => onSelect(member)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(member); }}
    className="p-5 rounded-[28px] bg-card border border-border hover:border-[#00a389] hover:shadow-lg cursor-pointer transition-all group shadow-md relative active:scale-[0.98] focus:ring-2 focus:ring-[#00a389] focus:outline-none"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-[#00a389] uppercase shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-[#00a389]/10" />
          <span className="relative z-10">{member.name?.charAt(0) || 'U'}</span>
        </div>
        <div>
          <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[120px]">{member.name}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] font-medium">{member.email}</p>
        </div>
      </div>
      <span className={`text-[8px] px-2 py-1 rounded-lg font-black uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-[#00a389]/10 text-[#00a389]'}`}>
        {member.role === 'admin' ? 'Sub-Admin' : 'User'}
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-2 mb-4">
      {member.statusSummary && Object.entries(member.statusSummary)
        .sort(([a], [b]) => a === 'New' ? -1 : b === 'New' ? 1 : 0)
        .map(([status, count]) => (
          <span key={status} className={cn(
            "text-[9px] px-3 py-1 rounded-lg font-semibold uppercase tracking-tighter shadow-sm border",
            status === 'New' ? "bg-blue-600 text-white border-blue-700 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-900/30" :
              status === 'In-Progress' ? "bg-amber-500 text-white border-amber-600 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-900/30" :
                status === 'Won' ? "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500/20 dark:text-[#52ffde] dark:border-emerald-900/30" :
                  "bg-slate-600 text-white border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
          )}>
            {count} {status}
          </span>
        ))}
      {(!member.statusSummary || Object.keys(member.statusSummary).length === 0) && (
        <span className="text-[8px] text-slate-400 font-bold uppercase italic">No leads assigned</span>
      )}
    </div>

    <div className="flex items-center gap-6 pt-4 border-t border-border">
      <div>
        <p className="text-sm font-black text-slate-900 dark:text-white">{member.leadCount || 0}</p>
        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">Total Leads</p>
      </div>
      <div>
        <p className="text-sm font-black text-[#00a389]">{member.activeCount || 0}</p>
        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">Active</p>
      </div>
      {isAdmin && (
        <button
          onClick={(e) => onDelete(member.id, e)}
          disabled={processingId === member.id}
          className="ml-auto p-2 text-black hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
        >
          {processingId === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      )}
    </div>
  </div>
));

export default function ManageTeam() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'agent' | 'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { session, user, role: currentUserRole, isAdmin } = useAuth();
  const { teamMembers, setTeamMembers, loadingMembers, setLoadingMembers, lastFetched, setLastFetched, addTeamMember, removeTeamMember } = useTeam();
  const { addOptimisticLead } = useLeads();
  const currentUserId = user?.id;

  // Logic to ensure only admin/super_admin can manage, but users can view their own
  const isStandardUser = !isAdmin;
  const canView = true; // Everyone authenticated can view this page (filtered accordingly)


  // ... (fetchTeamMembers and useEffect hook remain unchanged)

  const fetchTeamMembers = useCallback(async (force = false) => {
    if (!canView || !user?.id) {
      setLoadingMembers(false);
      return;
    }

    // Skip if already fetched within last minute (global cache)
    if (!force && lastFetched && Date.now() - lastFetched < 60000) {
      setLoadingMembers(false);
      return;
    }

    if (!teamMembers.length || force) setLoadingMembers(true);

    // EMERGENCY RESET: 3s fallback
    const safetyTimeout = setTimeout(() => {
      setLoadingMembers(false);
    }, 3000);

    try {
      const currentId = user.id;

      let query = supabase.from('profiles').select('*');

      if (isStandardUser) {
        query = query.eq('id', currentId);
      } else {
        // Broaden role check to ensure all users are captured (case-insensitive DB check)
        query = query.or('role.ilike.admin,role.ilike.user,role.ilike.agent,role.ilike.sub-admin,role.is.null');
      }

      const { data: profiles, error: profileError } = await query;
      if (profileError) throw profileError;

      if (profiles) {
        // Filter out current admin if not viewing own profile
        const listToShow = isStandardUser ? profiles : profiles.filter(a => a.id !== currentId);

        // Fetch leads separately to avoid relationship schema error
        const { data: allLeads, error: leadsError } = await supabase
          .from('leads')
          .select('*') // Bulk fetch full data for instant modal sync
          .in('user_id', listToShow.map(a => a.id));

        if (leadsError) throw leadsError;

        const enriched = listToShow.map(m => {
          const memberLeads = allLeads?.filter(l => l.user_id === m.id) || [];
          const summary = memberLeads.reduce((acc: any, lead: any) => {
            const s = lead.status || 'New';
            const displayStatus = (s === 'Contacted' || s === 'Qualified') ? 'In-Progress' : s;
            acc[displayStatus] = (acc[displayStatus] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return {
            ...m,
            name: m.full_name || m.name || m.email || "Unknown User",
            leadCount: memberLeads.length,
            activeCount: memberLeads.filter((l: any) => !['Lost', 'Won', 'Closed', 'Dropped'].includes(l.status || '')).length,
            statusSummary: summary,
            leads: memberLeads
          };
        });

        setTeamMembers(enriched);
        setLastFetched(Date.now());
      }
    } catch (err: any) {
      console.error("Critical Fetch Error:", err);
      toast.error("Error loading team members: " + err.message);
    } finally {
      clearTimeout(safetyTimeout);
      setLoadingMembers(false);
    }
  }, [canView, user?.id, isStandardUser, lastFetched, teamMembers.length, setTeamMembers, setLoadingMembers, setLastFetched]);

  useEffect(() => {
    const init = async () => {
      if (currentUserId && canView) {
        try {
          await fetchTeamMembers();
        } catch (err) {
          console.error("ManageTeam initial fetch error:", err);
          setLoadingMembers(false);
        }
      }
    };
    init();
  }, [currentUserId, canView, fetchTeamMembers, setLoadingMembers]);

  /* New state for on-demand fetching */
  const [userLeads, setUserLeads] = useState<Lead[]>([]);
  const [loadingUserLeads, setLoadingUserLeads] = useState(false);

  // Handle Modal Data Fetching (Instant Sync from Pre-fetched Team Data)
  useEffect(() => {
    if (selectedMember?.id) {
      const cachedLeads = selectedMember.leads || [];
      if (cachedLeads.length > 0) {
        setUserLeads(cachedLeads);
        setLoadingUserLeads(false);
      } else {
        // Fallback if leads weren't pre-fetched
        const fetchUserData = async () => {
          setLoadingUserLeads(true);
          try {
            const { data, error } = await supabase
              .from('leads')
              .select('*')
              .eq('user_id', selectedMember.id)
              .order('created_at', { ascending: false });

            if (error) throw error;
            setUserLeads(data || []);
          } catch (error) {
            console.error("User data fetch error:", error);
            setUserLeads([]);
          } finally {
            setLoadingUserLeads(false);
          }
        };
        fetchUserData();
      }
    }
  }, [selectedMember?.id, selectedMember?.leads]);

  const handleCloneLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId || processingId) return;

    setProcessingId(leadId);

    // Fetch original lead data
    const { data: original, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError) {
      console.error("Clone Fetch Error:", fetchError);
      toast.error("Failed to fetch lead data");
      setProcessingId(null);
      return;
    }

    // Destructure to remove system fields
    const { id, created_at, user_id, updated_at, ...rest } = original;

    const newLead = {
      ...rest,
      name: `${original.name}`,
      user_id: currentUserId,
      assigned_to: currentUserId,
      created_by_name: user?.user_metadata?.full_name || user?.email,
      created_by_email: user?.email,
      created_by_role: currentUserRole
    };

    // OPTIMISTIC UI: Add to dashboard instantly
    addOptimisticLead({
      id: 'temp-clone-' + Date.now(),
      created_at: new Date().toISOString(),
      ...newLead
    } as any);

    // INSTANT FEEDBACK
    toast.success("Lead Cloned!");
    setProcessingId(null);

    // BACKGROUND SYNC: Insert to database
    supabase.from('leads').insert([newLead]).then(({ error: insertError }) => {
      if (insertError) {
        console.error("Background Clone Error:", insertError);
        toast.error("Clone sync failed");
      }
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      // Singleton Pattern: Using the main exported 'supabase' instance
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            full_name: trimmedName,
            role: selectedRole === 'admin' ? 'admin' : 'user'
          },
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Profile creation with Upsert to handle potential race condition with DB triggers
        const profileRole = selectedRole === 'admin' ? 'admin' : 'user';
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: authData.user.id,
            email: trimmedEmail,
            full_name: trimmedName,
            name: trimmedName,
            role: profileRole,
            parent_id: currentUserId
          }], { onConflict: 'id' });

        if (profileError) {
          console.error("Profile Sync Error:", profileError);
          throw new Error(`Profile sync failed: ${profileError.message}`);
        }

        toast.success(`User account created for ${trimmedName}`);

        // FIX 4: Manual Profile Sync & Local State Update
        const newMember: TeamMember = {
          id: authData.user.id,
          email: trimmedEmail,
          full_name: trimmedName,
          name: trimmedName,
          role: profileRole,
          leadCount: 0,
          activeCount: 0,
          leads: []
        };

        addTeamMember(newMember);

        // Clear form
        setName(''); setEmail(''); setPassword('');
      }
    } catch (error: any) {
      console.error("Creation Error:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    if (processingId) return;
    if (!window.confirm(`Are you sure you want to remove this member?`)) return;

    // Optimistic UI Update
    removeTeamMember(id);
    if (selectedMember?.id === id) setSelectedMember(null);
    setProcessingId(id);

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast.success("Member removed");
    } catch (error: any) {
      // Revert on failure - this would require passing the original member back to context
      // For simplicity, we'll just show an error and let a re-fetch fix it if needed.
      toast.error("Failed to remove member: " + error.message);
      fetchTeamMembers(true); // Force re-fetch to sync state
    } finally {
      setProcessingId(null);
    }
  };

  if (!canView && !loadingMembers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-10">
        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl text-center max-w-md border border-red-100 dark:border-red-900/20">
          <h2 className="text-2xl font-black text-red-500 mb-2 uppercase italic">Access Denied</h2>
          <p className="text-muted-foreground font-medium">This module is reserved for Admin users only. Your current role is: <span className="text-red-400 font-bold uppercase">{currentUserRole}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-full mx-auto space-y-8 bg-background text-foreground min-h-screen relative">
      <div className="flex items-center gap-3 border-b pb-6 border-border">
        <div className="p-3 bg-[#00a389]/10 rounded-2xl">
          <Users className="text-[#00a389]" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground italic">{isStandardUser ? 'My Profile' : 'Team Management'}</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{isStandardUser ? 'View your stats and leads' : 'Register & Monitor Users'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD MEMBER FORM (Only for Admins) */}
        {isAdmin && (
          <div className="bg-card rounded-[32px] p-6 shadow-sm border border-border h-fit sticky top-8">
            <h3 className="text-xs font-black uppercase text-[#00a389] mb-6 tracking-widest">Add New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border-slate-300 dark:border-slate-800 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a389]/20" placeholder="Full Name" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border-slate-300 dark:border-slate-800 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a389]/20" placeholder="Email Address" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border-slate-300 dark:border-slate-800 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a389]/20" placeholder="Password (min 6 chars)" />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-2">Assign Role</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as any)} className="w-full h-12 px-4 py-3 rounded-xl border-slate-300 dark:border-slate-800 border bg-white dark:bg-slate-800 text-slate-700 dark:text-white text-sm font-bold outline-none cursor-pointer">
                  <option value="user">User</option>
                  <option value="admin">Sub-Admin</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#00a389] hover:bg-[#008f78] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-[#00a389]/20">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Create Account
              </button>
            </form>
          </div>
        )}

        {/* TEAM LIST / PROFILE CARD */}
        <div className={`${isStandardUser ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-4`}>
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2 italic">
            {isStandardUser ? 'My Profile Card' : `Active Team Members (${teamMembers.length})`}
          </h2>

          {loadingMembers ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-[#00a389]" size={40} />
              <p className="text-muted-foreground text-xs font-bold animate-pulse uppercase">Fetching Team Records...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="bg-card rounded-[32px] p-12 text-center border-2 border-dashed border-border">
              <p className="text-muted-foreground font-bold text-sm uppercase italic">No additional users found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onSelect={setSelectedMember}
                  onDelete={handleDeleteMember}
                  isAdmin={isAdmin}
                  processingId={processingId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED MEMBER VIEW MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-border">

            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#00a389] text-white flex items-center justify-center text-xl font-bold uppercase">
                  {selectedMember.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">{selectedMember.name}</h2>
                  <p className="text-xs text-muted-foreground font-medium">{selectedMember.email} • <span className="uppercase text-[#00a389] font-bold">{selectedMember.role === 'admin' ? 'Sub-Admin' : 'User'}</span></p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 bg-[#00a389]/5 p-4 border-b border-border shadow-inner">
              <div className="text-center border-r border-border">
                <p className="text-2xl font-black text-[#00a389]">{selectedMember.leadCount}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Total Leads Generated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">{selectedMember.activeCount}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Active Pipeline</p>
              </div>
            </div>

            {/* List Content */}
            <div className="overflow-y-auto p-6 flex-1">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4">Assigned Leads History</h3>

              {loadingUserLeads ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="animate-spin text-[#00a389]" size={32} />
                  <p className="text-[10px] font-bold uppercase text-muted-foreground animate-pulse">Loading Records...</p>
                </div>
              ) : !userLeads || userLeads.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                  <p className="text-muted-foreground font-bold text-sm">No leads found for this user.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {(() => {
                    const grouped = userLeads.reduce((acc, lead) => {
                      const date = new Date(lead.created_at).toLocaleDateString('en-GB');
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(lead);
                      return acc;
                    }, {} as Record<string, typeof userLeads>);

                    return Object.keys(grouped)
                      .sort((a, b) => {
                        const [d1, m1, y1] = a.split('/').map(Number);
                        const [d2, m2, y2] = b.split('/').map(Number);
                        return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
                      })
                      .map((date) => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-px bg-border flex-1"></div>
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-4 py-1.5 rounded-full border border-border shadow-sm flex items-center gap-2">
                              Leads Added on <span className="text-[#00a389]">{date}</span>
                              <span className="w-5 h-5 flex items-center justify-center bg-[#00a389] text-white rounded-full text-[9px]">{grouped[date].length}</span>
                            </h4>
                            <div className="h-px bg-border flex-1"></div>
                          </div>

                          <div className="rounded-2xl border border-border overflow-hidden shadow-md">
                            <table className="w-full text-left bg-card">
                              <thead className="bg-muted/80">
                                <tr>
                                  <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-wider w-12 text-center">#</th>
                                  <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-wider">Lead Name</th>
                                  <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-wider">LinkedIn</th>
                                  <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-wider">Contact Info</th>
                                  <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-wider text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {grouped[date].map((lead, index) => (
                                  <tr key={lead.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="px-4 py-3 text-center text-xs font-bold text-muted-foreground">
                                      {index + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="font-bold text-sm text-foreground">{lead.name}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {lead.linkedin_url ? (
                                        <a
                                          href={lead.linkedin_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 text-[#0077b5] hover:text-[#005582] font-bold text-xs group/link"
                                        >
                                          <Linkedin size={14} className="group-hover/link:scale-110 transition-transform" />
                                          <span className="underline decoration-transparent group-hover/link:decoration-current transition-all">Profile</span>
                                        </a>
                                      ) : (
                                        <span className="text-muted-foreground text-[10px] italic">Not Linked</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex flex-col gap-0.5">
                                        {lead.email && <span className="text-xs font-medium text-muted-foreground">{lead.email}</span>}
                                        {lead.contact && <span className="text-[10px] font-bold text-muted-foreground font-mono">{lead.contact}</span>}
                                        {!lead.email && !lead.contact && <span className="text-muted-foreground text-[10px]">-</span>}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {isAdmin && (
                                        <button
                                          onClick={(e) => handleCloneLead(lead.id, e)}
                                          disabled={processingId === lead.id}
                                          className="p-2.5 mr-2 bg-muted hover:bg-[#00a389] text-muted-foreground hover:text-white rounded-xl transition-all shadow-sm scale-95 hover:scale-110 border border-border hover:border-[#00a389] active:scale-90 disabled:opacity-50"
                                          title="Clone to my dashboard"
                                        >
                                          {processingId === lead.id ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30 text-center">
              <button onClick={() => setSelectedMember(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}