import React from 'react';

export default function PinForm({
  editing,
  t,
  formData,
  setField,
  formatDate,
  onCancel,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[450px] max-w-[90vw] my-4 self-start" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-5 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex-1">
              <h3 className="text-xl font-bold tracking-tight leading-tight m-0">{editing ? t('travel_pins.form.edit_title') : t('travel_pins.form.add_title')}</h3>
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
            <input type="text" required value={formData.title} onChange={(e) => setField('title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontSize: '16px' }} placeholder={t('travel_pins.form.title_placeholder')} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">📖</div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.travel_notes_label')}</h4>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
              <textarea rows={4} value={formData.note} onChange={(e) => setField('note', e.target.value)} className="w-full bg-transparent border-none resize-none focus:outline-none text-slate-700 placeholder:text-slate-500" style={{ fontSize: '16px' }} placeholder={t('travel_pins.form.travel_notes_placeholder')} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">📅</div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.visit_date_label')}</h4>
            </div>
            <div className="relative">
              <input type="date" value={formData.visited_at} onChange={(e) => setField('visited_at', e.target.value)} className="absolute opacity-0 pointer-events-none" style={{ fontSize: '16px' }} id="hidden-date-input" />
              <div className="relative">
                <input type="text" value={formData.visited_at ? formatDate(formData.visited_at) : ''} onClick={() => document.getElementById('hidden-date-input').showPicker?.() || document.getElementById('hidden-date-input').focus()} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer" style={{ fontSize: '16px' }} placeholder={t('travel_pins.form.visit_date_placeholder')} />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">📅</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">📷</div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.photo_url_label')}</h4>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/50 rounded-xl p-4">
              <input type="url" value={formData.photo_url || ''} onChange={(e) => setField('photo_url', e.target.value)} className="w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-500" style={{ fontSize: '16px' }} placeholder={t('travel_pins.form.photo_url_placeholder')} />
              {formData.photo_url && (
                <div className="mt-3 border-t border-pink-200 pt-3">
                  <div className="text-xs text-slate-500 mb-2">{t('travel_pins.form.photo_preview')}</div>
                  <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
                    <img src={formData.photo_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
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

          {formData.coordinates && (
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
                      {formData.coordinates[1].toFixed(6)}, {formData.coordinates[0].toFixed(6)}
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
              {editing ? t('travel_pins.form.update_button') : t('travel_pins.form.save_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

