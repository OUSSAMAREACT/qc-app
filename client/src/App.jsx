import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import OnboardingWizard from './components/OnboardingWizard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
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
                <Layout>
                  <AdminDashboardPage />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
