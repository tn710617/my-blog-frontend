/**
 * Unified TailwindCSS modal styles for Travel Pins New
 * Provides consistent design system for all modal components
 */

/**
 * Base modal container class with backdrop
 */
export const MODAL_BACKDROP = "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]";

/**
 * Base modal dialog class
 */
export const MODAL_DIALOG = "bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[420px] max-w-[90vw] animate-in zoom-in-95 duration-200";

/**
 * Modal header variants with gradient backgrounds
 */
export const MODAL_HEADERS = {
  // General purpose blue-purple gradient
  primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-5 relative",
  
  // Warning/confirmation amber gradient  
  warning: "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white px-6 py-5 relative",
  
  // Danger/delete red gradient
  danger: "bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-6 py-5 relative",
  
  // Edit form purple gradient
  edit: "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-5 relative"
};

/**
 * Header overlay for gradient enhancement
 */
export const HEADER_OVERLAY = "absolute inset-0 bg-gradient-to-br from-white/10 to-transparent";

/**
 * Header content container
 */
export const HEADER_CONTENT = "flex items-center gap-3 relative z-10";

/**
 * Icon container in header
 */
export const HEADER_ICON = "w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl";

/**
 * Header text container
 */
export const HEADER_TEXT = "flex-1";

/**
 * Header title
 */
export const HEADER_TITLE = "text-xl font-bold tracking-tight leading-tight m-0";

/**
 * Header subtitle
 */
export const HEADER_SUBTITLE = "text-sm opacity-90 mt-1";

/**
 * Modal body container
 */
export const MODAL_BODY = "p-6 space-y-5";

/**
 * Content section with gradient background
 */
export const CONTENT_SECTIONS = {
  primary: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4",
  warning: "bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-4", 
  danger: "bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4",
  info: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4"
};

/**
 * Section icon container
 */
export const SECTION_ICONS = {
  primary: "w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5",
  warning: "w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5",
  danger: "w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5",
  small: "w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
};

/**
 * Section content container
 */
export const SECTION_CONTENT = "flex items-start gap-3";

/**
 * Section text container
 */
export const SECTION_TEXT = "flex-1 min-w-0";

/**
 * Section label
 */
export const SECTION_LABEL = "text-sm font-bold text-slate-700 uppercase tracking-wide mb-2";

/**
 * Section title
 */
export const SECTION_TITLE = "text-lg font-semibold text-slate-900 break-words";

/**
 * Section description
 */
export const SECTION_DESC = "text-sm text-slate-600 mt-2";

/**
 * Modal footer/actions container
 */
export const MODAL_ACTIONS = "flex gap-3 pt-2";

/**
 * Button variants
 */
export const BUTTONS = {
  // Primary action button (save, confirm, etc.)
  primary: "flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide",
  
  // Secondary action button (cancel, back, etc.)
  secondary: "flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm uppercase tracking-wide",
  
  // Danger action button (delete, discard, etc.)
  danger: "flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide",
  
  // Continue/positive action button
  continue: "flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide"
};

/**
 * Form input styles
 */
export const FORM_INPUTS = {
  text: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base",
  textarea: "w-full bg-transparent border-none resize-none focus:outline-none text-slate-700 placeholder:text-slate-500 text-base",
  date: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer text-base",
  url: "w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-500 text-base"
};

/**
 * Form section styles
 */
export const FORM_SECTIONS = {
  title: "space-y-3",
  notes: "space-y-3",
  date: "space-y-3", 
  photo: "space-y-3",
  coordinates: "space-y-3"
};

/**
 * Form section headers
 */
export const FORM_SECTION_HEADERS = "flex items-center gap-2";

/**
 * Form section labels
 */
export const FORM_SECTION_LABELS = "text-sm font-bold text-slate-700 uppercase tracking-wide";

/**
 * Form section icons
 */
export const FORM_SECTION_ICONS = {
  title: "w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm",
  notes: "w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm",
  date: "w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm",
  photo: "w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm",
  coordinates: "w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center text-white text-sm"
};

/**
 * Form section backgrounds
 */
export const FORM_SECTION_BACKGROUNDS = {
  notes: "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4",
  photo: "bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/50 rounded-xl p-4",
  coordinates: "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl p-4"
};

/**
 * Animation classes using standard Tailwind
 */
export const ANIMATIONS = {
  modalEnter: "animate-in zoom-in-95 duration-200",
  modalExit: "animate-out zoom-out-95 duration-200"
};

/**
 * Utility function to create consistent modal structure
 */
export const createModalClasses = {
  backdrop: () => MODAL_BACKDROP,
  dialog: (width = "w-[420px]") => MODAL_DIALOG.replace("w-[420px]", width),
  header: (variant = 'primary') => MODAL_HEADERS[variant] || MODAL_HEADERS.primary,
  headerOverlay: () => HEADER_OVERLAY,
  headerContent: () => HEADER_CONTENT,
  headerIcon: () => HEADER_ICON,
  headerText: () => HEADER_TEXT,
  headerTitle: () => HEADER_TITLE,
  headerSubtitle: () => HEADER_SUBTITLE,
  body: () => MODAL_BODY,
  contentSection: (variant = 'primary') => CONTENT_SECTIONS[variant] || CONTENT_SECTIONS.primary,
  sectionIcon: (variant = 'primary') => SECTION_ICONS[variant] || SECTION_ICONS.primary,
  sectionContent: () => SECTION_CONTENT,
  sectionText: () => SECTION_TEXT,
  sectionLabel: () => SECTION_LABEL,
  sectionTitle: () => SECTION_TITLE,
  sectionDesc: () => SECTION_DESC,
  actions: () => MODAL_ACTIONS,
  button: (variant = 'primary') => BUTTONS[variant] || BUTTONS.primary
};