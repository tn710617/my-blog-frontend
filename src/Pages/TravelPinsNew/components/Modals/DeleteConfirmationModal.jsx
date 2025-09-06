import React from 'react';
import { useIntl } from 'react-intl';
import { useModalStore } from '../../stores/modalStore';
import { useDeleteTravelPin } from '../../hooks/useTravelPinsApi';
import { closeDisplayPopup, openDisplayPopup } from '../../utils/displayPopupController';
import { createModalClasses } from '../../utils/modalStyles';

const DeleteConfirmationModal = () => {
  const intl = useIntl();
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closeModal = useModalStore((s) => s.closeModal);

  const deletePinMutation = useDeleteTravelPin();

  if (activeModal !== 'delete' || !(modalData?.pin || modalData?.pinId)) return null;

  const pin = modalData.pin;
  const pinId = modalData.pinId || pin?.id;

  const onCancel = () => {
    // 關閉刪除 modal，回到顯示視窗
    closeModal();
    try { openDisplayPopup(pinId); } catch {}
  };

  const onConfirm = async () => {
    try {
      await deletePinMutation.mutateAsync(pinId);
    } catch (e) {
      console.error('Failed to delete pin', e);
    } finally {
      // 關閉彈窗與 popup
      try { closeDisplayPopup(); } catch {}
      closeModal();
    }
  };

  const t = (id) => intl.formatMessage({ id });
  const formatDate = (date) => intl.formatDate(new Date(date));

  return (
    <div className={createModalClasses.backdrop()} role="dialog" aria-modal="true">
      <div className={createModalClasses.dialog()}>
        <div className={createModalClasses.header('danger')}>
          <div className={createModalClasses.headerOverlay()} />
          <div className={createModalClasses.headerContent()}>
            <div className={createModalClasses.headerIcon()}>⚠️</div>
            <div className={createModalClasses.headerText()}>
              <h3 className={createModalClasses.headerTitle()}>{t('travel_pins.delete_modal.title')}</h3>
              <p className={createModalClasses.headerSubtitle()}>{t('travel_pins.delete_modal.subtitle')}</p>
            </div>
          </div>
        </div>
        
        <div className={createModalClasses.body()}>
          <div className="space-y-4">
            <div className={createModalClasses.contentSection('danger')}>
              <div className={createModalClasses.sectionContent()}>
                <div className={createModalClasses.sectionIcon('danger')}>📍</div>
                <div className={createModalClasses.sectionText()}>
                  <div className={createModalClasses.sectionLabel()}>{t('travel_pins.delete_modal.pin_to_delete')}</div>
                  <div className={createModalClasses.sectionTitle()}>{pin?.title}</div>
                  {pin?.visited_at && (
                    <div className="text-xs text-slate-500 mt-2">{t('travel_pins.popup.visited')} {formatDate(pin.visited_at)}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={createModalClasses.contentSection('warning')}>
              <div className={createModalClasses.sectionContent()}>
                <div className={createModalClasses.sectionIcon('small') + " bg-gradient-to-br from-amber-400 to-orange-500"}>💡</div>
                <div className="text-sm text-slate-700">
                  <div className="font-semibold mb-1">{t('travel_pins.delete_modal.confirmation_title')}</div>
                  <div>{t('travel_pins.delete_modal.confirmation_text')}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={createModalClasses.actions()}>
            <button onClick={onCancel} className={createModalClasses.button('secondary')}>
              {t('travel_pins.delete_modal.cancel_button')}
            </button>
            <button onClick={onConfirm} className={createModalClasses.button('danger')}>
              {t('travel_pins.delete_modal.delete_forever_button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
