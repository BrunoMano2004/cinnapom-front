import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Define um timer para atualizar o valor apenas após o "delay"
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Se o "value" mudar antes do tempo acabar (o utilizador continuou a digitar),
    // cancela o timer anterior e recomeça a contagem.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
