import React from "react";
import { Tooltip } from "@mui/material";
import { FiSettings } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { useStateContext } from "../context/ContextProvider";
import { Sidebar, Navbar, ThemeSettings, Footer } from "../components";

const AppWrapper = ({ children }) => {
  const {
    currentMode,
    setThemeSettings,
    themeSettings,
    currentColor,
    activeMenu,
  } = useStateContext();

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <div className="flex relative dark:bg-main-dark-bg bg-gray-50 min-h-screen">

        {/* Settings FAB */}
        <div className="fixed right-6 bottom-6 z-50">
          <Tooltip title="Settings" placement="top" arrow>
            <button
              type="button"
              onClick={() => setThemeSettings(true)}
              className="
                group flex items-center justify-center
                w-12 h-12 rounded-full
                text-white text-xl
                shadow-lg shadow-black/20
                transition-all duration-300 ease-out
                hover:scale-110 hover:shadow-xl hover:shadow-black/30
                active:scale-95
                focus:outline-none focus:ring-4 focus:ring-offset-2
              "
              style={{
                backgroundColor: currentColor,
                focusRingColor: `${currentColor}40`,
              }}
              aria-label="Open theme settings"
            >
              <FiSettings
                className="transition-transform duration-500 group-hover:rotate-90"
              />
            </button>
          </Tooltip>
        </div>

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-full z-40
            bg-white dark:bg-secondary-dark-bg
            border-r border-gray-100 dark:border-gray-800
            shadow-sm
            transition-all duration-300 ease-in-out
            ${activeMenu ? "w-72 translate-x-0" : "w-0 -translate-x-full"}
            overflow-hidden
          `}
        >
          <Sidebar />
        </aside>

        {/* Backdrop overlay on mobile when sidebar is open */}
        {activeMenu && (
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setThemeSettings(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content area */}
        <main
          className={`
            flex flex-col flex-1 min-h-screen
            bg-main-bg dark:bg-main-dark-bg
            transition-all duration-300 ease-in-out
            ${activeMenu ? "md:ml-72" : "ml-0"}
          `}
        >
          {/* Sticky top navbar */}
          <header
            className="
              sticky top-0 z-20
              bg-white/80 dark:bg-main-dark-bg/80
              backdrop-blur-md
              border-b border-gray-100 dark:border-gray-800
              shadow-sm
            "
          >
            <Navbar />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: "10px",
                  background: currentMode === "Dark" ? "#33373e" : "#fff",
                  color: currentMode === "Dark" ? "#f0f0f0" : "#333",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                },
              }}
            />
          </header>

          {/* Page content */}
          <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
            {themeSettings && (
              <div className="animate-fade-in">
                <ThemeSettings />
              </div>
            )}
            {children}
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AppWrapper;