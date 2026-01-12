import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import Landing from "./pages/Landing"; // Ikkade neeku kavalsina Middle icons untayi
import Dashboard from "./pages/Dashboard";
import CreateLead from "./pages/CreateLead";
import LeadDetail from "./pages/LeadDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Top Header - Venturemond Headline */}
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b p-4 text-center">
              <h1 className="text-2xl font-black text-primary tracking-tighter">VENTUREMOND</h1>
            </header>

            <main className="flex-1 overflow-y-auto">
              <Routes>
                {/* Landing page ippudu nee "Main Navigation Hub" */}
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard filter="all" />} />
                <Route path="/overdue" element={<Dashboard filter="overdue" />} />
                <Route path="/today" element={<Dashboard filter="today" />} />
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