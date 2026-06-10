import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export function useFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useToast();

  // O useCallback memoriza a função para não causar loops infinitos no useEffect
  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(false);
    try {
      const result = await api(endpoint);
      setData(result);
    } catch (err) {
      setError(true);
      showToast('Erro ao comunicar com o servidor.', 'error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Agora exportamos o "refetch" para podermos chamar manualmente quando precisarmos!
  return { data, loading, error, refetch: fetchData };
}
