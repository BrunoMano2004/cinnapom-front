import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { MovieCard } from '../components/MovieCard';
import { useModal } from '../contexts/ModalContext';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export function WatchlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openMembersModal } = useModal();

  const { showToast } = useToast();

  const { data: watchlist, loading, error, refetch } = useFetch(`/watch-list/getById/${id}`);

  if (loading) {
    return (
      <div className="page active" style={{ padding: '2.5rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !watchlist) {
    return (
      <div className="page active" style={{ padding: '2.5rem' }}>
        <button className="back-btn" onClick={() => navigate('/watchlist')}>
          ← Voltar para listas
        </button>
        <div className="empty">
          <div className="empty-icon">⚠️</div>
          Erro ao carregar a watchlist.
        </div>
      </div>
    );
  }

  const movies = (watchlist.movies || []).map((movie) => {
    const relation = (watchlist.watchListMovies || []).find((w) => w.tmdbMovieId === movie.id);
    return { ...movie, watchListMovieId: relation ? relation.id : null };
  });

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}?from=watchlist-detail&listId=${id}`);
  };

  const handleRemoveMovie = async (watchListMovieId, movieId) => {
    if (!window.confirm('Deseja realmente remover este filme da lista?')) return;

    try {
      await api(`/watch-list-movie/watchListMovieId/${watchListMovieId}/movieId/${movieId}`, { 
        method: 'DELETE' 
      });
      showToast("Filme removido da lista.");
      refetch();
    } catch (e) {
      showToast("Erro ao remover o filme.", "error");
      console.error(e);
    }
  };

  return (
    <div id="page-watchlist-detail" className="page active" style={{ padding: '2.5rem' }}>
      <button className="back-btn" onClick={() => navigate('/watchlist')}>
        ← Voltar para listas
      </button>

      <div className="wl-detail-header">
        <div className="wl-detail-cover" id="detail-cover">
          {watchlist.imageCoverUrl ? (
            <img src={watchlist.imageCoverUrl} alt={watchlist.name} />
          ) : (
            '🎬'
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div className="wl-detail-title">{watchlist.name}</div>
          <div className="wl-detail-meta">
            Criada em {new Date(watchlist.createdAt).toLocaleDateString('pt-PT')} · {movies.length}{' '}
            filme(s)
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => openMembersModal(id, watchlist.name, true)}
            >
              👥 Gerir membros
            </button>
          </div>
        </div>
      </div>

      <div id="detail-movies-container">
        {movies.length > 0 ? (
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                fromPage="watchlist-detail"
                watchListId={id}
                onClick={handleMovieClick}
                onRemove={handleRemoveMovie}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">🎬</div>
            Nenhum filme nesta lista ainda.
          </div>
        )}
      </div>
    </div>
  );
}
