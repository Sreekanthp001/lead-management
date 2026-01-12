import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Pages
import Dashboard from "./pages/Dashboard";
import CreateLead from "./pages/CreateLead";
import LeadDetail from "./pages/LeadDetail";
import NotFound from "./pages/NotFound";

// Components
import Sidebar from "./components/Sidebar"; // Mundu step lo cheppina Sidebar file idi

const queryClient = new QueryClient();

const App = () => {
  const [counts, setCounts] = useState({ all: 0, overdue: 0, today: 0, active: 0, closed: 0 });

  // Real-time counts fetch chese logic
  useEffect(() => {
    async function updateDashboardStats() {
      const { data: leads, error } = await supabase.from('leads').select('*');
      
      if (leads) {
        const todayStr = new Date().toISOString().split('T')[0];
        setCounts({
          all: leads.length,
          overdue: leads.filter(l => l.next_action_date && l.next_action_date < todayStr && l.status !== 'Closed').length,
          today: leads.filter(l => l.next_action_date === todayStr).length,
          active: leads.filter(l => l.status !== 'Closed' && l.status !== 'Dropped').length,
          closed: leads.filter(l => l.status === 'Closed').length,
        });
      }
    }

    updateDashboardStats();
    
    // Database lo emaina change aithe ventane counts update avtayi
    const subscription = supabase
      .channel('leads-count-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        updateDashboardStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar with dynamic counts */}
            <Sidebar counts={counts} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <Routes>
                {/* Landing page ki badulu direct Dashboard ki redirect chesthunnam professional CRM laaga */}
                // src/App.tsx lo Routes section ni deentho replace cheyandi
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
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;