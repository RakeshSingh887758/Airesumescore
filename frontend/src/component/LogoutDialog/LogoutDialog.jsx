
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./LogoutDialog.module.css";

const LogoutDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Log out of your account?",
  description = "You'll need to sign in again to access your dashboard.",
}) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  const openerRef = useRef(null);

  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;

    setError("");
    setPending(false);
    openerRef.current = document.activeElement;

    const raf = requestAnimationFrame(() => {
      cancelRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (open) return;

    const opener = openerRef.current;

    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (pending) return;

        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const buttons = panelRef.current?.querySelectorAll(
        "button:not([disabled])"
      );

      if (!buttons?.length) return;

      const first = buttons[0];
      const last = buttons[buttons.length - 1];

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

    document.addEventListener("keydown", handleKeyDown, true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, pending, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (pending) return;

    setError("");
    setPending(true);

    try {
      await onConfirm();
      onClose();
    } catch {
      setError(
        "We couldn't sign you out. Check your connection and try again."
      );
      setPending(false);
    }
  };

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget && !pending) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={handleBackdrop}
    >
      <div
        ref={panelRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className={styles.iconWrap} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M15 17l5-5-5-5M20 12H9M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>

        <p id={descId} className={styles.description}>
          {description}
        </p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            className={styles.cancel}
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.confirm}
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? (
              <>
                <span
                  className={styles.spinner}
                  aria-hidden="true"
                />
                Signing out...
              </>
            ) : (
              "Log out"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutDialog;
