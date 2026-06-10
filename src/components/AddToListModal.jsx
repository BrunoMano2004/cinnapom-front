import { useModal } from '../contexts/ModalContext';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export function AddToListModal() {
  const { atlModal, closeAtlModal } = useModal();
  const { showToast } = useToast();
  // Carrega as listas sempre que o modal abre
  const { data: lists, loading } = useFetch(atlModal.isOpen ? '/watch-list/listAll' : null);

  if (!atlModal.isOpen) return null;

  const handleAddToList = async (watchListId, watchListName) => {
    try {
      await api('/watch-list-movie/add', {
        method: 'POST',
        body: JSON.stringify({ watchListId, tmdbMovieId: atlModal.movieId }),
      });
      showToast(`Adicionado a "${watchListName}"!`);
      closeAtlModal();
    } catch (e) {
      showToast('Erro ao adicionar à lista.', 'error');
    }
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) closeAtlModal();
      }}
    >
      <div className="modal">
        <div className="modal-title">Adicionar à Watchlist</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
          Selecione uma lista para "{atlModal.movieTitle}":
        </p>

        <div className="atl-list">
          {loading ? (
            <div
              className="spinner"
              style={{ margin: '1.5rem auto', width: '24px', height: '24px', borderWidth: '2px' }}
            ></div>
          ) : lists?.length > 0 ? (
            lists.map((wl) => (
              <div key={wl.id} className="atl-item" onClick={() => handleAddToList(wl.id, wl.name)}>
                <div>
                  <div className="atl-item-name">{wl.name}</div>
                  <div className="atl-item-meta">
                    {new Date(wl.createdAt).toLocaleDateString('pt-PT')}
                  </div>
                </div>
                <span style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>+</span>
              </div>
            ))
          ) : (
            <div className="atl-empty">Não tens nenhuma lista. Crie uma em "Minhas Listas".</div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={closeAtlModal}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
