export function MovieCard({ movie, onClick, onRemove, watchListId }) {
  const poster = movie.posterPath ? `https://image.tmdb.org/t/p/w342${movie.posterPath}` : null;
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : '—';
  const score = movie.voteAverage ? movie.voteAverage.toFixed(1) : '—';
  const scoreClass = parseFloat(score) >= 7 ? 'good' : 'bad';

  return (
    <div className="movie-card" onClick={() => onClick(movie.id)}>
      
      {/* 2. Troque 'movie.watchListMovieId' pelo seu novo 'watchListId' */}
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