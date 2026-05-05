import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import BookingPage from './pages/BookingPage';
import RestaurantPage from './pages/RestaurantPage';
import ServicesPage from './pages/ServicesPage';
import LocationPage from './pages/LocationPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Wrapper that fades the main content in on every route change
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [location.pathname]);

  return (
    <main ref={mainRef} className="flex-grow">
      {children}
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/rooms" element={<RoomsPage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/dining" element={<RestaurantPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/location" element={<LocationPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/account" element={<DashboardPage />} />
                  </Routes>
                </PageTransition>
                <Footer />
                <ChatBot />
              </div>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
