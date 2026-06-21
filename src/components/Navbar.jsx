import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se por algum motivo o usuário não estiver carregado, não mostramos os dados
  if (!user) return null;

  const initial = user.name ? user.name[0].toUpperCase() : '?';
  const displayName = user.name || user.email;

  return (
    <nav id="main-nav">
      <Link to="/discover" className="logo" style={{ textDecoration: 'none' }}>
        Cinna<span>pom</span>
      </Link>

      <div className="nav-right" id="nav-right">
        {/* Botão de Amigos estilizado igual ao de Perfil */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/friends')}>
          👥 Amigos
        </button>
        
        {user && (
          <div className="user-pill">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
              alt={`Foto de ${user.name}`} 
              className="user-avatar" 
            />
            <span className="user-name">{user.name}</span>
          </div>
        )}
        
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
          Perfil
        </button>
      </div>
    </nav>
  );
}