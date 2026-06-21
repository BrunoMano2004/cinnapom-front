import { useModal } from '../contexts/ModalContext';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export function AddToListModal() {
  const { atlModal, closeAtlModal } = useModal();
  const { showToast } = useToast();
  
  // 1. Busca as listas que o usuário é dono
  const { data: myLists, loading: loadingMine } = useFetch(
    atlModal.isOpen ? '/watch-list/listAll' : null
  );

  // 2. Busca as listas onde o usuário é apenas membro (Compartilhadas com ele)
  const { data: sharedRaw, loading: loadingShared } = useFetch(
    atlModal.isOpen ? '/watch-list-member/shared-with-me' : null
  );

  if (!atlModal.isOpen) return null;

  const isLoading = loadingMine || loadingShared;

  // Extrai os objetos "watchList" de dentro do retorno do endpoint shared-with-me
  const sharedLists = (sharedRaw || []).map(member => member.watchList).filter(Boolean);

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

  // Subcomponente/Função para renderizar o item da lista de forma reutilizável
  const renderListItem = (wl, isShared = false) => (
    <div 
      key={wl.id} 
      className="atl-item" 
      onClick={() => handleAddToList(wl.id, wl.name)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '1rem', 
        padding: '0.75rem', cursor: 'pointer', 
        borderBottom: '1px solid var(--border)', transition: 'background 0.2s' 
      }}
    >
      {/* Capa da Watchlist Minimizada */}
      <div style={{ 
        width: '42px', height: '60px', borderRadius: '6px', overflow: 'hidden', 
        background: 'var(--surface2)', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' 
      }}>
        {wl.imageCoverUrl ? (
          <img src={wl.imageCoverUrl} alt={wl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '1.2rem' }}>🎬</span>
        )}
      </div>
      
      {/* Informações */}
      <div style={{ flex: 1 }}>
        <div className="atl-item-name" style={{ fontWeight: '500', fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {wl.name} 
          {isShared && (
            <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Membro
            </span>
          )}
        </div>
        <div className="atl-item-meta" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>
          {new Date(wl.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
      
      <span style={{ color: 'var(--accent)', fontSize: '1.3rem', fontWeight: 'bold' }}>+</span>
    </div>
  );

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) closeAtlModal();
      }}
    >
      <div className="modal" style={{ maxWidth: '420px', padding: '1.5rem' }}>
        <div className="modal-title">Adicionar à Watchlist</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          Selecione uma lista para "<strong>{atlModal.movieTitle}</strong>":
        </p>

        <div className="atl-list" style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '0.5rem' }}>
          {isLoading ? (
            <div className="spinner" style={{ margin: '2rem auto', width: '24px', height: '24px', borderWidth: '2px' }}></div>
          ) : (
            <>
              {myLists?.length === 0 && sharedLists?.length === 0 && (
                <div className="atl-empty" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Você não tem nenhuma lista nem é membro de nenhuma.
                </div>
              )}

              {/* Seção: Minhas Listas */}
              {myLists?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Minhas Listas
                  </div>
                  {myLists.map(wl => renderListItem(wl, false))}
                </div>
              )}

              {/* Seção: Listas Compartilhadas */}
              {sharedLists?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Compartilhadas Comigo
                  </div>
                  {sharedLists.map(wl => renderListItem(wl, true))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={closeAtlModal}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}