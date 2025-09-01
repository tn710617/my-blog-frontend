import React from 'react';
import { useIntl } from 'react-intl';

export default function DeleteConfirmationModal({ open, pin, onCancel, onConfirm, formatDate, t }) {
  const intl = useIntl();
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[420px] max-w-[90vw] animate-scale-up">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-6 py-5 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">⚠️</div>
            <div>
              <h3 className="text-xl font-bold tracking-tight leading-tight m-0">{t('travel_pins.delete_modal.title')}</h3>
              <p className="text-sm opacity-90 mt-1">{t('travel_pins.delete_modal.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5">📍</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">{t('travel_pins.delete_modal.pin_to_delete')}</div>
                  <div className="text-lg font-semibold text-slate-900 break-words">{pin?.title}</div>
                  {pin?.note && (<div className="text-sm text-slate-600 mt-2 line-clamp-2">{pin.note}</div>)}
                  {pin?.visited_at && (
                    <div className="text-xs text-slate-500 mt-2">{t('travel_pins.popup.visited')} {formatDate(pin.visited_at)}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">💡</div>
                <div className="text-sm text-slate-700">
                  <div className="font-semibold mb-1">{t('travel_pins.delete_modal.confirmation_title')}</div>
                  <div>{t('travel_pins.delete_modal.confirmation_text')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onCancel} className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm uppercase tracking-wide">
              {t('travel_pins.delete_modal.cancel_button')}
            </button>
            <button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide">
              {t('travel_pins.delete_modal.delete_forever_button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

