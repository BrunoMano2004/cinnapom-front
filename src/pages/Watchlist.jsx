import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PageTabs } from '../components/PageTabs';
import { useModal } from '../contexts/ModalContext';


export function Watchlist() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { openRenameModal, openMembersModal, openConfirmModal } = useModal();

  // Estado para controlar se o formulário está aberto
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Estados para os inputs do formulário
  const [nameInput, setNameInput] = useState('');
  const [coverInput, setCoverInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Busca as listas e pega a função refetch que acabamos de criar
  const { data: lists, loading, refetch } = useFetch('/watch-list/listAll');

  const handleCreateWatchlist = async () => {
    if (!nameInput.trim()) {
      showToast('Informe o nome da lista.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api('/watch-list/create', {
        method: 'POST',
        body: JSON.stringify({
          name: nameInput.trim(),
          imageCoverUrl: coverInput.trim() || undefined,
        }),
      });

      showToast('Watchlist criada com sucesso!');
      // Limpa os campos e fecha o formulário
      setNameInput('');
      setCoverInput('');
      setIsFormOpen(false);
      // Recarrega a lista automaticamente!
      refetch();
    } catch (e) {
      showToast('Erro ao criar watchlist.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWatchlist = (id, name) => {
    openConfirmModal({
      title: 'Excluir Watchlist',
      message: `Tem certeza que deseja deletar a lista "${name}"? Todos os filmes salvos nela serão removidos permanentemente.`,
      confirmText: 'Sim, excluir',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api(`/watch-list/watchListId/${id}`, { method: 'DELETE' });
          showToast('Watchlist deletada com sucesso!');
          refetch();
        } catch (e) {
          showToast('Erro ao deletar watchlist.', 'error');
          console.error(e);
        }
      }
    });
  };

  return (
    <div id="page-watchlist" className="page active" style={{ padding: '2.5rem' }}>
      <PageTabs />

      <div className="wl-header">
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--accent)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            Organizar
          </div>
          <div className="wl-title">
            Minhas <span>Watchlists</span>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? '✕ Cancelar' : '+ Nova lista'}
        </button>
      </div>

      {/* Formulário de Criação Condicional */}
      {isFormOpen && (
        <div className="wl-create-form open" style={{ display: 'block' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome da lista</label>
              <input
                className="form-input"
                placeholder="Ex: Filmes pra assistir no fim de semana"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL da capa (opcional)</label>
              <input
                className="form-input"
                placeholder="https://..."
                value={coverInput}
                onChange={(e) => setCoverInput(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={handleCreateWatchlist}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </div>
      )}

      {/* Renderização da Grelha */}
      {loading ? (
        <div className="spinner"></div>
      ) : lists && lists.length > 0 ? (
        <div className="wl-grid">
          {lists.map((wl) => (
            <div key={wl.id} className="wl-card" onClick={() => navigate(`/watchlist/${wl.id}`)}>
              <div className="wl-cover">
                {wl.imageCoverUrl ? <img src={wl.imageCoverUrl} alt={wl.name} /> : '🎬'}
              </div>
              <div className="wl-card-body">
                <div className="wl-card-name" title={wl.name}>
                  {wl.name}
                </div>
                <div className="wl-card-meta">
                  {new Date(wl.createdAt).toLocaleDateString('pt-BR')}
                </div>
                <div className="wl-card-actions">
                  <button
                    className="btn-icon accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRenameModal(wl.id, wl.name);
                    }}
                  >
                    ✏️ Renomear
                  </button>
                  <button
                    className="btn-icon accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMembersModal(wl.id, wl.name, true);
                    }}
                  >
                    👥 Membros
                  </button>
                  {/* 2. Adicione o botão de excluir */}
                  <button
                    className="btn-icon"
                    style={{ color: 'var(--red)', borderColor: 'rgba(232, 92, 74, 0.3)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWatchlist(wl.id, wl.name);
                    }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">📋</div>
          Nenhuma watchlist ainda.
          <br />
          Crie sua primeira lista!
        </div>
      )}
    </div>
  );
}
