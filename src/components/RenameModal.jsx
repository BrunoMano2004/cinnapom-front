import { useState, useEffect } from 'react';
import { useModal } from '../contexts/ModalContext';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export function RenameModal({ onRenameSuccess }) {
  const { renameModal, closeRenameModal } = useModal();
  const { showToast } = useToast();
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preenche o input quando o modal abre
  useEffect(() => {
    if (renameModal.isOpen) setNewName(renameModal.currentName);
  }, [renameModal.isOpen, renameModal.currentName]);

  if (!renameModal.isOpen) return null;

  const handleSubmit = async () => {
    if (!newName.trim()) return showToast('Informe o novo nome.', 'error');

    setIsSubmitting(true);
    try {
      await api(`/watch-list/updateName/${renameModal.watchListId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName.trim() }),
      });
      showToast('Lista renomeada!');
      closeRenameModal();
      if (onRenameSuccess) onRenameSuccess(); // Avisa a página por trás para recarregar
    } catch (e) {
      showToast('Erro ao renomear.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) closeRenameModal();
      }}
    >
      <div className="modal">
        <div className="modal-title">Renomear Lista</div>
        <label className="form-label">Novo nome</label>
        <input
          className="form-input"
          placeholder="Nome da watchlist"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={closeRenameModal}>
            Cancelar
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'A guardar...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
