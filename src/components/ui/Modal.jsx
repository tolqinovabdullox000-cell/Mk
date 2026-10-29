import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';

export default function Modal({ open, onClose, title, dirty = false, children, labelledBy = 'dialog-title' }) {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);
  const backdropDown = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const { t } = useI18n();

  const requestClose = useCallback(() => {
    if (dirty && !confirming) setConfirming(true);
    else if (confirming) setConfirming(false);
    else onClose();
  }, [dirty, confirming, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    dialogRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open, requestClose]);

  if (!open) return null;

  function handleBackdropUp(event) {
    if (event.target === event.currentTarget && backdropDown.current) requestClose();
    backdropDown.current = false;
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => { backdropDown.current = event.target === event.currentTarget; }}
      onMouseUp={handleBackdropUp}
    >
      <div
        ref={dialogRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <h2 id={labelledBy}>{title}</h2>
        {children}
        {confirming && (
          <div className="discard-confirm" role="alertdialog" aria-modal="true" aria-labelledby={`${labelledBy}-discard`}>
            <h3 id={`${labelledBy}-discard`}>{t('modal.discardTitle')}</h3>
            <p>{t('modal.discardMessage')}</p>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setConfirming(false)}>{t('common.cancel')}</button>
              <button className="btn btn-danger" type="button" onClick={() => { setConfirming(false); onClose(); }}>{t('modal.discard')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
