import { useState } from 'react';
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
  const [emailInput, setEmailInput] = useState('');
  const navigate = useNavigate();

  // Busca os dados da lista e os membros
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

  if (!membersModal.isOpen) return null;

  const handleAddMember = async () => {
    if (!emailInput.trim()) return showToast('Informe o e-mail do utilizador.', 'error');
    try {
      await api(`/watch-list-member/${membersModal.watchListId}/add`, {
        method: 'POST',
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      setEmailInput('');
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

              {/* Os Convidados */}
              {(members || []).map((m) => (
                <div
                  key={m.id}
                  className={`member-item ${m.user.id !== currentUser?.id ? 'clickable' : ''}`}
                  onClick={() => {
                    if (m.user.id !== currentUser?.id) {
                      closeMembersModal();
                      // Aqui passamos o ID na URL, mas o name e email escondidos no state!
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
                      onClick={() => handleRemoveMember(m.user.id)}
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
                marginBottom: '0.5rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Adicionar membro
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                className="form-input"
                placeholder="E-mail do utilizador"
                style={{ flex: 1 }}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAddMember}>
                Adicionar
              </button>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={closeMembersModal}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
