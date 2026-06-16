// src/components/ConfirmModal.jsx
import { useModal } from '../contexts/ModalContext';

export function ConfirmModal() {
  const { confirmModal, closeConfirmModal } = useModal();

  if (!confirmModal.isOpen) return null;

  const handleConfirm = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm(); // Executa a ação perigosa!
    }
    closeConfirmModal(); // Fecha o modal
  };

  return (
    <div className="modal-overlay open" onClick={closeConfirmModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-title" style={{ color: confirmModal.isDanger ? 'var(--red)' : 'inherit' }}>
          {confirmModal.title}
        </div>
        
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {confirmModal.message}
        </p>
        
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={closeConfirmModal}>
            Cancelar
          </button>
          
          <button 
            className="btn btn-primary" 
            style={confirmModal.isDanger ? { background: 'var(--red)', color: '#fff' } : {}}
            onClick={handleConfirm}
          >
            {confirmModal.confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}