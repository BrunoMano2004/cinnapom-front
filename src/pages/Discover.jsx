import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { MovieCard } from '../components/MovieCard';
import { PageTabs } from '../components/PageTabs';

export function Discover() {
  const navigate = useNavigate();
  
  // Referências para fechar os dropdowns ao clicar fora
  const genreRef = useRef(null);
  const releaseRef = useRef(null);
  const sortRef = useRef(null);
  const lengthRef = useRef(null); // Nova ref para o dropdown de duração
  const isFirstRender = useRef(true);

  // Estados dos filtros carregados do sessionStorage
  const [searchInput, setSearchInput] = useState(() => sessionStorage.getItem('discover_search') || '');
  const [selectedGenre, setSelectedGenre] = useState(() => sessionStorage.getItem('discover_genre') || '');
  const [selectedRelease, setSelectedRelease] = useState(() => sessionStorage.getItem('discover_release') || '');
  const [selectedSort, setSelectedSort] = useState(() => sessionStorage.getItem('discover_sort') || 'popularity.desc');
  const [selectedLength, setSelectedLength] = useState(() => sessionStorage.getItem('discover_length') || ''); // Novo estado
  const [includeAdult, setIncludeAdult] = useState(() => sessionStorage.getItem('discover_adult') === 'true');
  const [page, setPage] = useState(() => parseInt(sessionStorage.getItem('discover_page'), 10) || 1);
  
  // Estados de abertura dos menus dropdowns
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLengthOpen, setIsLengthOpen] = useState(false); // Novo estado de abertura

  const debouncedSearch = useDebounce(searchInput, 600);

  // Sincroniza e guarda os filtros na sessão do navegador
  useEffect(() => {
    sessionStorage.setItem('discover_search', searchInput);
    sessionStorage.setItem('discover_genre', selectedGenre);
    sessionStorage.setItem('discover_release', selectedRelease);
    sessionStorage.setItem('discover_sort', selectedSort);
    sessionStorage.setItem('discover_length', selectedLength);
    sessionStorage.setItem('discover_adult', includeAdult);
    sessionStorage.setItem('discover_page', page);
  }, [searchInput, selectedGenre, selectedRelease, selectedSort, selectedLength, includeAdult, page]);

  // Fecha os dropdowns ao clicar fora deles
  useEffect(() => {
    function handleClickOutside(event) {
      if (genreRef.current && !genreRef.current.contains(event.target)) setIsGenreOpen(false);
      if (releaseRef.current && !releaseRef.current.contains(event.target)) setIsReleaseOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target)) setIsSortOpen(false);
      if (lengthRef.current && !lengthRef.current.contains(event.target)) setIsLengthOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reseta para a página 1 apenas quando um filtro for alterado
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, selectedGenre, selectedRelease, selectedSort, selectedLength, includeAdult]);

  // Busca de géneros no backend
  const { data: genresData } = useFetch('/movie/genres');
  const genresList = genresData?.genres || (Array.isArray(genresData) ? genresData : []);

  // Labels amigáveis para os botões dos dropdowns
  const currentGenreLabel = genresList.find(g => String(g.id) === String(selectedGenre))?.name || 'Todos os Gêneros';

  const currentReleaseLabel = 
    selectedRelease === 'upcoming' ? 'Próximos Lançamentos' : 
    selectedRelease === 'released' ? 'Já Lançados' : 'Todos os Status';

  const currentLengthLabel = 
    selectedLength === 'short' ? 'Curta-metragem' :
    selectedLength === 'feature' ? 'Longa-metragem' : 'Qualquer Duração';

  const sortOptions = [
    { value: 'popularity.desc', label: 'Mais Populares' },
    { value: 'popularity.asc', label: 'Menos Populares' },
    { value: 'vote_average.desc', label: 'Melhor Avaliados' },
    { value: 'vote_average.asc', label: 'Pior Avaliados' },
    { value: 'primary_release_date.desc', label: 'Mais Recentes' },
    { value: 'primary_release_date.asc', label: 'Mais Antigos' },
    { value: 'revenue.desc', label: 'Maior Bilheteria' },
    { value: 'title.asc', label: 'Título (A-Z)' },
    { value: 'title.desc', label: 'Título (Z-A)' },
  ];
  
  const currentSortLabel = sortOptions.find(s => s.value === selectedSort)?.label || 'Mais Populares';

  // Construção dinâmica do endpoint da API
  let endpoint = '';
  if (debouncedSearch) {
    endpoint = `/movie/search/${encodeURIComponent(debouncedSearch)}?page=${page}`;
  } else {
    const genreParam = selectedGenre ? `&genreId=${selectedGenre}` : '';
    const adultParam = `&includeAdult=${includeAdult}`;
    const releaseParam = selectedRelease ? `&release=${selectedRelease}` : '';
    const sortParam = selectedSort ? `&sortBy=${selectedSort}` : '';
    const lengthParam = selectedLength ? `&length=${selectedLength}` : '';
    
    endpoint = `/movie/discover?page=${page}${genreParam}${adultParam}${releaseParam}${sortParam}${lengthParam}`;
  }

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
      <style>{`
        .custom-select-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-select-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-select-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 4px; }
        .custom-select-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--primary); }
      `}</style>

      <PageTabs />

      <div className="filters-container" style={{ marginBottom: '2.5rem' }}>
        <div className="search-bar" style={{ marginBottom: '1.25rem' }}>
          <input
            name="search-movie"
            id="search-movie"
            className="search-input"
            placeholder="Buscar filmes por título..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
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

        {!debouncedSearch && (
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Dropdown 1: Gêneros */}
            <div ref={genreRef} style={{ position: 'relative', width: '210px' }}>
              <button
                type="button"
                onClick={() => { setIsGenreOpen(!isGenreOpen); setIsReleaseOpen(false); setIsSortOpen(false); setIsLengthOpen(false); }}
                style={{
                  width: '100%', padding: '0.75rem 1.25rem', borderRadius: '10px',
                  border: isGenreOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text)', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem', transition: 'border-color 0.2s'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentGenreLabel}
                </span>
                <span style={{ transform: isGenreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>▼</span>
              </button>

              {isGenreOpen && (
                <div 
                  className="custom-select-scrollbar"
                  style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%',
                    background: '#1a1a1f', border: '1px solid var(--border)', borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)', zIndex: 110, maxHeight: '250px', overflowY: 'auto', padding: '0.4rem'
                  }}
                >
                  <div
                    onClick={() => { setSelectedGenre(''); setIsGenreOpen(false); }}
                    style={{
                      padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer',
                      color: selectedGenre === '' ? 'var(--primary)' : 'var(--text)',
                      background: selectedGenre === '' ? 'rgba(255,255,255,0.04)' : 'transparent', fontSize: '0.85rem'
                    }}
                  >
                    Todos os Gêneros
                  </div>
                  {genresList.map((g) => {
                    const isSelected = String(g.id) === String(selectedGenre);
                    return (
                      <div
                        key={g.id}
                        onClick={() => { setSelectedGenre(g.id); setIsGenreOpen(false); }}
                        style={{
                          padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer',
                          color: isSelected ? 'var(--primary)' : 'var(--text)',
                          background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                          fontSize: '0.85rem', fontWeight: isSelected ? '600' : '400'
                        }}
                      >
                        {g.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dropdown 2: Status de Lançamento */}
            <div ref={releaseRef} style={{ position: 'relative', width: '210px' }}>
              <button
                type="button"
                onClick={() => { setIsReleaseOpen(!isReleaseOpen); setIsGenreOpen(false); setIsSortOpen(false); setIsLengthOpen(false); }}
                style={{
                  width: '100%', padding: '0.75rem 1.25rem', borderRadius: '10px',
                  border: isReleaseOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text)', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem', transition: 'border-color 0.2s'
                }}
              >
                <span>{currentReleaseLabel}</span>
                <span style={{ transform: isReleaseOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.75rem', color: 'var(--muted)' }}>▼</span>
              </button>

              {isReleaseOpen && (
                <div 
                  style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%',
                    background: '#1a1a1f', border: '1px solid var(--border)', borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)', zIndex: 110, padding: '0.4rem'
                  }}
                >
                  {[
                    { value: '', label: 'Todos os Status' },
                    { value: 'released', label: 'Já Lançados' },
                    { value: 'upcoming', label: 'Próximos Lançamentos' }
                  ].map((item) => {
                    const isSelected = selectedRelease === item.value;
                    return (
                      <div
                        key={item.value}
                        onClick={() => { setSelectedRelease(item.value); setIsReleaseOpen(false); }}
                        style={{
                          padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer',
                          color: isSelected ? 'var(--primary)' : 'var(--text)',
                          background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                          fontSize: '0.85rem', fontWeight: isSelected ? '600' : '400'
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dropdown 3: Duração (Length) */}
            <div ref={lengthRef} style={{ position: 'relative', width: '210px' }}>
              <button
                type="button"
                onClick={() => { setIsLengthOpen(!isLengthOpen); setIsGenreOpen(false); setIsReleaseOpen(false); setIsSortOpen(false); }}
                style={{
                  width: '100%', padding: '0.75rem 1.25rem', borderRadius: '10px',
                  border: isLengthOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text)', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem', transition: 'border-color 0.2s'
                }}
              >
                <span>{currentLengthLabel}</span>
                <span style={{ transform: isLengthOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.75rem', color: 'var(--muted)' }}>▼</span>
              </button>

              {isLengthOpen && (
                <div 
                  style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%',
                    background: '#1a1a1f', border: '1px solid var(--border)', borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)', zIndex: 110, padding: '0.4rem'
                  }}
                >
                  {[
                    { value: '', label: 'Qualquer Duração' },
                    { value: 'short', label: 'Curta-metragem' },
                    { value: 'feature', label: 'Longa-metragem' }
                  ].map((item) => {
                    const isSelected = selectedLength === item.value;
                    return (
                      <div
                        key={item.value}
                        onClick={() => { setSelectedLength(item.value); setIsLengthOpen(false); }}
                        style={{
                          padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer',
                          color: isSelected ? 'var(--primary)' : 'var(--text)',
                          background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                          fontSize: '0.85rem', fontWeight: isSelected ? '600' : '400'
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dropdown 4: Ordenação (Sort By) */}
            <div ref={sortRef} style={{ position: 'relative', width: '210px' }}>
              <button
                type="button"
                onClick={() => { setIsSortOpen(!isSortOpen); setIsGenreOpen(false); setIsReleaseOpen(false); setIsLengthOpen(false); }}
                style={{
                  width: '100%', padding: '0.75rem 1.25rem', borderRadius: '10px',
                  border: isSortOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text)', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem', transition: 'border-color 0.2s'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentSortLabel}
                </span>
                <span style={{ transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>▼</span>
              </button>

              {isSortOpen && (
                <div 
                  className="custom-select-scrollbar"
                  style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%',
                    background: '#1a1a1f', border: '1px solid var(--border)', borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)', zIndex: 110, maxHeight: '250px', overflowY: 'auto', padding: '0.4rem'
                  }}
                >
                  {sortOptions.map((item) => {
                    const isSelected = selectedSort === item.value;
                    return (
                      <div
                        key={item.value}
                        onClick={() => { setSelectedSort(item.value); setIsSortOpen(false); }}
                        style={{
                          padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer',
                          color: isSelected ? 'var(--primary)' : 'var(--text)',
                          background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                          fontSize: '0.85rem', fontWeight: isSelected ? '600' : '400'
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Checkbox / Toggle Switch */}
            <div 
              onClick={() => setIncludeAdult(!includeAdult)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', 
                cursor: 'pointer', userSelect: 'none', marginLeft: '0.5rem'
              }}
            >
              <div style={{
                width: '44px', height: '24px', borderRadius: '12px', border: '1px solid var(--border)',
                background: includeAdult ? 'var(--primary)' : '#2a2a32', position: 'relative', transition: 'background-color 0.2s'
              }}>
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%', background: '#ffffff',
                  position: 'absolute', top: '3px', left: includeAdult ? '23px' : '3px',
                  transition: 'left 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text)' }}>
                Adulto
              </span>
            </div>

          </div>
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
        <>
          <div className="movie-grid">
            {movies.length > 0 ? (
              movies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onClick={handleMovieClick} 
                  showQuickAdd={true} /* <-- BOTÃO QUICK ADD ATIVADO AQUI! */
                />
              ))
            ) : (
              <div className="empty">
                <div className="empty-icon">🔍</div>
                Nenhum filme encontrado.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
              <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>← Anterior</button>
              <span style={{ fontWeight: '500' }}>Página {page} de {totalPages}</span>
              <button className="btn btn-primary" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>Próxima →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}