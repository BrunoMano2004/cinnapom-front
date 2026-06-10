import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se por algum motivo o utilizador não estiver carregado, não mostramos os dados
  if (!user) return null;

  const initial = user.name ? user.name[0].toUpperCase() : '?';
  const displayName = user.name || user.email;

  return (
    <nav id="main-nav">
      <Link to="/discover" className="logo" style={{ textDecoration: 'none' }}>
        Cinna<span>pom</span>
      </Link>

      <div className="nav-right" id="nav-right">
        <div className="user-pill">
          <div className="avatar">{initial}</div>
          <span className="user-name">{displayName}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
          Perfil
        </button>
      </div>
    </nav>
  );
}
