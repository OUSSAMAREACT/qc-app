import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import WeeklyExamPage from './pages/WeeklyExamPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ModuleCatalogPage from './pages/ModuleCatalogPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PaymentPage from './pages/PaymentPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import PublicRoute from './components/PublicRoute';

import ProtectedRoute from './components/ProtectedRoute';
import OnboardingWizard from './components/OnboardingWizard';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';

// Wrapper for routes that require active status
const RequireActive = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a spinner

  // If user is pending and NOT admin, redirect to payment
  // REMOVED: Freemium model allows ACTIVE status by default
  // if (user && user.status === 'PENDING' && user.role !== 'ADMIN') {
  //   return <Navigate to="/payment" />;
  // }

  return children;
};

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <ThemeProvider>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />

              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />

              {/* Payment Page - Accessible by PENDING users */}
              <Route path="/payment" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />

              <Route path="/profile-setup" element={
                <ProtectedRoute>
                  <ProfileSetupPage />
                </ProtectedRoute>
              } />

              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <RequireActive>
                    <OnboardingWizard />
                  </RequireActive>
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RequireActive>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </RequireActive>
                </ProtectedRoute>
              } />

              <Route path="/modules/:type" element={
                <ProtectedRoute>
                  <RequireActive>
                    <Layout>
                      <ModuleCatalogPage />
                    </Layout>
                  </RequireActive>
                </ProtectedRoute>
              } />

              <Route path="/history" element={
                <ProtectedRoute>
                  <RequireActive>
                    <Layout>
                      <HistoryPage />
                    </Layout>
                  </RequireActive>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/quiz" element={
                <ProtectedRoute>
                  <RequireActive>
                    <Layout>
                      <QuizPage />
                    </Layout>
                  </RequireActive>
                </ProtectedRoute>
              } />

              <Route path="/result" element={
                <ProtectedRoute>
                  <RequireActive>
                    <Layout>
                      <ResultPage />
                    </Layout>
                  </RequireActive>
                </ProtectedRoute>
              } />

              <Route path="/weekly-exam/:id" element={
                <ProtectedRoute>
                  <RequireActive>
                    <Layout>
                      <WeeklyExamPage />
                    </Layout>
                  </RequireActive>
                </ProtectedRoute>
              } />

              <Route path="/weekly-exam/:id/leaderboard" element={
                <ProtectedRoute>
                  <RequireActive>
                    <Layout>
                      <LeaderboardPage />
                    </Layout>
                  </RequireActive>
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
