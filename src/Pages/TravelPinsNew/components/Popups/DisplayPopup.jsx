import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useIntl } from 'react-intl';
import { useModalStore } from '../../stores/modalStore';
import { useMapStore } from '../../stores/mapStore';
import { Z_INDEX } from '../../utils/zIndex';
import { markdownToHtml } from '../../utils/markdownUtils';
import { copyPinUrlToClipboard } from '../../utils/urlUtils';
import { usePinFromCache } from '../../hooks/useTravelPinsApi';
import { createPopupClasses } from '../../utils/popupTailwindStyles';

const DisplayPopup = () => {
  const intl = useIntl();
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const mapRootEl = useMapStore((s) => s.mapRootEl);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

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
  const onEdit = () => {
    closeModal();
    openModal('form', { pin });
  };
  const onDelete = () => {
    closeModal();
    openModal('delete', { pin });
  };
  const onPhoto = () => {
    if (pin.photo_url) {
      openModal('photo', { url: pin.photo_url, title: pin.title, pin, pinId: pin.id });
    }
  };

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
      <div className={createPopupClasses.dialog()}>
        <header className={createPopupClasses.header()}>
          <div className={createPopupClasses.headerOverlay()} />
          <div className={createPopupClasses.headerContent()}>
            <div className={createPopupClasses.titleSection()}>
              <h3 className={createPopupClasses.title()}>{pin.title}</h3>
              {pin.visited_at && (
                <p className={createPopupClasses.date()}>📍 {formatDate(pin.visited_at)}</p>
              )}
            </div>
            <button className={createPopupClasses.closeBtn()} aria-label="Close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <div className={createPopupClasses.content()}>
          {pin.note && (
            <section className={createPopupClasses.section()}>
              <h4 className={createPopupClasses.sectionTitle()}>
                <span className={createPopupClasses.sectionIcon()}>📝</span>
                {t('travel_pins.popup.travel_notes')}
              </h4>
              <div className={createPopupClasses.notesContainer()}>
                <div className={createPopupClasses.notesContent()} dangerouslySetInnerHTML={{ __html: markdownToHtml(pin.note) }} />
              </div>
            </section>
          )}

          {pin.photo_url && (
            <section className={createPopupClasses.section()}>
              <h4 className={createPopupClasses.sectionTitle()}>
                <span className={createPopupClasses.sectionIcon()}>📷</span>
                {t('travel_pins.popup.photo')}
              </h4>
              <div className={createPopupClasses.photoContainer()}>
                <button className={createPopupClasses.photoBtn()} aria-label="View photo" onClick={onPhoto}>
                  <img src={pin.photo_url} alt={pin.title} className={createPopupClasses.photoImg()} loading="lazy" />
                  <div className={createPopupClasses.photoOverlay()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="M21 21l-4.35-4.35"></path>
                      <circle cx="11" cy="11" r="3"></circle>
                    </svg>
                  </div>
                </button>
              </div>
            </section>
          )}
        </div>

        <footer className={createPopupClasses.actions()}>
          <button className={createPopupClasses.button('secondary')} onClick={onCopy} type="button">
            <svg className={createPopupClasses.buttonIcon()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {copied ? (
                <polyline points="20,6 9,17 4,12"></polyline>
              ) : (
                <>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </>
              )}
            </svg>
            {copied ? t('travel_pins.popup.copied') : t('travel_pins.popup.copy_link')}
          </button>
          
          {copyError && (
            <span className={createPopupClasses.copyError()}>{copyError}</span>
          )}
          
          <button className={createPopupClasses.button('primary')} onClick={onEdit}>
            <svg className={createPopupClasses.buttonIcon()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            {t('travel_pins.popup.edit_button')}
          </button>
          
          <button className={createPopupClasses.button('danger')} onClick={onDelete}>
            <svg className={createPopupClasses.buttonIcon()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
