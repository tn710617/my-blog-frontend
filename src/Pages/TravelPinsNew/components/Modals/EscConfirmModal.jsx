import React from 'react';
import { useModalStore } from '../../stores/modalStore';
import { Z_INDEX } from '../../utils/zIndex';

const EscConfirmModal = () => {
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closeModal = useModalStore((s) => s.closeModal);

  if (activeModal !== 'esc-confirm') return null;

  const onCancel = () => {
    // 回到編輯表單
    const pin = modalData?.pin;
    const draft = modalData?.draft;
    closeModal();
    if (pin) {
      try { useModalStore.getState().openModal('form', { pin, draft }); } catch {}
    }
  };
  const onConfirm = () => {
    // 交由上層提供的 onConfirm 關閉 esc-confirm 與打開 display popup
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
          <strong>確認離開</strong>
        </div>
        <div style={{ padding: 16, color: '#334155', fontSize: 14 }}>
          你有尚未儲存的變更，確定要放棄嗎？
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: 14, borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onCancel} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>取消</button>
          <button onClick={onConfirm} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid transparent', background: '#ef4444', color: 'white', cursor: 'pointer' }}>放棄變更</button>
        </div>
      </div>
    </div>
  );
};

export default EscConfirmModal;
