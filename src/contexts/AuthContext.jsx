import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se voltamos do login do Google com um token na URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      localStorage.setItem('cinnapom_token', urlToken);
      // Limpa a URL para não deixar o token exposto
      window.history.replaceState({}, '', window.location.pathname);
    }

    const token = localStorage.getItem('cinnapom_token');

    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api('/user/me');
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar utilizador:', error);
      localStorage.removeItem('cinnapom_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cinnapom_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
