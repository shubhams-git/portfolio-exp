import { Route, Routes, useLocation } from "react-router-dom";

import "./App.css";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HomePage } from "@/pages/HomePage";
import { ProjectPage } from "@/pages/ProjectPage";

function App() {
  const location = useLocation();

  return (
    <div className="page-shell">
      <ScrollToTop />
      <SiteHeader />
      <div className="route-shell" key={location.pathname}>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<ProjectPage />} path="/projects/:slug" />
        </Routes>
      </div>
      <SiteFooter status="milestone_9" />
    </div>
  );
}

export default App;
