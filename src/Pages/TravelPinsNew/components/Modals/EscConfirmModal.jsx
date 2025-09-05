import React from 'react';
import { useIntl } from 'react-intl';
import { useModalStore } from '../../stores/modalStore';
import { Z_INDEX } from '../../utils/zIndex';

const EscConfirmModal = () => {
  const intl = useIntl();
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closeModal = useModalStore((s) => s.closeModal);

  // Render as inline confirm when edit form is active
  if (!(activeModal === 'form' && modalData?.confirmOpen)) return null;

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

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: Z_INDEX.MODAL, pointerEvents: 'none'
    }}>
      <div style={{
        width: 'clamp(300px, 90vw, 380px)', background: 'white', borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        pointerEvents: 'auto', overflow: 'hidden'
      }}>
        <div style={{ background: '#0ea5e9', color: 'white', padding: '12px 14px' }}>
          <strong>{intl.formatMessage({id: 'travel_pins.unsaved_modal.title'})}</strong>
        </div>
        <div style={{ padding: 16, color: '#334155', fontSize: 14 }}>
          {intl.formatMessage({id: 'travel_pins.unsaved_modal.question'})}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: 14, borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onCancel} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
            {intl.formatMessage({id: 'travel_pins.form.cancel_button'})}
          </button>
          <button onClick={onConfirm} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid transparent', background: '#ef4444', color: 'white', cursor: 'pointer' }}>
            {intl.formatMessage({id: 'travel_pins.unsaved_modal.discard_button'})}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscConfirmModal;
