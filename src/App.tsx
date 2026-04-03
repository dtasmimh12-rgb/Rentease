import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Auth from './components/Auth';
import LandlordDashboard from './components/LandlordDashboard';
import TenantFeed from './components/TenantFeed';
import PropertyDetails from './components/PropertyDetails';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import Favorites from './components/Favorites';

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!profile) {
    return <Auth />; // This will handle role selection if user exists but profile doesn't
  }

  return (
    <Layout>
      <Routes>
        {profile.role === 'landlord' ? (
          <>
            <Route path="/" element={<LandlordDashboard />} />
            <Route path="/dashboard" element={<LandlordDashboard />} />
          </>
        ) : (
          <>
            <Route path="/" element={<TenantFeed />} />
            <Route path="/feed" element={<TenantFeed />} />
            <Route path="/favorites" element={<Favorites />} />
          </>
        )}
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
