import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SuspendedBanner } from "./components/SuspendedBanner";
import SplineBackground from "./components/SplineBackground";
import { MouseGlowOverlay } from "./components/MouseGlowOverlay";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import LandlordListings from "./pages/LandlordListings";
import LandlordListingForm from "./pages/LandlordListingForm";
import Messages from "./pages/Messages";
import Verification from "./pages/Verification";
import Subscription from "./pages/Subscription";
import IncomeVerification from "./pages/IncomeVerification";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Board from "./pages/Board";
import NotFound from "./pages/NotFound";
import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import LandlordListingsPage from "./pages/landlord/LandlordListings";
import RoommateSwipe from "./pages/RoommateSwipe";
import Subscribe from "./pages/Subscribe";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminAbuse from "./pages/admin/AdminAbuse";
import LandlordApplications from "./pages/landlord/LandlordApplications";
import LandlordAssistant from "./pages/landlord/LandlordAssistant";
import BecomeLandlord from "./pages/BecomeLandlord";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div className="relative min-h-screen bg-background">
      <SplineBackground />
      <MouseGlowOverlay />
      <Toaster />
      <Sonner />
      <SuspendedBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/groups" element={<ProtectedRoute requireRenter><Groups /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute requireRenter><GroupDetail /></ProtectedRoute>} />
        <Route path="/become-landlord" element={<BecomeLandlord />} />
        <Route path="/landlord/dashboard" element={<ProtectedRoute requireLandlord><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/landlord/listings" element={<ProtectedRoute requireLandlord><LandlordListingsPage /></ProtectedRoute>} />
        <Route path="/landlord/assistant" element={<ProtectedRoute requireLandlord><LandlordAssistant /></ProtectedRoute>} />
        <Route path="/landlord/listings/new" element={<ProtectedRoute requireLandlord><LandlordListingForm /></ProtectedRoute>} />
        <Route path="/landlord/listings/:id/edit" element={<ProtectedRoute requireLandlord><LandlordListingForm /></ProtectedRoute>} />
        <Route path="/landlord/applications/:propertyId" element={<ProtectedRoute requireLandlord><LandlordApplications /></ProtectedRoute>} />
        <Route path="/messages/:conversationId?" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/income-verification" element={<ProtectedRoute><IncomeVerification /></ProtectedRoute>} />
        <Route path="/roommate-swipe" element={<ProtectedRoute requireRenter><RoommateSwipe /></ProtectedRoute>} />
        <Route path="/roommates/swipe" element={<ProtectedRoute requireRenter><RoommateSwipe /></ProtectedRoute>} />
        <Route path="/subscribe" element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/verifications" element={<ProtectedRoute requireAdmin><AdminVerifications /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute requireAdmin><AdminLogs /></ProtectedRoute>} />
        <Route path="/admin/properties" element={<ProtectedRoute requireAdmin><AdminProperties /></ProtectedRoute>} />
        <Route path="/admin/abuse" element={<ProtectedRoute requireAdmin><AdminAbuse /></ProtectedRoute>} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/board" element={<Board />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  </QueryClientProvider>
);

export default App;
