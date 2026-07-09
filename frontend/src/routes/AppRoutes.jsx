import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
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
        {/* Authentication */}
        <Route
            path="/"
            element={
                <AuthLayout>
                    <Login />
                </AuthLayout>
            }
        />

        <Route
            path="/login"
            element={
                <AuthLayout>
                    <Login />
                </AuthLayout>
            }
        />

        {/* Main Application */}
        <Route
            path="/dashboard"
            element={
                <MainLayout>
                    <Dashboard />
                </MainLayout>
            }
        />

        <Route
            path="/cases"
            element={
                <MainLayout>
                    <CaseBook />
                </MainLayout>
            }
        />

        <Route
            path="/case/:id/speech"
            element={
                <MainLayout>
                    <SpeechToText />
                </MainLayout>
            }
        />

        <Route
            path="/case/:id/previous-cases"
            element={
                <MainLayout>
                    <PreviousCases />
                </MainLayout>
            }
        />

        <Route
            path="/case/:id/generate"
            element={
                <MainLayout>
                    <DocumentGenerator />
                </MainLayout>
            }
        />

        <Route
            path="/case/:id/preview"
            element={
                <MainLayout>
                    <Preview />
                </MainLayout>
            }
        />

        <Route
            path="/settings"
            element={
                <MainLayout>
                    <Settings />
                </MainLayout>
            }
        />
    </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;