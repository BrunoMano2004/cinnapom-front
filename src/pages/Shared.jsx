import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PageTabs } from '../components/PageTabs';

export function Shared() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Busca as listas partilhadas com o utilizador
  const { data: members, loading, error, refetch } = useFetch('/watch-list-member/shared-with-me');

  const handleLeaveList = async (watchListId, watchListName) => {
    if (!window.confirm(`Sair da lista "${watchListName}"?`)) return;

    try {
      // O endpoint exige o ID da lista e o ID do utilizador que está a sair
      await api(`/watch-list-member/${watchListId}/remove/${user.id}`, {
        method: 'DELETE',
      });
      showToast('Saíste da lista com sucesso.');
      refetch(); // Recarrega o ecrã automaticamente
    } catch (e) {
      showToast('Erro ao sair da lista.', 'error');
    }
  };

  return (
    <div id="page-shared" className="page active" style={{ padding: '2.5rem' }}>
      <PageTabs />

      <div className="wl-header" style={{ marginTop: '1.5rem' }}>
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
            Colaborar
          </div>
          <div className="wl-title">
            Listas <span>Compartilhadas</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="empty">
          <div className="empty-icon">⚠️</div>Erro ao carregar listas.
        </div>
      ) : members && members.length > 0 ? (
        <div className="wl-grid">
          {members.map((m) => {
            const wl = m.watchList;
            return (
              <div key={wl.id} className="wl-card" onClick={() => navigate(`/watchlist/${wl.id}`)}>
                <div className="wl-cover">
                  {wl.imageCoverUrl ? <img src={wl.imageCoverUrl} alt={wl.name} /> : '🎬'}
                </div>
                <div className="wl-card-body">
                  <div className="wl-card-name" title={wl.name}>
                    {wl.name}
                  </div>
                  <div className="wl-card-meta">
                    {new Date(wl.createdAt).toLocaleDateString('pt-PT')}
                  </div>
                  <div className="wl-card-actions">
                    <span className="shared-badge">Compartilhada</span>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveList(wl.id, wl.name);
                      }}
                    >
                      ✕ Sair
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">👥</div>
          Nenhuma lista foi compartilhada contigo ainda.
        </div>
      )}
    </div>
  );
}
