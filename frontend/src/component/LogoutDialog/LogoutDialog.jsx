import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './LogoutDialog.module.css';

const LogoutDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Log out of Resume Screening?',
  description =
    "You'll be returned to the sign-in screen. Any unsaved changes will be lost.",
}) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  const openerRef = useRef(null);

  const titleId = useId();
  const descId = useId();

  /* Reset state + remember the element that opened the dialog */
  useEffect(() => {
    if (!open) return undefined;
    setError(null);
    setPending(false);
    openerRef.current = document.activeElement;

    /* Default focus on the safe action, not the destructive one */
    const raf = requestAnimationFrame(() =>
      cancelRef.current?.focus({ preventScroll: true })
    );
    return () => cancelAnimationFrame(raf);
  }, [open]);

  /* Return focus to the trigger when the dialog closes */
  useEffect(() => {
    if (open) return undefined;
    const opener = openerRef.current;
    if (opener instanceof HTMLElement) {
      opener.focus({ preventScroll: true });
    }
    return undefined;
  }, [open]);

  /* Escape (capture phase → takes priority over the mobile drawer),
     Tab trap, scroll lock */
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (pending) return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const nodes = panelRef.current?.querySelectorAll('button:not([disabled])');
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

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, pending, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (pending) return;
    setError(null);
    setPending(true);

    try {
      await onConfirm?.();
      onClose();
    } catch {
      setError(
        "We couldn't sign you out. Check your connection and try again."
      );
      setPending(false);
    }
  };

  const handleBackdrop = () => {
    if (!pending) onClose();
  };

  return createPortal(
    <div className={styles.overlay} onMouseDown={handleBackdrop}>
      <div
        ref={panelRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.iconWrap} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M15 17l5-5-5-5M20 12H9M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"
              fill="none"
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
                <span className={styles.spinner} aria-hidden="true" />
                Signing out…
              </>
            ) : (
              'Log out'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutDialog;