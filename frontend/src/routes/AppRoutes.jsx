import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import CaseBook from "../pages/CaseBook/CaseBook";
import SpeechToText from "../pages/SpeechToText/SpeechToText";
import PreviousCases from "../pages/PreviousCases/PreviousCases";
import DocumentGenerator from "../pages/DocumentGenerator/DocumentGenerator";
import Preview from "../pages/Preview/Preview";
import Settings from "../pages/Settings/Settings";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases" element={<CaseBook />} />
        <Route path="/case/:id/speech" element={<SpeechToText />} />
        <Route path="/case/:id/previous-cases" element={<PreviousCases />} />
        <Route path="/case/:id/generate" element={<DocumentGenerator />} />
        <Route path="/case/:id/preview" element={<Preview />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;