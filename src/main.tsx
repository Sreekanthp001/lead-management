import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TeamProvider } from "./contexts/TeamContext";
import { LeadsProvider } from "./contexts/LeadsContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <TeamProvider>
        <LeadsProvider>
          <App />
        </LeadsProvider>
      </TeamProvider>
    </AuthProvider>
  </ThemeProvider>
);
