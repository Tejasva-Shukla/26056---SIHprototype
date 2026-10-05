import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RouteAnalysisPage from "./pages/RouteAnalysisPage";
import NationalStatePage from "./pages/NationalStatePage";
import OverviewPage from "./pages/OverviewPage";

export default function App() {
  return (
    <div className="flex-1 min-h-screen flex antialiased bg-[#F6F8FB] text-[#0F172A]">
      {/* Left Sidebar with global filters & navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/route-analysis" replace />} />
            <Route path="/route-analysis" element={<RouteAnalysisPage />} />
            <Route path="/national-state" element={<NationalStatePage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="*" element={<Navigate to="/route-analysis" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}
