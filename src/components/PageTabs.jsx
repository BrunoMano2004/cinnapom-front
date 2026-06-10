import { NavLink } from 'react-router-dom';

export function PageTabs() {
  // O NavLink injeta automaticamente a variável "isActive"
  // caso a URL atual do navegador corresponda ao "to" do link.
  const getTabClass = ({ isActive }) => (isActive ? 'tab-btn active' : 'tab-btn');

  return (
    <div className="tabs">
      <NavLink to="/discover" className={getTabClass}>
        Descobrir
      </NavLink>
      <NavLink to="/watchlist" className={getTabClass}>
        Minhas Listas
      </NavLink>
      <NavLink to="/shared" className={getTabClass}>
        Compartilhadas
      </NavLink>
      <NavLink to="/profile" className={getTabClass}>
        Meu Perfil
      </NavLink>
    </div>
  );
}
