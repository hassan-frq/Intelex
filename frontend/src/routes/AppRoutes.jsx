import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoutes";
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
        <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/cases" element={<ProtectedRoute><MainLayout><CaseBook /></MainLayout></ProtectedRoute>} />
        <Route path="/case/:id/speech" element={<ProtectedRoute><MainLayout><SpeechToText /></MainLayout></ProtectedRoute>} />
        <Route path="/case/:id/previous-cases" element={<ProtectedRoute><MainLayout><PreviousCases /></MainLayout></ProtectedRoute>} />
        <Route path="/case/:id/generate" element={<ProtectedRoute><MainLayout><DocumentGenerator /></MainLayout></ProtectedRoute>} />
        <Route path="/case/:id/preview" element={<ProtectedRoute><MainLayout><Preview /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;