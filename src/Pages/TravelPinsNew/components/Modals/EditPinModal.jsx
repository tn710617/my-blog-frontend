import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useModalStore } from '../../stores/modalStore';
import { useCreateTravelPin, useUpdateTravelPin } from '../../hooks/useTravelPinsApi';
import { openDisplayPopup } from '../../utils/displayPopupController';

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
  const intl = useIntl();
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
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    setTitle((draft?.title ?? editingPin?.title) || '');
    setNote((draft?.note ?? editingPin?.note) || '');
    const initialVisited = draft?.visited_at ?? toDateInput(editingPin?.visited_at) ?? todayStr;
    setVisitedAt(initialVisited);
    setPhotoUrl((draft?.photo_url ?? editingPin?.photo_url) || '');
    // 初始化時，把現有座標也補在 draft 以便建立流程保存
    const coords = draft?.coordinates || editingPin?.coordinates || null;
    updateModalData({ dirty: false, pin: editingPin || null, draft: { ...(draft || {}), coordinates: coords } });
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
    // 保留現有座標（草稿或 pin）
    const coords = (modalData?.draft && modalData.draft.coordinates) || editingPin?.coordinates || null;
    updateModalData({ dirty, draft: { title, note, visited_at: visitedAt, photo_url: photoUrl, coordinates: coords } });
  }, [isOpen, title, note, visitedAt, photoUrl, initialRef, updateModalData]);

  if (!isOpen) return null;

  const onCancel = () => {
    closeModal();
    if (editingPin) {
      setTimeout(() => { try { openDisplayPopup(editingPin.id); } catch {} }, 0);
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
          visited_at: fromDateInput(visitedAt) || new Date().toISOString().slice(0,10),
          photo_url: photoUrl || null,
          coordinates: editingPin.coordinates,
        }});
        closeModal();
        setTimeout(() => { try { openDisplayPopup(editingPin.id); } catch {} }, 0);
      } else if (modalData?.draft) {
        const draft = modalData.draft;
        const coords = draft.coordinates;
        if (!coords || coords.length !== 2) {
          // 沒有座標，不送出；可改為顯示 inline 錯誤
          return;
        }
        const created = await createMutation.mutateAsync({
          title: title.trim(),
          note,
          visited_at: fromDateInput(visitedAt) || new Date().toISOString().slice(0,10),
          photo_url: photoUrl || null,
          coordinates: coords,
        });
        closeModal();
        // Reopen display for created pin (best-effort)
        const pinForOpenId = (created && created.id) || draft.id;
        setTimeout(() => { try { openDisplayPopup(pinForOpenId); } catch {} }, 0);
      }
    } catch (err) {
      // TODO: show inline error
      // console.error('Save pin failed', err);
    }
  };

  const t = (id) => intl.formatMessage({ id });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[450px] max-w-[90vw] my-4 self-start" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-5 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex-1">
              <h3 className="text-xl font-bold tracking-tight leading-tight m-0">{editingPin ? t('travel_pins.form.edit_title') : t('travel_pins.form.add_title')}</h3>
            </div>
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors duration-200 text-white/80 hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">📝</div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.title_label')}</h4>
            </div>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontSize: '16px' }} placeholder={t('travel_pins.form.title_placeholder')} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">📖</div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.travel_notes_label')}</h4>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
              <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-transparent border-none resize-none focus:outline-none text-slate-700 placeholder:text-slate-500" style={{ fontSize: '16px' }} placeholder={t('travel_pins.form.travel_notes_placeholder')} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">📅</div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.visit_date_label')}</h4>
            </div>
            <input type="date" value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" style={{ fontSize: '16px' }} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">📷</div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.photo_url_label')}</h4>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/50 rounded-xl p-4">
              <input type="url" value={photoUrl || ''} onChange={(e) => setPhotoUrl(e.target.value)} className="w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-500" style={{ fontSize: '16px' }} placeholder={t('travel_pins.form.photo_url_placeholder')} />
              {photoUrl && (
                <div className="mt-3 border-t border-pink-200 pt-3">
                  <div className="text-xs text-slate-500 mb-2">{t('travel_pins.form.photo_preview')}</div>
                  <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
                    <img src={photoUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                    <div style={{ display: 'none' }} className="absolute inset-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs">{t('travel_pins.form.invalid_url')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {editingPin?.coordinates && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center text-white text-sm">🌍</div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Location</h4>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">COORDINATES</div>
                    <div className="font-mono text-sm text-slate-800 font-semibold">
                      {editingPin.coordinates[1].toFixed(6)}, {editingPin.coordinates[0].toFixed(6)}
                    </div>
                  </div>
                  <div className="text-2xl">📍</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm uppercase tracking-wide">
              {t('travel_pins.form.cancel_button')}
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide">
              {editingPin ? t('travel_pins.form.update_button') : t('travel_pins.form.save_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPinModal;
