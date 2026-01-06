import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import ErrorBoundary from "./components/UI/ErrorBoundary";
import GlobalThemeToggle from "./components/UI/GlobalThemeToggle";

import Footer from "./components/Layout/Footer";

import PushNotificationButton from "./components/Common/PushNotificationButton";

import "./App.css";
import "./styles/globals.css";
import EmailVerification from "./components/Auth/EmailVerification";

// Lazy loading des pages
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const StudentAppPage = lazy(() => import("./pages/StudentAppPage"));
const Profile = lazy(() => import("./pages/Profile"));
const HomePage = lazy(() => import("./pages/HomePage"));
const TeacherProjectManagement = lazy(() =>
  import("./components/Teacher/ProjectManagement/TeacherProjectManagement")
);
const ResetPassword = lazy(() => import("./components/Auth/ResetPassword"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/UserManagement"));

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Routes>
                        {/* Admin routes */}
                        <Route
                          path="/admin/dashboard"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Suspense fallback={<LoadingSpinner />}>
                                <AdminDashboard />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Suspense fallback={<LoadingSpinner />}>
                                <UserManagement />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
            <>
              <Route
                path="/deliverables"
                element={
                  <ProtectedRoute requiredRole="ENSEIGNANT">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherProjectManagement activeView="deliverables" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/statistics"
                element={
                  <ProtectedRoute requiredRole="ENSEIGNANT">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherProjectManagement activeView="statistics" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tasks"
                element={
                  <ProtectedRoute requiredRole="ENSEIGNANT">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherProjectManagement activeView="all-tasks" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/deadlines-calendar"
                element={
                  <ProtectedRoute requiredRole="ENSEIGNANT">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherProjectManagement activeView="deadlines-calendar" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
            </>
            {/* Routes publiques */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <HomePage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <HomePage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <HomePage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ForgotPasswordPage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ResetPassword />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/verify-email"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <EmailVerification />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Unauthorized />
                </Suspense>
              }
            />

            {/* Routes protégées - AJOUT des ProtectedRoute */}
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute requiredRole="ENSEIGNANT">
                  <Suspense fallback={<LoadingSpinner />}>
                    <TeacherDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-app"
              element={
                <ProtectedRoute requiredRole="ETUDIANT">
                  <Suspense fallback={<LoadingSpinner />}>
                    <StudentAppPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Profile />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute requiredRole="ENSEIGNANT">
                  <Suspense fallback={<LoadingSpinner />}>
                    <TeacherProjectManagement activeView="projects" />
                  </Suspense>
                </ProtectedRoute>
              }
            />


            <Route
              path="/groups"
              element={
                <ProtectedRoute requiredRole="ENSEIGNANT">
                  <Suspense fallback={<LoadingSpinner />}>
                    <TeacherProjectManagement activeView="groups" />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Route messagerie */}
            <Route
              path="/messaging"
              element={
                <ProtectedRoute requiredRole="ENSEIGNANT">
                  <Suspense fallback={<LoadingSpinner />}>
                    {/** Container pour la page de messagerie */}
                    {React.createElement(require('./pages/MessagingPage').default)}
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Route 404 */}
            <Route
              path="*"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <HomePage />
                  </Suspense>
                </PublicRoute>
              }
            />
          </Routes>
      {isAuthenticated && location.pathname !== '/messaging' && user?.role !== 'ADMIN' && <Footer />}
    </>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="app">
        {/* Bouton flottant global pour le mode clair/sombre */}
        <GlobalThemeToggle />
        {/* Bouton flottant pour notifications push */}
        <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
          <PushNotificationButton />
        </div>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
