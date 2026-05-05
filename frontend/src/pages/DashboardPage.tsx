import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClientDashboard from '../components/dashboards/ClientDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ReceptionistDashboard from '../components/dashboards/ReceptionistDashboard';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("DEBUG - Current User:", user);
    console.log("DEBUG - Current Profile:", profile);
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-gold font-display text-xl animate-pulse tracking-widest uppercase">
          Accessing Velora Vault...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-bg">
      <div className="max-w-7xl mx-auto px-6">
        {/* Debug Banner - Remove this once production ready */}
        <div className="mb-4 p-2 bg-black/40 border border-gold/30 text-[10px] text-gold uppercase tracking-[0.2em]">
          Profile Status: {profile ? `Found (${profile.role})` : 'Not Found (Defaulting to Client)'}
        </div>

        {profile?.role === 'admin' ? (
          <AdminDashboard />
        ) : profile?.role === 'personnel' ? (
          <ReceptionistDashboard />
        ) : (
          <ClientDashboard />
        )}
      </div>
    </div>
  );
}
