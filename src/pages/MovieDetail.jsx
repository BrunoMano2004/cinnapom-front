import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useModal } from '../contexts/ModalContext';

export function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openAtlModal, openRatingModal } = useModal();

  // 1. Agora o `data` contém a estrutura { movie, providers }
  const { data, loading, error } = useFetch(`/movie/details/${id}`);

  if (loading) {
    return (
      <div className="page active" style={{ padding: '0' }}>
        <div className="spinner" style={{ marginTop: '6rem' }}></div>
      </div>
    );
  }

  // 2. Extraímos o filme e os providers com optional chaining
  const movie = data?.movie;
  const providers = data?.providers;

  if (error || !movie) {
    return (
      <div className="page active">
        <div className="empty" style={{ marginTop: '4rem' }}>
          <div className="empty-icon">⚠️</div>
          Erro ao carregar os detalhes do filme.
          <br />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginTop: '1rem' }}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const backdrop = movie.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
    : null;
  const poster = movie.posterPath 
    ? `https://image.tmdb.org/t/p/w342${movie.posterPath}` 
    : null;
  const score = movie.voteAverage ? movie.voteAverage.toFixed(1) : '—';
  const scoreClass = parseFloat(score) >= 7 ? 'good' : 'bad';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '—';
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : '—';

  return (
    <div id="page-movie-detail" className="page active" style={{ padding: '0' }}>
      <div className="movie-detail-backdrop">
        {backdrop ? (
          <img src={backdrop} alt={movie.title} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--surface2)' }}></div>
        )}
        <div className="backdrop-gradient"></div>
        <div className="movie-detail-hero">
          <div className="movie-detail-poster">
            {poster ? (
              <img src={poster} alt={movie.title} />
            ) : (
              <div className="movie-detail-poster-placeholder">🎬</div>
            )}
          </div>
          <div className="movie-detail-info">
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              style={{ marginBottom: '0.75rem' }}
            >
              ← Voltar
            </button>
            <div className="movie-detail-title">{movie.title}</div>
            <div className="movie-detail-meta-row">
              <span>{year}</span>
              <span>{runtime}</span>
              <span className={scoreClass} style={{ fontWeight: 600 }}>
                ★ {score}/10
              </span>
              {movie.voteCount && <span>{movie.voteCount.toLocaleString('pt-BR')} votos</span>}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {(movie.genres || []).map((g) => (
                <span key={g.id} className="meta-tag">
                  {g.name}
                </span>
              ))}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => openAtlModal(movie.id, movie.title)}
              >
                + Adicionar à lista
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openRatingModal(movie.id, movie.title)}
              >
                ★ Avaliar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="movie-detail-body">
        {movie.tagline && (
          <p
            style={{
              fontStyle: 'italic',
              color: 'var(--muted)',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
            }}
          >
            "{movie.tagline}"
          </p>
        )}

        {movie.overview && (
          <div className="detail-section">
            <div className="detail-section-title">Sinopse</div>
            <p className="detail-overview">{movie.overview}</p>
          </div>
        )}

        {/* 3. Nova Seção: Onde Assistir (Providers) */}
        {providers && (providers.flatrate || providers.rent || providers.buy || providers.ads) && (
          <div className="detail-section">
            <div className="detail-section-title">Onde Assistir</div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              
              {/* Streaming (Flatrate) */}
              {providers.flatrate?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Stream</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {providers.flatrate.map((p) => (
                      <img
                        key={p.providerId}
                        src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
                        alt={p.providerName}
                        title={p.providerName}
                        style={{ width: '45px', height: '45px', borderRadius: '12px' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Aluguel (Rent) */}
              {providers.rent?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Alugar</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {providers.rent.map((p) => (
                      <img
                        key={p.providerId}
                        src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
                        alt={p.providerName}
                        title={p.providerName}
                        style={{ width: '45px', height: '45px', borderRadius: '12px' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Compra (Buy) */}
              {providers.buy?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Comprar</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {providers.buy.map((p) => (
                      <img
                        key={p.providerId}
                        src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
                        alt={p.providerName}
                        title={p.providerName}
                        style={{ width: '45px', height: '45px', borderRadius: '12px' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Link oficial do JustWatch fornecido pelo TMDB */}
            {providers.link && (
              <div style={{ marginTop: '1rem' }}>
                <a 
                  href={providers.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}
                >
                  Ver mais detalhes no TMDB / JustWatch ↗
                </a>
              </div>
            )}
          </div>
        )}

        <div className="detail-section">
          <div className="detail-section-title">Detalhes</div>
          <div className="detail-stats">
            <div className="stat-card">
              <div className="stat-label">Nota</div>
              <div className="stat-value accent">{score}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ano</div>
              <div className="stat-value">{year}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Duração</div>
              <div className="stat-value">{runtime}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Idioma original</div>
              <div className="stat-value">{(movie.originalLanguage || '—').toUpperCase()}</div>
            </div>
            {movie.budget > 0 && (
              <div className="stat-card">
                <div className="stat-label">Orçamento</div>
                <div className="stat-value">${(movie.budget / 1e6).toFixed(0)}M</div>
              </div>
            )}
            {movie.revenue > 0 && (
              <div className="stat-card">
                <div className="stat-label">Bilheteria</div>
                <div className="stat-value">${(movie.revenue / 1e6).toFixed(0)}M</div>
              </div>
            )}
            <div className="stat-card">
              <div className="stat-label">Status</div>
              <div className="stat-value">{movie.status || '—'}</div>
            </div>
          </div>
        </div>

        {movie.productionCompanies?.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Produtoras</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {movie.productionCompanies.map((c) => c.name).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}