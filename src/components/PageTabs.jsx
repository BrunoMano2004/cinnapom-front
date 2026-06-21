import { NavLink } from 'react-router-dom';

export function PageTabs() {
  const getTabClass = ({ isActive }) => (isActive ? 'tab-btn active' : 'tab-btn');

  return (
    <div className="tabs">
      <NavLink to="/discover" className={getTabClass}>
        <span className="tab-icon">🧭</span>
        <span className="tab-label">Descobrir</span>
      </NavLink>
      <NavLink to="/watchlist" className={getTabClass}>
        <span className="tab-icon">🎬</span>
        <span className="tab-label">Listas</span>
      </NavLink>
      <NavLink to="/shared" className={getTabClass}>
        <span className="tab-icon">🤝</span>
        <span className="tab-label">Compartilhadas</span>
      </NavLink>
      <NavLink to="/profile" className={getTabClass}>
        <span className="tab-icon">👤</span>
        <span className="tab-label">Perfil</span>
      </NavLink>
    </div>
  );
}