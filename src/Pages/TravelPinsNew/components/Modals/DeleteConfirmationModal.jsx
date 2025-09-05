import React from 'react';
import { useModalStore } from '../../stores/modalStore';
import { useDeleteTravelPin } from '../../hooks/useTravelPinsApi';
import { closeDisplayPopup, openDisplayPopup } from '../../utils/displayPopupController';
import { Z_INDEX } from '../../utils/zIndex';

const DeleteConfirmationModal = () => {
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closeModal = useModalStore((s) => s.closeModal);

  const deletePinMutation = useDeleteTravelPin();

  if (activeModal !== 'delete' || !modalData?.pin) return null;

  const pin = modalData.pin;

  const onCancel = () => {
    // 關閉刪除 modal，回到顯示視窗
    closeModal();
    try { openDisplayPopup(pin); } catch {}
  };

  const onConfirm = async () => {
    try {
      await deletePinMutation.mutateAsync(pin.id);
    } catch (e) {
      console.error('Failed to delete pin', e);
    } finally {
      // 關閉彈窗與 popup
      try { closeDisplayPopup(); } catch {}
      closeModal();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: Z_INDEX.MODAL,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 'clamp(320px, 90vw, 420px)',
          background: 'white',
          borderRadius: 12,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          padding: 20,
          pointerEvents: 'auto',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
          color: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>刪除確認</h3>
        </div>
        <p style={{ marginTop: 0, color: '#475569' }}>
          確定要刪除「{pin.title || pin.id}」嗎？此動作無法復原。
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onCancel} style={{
            padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer'
          }}>取消</button>
          <button onClick={onConfirm} style={{
            padding: '10px 16px', borderRadius: 10, border: '1px solid transparent', background: '#ef4444', color: 'white', cursor: 'pointer'
          }}>刪除</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
