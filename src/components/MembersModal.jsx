import { useModal } from '../contexts/ModalContext';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function MembersModal() {
  const { membersModal, closeMembersModal } = useModal();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Busca os dados da lista e os membros atuais
  const { data: wl, loading: loadingWl } = useFetch(
    membersModal.isOpen ? `/watch-list/getById/${membersModal.watchListId}` : null,
  );
  const {
    data: members,
    loading: loadingMembers,
    refetch: refetchMembers,
  } = useFetch(
    membersModal.isOpen ? `/watch-list-member/${membersModal.watchListId}/members` : null,
  );

  // Busca as amizades do usuário logado
  const { data: friendshipData, loading: friendsLoading } = useFetch(
    membersModal.isOpen ? '/friendship' : null
  );

  // Filtra as amizades para mostrar apenas as que já foram aceitas
  const friendsList = friendshipData?.friends?.filter(f => f.status === 'ACCEPTED') || [];

  if (!membersModal.isOpen) return null;

  // Função para adicionar o membro recebendo diretamente o friendId
  const handleAddMember = async (friendId) => {
    try {
      await api(`/watch-list-member/${membersModal.watchListId}/add`, {
        method: 'POST',
        body: JSON.stringify({ friendId }),
      });
      
      showToast('Membro adicionado!');
      refetchMembers();
    } catch (e) {
      showToast('Erro ao adicionar membro.', 'error');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api(`/watch-list-member/${membersModal.watchListId}/remove/${memberId}`, {
        method: 'DELETE',
      });
      showToast('Membro removido.');
      refetchMembers();
    } catch (e) {
      showToast('Erro ao remover membro.', 'error');
    }
  };

  const isLoading = loadingWl || loadingMembers;

  // Verifica quais amigos da lista ainda não foram adicionados nesta watchlist
  const availableFriends = friendsList.filter(friend => 
    !(members || []).some(m => m.user.id === friend.friendId)
  );

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) closeMembersModal();
      }}
    >
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-title">Membros da Lista</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          {membersModal.watchListName}
        </p>

        <div className="member-list">
          {isLoading ? (
            <div
              className="spinner"
              style={{ margin: '1rem auto', width: '24px', height: '24px', borderWidth: '2px' }}
            ></div>
          ) : (
            <>
              {/* O Dono da Lista */}
              {wl?.user && (
                <div className="member-item" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  <div className="member-info">
                    <div
                      className="member-avatar"
                      style={{
                        background: 'var(--surface2)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {wl.user.name ? wl.user.name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="member-name">
                          {wl.user.name || '—'} {wl.user.id === currentUser?.id ? '(Você)' : ''}
                        </div>
                        <span className="owner-badge">Dono</span>
                      </div>
                      <div className="member-email">{wl.user.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Os Convidados (Membros Adicionados) */}
              {(members || []).map((m) => (
                <div
                  key={m.id}
                  className={`member-item ${m.user.id !== currentUser?.id ? 'clickable' : ''}`}
                  onClick={() => {
                    if (m.user.id !== currentUser?.id) {
                      closeMembersModal();
                      navigate(`/profile/${m.user.id}`, {
                        state: { name: m.user.name, email: m.user.email },
                      });
                    }
                  }}
                >
                  <div className="member-info">
                    <div className="member-avatar">
                      {m.user.name ? m.user.name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <div className="member-name">
                        {m.user.name || '—'} {m.user.id === currentUser?.id ? '(Você)' : ''}
                      </div>
                      <div className="member-email">{m.user.email}</div>
                    </div>
                  </div>
                  {membersModal.isOwner && m.user.id !== currentUser?.id && (
                    <button
                      className="btn-icon"
                      style={{ color: 'var(--red)', borderColor: 'rgba(232,92,74,0.3)' }}
                      onClick={(e) => {
                        e.stopPropagation(); // Evita navegar para o perfil ao clicar em remover
                        handleRemoveMember(m.user.id);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {!wl?.user && (!members || members.length === 0) && (
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--muted)',
                    textAlign: 'center',
                    padding: '1rem 0',
                  }}
                >
                  Nenhum membro encontrado.
                </div>
              )}
            </>
          )}
        </div>

        {/* --- Seção de Adicionar Membro --- */}
        {membersModal.isOwner && (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--muted)',
                marginBottom: '0.75rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Adicionar amigo
            </div>

            {friendsLoading ? (
              <div className="spinner" style={{ width: '24px', height: '24px', margin: '0.5rem auto', borderWidth: '2px' }}></div>
            ) : friendsList.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Você ainda não tem amigos adicionados.</p>
            ) : availableFriends.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Todos os seus amigos já estão nesta lista.</p>
            ) : (
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem', 
                  maxHeight: '160px', 
                  overflowY: 'auto',
                  paddingRight: '0.25rem'
                }}
              >
                {availableFriends.map(friend => (
                  <div 
                    key={friend.friendshipId} 
                    className="member-item" 
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      borderRadius: '6px', 
                      background: 'var(--surface2)',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div className="member-info">
                      <div className="member-avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                        {friend.username ? friend.username[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="member-name" style={{ fontSize: '0.85rem' }}>
                          {friend.username || '—'}
                        </div>
                        <div className="member-email" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {friend.userEmail}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm" 
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: 'auto' }}
                      onClick={() => handleAddMember(friend.friendId)}
                    >
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={closeMembersModal}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}