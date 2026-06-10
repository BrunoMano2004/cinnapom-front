export function MovieCard({ movie, onClick }) {
  // Tratamento de dados igual ao seu Vanilla JS
  const poster = movie.posterPath ? `https://image.tmdb.org/t/p/w342${movie.posterPath}` : null;
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : '—';
  const score = movie.voteAverage ? movie.voteAverage.toFixed(1) : '—';
  const scoreClass = parseFloat(score) >= 7 ? 'good' : 'bad';

  return (
    <div className="movie-card" onClick={() => onClick(movie.id)}>
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
