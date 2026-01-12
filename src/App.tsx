import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LeadProvider } from "@/contexts/LeadContext";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CreateLead from "./pages/CreateLead";
import LeadDetail from "./pages/LeadDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LeadProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create" element={<CreateLead />} />
                <Route path="/lead/:id" element={<LeadDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <MobileNav />
          </div>
        </BrowserRouter>
      </LeadProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;