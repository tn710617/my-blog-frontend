import React from 'react';
import { useIntl } from 'react-intl';
import { useModalStore } from '../../stores/modalStore';
import { createModalClasses } from '../../utils/modalStyles';

const EscConfirmModal = () => {
  const intl = useIntl();
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closeModal = useModalStore((s) => s.closeModal);

  // Render as inline confirm when edit form is active
  if (!(activeModal === 'form' && modalData?.confirmOpen)) return null;

  const editingPin = modalData?.pin;

  const onCancel = () => {
    // 只關閉確認層，保留編輯表單
    try { useModalStore.getState().updateModalData({ confirmOpen: false }); } catch {}
  };
  const onConfirm = () => {
    // 關閉確認層並放棄變更：關閉表單並回到顯示視窗
    try { useModalStore.getState().updateModalData({ confirmOpen: false }); } catch {}
    const pin = modalData?.pin;
    try { useModalStore.getState().closeModal(); } catch {}
    if (pin) {
      // 在這裡不直接調 openDisplayPopup，交由集中 ESC 或上層控制
      // 為保持一致，也可以直接開：
      // setTimeout(() => { try { openDisplayPopup(pin) } catch {} }, 0)
    }
    if (modalData?.onConfirm) modalData.onConfirm();
  };

  const t = (id) => intl.formatMessage({ id });

  return (
    <div className={createModalClasses.backdrop()} role="dialog" aria-modal="true">
      <div className={createModalClasses.dialog("w-[380px]")}>
        <div className={createModalClasses.header('warning')}>
          <div className={createModalClasses.headerOverlay()} />
          <div className={createModalClasses.headerContent()}>
            <div className={createModalClasses.headerIcon()}>💾</div>
            <div className={createModalClasses.headerText()}>
              <h3 className={createModalClasses.headerTitle()}>{t('travel_pins.unsaved_modal.title')}</h3>
              <p className={createModalClasses.headerSubtitle()}>You have unsaved changes</p>
            </div>
          </div>
        </div>
        
        <div className={createModalClasses.body()}>
          <div className="space-y-4">
            <div className={createModalClasses.contentSection('warning')}>
              <div className={createModalClasses.sectionContent()}>
                <div className={createModalClasses.sectionIcon('warning')}>✏️</div>
                <div className={createModalClasses.sectionText()}>
                  <div className={createModalClasses.sectionLabel()}>Current Form</div>
                  <div className={createModalClasses.sectionTitle()}>
                    {editingPin ? `Editing: ${editingPin.title}` : 'Creating New Pin'}
                  </div>
                  <div className={createModalClasses.sectionDesc()}>
                    You have made changes that haven't been saved yet.
                  </div>
                </div>
              </div>
            </div>
            
            <div className={createModalClasses.contentSection('info')}>
              <div className={createModalClasses.sectionContent()}>
                <div className={createModalClasses.sectionIcon('small')}>💡</div>
                <div className="text-sm text-slate-700">
                  <div className="font-semibold mb-1">What would you like to do?</div>
                  <div>You can go back to continue editing, or discard your changes and close the form.</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={createModalClasses.actions()}>
            <button onClick={onCancel} className={createModalClasses.button('continue')}>
              Continue Editing
            </button>
            <button onClick={onConfirm} className={createModalClasses.button('secondary')}>
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscConfirmModal;
