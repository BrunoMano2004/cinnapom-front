import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PageTabs } from '../components/PageTabs';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';

export function Profile() {
  // Se você tiver a função `setUser` no AuthContext, importe-a para atualizar o nome no topo em tempo real
  const { user, logout, setUser } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  // Buscar os pedidos de amizade pendentes
  const { data: requestsData, loading: loadingReqs, refetch: refetchReqs } = useFetch('/friendship/requests');

  // Mantém o estado de edição sincronizado com o usuário carregado
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
    }
  }, [user]);

  if (!user) return null;

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : '—';

  const handleLogout = () => {
    logout();
    showToast('Saíste da conta com sucesso.');
  };

  // Atualizar nome de perfil
// Atualizar nome de perfil
  const handleUpdateName = async () => {
    // Validação no frontend espelhando o @IsNotEmpty() do seu DTO
    if (!editName.trim()) {
      showToast('O nome não pode ficar vazio.', 'error');
      return;
    }

    // Se não mudou nada, apenas fecha a edição
    if (editName === user.name) {
      setIsEditing(false);
      return;
    }

    try {
      // Nota: Se o seu Controller tiver um prefixo (ex: @Controller('users')), 
      // a rota aqui deve ser '/users/update/name'. Caso contrário, use apenas '/update/name'
      await api('/user/update/name', {
        method: 'PATCH',
        body: JSON.stringify({ name: editName })
      });
      
      // Atualiza o estado global caso setUser esteja disponível
      if (setUser) {
        setUser({ ...user, name: editName });
      }
      
      showToast('Nome de perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      showToast('Erro ao atualizar o nome.', 'error');
    }
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
        
        {/* --- Cabeçalho do Perfil (Com Foto e Edição) --- */}
        <div className="profile-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img 
            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}`} 
            alt={`Foto de ${user.name}`} 
            className="profile-large-avatar"
            style={{ 
              width: '75px', height: '75px', borderRadius: '50%', 
              objectFit: 'cover', border: '2px solid var(--accent)' 
            }}
          />
          
          <div className="profile-info-block">
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)', 
                    color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '6px', 
                    fontSize: '1.2rem', fontFamily: '"Bebas Neue", sans-serif', outline: 'none'
                  }}
                />
                <button onClick={handleUpdateName} className="btn btn-primary btn-sm">Salvar</button>
                <button 
                  onClick={() => { setIsEditing(false); setEditName(user.name); }} 
                  className="btn btn-ghost btn-sm" 
                  style={{ borderColor: 'var(--border)' }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div 
                  className="profile-name"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', margin: 0, lineHeight: 1 }}
                >
                  {user.name || '—'}
                </div>
                <button 
                  onClick={() => setIsEditing(true)} 
                  style={{ 
                    background: 'transparent', border: 'none', color: 'var(--muted)', 
                    cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', transition: 'all 0.2s' 
                  }}
                >
                  ✏️ Editar
                </button>
              </div>
            )}

            <div className="profile-email" style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              {user.email || '—'}
            </div>
          </div>
        </div>

        {/* --- Informações de Sistema do Usuário --- */}
        <div className="profile-card">
          <div className="profile-row">
            <span className="profile-key">ID</span>
            <span className="profile-val">{user.id ? String(user.id).slice(0, 12) + '...' : '—'}</span>
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

        {/* --- Logout --- */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}