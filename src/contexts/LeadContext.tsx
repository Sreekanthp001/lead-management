import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lead, LeadNote } from '@/lib/types';
import { sampleLeads } from '@/lib/sample-data';

interface LeadContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addNote: (leadId: string, content: string) => void;
  getLeadById: (id: string) => Lead | undefined;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);

  const addLead = (leadData: Omit<Lead, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev =>
      prev.map(lead =>
        lead.id === id
          ? { ...lead, ...updates, updatedAt: new Date() }
          : lead
      )
    );
  };

  const addNote = (leadId: string, content: string) => {
    const newNote: LeadNote = {
      id: Date.now().toString(),
      content,
      createdAt: new Date(),
    };
    setLeads(prev =>
      prev.map(lead =>
        lead.id === leadId
          ? { ...lead, notes: [...lead.notes, newNote], updatedAt: new Date() }
          : lead
      )
    );
  };

  const getLeadById = (id: string) => leads.find(lead => lead.id === id);

  return (
    <LeadContext.Provider value={{ leads, addLead, updateLead, addNote, getLeadById }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}