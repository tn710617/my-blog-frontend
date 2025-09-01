export function buildPopupHTML(pin, ctx) {
  const { t, formatDate, isMobile, isLoggedIn, popupId, renderMarkdownToHTML } = ctx;
  return `
      <div id="${popupId}" class="p-0 ${isMobile ? 'w-[85vw] max-w-sm' : 'min-w-80 max-w-md'} bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50">
        <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white ${isMobile ? 'px-4 py-4' : 'px-6 py-5'} relative">
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div class="flex justify-between items-start relative z-10">
            <div class="flex-1 pr-4">
              <h3 class="m-0 ${isMobile ? 'text-lg' : 'text-xl'} font-bold tracking-tight leading-tight">${pin.title}</h3>
              ${pin.visited_at ? `
                <div class="mt-2 flex items-center gap-2 text-sm opacity-90">
                  <div class="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <span>${t('travel_pins.popup.visited')} ${formatDate(pin.visited_at)}</span>
                </div>
              ` : ''}
            </div>
            <button 
              data-action="close"
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors duration-200 text-white/80 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-5'}">
          ${pin.note ? `
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📝
                </div>
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">${t('travel_pins.popup.travel_notes')}</h4>
              </div>
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4 text-sm leading-relaxed text-slate-700 shadow-inner">
                ${renderMarkdownToHTML(pin.note)}
              </div>
            </div>
          ` : ''}

          ${pin.photo_url ? `
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📷
                </div>
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">${t('travel_pins.popup.photo')}</h4>
              </div>
              <div class="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/50 rounded-xl p-2">
                <div class="relative w-full" style="aspect-ratio: 16/10;">
                  <img
                    src="${pin.photo_url}"
                    alt="${pin.title}"
                    data-action="open-photo"
                    class="absolute inset-0 w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div style="display: none;" class="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100 rounded-lg">
                    <div class="text-center">
                      <div class="text-2xl mb-2">📷</div>
                      <div class="text-sm">${t('travel_pins.popup.image_not_available')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          ${pin.photos && pin.photos.length > 0 ? `
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📎
                </div>
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">${t('travel_pins.popup.attachments')}</h4>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-50 border-2 border-dashed border-purple-200 rounded-xl p-4 text-center">
                <div class="text-2xl mb-2">📸</div>
                <div class="text-sm font-medium text-slate-600">
                  ${pin.photos.length} photo${pin.photos.length !== 1 ? 's' : ''} attached
                </div>
              </div>
            </div>
          ` : ''}

          <div class="flex justify-center">
            <button
              data-action="copy"
              id="copy-btn-${pin.id}"
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-emerald-700 border border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span class="text-sm font-medium">${t('travel_pins.popup.copy_location')}</span>
            </button>
          </div>

          <div class="pt-2 border-t border-slate-100 auth-buttons-container ${isLoggedIn ? 'auth-buttons-visible' : 'auth-buttons-hidden'}">
            <div class="flex gap-2">
              <button 
                data-action="delete"
                class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-3 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                ${t('travel_pins.popup.delete_button')}
              </button>
              <button 
                data-action="edit"
                class="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium py-2.5 px-3 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                ${t('travel_pins.popup.edit_button')}
              </button>
            </div>
          </div>
        </div>
      </div>
  `;
}
