import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import Dashboard from "./pages/Dashboard";
import CreateLead from "./pages/CreateLead";
import LeadDetail from "./pages/LeadDetail";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient();

const App = () => {
  const [counts, setCounts] = useState({ all: 0, overdue: 0, today: 0, active: 0, closed: 0 });

  // Simplified: No more automatic theme colors
  useEffect(() => {
    // Resetting to default light theme
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    async function updateStats() {
      const { data: leads } = await supabase.from('leads').select('*');
      if (leads) {
        const todayStr = new Date().toISOString().split('T')[0];
        setCounts({
          all: leads.length,
          overdue: leads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed').length,
          today: leads.filter(l => l.next_action_date === todayStr).length,
          active: leads.filter(l => l.status !== 'Closed' && l.status !== 'Dropped').length,
          closed: leads.filter(l => l.status === 'Closed' || l.status === 'Dropped').length,
        });
      }
    }
    updateStats();
    
    const sub = supabase.channel('count-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => updateStats()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Back to professional gray/white background */}
          <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar counts={counts} />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard filter="all" />} />
                <Route path="/overdue" element={<Dashboard filter="overdue" />} />
                <Route path="/today" element={<Dashboard filter="today" />} />
                <Route path="/active" element={<Dashboard filter="active" />} />
                <Route path="/closed" element={<Dashboard filter="closed" />} />
                <Route path="/create" element={<CreateLead />} />
                <Route path="/lead/:id" element={<LeadDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;