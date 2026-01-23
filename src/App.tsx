import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMemo } from "react";

import Dashboard from "./pages/Dashboard";
import CreateLead from "./pages/CreateLead";
import LeadDetail from "./pages/LeadDetail";
import TableViewPage from "./pages/TableViewPage";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import ManageTeam from "./pages/ManageTeam";
import { useAuth } from "./contexts/AuthContext";
import { useLeads } from "./contexts/LeadsContext";

const queryClient = new QueryClient();

const App = () => {
  const { session, role, loading } = useAuth();
  const { counts } = useLeads(); // Get real-time counts from LeadsContext

  const sidebarContent = useMemo(() => {
    if (!session) return null;
    return <Sidebar counts={counts} />;
  }, [session, counts]);

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
                  <div className="flex min-h-screen bg-background text-foreground font-['Outfit',sans-serif]">
                    {sidebarContent}
                    {/* Updated main container to fix sidebar gap and alignment */}
                    <main className="flex-1 w-full lg:pl-64 transition-all duration-500 overflow-x-hidden">
                      <div className="pt-16 lg:pt-0 w-full min-h-screen">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard filter="all" />} />
                          <Route path="/table" element={<TableViewPage />} />
                          <Route path="/overdue" element={<Dashboard filter="overdue" />} />
                          <Route path="/today" element={<Dashboard filter="today" />} />
                          <Route path="/active" element={<Dashboard filter="active" />} />
                          <Route path="/closed" element={<Dashboard filter="closed" />} />
                          <Route path="/create" element={<CreateLead />} />
                          <Route path="/lead/:id" element={<LeadDetail />} />
                          <Route
                            path="/manage-team"
                            element={
                              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                                <ManageTeam />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
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