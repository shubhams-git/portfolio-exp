import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import "./App.css";
import { CosmicBackground } from "@/components/CosmicBackground";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SplashScreen } from "@/components/SplashScreen";
import { HomePage } from "@/pages/HomePage";
import { ProjectPage } from "@/pages/ProjectPage";

function App() {
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  // Show splash once per session; reduced-motion users get an instant skip
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("splashDone") === "1",
  );

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashDone", "1");
    setSplashDone(true);
  };

  return (
    <div className="page-shell">
      <CosmicBackground />
      <ScrollToTop />

      {/*
       * Site content is only rendered after the splash completes.
       * This prevents any header/text/card from bleeding through
       * the splash overlay during the animation sequence.
       */}
      {splashDone && (
        <>
          <SiteHeader />
          <div className="route-shell" key={location.pathname}>
            <Routes>
              <Route element={<HomePage />} path="/" />
              <Route element={<ProjectPage />} path="/projects/:slug" />
            </Routes>
          </div>
          <SiteFooter />
        </>
      )}

      {/*
       * Splash overlay lives above everything (z-index 9999).
       * AnimatePresence drives a slow opacity-0 exit so the white blast
       * cross-fades smoothly into the live site underneath.
       */}
      <AnimatePresence>
        {!splashDone && (
          <motion.div
            className="splash-exit-wrapper"
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReduced ? 0 : 1.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
