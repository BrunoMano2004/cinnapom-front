import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export function Friends() {
  const { showToast } = useToast();
  
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [friendEmail, setFriendEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função auxiliar para extrair a mensagem de erro
// Função auxiliar para extrair a mensagem de erro
  const extractErrorMessage = (err, defaultMsg) => {
    // 1. Verifica se o status HTTP passado pelo api.js é 404
    if (err.status === 404) {
      return 'Usuário não foi encontrado.';
    }

    try {
      const parsed = JSON.parse(err.message);
      
      // 2. Verifica se o JSON do backend tem o statusCode 404
      // Se tiver, ignoramos a mensagem em inglês e forçamos a nossa
      if (parsed.statusCode === 404) {
        return 'Usuário não foi encontrado.';
      }

      // Para outros erros (ex: 400 Bad Request, 409 Conflict) pegamos a mensagem do backend
      if (parsed.message) {
        return Array.isArray(parsed.message) ? parsed.message[0] : parsed.message;
      }
    } catch (e) {
      // Falha silenciosa se não for um JSON
    }
    
    return defaultMsg;
  };

  const fetchFriendshipData = async () => {
    setLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        api('/friendship'),
        api('/friendship/requests')
      ]);
      
      setFriends(friendsData?.friends || []);
      setReceivedRequests(requestsData?.received || []);
      setSentRequests(requestsData?.sent || []);
    } catch (err) {
      showToast('Erro ao carregar dados de amizades.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendshipData();
  }, []);

  // 1. Enviar pedido de amizade
  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!friendEmail) return;

    setIsSubmitting(true);
    try {
      await api('/friendship', {
        method: 'POST',
        body: JSON.stringify({ addresseeEmail: friendEmail }), 
      });
      showToast('Convite de amizade enviado com sucesso!', 'success');
      setFriendEmail('');
      fetchFriendshipData();
    } catch (err) {
      // Chama o extrator que vai ler o 404 corretamente
      const msg = extractErrorMessage(err, 'Erro ao enviar convite de amizade.');
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await api(`/friendship/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACCEPTED' })
      });
      
      // Substitua addToast por showToast:
      showToast('Pedido de amizade aceite!'); 
      
      // A função que recarrega os pedidos deve vir logo a seguir
      refetchReqs(); // ou o nome da função que você usa para recarregar a lista
    } catch (err) {
      // Substitua addToast por showToast:
      showToast('Erro ao aceitar pedido.', 'error');
    }
  };

  // 3. Deletar (Serve para recusar, cancelar ou remover amigo)
  const handleDeleteFriendship = async (friendshipId, actionName) => {
    try {
      await api(`/friendship/${friendshipId}`, {
        method: 'DELETE',
      });
      
      let msg = 'Ação realizada com sucesso.';
      if (actionName === 'remove') msg = 'Amigo removido.';
      if (actionName === 'reject') msg = 'Pedido recusado.';
      if (actionName === 'cancel') msg = 'Convite cancelado.';
      
      showToast(msg, 'success');
      fetchFriendshipData();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Erro ao processar a ação.');
      showToast(msg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="page active" style={{ padding: '2.5rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div id="page-friends" className="page active" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: 'var(--text)' }}>Minha Rede de Amigos</h2>

      {/* Secção: Adicionar Amigo */}
      <div className="detail-section" style={{ marginBottom: '2rem' }}>
        <div className="detail-section-title">Adicionar Amigo</div>
        <form onSubmit={handleSendRequest} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="email"
            placeholder="E-mail do usuário..."
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            className="search-input"
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px' }}
            required
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
          </button>
        </form>
      </div>

      {/* Secção: Pedidos Recebidos */}
      {receivedRequests.length > 0 && (
        <div className="detail-section" style={{ marginBottom: '2rem' }}>
          <div className="detail-section-title">Convites Recebidos ({receivedRequests.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {receivedRequests.map((req) => (
              <div 
                key={req.friendshipId} 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {req.avatar ? (
                    <img src={req.avatar} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {req.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: '600' }}>{req.username}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{req.userEmail}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(req.friendshipId)}>
                    Aceitar
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteFriendship(req.friendshipId, 'reject')}>
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secção: Lista de Amigos */}
      <div className="detail-section" style={{ marginBottom: '2rem' }}>
        <div className="detail-section-title">Meus Amigos ({friends.length})</div>
        {friends.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Você ainda não adicionou nenhum amigo.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {friends.map((friend) => (
              <div 
                key={friend.friendshipId} 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {friend.avatar ? (
                    <img src={friend.avatar} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {friend.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: '600' }}>{friend.username}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{friend.userEmail}</div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ color: '#ff4d4f' }} onClick={() => handleDeleteFriendship(friend.friendshipId, 'remove')}>
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Secção: Pedidos Enviados */}
      {sentRequests.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">Convites Enviados ({sentRequests.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sentRequests.map((req) => (
              <div 
                key={req.friendshipId} 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {req.avatar ? (
                    <img src={req.avatar} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', opacity: 0.7 }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', opacity: 0.7 }}>
                      {req.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div style={{ opacity: 0.7 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{req.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{req.userEmail}</div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteFriendship(req.friendshipId, 'cancel')}>
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}