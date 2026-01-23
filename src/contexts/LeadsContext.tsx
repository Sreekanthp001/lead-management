import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export type Lead = {
    id: string;
    name: string;
    email?: string;
    status?: string;
    source?: string;
    company?: string;
    contact?: string;
    linkedin_url?: string;
    next_action?: string;
    next_action_date?: string;
    priority?: string;
    value_estimate?: number;
    context?: string;
    links?: any[];
    tags?: string[];
    user_id?: string;
    assigned_to?: string;
    created_at: string;
    created_by_name?: string;
    created_by_email?: string;
    created_by_role?: string;
};

type LeadCounts = {
    all: number;
    overdue: number;
    today: number;
    active: number;
    closed: number;
};

interface LeadsContextType {
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    addOptimisticLead: (lead: Lead) => void;
    updateOptimisticLead: (id: string, updates: Partial<Lead>) => void;
    removeOptimisticLead: (id: string) => void;
    lastFetched: number | null;
    fetchLeads: (userId: string, force?: boolean) => Promise<void>;
    loading: boolean;
    counts: LeadCounts;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

const CACHE_KEY = 'vt_leads_cache';

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [leads, setLeads] = useState<Lead[]>(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data } = JSON.parse(cached);
                return data || [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [lastFetched, setLastFetched] = useState<number | null>(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { timestamp } = JSON.parse(cached);
                return timestamp || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(false);
    const { role } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin';

    // REAL-TIME COUNTS: Calculate from leads array
    const counts = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        return {
            all: leads.length,
            overdue: leads.filter(l => l.next_action_date && l.next_action_date < todayStr && !['Won', 'Lost', 'Closed', 'Dropped'].includes(l.status || '')).length,
            today: leads.filter(l => l.next_action_date === todayStr).length,
            active: leads.filter(l => !['Won', 'Lost', 'Closed', 'Dropped'].includes(l.status || '')).length,
            closed: leads.filter(l => ['Won', 'Lost', 'Closed', 'Dropped'].includes(l.status || '')).length,
        };
    }, [leads]);

    // Save to localStorage whenever leads or lastFetched changes
    useEffect(() => {
        if (leads.length > 0) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: leads,
                timestamp: lastFetched
            }));
        }
    }, [leads, lastFetched]);

    const fetchLeads = useCallback(async (userId: string, force = false) => {
        // Cache Duration: 5 minutes (300,000 ms)
        const CACHE_DURATION = 300000;
        const now = Date.now();

        if (!force && lastFetched && (now - lastFetched < CACHE_DURATION) && leads.length > 0) {
            return;
        }

        // Only show full-page loader if we have no data
        if (leads.length === 0) setLoading(true);

        // EMERGENCY RESET: 1s fallback
        const safetyTimeout = setTimeout(() => {
            setLoading(false);
        }, 1000);

        try {
            let query = supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            // If not admin, only show leads they own or are assigned to
            if (!isAdmin) {
                query = query.or(`user_id.eq.${userId},assigned_to.eq.${userId}`);
            }

            const { data, error } = await query;

            if (error) throw error;

            setLeads(data || []);
            setLastFetched(now);
        } catch (error: any) {
            console.error("Error fetching leads:", error.message);
            toast.error("Failed to sync leads");
        } finally {
            clearTimeout(safetyTimeout);
            setLoading(false);
        }
    }, [isAdmin]); // Stable with isAdmin dependency

    const addOptimisticLead = useCallback((lead: Lead) => {
        setLeads(prev => [lead, ...prev]);
    }, []);

    const updateOptimisticLead = useCallback((id: string, updates: Partial<Lead>) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }, []);

    const removeOptimisticLead = useCallback((id: string) => {
        setLeads(prev => prev.filter(l => l.id !== id));
    }, []);

    return (
        <LeadsContext.Provider value={{ leads, setLeads, addOptimisticLead, updateOptimisticLead, removeOptimisticLead, lastFetched, fetchLeads, loading, counts }}>
            {children}
        </LeadsContext.Provider>
    );
};

export const useLeads = () => {
    const context = useContext(LeadsContext);
    if (context === undefined) {
        throw new Error('useLeads must be used within a LeadsProvider');
    }
    return context;
};
