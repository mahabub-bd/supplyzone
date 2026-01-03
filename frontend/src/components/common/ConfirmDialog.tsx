import React from "react";
import { Modal } from "../ui/modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  showCloseButton?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  showCloseButton = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      className="max-w-lg p-6"
      showCloseButton={showCloseButton}
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </h2>

      <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {cancelLabel}
        </button>

        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
