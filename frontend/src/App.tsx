import { Route, Routes, useLocation } from "react-router-dom";
import { BackgroundInteractionLayer } from "@/components/BackgroundInteractionLayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HomePage } from "@/pages/HomePage";
import { ProjectPage } from "@/pages/ProjectPage";

function App() {
  const location = useLocation();

  return (
    <div className="relative isolate min-h-screen bg-[var(--color-background)] text-white">
      <div className="absolute inset-0">
        <BackgroundInteractionLayer />
      </div>
      <ScrollToTop />
      <div className="relative z-10">
        <SiteHeader />
        <div className="relative z-10" key={location.pathname}>
          <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<ProjectPage />} path="/projects/:slug" />
          </Routes>
        </div>
        <div className="relative z-10">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

export default App;
