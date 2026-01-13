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
import Auth from "./pages/Auth"; // Login page kotha file
import ProtectedRoute from "./components/ProtectedRoute"; // Session check chese file

const queryClient = new QueryClient();

const App = () => {
  const [counts, setCounts] = useState({ all: 0, overdue: 0, today: 0, active: 0, closed: 0 });
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Auth State Change Listener (Login/Logout detect chestundi)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. Stats Update Function
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

    if (session) updateStats();
    
    const sub = supabase.channel('count-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => updateStats())
      .subscribe();

    return () => { 
      supabase.removeChannel(sub);
      subscription.unsubscribe();
    };
  }, [session]);

  if (loading) return null; // Initial loading appudu empty screen or spinner

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Login Route: Session unte home ki pampisthundi */}
            <Route path="/login" element={!session ? <Auth /> : <Navigate to="/" replace />} />

            {/* Private Routes: Session unteనే side-bar mariyu content kanipisthundi */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50 overflow-hidden font-['Inter',sans-serif]">
                    <Sidebar counts={counts} />
                    <main className="flex-1 overflow-y-auto p-8">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard filter="all" />} />
                        <Route path="/overdue" element={<Dashboard filter="overdue" />} />
                        <Route path="/today" element={<Dashboard filter="today" />} />
                        <Route path="/active" element={<Dashboard filter="active" />} />
                        <Route path="/followups" element={<Dashboard filter="today" />} />
                        <Route path="/closed" element={<Dashboard filter="closed" />} />
                        <Route path="/create" element={<CreateLead />} />
                        <Route path="/lead/:id" element={<LeadDetail />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;