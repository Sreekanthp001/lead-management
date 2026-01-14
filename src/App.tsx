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
import TableViewPage from "./pages/TableViewPage";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [counts, setCounts] = useState({ all: 0, overdue: 0, today: 0, active: 0, closed: 0 });
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- Auto Theme Logic ---
  useEffect(() => {
    const handleTheme = () => {
      const savedTheme = localStorage.getItem('vm-theme');
      const hour = new Date().getHours();
      const isNightTime = hour >= 18 || hour < 6;

      if (savedTheme) {
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        document.documentElement.classList.toggle('dark', isNightTime);
      }
    };

    handleTheme();
    const interval = setInterval(handleTheme, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // DYNAMIC STATS UPDATE LOGIC
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

  if (loading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={!session ? <Auth /> : <Navigate to="/" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 overflow-hidden font-['Outfit',sans-serif] lg:pl-64 transition-colors duration-500">
                    <Sidebar counts={counts} />
                    <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        {/* ROUTES WITH FILTERS PASSED TO DASHBOARD */}
                        <Route path="/dashboard" element={<Dashboard filter="all" />} />
                        <Route path="/table" element={<TableViewPage />} />
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