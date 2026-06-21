import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PageTabs } from '../components/PageTabs';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';

export function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // Buscar os pedidos de amizade pendentes
  const { data: requestsData, loading: loadingReqs, refetch: refetchReqs } = useFetch('/friendship/requests');

  if (!user) return null;

  const initial = user.name ? user.name[0].toUpperCase() : '?';
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : '—';

  const handleLogout = () => {
    logout();
    showToast('Saíste da conta com sucesso.');
  };

  // Aceitar pedido de amizade
  const handleAcceptRequest = async (id) => {
    try {
      await api(`/friendship/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACCEPTED' })
      });
      showToast('Pedido de amizade aceite!');
      refetchReqs();
    } catch (err) {
      showToast('Erro ao aceitar pedido.', 'error');
    }
  };

  // Recusar ou cancelar um pedido
  const handleDeleteRequest = async (id, isSent = false) => {
    try {
      await api(`/friendship/${id}`, { method: 'DELETE' });
      showToast(isSent ? 'Pedido cancelado.' : 'Pedido recusado.');
      refetchReqs();
    } catch (err) {
      showToast('Erro ao eliminar pedido.', 'error');
    }
  };

  const receivedReqs = requestsData?.received || [];
  const sentReqs = requestsData?.sent || [];

  return (
    <div id="page-profile" className="page active" style={{ padding: '2.5rem' }}>
      <PageTabs />
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="profile-header" style={{ marginBottom: '2rem' }}>
          <div
            className="profile-avatar"
            style={{ width: '72px', height: '72px', fontSize: '2rem', marginBottom: '1rem' }}
          >
            {initial}
          </div>
          <div
            className="profile-name"
            style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem' }}
          >
            {user.name || '—'}
          </div>
          <div className="profile-email" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            {user.email || '—'}
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-row">
            <span className="profile-key">ID</span>
            <span className="profile-val">{user.id ? user.id.slice(0, 12) + '...' : '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-key">Nickname</span>
            <span className="profile-val">{user.name || 'não definido'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-key">Membro desde</span>
            <span className="profile-val">{memberSince}</span>
          </div>
        </div>

        {/* --- Secção de Pedidos de Amizade --- */}
        <div style={{ marginTop: '2.5rem' }}>
          <div className="detail-section-title" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Pedidos de Amizade Pendentes
          </div>
          
          {loadingReqs ? (
            <div className="spinner" style={{ width: '24px', height: '24px', margin: '1rem auto', borderWidth: '2px' }}></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {receivedReqs.length === 0 && sentReqs.length === 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Não tens pedidos de amizade pendentes.</div>
              )}
              
              {/* Pedidos Recebidos */}
              {receivedReqs.map(req => (
                <div key={req.friendshipId} className="profile-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Recebido de</div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{req.username || req.userEmail}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(req.friendshipId)}>Aceitar</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', borderColor: 'rgba(232, 92, 74, 0.3)' }} onClick={() => handleDeleteRequest(req.friendshipId, false)}>Recusar</button>
                  </div>
                </div>
              ))}

              {/* Pedidos Enviados */}
              {sentReqs.map(req => (
                <div key={req.friendshipId} className="profile-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Enviado para</div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{req.username || req.userEmail}</div>
                  </div>
                  <div>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', borderColor: 'rgba(232, 92, 74, 0.3)' }} onClick={() => handleDeleteRequest(req.friendshipId, true)}>Cancelar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}