import React from 'react';
import PinForm from './PinForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EscConfirmationModal from './EscConfirmationModal';
import PhotoLightbox from './PhotoLightbox';

const ModalManager = ({
  // Pin Form props
  showForm,
  editingPin,
  formData,
  t,
  formatDate,
  handleInputChange,
  handleCloseForm,
  handleSavePin,
  
  // Delete Modal props
  showDeleteModal,
  pendingDeletePin,
  cancelDeletePin,
  confirmDeletePin,
  
  // ESC Modal props
  showEscModal,
  cancelEscAction,
  confirmEscAction,
  
  // Photo Modal props
  showPhotoModal,
  photoModalData,
  closePhotoModal
}) => {
  return (
    <>
      {/* Pin Creation/Edit Form */}
      {showForm && (
        <PinForm
          editing={!!editingPin}
          t={t}
          formData={formData}
          setField={handleInputChange}
          formatDate={formatDate}
          onCancel={handleCloseForm}
          onSubmit={handleSavePin}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          open={showDeleteModal}
          pin={pendingDeletePin}
          onCancel={cancelDeletePin}
          onConfirm={confirmDeletePin}
          formatDate={formatDate}
          t={t}
        />
      )}

      {/* ESC Key Confirmation Modal */}
      <EscConfirmationModal
        open={showEscModal}
        editingPin={editingPin}
        onCancel={cancelEscAction}
        onConfirm={confirmEscAction}
      />

      {/* Photo Modal/Lightbox */}
      <PhotoLightbox open={showPhotoModal} data={photoModalData} onClose={closePhotoModal} />
    </>
  );
};

export default ModalManager;