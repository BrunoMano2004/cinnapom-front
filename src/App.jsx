import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ModalProvider } from './contexts/ModalContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Discover } from './pages/Discover';
import { Watchlist } from './pages/Watchlist';
import { WatchlistDetail } from './pages/WatchlistDetail';
import { Profile } from './pages/Profile';
import { Shared } from './pages/Shared';
import { ExternalProfile } from './pages/ExternalProfile';
import { AddToListModal } from './components/AddToListModal';
import { RatingModal } from './components/RatingModal';
import { RenameModal } from './components/RenameModal';
import { MembersModal } from './components/MembersModal';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Criamos o componente AppRoutes que usa os hooks do Router
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner"></div>;

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/discover"
          element={
            <PrivateRoute>
              <Discover />
            </PrivateRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <PrivateRoute>
              <Watchlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/watchlist/:id"
          element={
            <PrivateRoute>
              <WatchlistDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/shared"
          element={
            <PrivateRoute>
              <Shared />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <PrivateRoute>
              <ExternalProfile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? '/discover' : '/login'} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {' '}
      {/* O Router envolve tudo agora! */}
      <ToastProvider>
        <AuthProvider>
          <ModalProvider>
            <AppRoutes />

            {/* Agora os modais estão dentro do BrowserRouter */}
            <AddToListModal />
            <RatingModal />
            <RenameModal />
            <MembersModal />
          </ModalProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
