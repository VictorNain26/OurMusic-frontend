import React from 'react';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';

const ModalWrapper = ({ isOpen, onRequestClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onRequestClose={onRequestClose}
          overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          className="outline-none"
          shouldCloseOnOverlayClick={true}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4"
          >
            {children}
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default ModalWrapper;
