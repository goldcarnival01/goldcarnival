import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import ReferEarnPage from "./pages/ReferEarnPage";
import DashboardPage from "./pages/DashboardPage";

import TicketHistoryPage from "./pages/TicketHistoryPage";
import MyPlansPage from "./pages/MyPlansPage";
import MyWinningsPage from "./pages/MyWinningsPage";
import DepositPage from "./pages/DepositPage";
import LoginPage from "./pages/LoginPage";
import WinnersPage from "./pages/WinnersPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import { PasswordResetRequestPage, PasswordResetPage } from "./pages/PasswordResetPages";
import CryptoPaymentTestPage from "./pages/CryptoPaymentTestPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import AdminUserPlansPage from "./pages/AdminUserPlansPage";
import WithdrawPage from "./pages/WithdrawPage";
import MyReferralsPage from "./pages/MyReferralsPage";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/refer-earn" element={<ReferEarnPage />} />
      <Route path="/winners" element={<WinnersPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<PasswordResetRequestPage />} />
      <Route path="/reset-password" element={<PasswordResetPage />} />
      
      {/* Test route */}
      <Route path="/test-route" element={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Test Route Working!</h1>
          <p>If you can see this, routing is working.</p>
        </div>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/dashboard/ticket-history" element={
        <ProtectedRoute>
          <TicketHistoryPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/my-plans" element={
        <ProtectedRoute>
          <MyPlansPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/my-winnings" element={
        <ProtectedRoute>
          <MyWinningsPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/deposit" element={
        <ProtectedRoute>
          <DepositPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/withdraw-fund" element={
        <ProtectedRoute>
          <WithdrawPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/referrals" element={
        <ProtectedRoute>
          <MyReferralsPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/crypto-test" element={
        <ProtectedRoute>
          <CryptoPaymentTestPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users/:userId/plans" element={
        <ProtectedRoute>
          <AdminUserPlansPage />
        </ProtectedRoute>
      } />
      
      {/* Redirect authenticated users away from login */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
