import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";

const STORAGE_KEY = "sidebar-collapsed";

// Read the saved collapsed state safely (localStorage can throw in some browsers).
const getInitialCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

/**
 * Shared layout for every logged-in page.
 * The sidebar is fixed, so <main> gets a left padding equal to the sidebar width:
 *   expanded  -> 16rem (md:w-64)  -> md:pl-64
 *   collapsed ->  5rem (md:w-20)  -> md:pl-20
 * Both animate with the same 300ms timing, so the page always moves with the sidebar.
 */
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  const handleCollapsedChange = (next) => {
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        defaultCollapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
      />

      <main
        className={[
          "min-h-screen min-w-0 transition-[padding] duration-300 ease-in-out",
          collapsed ? "md:pl-20" : "md:pl-64",
        ].join(" ")}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;