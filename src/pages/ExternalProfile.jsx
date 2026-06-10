import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';

export function ExternalProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // O useLocation permite-nos ler o "state" que passámos no navigate()
  const location = useLocation();
  const { name, email } = location.state || { name: 'Utilizador', email: '—' };
  const initial = name !== 'Utilizador' && name ? name[0].toUpperCase() : '?';

  // Busca as avaliações deste utilizador
  const { data: ratings, loading, error } = useFetch(`/rating/user/${userId}`);

  // O teu back-end bloqueia (403) se tentarmos ver alguém com quem não partilhamos lista
  const isForbidden = error === true; // No nosso useFetch, error fica true se a API falhar

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}?from=external-profile`);
  };

  return (
    <div
      id="page-external-profile"
      className="page active"
      style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto' }}
    >
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <div className="profile-header" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
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
          {name}
        </div>
        <div className="profile-email" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          {email}
        </div>
      </div>

      <div
        style={{
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
        }}
      >
        <div className="detail-section-title" style={{ fontSize: '0.85rem' }}>
          Avaliações do Utilizador
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : isForbidden ? (
        <div className="empty">
          <div className="empty-icon">🔒</div>
          Sem permissão.
          <br />
          <span style={{ fontSize: '0.8rem' }}>
            Apenas podes ver avaliações de utilizadores com quem partilhas uma watchlist.
          </span>
        </div>
      ) : ratings && ratings.length > 0 ? (
        <div>
          {ratings.map((r) => {
            const movieTitle = r.movie?.title || `Filme ID: ${r.tmdbMovieId}`;
            return (
              <div
                key={r.id}
                className="ext-rating-card"
                onClick={() => handleMovieClick(r.tmdbMovieId)}
              >
                <div className="ext-rating-header">
                  <div className="ext-rating-movie">🎬 {movieTitle}</div>
                  <div className="ext-rating-score">
                    ★ {r.score}{' '}
                    <span
                      style={{ fontSize: '0.8rem', fontFamily: '"DM Sans"', color: 'var(--muted)' }}
                    >
                      /10
                    </span>
                  </div>
                </div>
                {r.comment && <div className="ext-rating-comment">"{r.comment}"</div>}
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  Avaliado em {new Date(r.createdAt).toLocaleDateString('pt-PT')}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">⭐</div>
          Este utilizador ainda não avaliou nenhum filme.
        </div>
      )}
    </div>
  );
}
