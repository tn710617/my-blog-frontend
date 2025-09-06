/**
 * TailwindCSS popup styles for Travel Pins New DisplayPopup
 * Consistent with modal design system but optimized for popup presentation
 */

/**
 * Main popup container classes
 */
export const POPUP_CONTAINER = "travel-pin-popup-modern";

/**
 * Popup dialog classes - matches modal dialog style
 */
export const POPUP_DIALOG = "w-full max-w-[420px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 flex flex-col";

/**
 * Popup header - matches modal header with gradient, flex-shrink-0 to prevent compression
 */
export const POPUP_HEADER = "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-5 relative flex-shrink-0";

/**
 * Header overlay for gradient enhancement
 */
export const POPUP_HEADER_OVERLAY = "absolute inset-0 bg-gradient-to-br from-white/10 to-transparent";

/**
 * Header content container
 */
export const POPUP_HEADER_CONTENT = "flex justify-between items-start gap-4 relative z-10";

/**
 * Title section in header
 */
export const POPUP_TITLE_SECTION = "flex-1 min-w-0";

/**
 * Popup title
 */
export const POPUP_TITLE = "text-xl font-bold tracking-tight leading-tight m-0 break-words";

/**
 * Popup date display
 */
export const POPUP_DATE = "text-sm opacity-90 mt-2 font-normal";

/**
 * Close button
 */
export const POPUP_CLOSE_BTN = "flex-shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg border-none cursor-pointer flex items-center justify-center text-white transition-all duration-200 hover:scale-105";

/**
 * Popup content container - with scrollable support, flexible height
 */
export const POPUP_CONTENT = "p-6 space-y-6 flex-1 overflow-y-auto min-h-0";

/**
 * Content section
 */
export const POPUP_SECTION = "space-y-3";

/**
 * Section title with icon
 */
export const POPUP_SECTION_TITLE = "text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2";

/**
 * Section icon
 */
export const POPUP_SECTION_ICON = "text-base";

/**
 * Notes section background
 */
export const POPUP_NOTES_CONTAINER = "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4";

/**
 * Notes content - markdown styles are now embedded in the HTML
 */
export const POPUP_NOTES_CONTENT = "text-sm text-slate-700 leading-relaxed max-w-none";

/**
 * Photo section
 */
export const POPUP_PHOTO_CONTAINER = "relative";

/**
 * Photo button
 */
export const POPUP_PHOTO_BTN = "w-full border-none bg-none p-0 cursor-pointer rounded-xl overflow-hidden relative block";

/**
 * Photo image
 */
export const POPUP_PHOTO_IMG = "w-full h-48 object-cover transition-transform duration-300 hover:scale-105";

/**
 * Photo overlay
 */
export const POPUP_PHOTO_OVERLAY = "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 text-white";

/**
 * Popup actions footer - flex-shrink-0 to prevent compression
 */
export const POPUP_ACTIONS = "flex flex-wrap gap-3 px-6 py-5 bg-gradient-to-br from-slate-50 to-gray-50 border-t border-slate-100 flex-shrink-0";

/**
 * Base popup button
 */
export const POPUP_BTN_BASE = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border min-h-[40px] min-w-[110px]";

/**
 * Popup button variants
 */
export const POPUP_BUTTONS = {
  // Copy link button - updated to match edit/delete style
  secondary: `${POPUP_BTN_BASE} bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5`,
  
  // Edit button
  primary: `${POPUP_BTN_BASE} bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5`,
  
  // Delete button
  danger: `${POPUP_BTN_BASE} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5`
};

/**
 * Button icon
 */
export const POPUP_BTN_ICON = "w-4 h-4";

/**
 * Copy success state
 */
export const COPY_SUCCESS_TEXT = "text-green-600 font-medium";

/**
 * Copy error state  
 */
export const COPY_ERROR_TEXT = "text-red-600 text-xs";

/**
 * Mobile responsive classes
 */
export const MOBILE_RESPONSIVE = {
  dialog: "sm:max-w-[420px] max-w-[calc(100vw-4rem)]",
  header: "px-4 py-4 sm:px-6 sm:py-5",
  title: "text-lg sm:text-xl",
  content: "p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto min-h-0",
  actions: "flex-col sm:flex-row px-4 py-4 sm:px-6 sm:py-5",
  button: "w-full sm:w-auto justify-center",
  photo: "h-40 sm:h-48"
};

/**
 * Utility function to create popup classes
 */
export const createPopupClasses = {
  container: () => POPUP_CONTAINER,
  dialog: () => `${POPUP_DIALOG} ${MOBILE_RESPONSIVE.dialog}`,
  header: () => `${POPUP_HEADER} ${MOBILE_RESPONSIVE.header}`,
  headerOverlay: () => POPUP_HEADER_OVERLAY,
  headerContent: () => POPUP_HEADER_CONTENT,
  titleSection: () => POPUP_TITLE_SECTION,
  title: () => `${POPUP_TITLE} ${MOBILE_RESPONSIVE.title}`,
  date: () => POPUP_DATE,
  closeBtn: () => POPUP_CLOSE_BTN,
  content: () => `${POPUP_CONTENT} ${MOBILE_RESPONSIVE.content}`,
  section: () => POPUP_SECTION,
  sectionTitle: () => POPUP_SECTION_TITLE,
  sectionIcon: () => POPUP_SECTION_ICON,
  notesContainer: () => POPUP_NOTES_CONTAINER,
  notesContent: () => POPUP_NOTES_CONTENT,
  photoContainer: () => POPUP_PHOTO_CONTAINER,
  photoBtn: () => POPUP_PHOTO_BTN,
  photoImg: () => `${POPUP_PHOTO_IMG} ${MOBILE_RESPONSIVE.photo}`,
  photoOverlay: () => POPUP_PHOTO_OVERLAY,
  actions: () => `${POPUP_ACTIONS} ${MOBILE_RESPONSIVE.actions}`,
  button: (variant = 'primary') => `${POPUP_BUTTONS[variant]} ${MOBILE_RESPONSIVE.button}`,
  buttonIcon: () => POPUP_BTN_ICON,
  copySuccess: () => COPY_SUCCESS_TEXT,
  copyError: () => COPY_ERROR_TEXT
};
