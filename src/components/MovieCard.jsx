import { useState, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useModal } from '../contexts/ModalContext';

// Componente interno do balão de avaliações
function HoverRatings({ movieId }) {
  const { data: ratings, loading } = useFetch(`/rating/movie/${movieId}/friends`);

  if (loading) {
    return (
      <div className="movie-tooltip">
        <div className="tooltip-arrow"></div>
        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (!ratings || ratings.length === 0) return null;

  return (
    <div className="movie-tooltip">
      <div className="tooltip-arrow"></div>
      <div className="tooltip-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {ratings.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            {r.user?.avatar ? (
              <img 
                src={r.user.avatar} 
                alt={r.user.name || 'Avatar'} 
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
              />
            ) : (
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--accent)', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0
              }}>
                {r.user?.name ? r.user.name[0].toUpperCase() : '?'}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                  {r.user?.name || '—'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)' }}>★ {r.score}</span>
              </div>
              {r.comment && (
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.3 }}>
                  "{r.comment}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MovieCard({ movie, onClick, onRemove, watchListId, showTooltip, showQuickAdd }) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);
  
  const { openAtlModal } = useModal(); 

  const poster = movie.posterPath ? `https://image.tmdb.org/t/p/w342${movie.posterPath}` : null;
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : '—';
  const score = movie.voteAverage ? movie.voteAverage.toFixed(1) : '—';
  const scoreClass = parseFloat(score) >= 7 ? 'good' : 'bad';

  const handleMouseEnter = () => {
    if (!showTooltip) return;
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 400); 
  };

  const handleMouseLeave = () => {
    if (!showTooltip) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation(); 
    openAtlModal(movie.id, movie.title);
  };

  return (
    <div 
      className="movie-card" 
      onClick={() => onClick(movie.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }} 
    >
      {showTooltip && (
        <style>{`
          .movie-tooltip {
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            width: 220px;
            background: rgba(25, 25, 30, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px;
            z-index: 999;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
            pointer-events: none;
            animation: fadeInTooltip 0.2s ease-out forwards;
            text-align: left;
          }
          .movie-tooltip .tooltip-arrow {
            position: absolute;
            top: -5px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 10px;
            height: 10px;
            background: rgba(25, 25, 30, 0.95);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          @keyframes fadeInTooltip {
            from { opacity: 0; transform: translate(-50%, -5px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}</style>
      )}

      {/* --- ESTILOS DO QUICK ADD (Oculto até sofrer Hover) --- */}
      {showQuickAdd && (
        <style>{`
          .quick-add-btn {
            position: absolute;
            bottom: 8px; /* Inferior */
            right: 8px;  /* Direita */
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            transition: all 0.2s ease;
            padding-bottom: 2px;
            opacity: 0;
            pointer-events: none;
            transform: scale(0.8);
          }
          .movie-card:hover .quick-add-btn {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1);
          }
          .quick-add-btn:hover {
            background: var(--accent) !important;
            color: #000 !important;
            transform: scale(1.1) !important;
          }
        `}</style>
      )}

      {isHovered && showTooltip && <HoverRatings movieId={movie.id} />}

      {onRemove && watchListId && (
        <button
          className="btn-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(watchListId, movie.id);
          }}
        >
          ✕ Remover
        </button>
      )}
      
      <div className="poster-wrap">
        {poster ? (
          <img src={poster} alt={movie.title} loading="lazy" />
        ) : (
          <div className="poster-placeholder">🎬</div>
        )}
        <div className="card-overlay">
          <div className="overlay-score">
            {score}
            <span>/10</span>
          </div>
        </div>
        <div className={`score-badge ${scoreClass}`}>★ {score}</div>
        
        {/* Renderiza o botão de Quick Add apenas se showQuickAdd for true */}
        {showQuickAdd && (
          <button
            className="quick-add-btn"
            onClick={handleQuickAdd}
            title="Adicionar à Watchlist"
          >
            +
          </button>
        )}
      </div>
      
      <div className="card-info">
        <div className="card-title" title={movie.title}>
          {movie.title}
        </div>
        <div className="card-year">{year}</div>
      </div>
    </div>
  );
}