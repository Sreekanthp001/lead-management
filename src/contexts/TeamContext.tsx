import React, { createContext, useContext, useState, useCallback } from 'react';

type Lead = {
    id: string;
    status?: string;
    user_id?: string;
    name?: string;
    email?: string;
    contact?: string;
    linkedin_url?: string;
    created_at: string;
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

interface TeamContextType {
    teamMembers: TeamMember[];
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
    loadingMembers: boolean;
    setLoadingMembers: React.Dispatch<React.SetStateAction<boolean>>;
    lastFetched: number | null;
    setLastFetched: (time: number | null) => void;
    addTeamMember: (member: TeamMember) => void;
    removeTeamMember: (id: string) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [lastFetched, setLastFetchedState] = useState<number | null>(null);

    const setLastFetched = useCallback((time: number | null) => {
        setLastFetchedState(time);
    }, []);

    const addTeamMember = useCallback((member: TeamMember) => {
        setTeamMembers(prev => [member, ...prev]);
    }, []);

    const removeTeamMember = useCallback((id: string) => {
        setTeamMembers(prev => prev.filter(m => m.id !== id));
    }, []);

    return (
        <TeamContext.Provider value={{
            teamMembers,
            setTeamMembers,
            loadingMembers,
            setLoadingMembers,
            lastFetched,
            setLastFetched,
            addTeamMember,
            removeTeamMember
        }}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
};
