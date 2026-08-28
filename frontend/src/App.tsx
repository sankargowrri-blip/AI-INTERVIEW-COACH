import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';
import { lazy, Suspense } from 'react';

import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import LoadingState from './components/common/LoadingState';

// Pages — lazy loaded
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const CompanyPreparationPage = lazy(() => import('./pages/CompanyPreparationPage'));
const InterviewSetupPage = lazy(() => import('./pages/interview/InterviewSetupPage'));
const CameraCheckPage = lazy(() => import('./pages/interview/CameraCheckPage'));
const LiveInterviewPage = lazy(() => import('./pages/interview/LiveInterviewPage'));
const CompletionPage = lazy(() => import('./pages/interview/CompletionPage'));
const ResultPage = lazy(() => import('./pages/interview/ResultPage'));
const HistoryPage = lazy(() => import('./pages/interview/HistoryPage'));
const HistoryDetailPage = lazy(() => import('./pages/interview/HistoryDetailPage'));

function PageLoader() {
  return <LoadingState fullPage message="" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
