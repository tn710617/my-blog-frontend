import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useIntl } from 'react-intl';
import { useModalStore } from '../../stores/modalStore';
import { useMapStore } from '../../stores/mapStore';
import { Z_INDEX } from '../../utils/zIndex';
import { injectPopupStyles } from '../../utils/popupStyles';
import { markdownToHtml } from '../../utils/markdownUtils';
import { copyPinUrlToClipboard } from '../../utils/urlUtils';
import { usePinFromCache } from '../../hooks/useTravelPinsApi';

const DisplayPopup = () => {
  const intl = useIntl();
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const mapRootEl = useMapStore((s) => s.mapRootEl);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  useEffect(() => {
    try { injectPopupStyles(); } catch {}
  }, []);

  const pinId = modalData?.pinId || modalData?.pin?.id;
  // Always run hooks in the same order (avoid conditional hooks)
  const latestPin = usePinFromCache(pinId);
  const pin = latestPin || modalData?.pin;
  if (activeModal !== 'display' || !pinId || !mapRootEl || !pin) return null;

  const t = (id) => intl.formatMessage({ id });
  const formatDate = (date) => intl.formatDate(new Date(date));

  const onClose = () => closeModal();
  const onCopy = async () => {
    setCopyError('');
    const res = await copyPinUrlToClipboard(pin.id);
    if (res?.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      setCopyError(res?.error || '');
    }
  };
  const onEdit = () => { try { closeModal(); openModal('form', { pin }); } catch {} };
  const onDelete = () => { try { closeModal(); openModal('delete', { pin }); } catch {} };
  const onPhoto = () => { if (pin.photo_url) try { openModal('photo', { url: pin.photo_url, title: pin.title, pin, pinId: pin.id }); } catch {} };

  const el = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'absolute',
        left: '50%',
        top: '12%',
        transform: 'translateX(-50%)',
        zIndex: Z_INDEX.POPUP,
        pointerEvents: 'auto',
      }}
    >
      <div className="travel-pin-popup-modern">
        <header className="popup-header">
          <div className="popup-title-section">
            <h3 className="popup-title">{pin.title}</h3>
            {pin.visited_at && (
              <p className="popup-date">📍 {formatDate(pin.visited_at)}</p>
            )}
          </div>
          <button className="popup-close-btn" aria-label="Close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="popup-content">
          {pin.note && (
            <section className="popup-section">
              <h4 className="popup-section-title">
                <span className="popup-section-icon">📝</span>
                {t('travel_pins.popup.travel_notes')}
              </h4>
              <div className="popup-notes" dangerouslySetInnerHTML={{ __html: markdownToHtml(pin.note) }} />
            </section>
          )}

          {pin.photo_url && (
            <section className="popup-section">
              <h4 className="popup-section-title">
                <span className="popup-section-icon">📷</span>
                {t('travel_pins.popup.photo')}
              </h4>
              <div className="popup-photo">
                <button className="popup-photo-btn" aria-label="View photo" onClick={onPhoto}>
                  <img src={pin.photo_url} alt={pin.title} className="popup-photo-img" loading="lazy" />
                  <div className="popup-photo-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14 21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
                  </div>
                </button>
              </div>
            </section>
          )}
        </div>

        <footer className="popup-actions">
          <button className="popup-btn popup-btn-secondary" onClick={onCopy} type="button">
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                {t('travel_pins.popup.copied')}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                {t('travel_pins.popup.copy_link')}
              </>
            )}
          </button>
          {copyError && (
            <span style={{ color: '#dc2626', fontSize: 12 }}>
              {copyError}
            </span>
          )}
          <button className="popup-btn popup-btn-primary" onClick={onEdit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            {t('travel_pins.popup.edit_button')}
          </button>
          <button className="popup-btn popup-btn-danger" onClick={onDelete}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2V6"></path>
            </svg>
            {t('travel_pins.popup.delete_button')}
          </button>
        </footer>
      </div>
    </div>
  );

  return ReactDOM.createPortal(el, mapRootEl);
};

export default DisplayPopup;
