import React from 'react';
import Modal from 'react-modal';

const ModalWrapper = ({ isOpen, onRequestClose, children }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
    className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4"
    shouldCloseOnOverlayClick={true}
  >
    {children}
  </Modal>
);

export default ModalWrapper;