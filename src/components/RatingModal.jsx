import { useState, useEffect } from 'react';
import { useModal } from '../contexts/ModalContext';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export function RatingModal() {
  const { ratingModal, closeRatingModal } = useModal();
  const { showToast } = useToast();

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpa os campos quando o modal abre/fecha
  useEffect(() => {
    if (ratingModal.isOpen) {
      setScore(0);
      setComment('');
    }
  }, [ratingModal.isOpen]);

  if (!ratingModal.isOpen) return null;

  const handleSubmit = async () => {
    if (!score) return showToast('Selecione uma pontuação.', 'error');
    if (!comment.trim()) return showToast('Escreva um comentário.', 'error');

    setIsSubmitting(true);
    try {
      // Endpoint exato do teu vanilla HTML
      await api('/rating/create', {
        method: 'POST',
        body: JSON.stringify({
          tmdbMovieId: ratingModal.movieId,
          score,
          comment,
        }),
      });
      showToast('Avaliação salva!');
      closeRatingModal();
    } catch (e) {
      showToast('Erro ao salvar avaliação.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) closeRatingModal();
      }}
    >
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-title">Avaliar Filme</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
          "{ratingModal.movieTitle}"
        </p>

        <div id="rating-form-block">
          <div
            className="rating-stars"
            style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
              <span
                key={val}
                className={`star-btn ${val <= score ? 'active' : ''}`}
                onClick={() => setScore(val)}
                style={{
                  cursor: 'pointer',
                  fontSize: '1.6rem',
                  color: val <= score ? 'var(--accent)' : 'var(--surface2)',
                }}
              >
                ★
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <span className="rating-score-label">{score || '—'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>/10</span>
          </div>

          <textarea
            className="rating-comment"
            placeholder="Escreva um comentário (obrigatório)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          <div className="rating-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A guardar...' : 'Salvar avaliação'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={closeRatingModal}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
