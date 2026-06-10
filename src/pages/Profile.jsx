import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PageTabs } from '../components/PageTabs';

export function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  if (!user) return null;

  const initial = user.name ? user.name[0].toUpperCase() : '?';
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : '—';

  const handleLogout = () => {
    logout();
    showToast('Saíste da conta com sucesso.');
    // O redirecionamento para /login acontece automaticamente
    // graças ao nosso AppRoutes e PrivateRoute no App.jsx!
  };

  return (
    // 1. Removemos o maxWidth e o margin daqui. Deixamos apenas o padding.
    <div id="page-profile" className="page active" style={{ padding: '2.5rem' }}>
      {/* As abas agora vão ocupar a largura normal, alinhadas à esquerda */}
      <PageTabs />
      {/* 2. Criamos uma div "wrapper" para limitar apenas a largura do perfil */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="profile-header" style={{ marginBottom: '2rem' }}>
          <div
            className="profile-avatar"
            style={{ width: '72px', height: '72px', fontSize: '2rem', marginBottom: '1rem' }}
          >
            {initial}
          </div>
          <div
            className="profile-name"
            style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem' }}
          >
            {user.name || '—'}
          </div>
          <div className="profile-email" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            {user.email || '—'}
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-row">
            <span className="profile-key">ID</span>
            <span className="profile-val">{user.id ? user.id.slice(0, 12) + '...' : '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-key">Nickname</span>
            <span className="profile-val">{user.name || 'não definido'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-key">Membro desde</span>
            <span className="profile-val">{memberSince}</span>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sair da conta
          </button>
        </div>
      </div>{' '}
      {/* Fim do wrapper do perfil */}
    </div>
  );
}
