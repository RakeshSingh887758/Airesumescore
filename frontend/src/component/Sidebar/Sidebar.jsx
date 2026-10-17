import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Sidebar.module.css';
import LogoutDialog from "../LogoutDialog/LogoutDialog"

import { DocumentIcon } from '../../assets/icons/document';
import { DashboardIcon } from '../../assets/icons/dashboardicon';
import { HIstoryIcon } from '../../assets/icons/historyicon';
import { AdminIcon } from '../../assets/icons/admin';
import { LogoutIcon } from '../../assets/icons/logout';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: DashboardIcon, href: '/dashboard' },
  { label: 'History', icon: HIstoryIcon, href: '/history' },
  { label: 'Admin', icon: AdminIcon, href: '/admin' },
];

const isActiveRoute = (href, pathname) =>
  pathname === href || pathname.startsWith(`${href}/`);

const Sidebar = ({
  activePath = '/dashboard',
  navItems = NAV_ITEMS,
  onLogout,
  defaultCollapsed = false,
  onCollapsedChange,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const wasOpenRef = useRef(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    setTooltip(null);
    onCollapsedChange?.(next);
  };

  /* Mobile drawer: Escape, Tab trap, scroll lock */
  useEffect(() => {
    if (!mobileOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const nodes = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  /* Focus in on open, back to the trigger on close */
  useEffect(() => {
    if (mobileOpen) {
      wasOpenRef.current = true;
      panelRef.current?.querySelector('a[href]')?.focus({ preventScroll: true });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [mobileOpen]);

  /* Navigate = drawer closes */
  useEffect(() => {
    setMobileOpen(false);
    setTooltip(null);
  }, [activePath]);

  /* Rail tooltips (fixed positioned → never clipped) */
  const showTooltip = (event, label) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2, left: rect.right + 14 });
  };
  const hideTooltip = () => setTooltip(null);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={styles.mobileToggle}
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
        <div className={styles.backdrop} onClick={closeMobile} aria-hidden="true" />
      )}

      <aside
        id="app-sidebar"
        ref={panelRef}
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : '',
          mobileOpen ? styles.open : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          type="button"
          className={styles.collapseToggle}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
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

        <a
          href="/dashboard"
          className={styles.brand}
          aria-label="Resume Screening — go to dashboard"
          onClick={closeMobile}
        >
          <span className={styles.brandIcon} aria-hidden="true">
            <DocumentIcon />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandTitle}>Resume Screening</span>
            <span className={styles.brandSubtitle}>SMART RECRUITMENT</span>
          </span>
        </a>

        <div className={styles.divider} />

        <nav
          className={styles.navigation}
          aria-label="Workspace"
          onScroll={hideTooltip}
        >
          <p className={styles.sectionLabel}>WORKSPACE</p>

          {navItems.map(({ label, icon: Icon, href, badge }) => {
            const active = isActiveRoute(href, activePath);

            return (
              <a
                key={href}
                href={href}
                className={`${styles.navItem} ${active ? styles.active : ''}`}
                aria-current={active ? 'page' : undefined}
                onPointerEnter={(event) => showTooltip(event, label)}
                onPointerLeave={hideTooltip}
                onFocus={(event) => showTooltip(event, label)}
                onBlur={hideTooltip}
                onClick={closeMobile}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  <Icon />
                </span>

                <span className={styles.navLabel}>{label}</span>

                {badge != null && <span className={styles.badge}>{badge}</span>}

                {active && (
                  <span className={styles.activeIndicator} aria-hidden="true" />
                )}
              </a>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.bottomDivider} />

          <button
            type="button"
            className={styles.logoutButton}
            onClick={() => setLogoutOpen(true)}
          >
            <span className={styles.navIcon} aria-hidden="true">
              <LogoutIcon />
            </span>
            <span className={styles.navLabel}>Logout</span>
          </button>
        </div>
      </aside>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={onLogout}
      />

      {tooltip && (
        <div
          className={styles.tooltip}
          role="tooltip"
          style={{ top: tooltip.top, left: tooltip.left }}
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
};

export default Sidebar;