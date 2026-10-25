import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import LogoutDialog from "../LogoutDialog/LogoutDialog";
import { useAuth } from "../../context/AuthContext";

import { DocumentIcon } from "../../assets/icons/document";
import { DashboardIcon } from "../../assets/icons/dashboardicon";
import { HIstoryIcon } from "../../assets/icons/historyicon";
import { AdminIcon } from "../../assets/icons/admin";
import { LogoutIcon } from "../../assets/icons/logout";

const NAV_ITEMS = [
  { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
  { label: "History", icon: HIstoryIcon, href: "/history" },
  { label: "Admin", icon: AdminIcon, href: "/admin" },
];

// Small helper to join conditional class names.
const cx = (...classes) => classes.filter(Boolean).join(" ");

const Sidebar = ({
  activePath,
  navItems = NAV_ITEMS,
  onLogout,
  defaultCollapsed = false,
  onCollapsedChange,
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = activePath ?? location.pathname;

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const wasOpenRef = useRef(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Logout through AuthContext and then redirect to login.
  const handleLogout = useCallback(async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await logout();
    }

    setLogoutOpen(false);
    setMobileOpen(false);
    navigate("/login", { replace: true });
  }, [logout, navigate, onLogout]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    setTooltip(null);
    onCollapsedChange?.(next);
  };

  // Mobile drawer keyboard controls and scroll lock.
  useEffect(() => {
    if (!mobileOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled])'
      );

      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  // Focus management for the mobile drawer.
  useEffect(() => {
    if (mobileOpen) {
      wasOpenRef.current = true;

      panelRef.current
        ?.querySelector("a[href]")
        ?.focus({ preventScroll: true });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [mobileOpen]);

  // Close mobile navigation when the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setTooltip(null);
  }, [currentPath]);

  // Rail tooltips.
  const showTooltip = (event, label) => {
    if (!collapsed) return;

    const rect = event.currentTarget.getBoundingClientRect();

    setTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 14,
    });
  };

  const hideTooltip = () => setTooltip(null);

  // ---- Shared Tailwind class sets ----
  // "md:" variants only apply on desktop, so the mobile drawer always shows full labels.
  const hideWhenCollapsed = collapsed ? "md:hidden" : "";

  const navLabelClass = cx(
    "truncate text-sm font-medium",
    hideWhenCollapsed
  );

  const navIconClass =
    "flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5";

  const itemBaseClass = cx(
    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
    collapsed && "md:justify-center md:px-0"
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden [&>svg]:h-5 [&>svg]:w-5"
        onClick={() => setMobileOpen(true)}
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
        aria-label="Open navigation menu"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        ref={panelRef}
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white shadow-xl",
          "transition-[width,transform] duration-300 ease-in-out",
          "md:translate-x-0 md:shadow-none",
          collapsed ? "md:w-20" : "md:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          className="absolute -right-3 top-8 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:flex [&>svg]:h-3.5 [&>svg]:w-3.5"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cx(
              "transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          >
            <path
              d="M14 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Link
          to="/dashboard"
          className={cx(
            "flex items-center gap-3 px-5 pb-4 pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500",
            collapsed && "md:justify-center md:px-0"
          )}
          aria-label="Resume Screening — go to dashboard"
          onClick={closeMobile}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 [&>svg]:h-5 [&>svg]:w-5"
            aria-hidden="true"
          >
            <DocumentIcon />
          </span>

          <span className={cx("flex min-w-0 flex-col", hideWhenCollapsed)}>
            <span className="truncate text-base font-bold leading-tight text-slate-900">
              Resume Screening
            </span>
            <span className="text-[10px] font-semibold tracking-[0.15em] text-slate-400">
              SMART RECRUITMENT
            </span>
          </span>
        </Link>

        {user && (
          <div
            className={cx(
              "mx-4 mb-3 rounded-lg bg-slate-50 px-3 py-2 text-slate-700",
              hideWhenCollapsed
            )}
          >
            <span className={navLabelClass}>{user.name}</span>
          </div>
        )}

        <div className="mx-4 h-px bg-slate-200" />

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label="Workspace"
          onScroll={hideTooltip}
        >
          <p
            className={cx(
              "px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400",
              hideWhenCollapsed
            )}
          >
            WORKSPACE
          </p>

          {navItems.map(({ label, icon: Icon, href, badge }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/dashboard"}
              className={({ isActive }) =>
                cx(
                  itemBaseClass,
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )
              }
              onPointerEnter={(event) =>
                showTooltip(event, label)
              }
              onPointerLeave={hideTooltip}
              onFocus={(event) => showTooltip(event, label)}
              onBlur={hideTooltip}
              onClick={closeMobile}
            >
              {({ isActive }) => (
                <>
                  <span className={navIconClass} aria-hidden="true">
                    <Icon />
                  </span>

                  <span className={navLabelClass}>{label}</span>

                  {badge != null && (
                    <span
                      className={cx(
                        "ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700",
                        collapsed &&
                          "md:absolute md:right-1 md:top-0.5 md:ml-0 md:px-1.5 md:text-[10px]"
                      )}
                    >
                      {badge}
                    </span>
                  )}

                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-3 pb-5">
          <div className="mb-3 h-px bg-slate-200" />

          <button
            type="button"
            className={cx(
              itemBaseClass,
              "text-slate-600 hover:bg-red-50 hover:text-red-600"
            )}
            onClick={() => setLogoutOpen(true)}
            onPointerEnter={(event) =>
              showTooltip(event, "Logout")
            }
            onPointerLeave={hideTooltip}
            onFocus={(event) =>
              showTooltip(event, "Logout")
            }
            onBlur={hideTooltip}
          >
            <span className={navIconClass} aria-hidden="true">
              <LogoutIcon />
            </span>

            <span className={navLabelClass}>Logout</span>
          </button>
        </div>
      </aside>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Log out of Resume Screening?"
        description="You'll be returned to the sign-in screen. Any unsaved changes will be lost."
      />

      {tooltip && (
        <div
          className="pointer-events-none fixed z-[60] whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          role="tooltip"
          style={{
            top: tooltip.top,
            left: tooltip.left,
            transform: "translateY(-50%)",
          }}
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
};

export default Sidebar;