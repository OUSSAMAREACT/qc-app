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
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import OnboardingWizard from './components/OnboardingWizard';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingWizard />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/modules/:type" element={
                <ProtectedRoute>
                  <Layout>
                    <ModuleCatalogPage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/history" element={
                <ProtectedRoute>
                  <Layout>
                    <HistoryPage />
                  </Layout>
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
                  <Layout>
                    <QuizPage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/result" element={
                <ProtectedRoute>
                  <Layout>
                    <ResultPage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/weekly-exam/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <WeeklyExamPage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/weekly-exam/:id/leaderboard" element={
                <ProtectedRoute>
                  <Layout>
                    <LeaderboardPage />
                  </Layout>
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
