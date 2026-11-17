import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { LiteraturePage } from "./pages/LiteraturePage";
import { GeoDiscoveryPage } from "./pages/GeoDiscoveryPage";
import { CrossReferencePage } from "./pages/CrossReferencePage";
import { ExtractionPage } from "./pages/ExtractionPage";
import { VerificationPage } from "./pages/VerificationPage";
import { ExportCenterPage } from "./pages/ExportCenterPage";

export const App: React.FC = () => {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/literature" element={<LiteraturePage />} />
        <Route path="/geo" element={<GeoDiscoveryPage />} />
        <Route path="/cross-reference" element={<CrossReferencePage />} />
        <Route path="/extraction" element={<ExtractionPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/export" element={<ExportCenterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};

export default App;
