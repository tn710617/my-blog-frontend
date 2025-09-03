import React from 'react';

const EscConfirmationModal = ({ 
  open, 
  editingPin, 
  onCancel, 
  onConfirm 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[420px] max-w-[90vw] animate-scale-up">
        {/* Warning header with amber gradient */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white px-6 py-5 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
              💾
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight leading-tight m-0">Unsaved Changes</h3>
              <p className="text-sm opacity-90 mt-1">You have unsaved changes</p>
            </div>
          </div>
        </div>
        
        {/* Modal content */}
        <div className="p-6 space-y-5">
          {/* Warning content */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5">
                  ✏️
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Current Form</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {editingPin ? `Editing: ${editingPin.title}` : 'Creating New Pin'}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">
                    You have made changes that haven't been saved yet.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action explanation */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                  💡
                </div>
                <div className="text-sm text-slate-700">
                  <div className="font-semibold mb-1">What would you like to do?</div>
                  <div>You can go back to continue editing, or discard your changes and close the form.</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide"
            >
              Continue Editing
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm uppercase tracking-wide"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscConfirmationModal;