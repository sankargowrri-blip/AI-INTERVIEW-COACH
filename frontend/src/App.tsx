import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';
import { Suspense } from 'react';

import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import LoadingState from './components/common/LoadingState';

// Pages — direct imports to avoid lazy loading issues during debugging
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProgressPage from './pages/ProgressPage';
import PracticePage from './pages/PracticePage';
import ResumePage from './pages/ResumePage';
import CompanyPreparationPage from './pages/CompanyPreparationPage';
import InterviewSetupPage from './pages/interview/InterviewSetupPage';
import CameraCheckPage from './pages/interview/CameraCheckPage';
import LiveInterviewPage from './pages/interview/LiveInterviewPage';
import CompletionPage from './pages/interview/CompletionPage';
import ResultPage from './pages/interview/ResultPage';
import HistoryPage from './pages/interview/HistoryPage';
import HistoryDetailPage from './pages/interview/HistoryDetailPage';

function PageLoader() {
  return <LoadingState fullPage message="" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <Routes>
              {/* Public routes */}
              <Route element={<PublicLayout />}>
                <Route
                  path="/"
                  element={
                    <GuestRoute>
                      <LandingPage />
                    </GuestRoute>
                  }
                />
              </Route>

              {/* Auth routes — redirect if logged in */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />

              {/* Protected app routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/resume" element={<ResumePage />} />
                <Route path="/company-preparation" element={<CompanyPreparationPage />} />
                <Route path="/interview/history" element={<HistoryPage />} />
                <Route path="/interview/history/:id" element={<HistoryDetailPage />} />
                <Route path="/interview/setup" element={<InterviewSetupPage />} />
                <Route path="/interview/result" element={<ResultPage />} />
              </Route>

              {/* Full-screen interview routes (no app nav) */}
              <Route
                path="/interview/setup/camera-check"
                element={
                  <ProtectedRoute>
                    <CameraCheckPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview/live"
                element={
                  <ProtectedRoute>
                    <LiveInterviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview/completion"
                element={
                  <ProtectedRoute>
                    <CompletionPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
