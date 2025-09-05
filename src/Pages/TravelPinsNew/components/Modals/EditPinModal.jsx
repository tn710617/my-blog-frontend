import React, { useMemo, useState } from 'react';
import { useModalStore } from '../../stores/modalStore';
import { useCreateTravelPin, useUpdateTravelPin } from '../../hooks/useTravelPinsApi';
import { openDisplayPopup } from '../../utils/displayPopupController';
import { Z_INDEX } from '../../utils/zIndex';

const toDateInput = (iso) => {
  try {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch { return ''; }
};

  // API 格式比照 TravelPins：直接送 YYYY-MM-DD 字串或 null，不轉 ISO
  const fromDateInput = (val) => (val && String(val)) || null;

const EditPinModal = () => {
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closeModal = useModalStore((s) => s.closeModal);
  const updateModalData = useModalStore((s) => s.updateModalData);

  const isOpen = activeModal === 'form';
  const editingPin = modalData?.pin || null;

  const [title, setTitle] = useState(editingPin?.title || '');
  const [note, setNote] = useState(editingPin?.note || '');
  const [visitedAt, setVisitedAt] = useState(toDateInput(editingPin?.visited_at));
  const [photoUrl, setPhotoUrl] = useState(editingPin?.photo_url || '');
  const initialRef = useMemo(() => ({
    title: editingPin?.title || '',
    note: editingPin?.note || '',
    visited_at: toDateInput(editingPin?.visited_at),
    photo_url: editingPin?.photo_url || '',
  }), [editingPin?.id]);

  const createMutation = useCreateTravelPin();
  const updateMutation = useUpdateTravelPin();

  // Reset fields when target pin changes
  React.useEffect(() => {
    if (!isOpen) return;
    const draft = modalData?.draft;
    setTitle((draft?.title ?? editingPin?.title) || '');
    setNote((draft?.note ?? editingPin?.note) || '');
    setVisitedAt(draft?.visited_at ?? toDateInput(editingPin?.visited_at));
    setPhotoUrl((draft?.photo_url ?? editingPin?.photo_url) || '');
    updateModalData({ dirty: false, pin: editingPin || null });
  }, [isOpen, editingPin?.id]);

  // Track dirty state and expose到 modalData，供集中 ESC 判斷
  React.useEffect(() => {
    if (!isOpen) return;
    const dirty = (
      title !== initialRef.title ||
      note !== initialRef.note ||
      visitedAt !== initialRef.visited_at ||
      photoUrl !== initialRef.photo_url
    );
    updateModalData({ dirty, draft: { title, note, visited_at: visitedAt, photo_url: photoUrl } });
  }, [isOpen, title, note, visitedAt, photoUrl, initialRef, updateModalData]);

  if (!isOpen) return null;

  const onCancel = () => {
    closeModal();
    if (editingPin) {
      setTimeout(() => { try { openDisplayPopup(editingPin); } catch {} }, 0);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return; // minimal validation
    try {
      if (editingPin) {
        await updateMutation.mutateAsync({ id: editingPin.id, pinData: {
          title: title.trim(),
          note,
          visited_at: fromDateInput(visitedAt) || editingPin.visited_at || null,
          photo_url: photoUrl || null,
          coordinates: editingPin.coordinates,
        }});
        closeModal();
        setTimeout(() => { try { openDisplayPopup({ ...editingPin, title, note, visited_at: fromDateInput(visitedAt) || editingPin.visited_at, photo_url: photoUrl }); } catch {} }, 0);
      } else if (modalData?.draft) {
        const draft = modalData.draft;
        const created = await createMutation.mutateAsync({
          title: title.trim(),
          note,
          visited_at: fromDateInput(visitedAt) || null,
          photo_url: photoUrl || null,
          coordinates: draft.coordinates,
        });
        closeModal();
        // Reopen display for created pin (best-effort)
        const pinForOpen = created || { id: draft.id, coordinates: draft.coordinates, title, note, visited_at: fromDateInput(visitedAt), photo_url: photoUrl };
        setTimeout(() => { try { openDisplayPopup(pinForOpen); } catch {} }, 0);
      }
    } catch (err) {
      // TODO: show inline error
      // console.error('Save pin failed', err);
    }
  };

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: Z_INDEX.MODAL, pointerEvents: 'none'
    }}>
      <form onSubmit={onSubmit} style={{
        width: 'clamp(340px, 92vw, 520px)', background: 'white', borderRadius: 14,
        border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        pointerEvents: 'auto', overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', padding: '16px 18px'
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editingPin ? '編輯釘點' : '新增釘點'}</h3>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#334155' }}>標題（必填）</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="輸入標題"
                   style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}/>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#334155' }}>備註（Markdown 可用）</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={6}
                      placeholder="旅遊記事..."
                      style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}/>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#334155' }}>造訪日期</span>
            <input type="date" value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)}
                   style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}/>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#334155' }}>照片 URL</span>
            <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..."
                   style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}/>
          </label>
          {editingPin?.coordinates && (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              座標：{editingPin.coordinates[0].toFixed(6)}, {editingPin.coordinates[1].toFixed(6)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: 16, borderTop: '1px solid #f1f5f9' }}>
          <button type="button" onClick={onCancel} style={{
            padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer'
          }}>取消</button>
          <button type="submit" style={{
            padding: '10px 16px', borderRadius: 10, border: '1px solid transparent', background: '#3b82f6', color: 'white', cursor: 'pointer'
          }}>{editingPin ? '儲存' : '建立'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditPinModal;
