// src/App.tsx content (partial)
<div className="flex h-screen bg-gray-50 overflow-hidden">
  <Sidebar counts={counts} />
  <main className="flex-1 overflow-y-auto p-8">
     <Routes>
       <Route path="/dashboard" element={<Dashboard filter="all" />} />
       <Route path="/overdue" element={<Dashboard filter="overdue" />} />
       {/* ... other routes */}
     </Routes>
  </main>
</div>