import React from 'react'

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel', isDestructive = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onCancel}
        className="absolute inset-0 bg-surface-container-highest/60 backdrop-blur-[4px] transition-opacity" 
      />

      {/* Modal Content */}
      <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 max-w-md w-full p-6 shadow-xl animate-scale-up">
        {/* Header Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`material-symbols-outlined text-[24px] ${isDestructive ? 'text-error' : 'text-primary'}`}>
            {isDestructive ? 'warning' : 'info'}
          </span>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-body-md text-on-surface-variant mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`px-5 py-2.5 rounded-lg text-label-md font-label-md text-white transition-all shadow-sm ${
              isDestructive 
                ? 'bg-error hover:opacity-90' 
                : 'bg-primary hover:opacity-90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
