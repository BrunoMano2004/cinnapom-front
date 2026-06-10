import { useState, useEffect } from 'react'; // <-- adicione useEffect
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce'; // <-- Importe o novo hook
import { MovieCard } from '../components/MovieCard';
import { PageTabs } from '../components/PageTabs';

export function Discover() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');

  // O debounceValue só será atualizado 600ms após o utilizador parar de digitar
  const debouncedSearch = useDebounce(searchInput, 600);

  // Sempre que a busca "debounced" mudar, voltamos para a página 1 automaticamente
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // O endpoint reage automaticamente ao valor com atraso
  const endpoint = debouncedSearch
    ? `/movie/search/${encodeURIComponent(debouncedSearch)}?page=${page}`
    : `/movie/discover?page=${page}`;

  const { data, loading, error } = useFetch(endpoint);

  const movies = data?.results || [];
  const totalPages = data?.totalPages || 1;

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}?from=discover`);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setPage(1);
  };

  return (
    <div id="page-discover" className="page active" style={{ padding: '2.5rem' }}>
      <PageTabs />

      {/* ... (mantenha o header e os botões de paginação iguais) ... */}

      <div className="search-bar">
        <input
          name="search-movie"
          id="search-movie"
          className="search-input"
          placeholder="Buscar filmes por título..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {/* Adicionamos type="button" para evitar que o botão dispare o form por acidente */}
        {searchInput.length > 0 && (
          <button
            type="button"
            className="search-clear visible"
            onClick={handleClearSearch}
            style={{ display: 'block' }}
          >
            ✕ Limpar
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="empty">
          <div className="empty-icon">⚠️</div>
          Não foi possível carregar os filmes no momento.
        </div>
      ) : (
        <div className="movie-grid">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
            ))
          ) : (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              Nenhum filme encontrado para "<strong>{debouncedSearch}</strong>".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
