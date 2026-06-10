import { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // useCallback garante que essa função não seja recriada a cada renderização
  const showToast = useCallback((message, type = '') => {
    setToast({ message, type, visible: true });

    // Esconde o toast automaticamente após 3 segundos
    setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* O HTML do Toast fica na raiz da aplicação, sobrepondo tudo */}
      <div className={`toast ${toast.type} ${toast.visible ? 'show' : ''}`}>{toast.message}</div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
