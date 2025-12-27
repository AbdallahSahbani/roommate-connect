import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SuspendedBanner } from "./components/SuspendedBanner";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "./components/AppShell";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import DashboardNew from "./pages/DashboardNew";
import BrowseNew from "./pages/BrowseNew";
import Properties3D from "./pages/Properties3D";
import { RentForecast } from "./pages/RentForecast";
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

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: "easeOut" as const }
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={pageTransition.transition}
        className="min-h-screen"
      >
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/board" element={<Board />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/become-landlord" element={<BecomeLandlord />} />
          <Route path="/rent-forecast" element={<RentForecast />} />
          
          {/* Protected routes with AppShell */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardNew />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/browse" element={<BrowseNew />} />
            <Route path="/properties" element={<Properties3D />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/messages/:conversationId?" element={<Messages />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/income-verification" element={<IncomeVerification />} />
            <Route path="/roommate-swipe" element={<RoommateSwipe />} />
            <Route path="/roommates/swipe" element={<RoommateSwipe />} />
            <Route path="/subscribe" element={<Subscribe />} />
          </Route>
          
          {/* Landlord routes */}
          <Route path="/landlord/dashboard" element={<ProtectedRoute requireLandlord><LandlordDashboard /></ProtectedRoute>} />
          <Route path="/landlord/listings" element={<ProtectedRoute requireLandlord><LandlordListingsPage /></ProtectedRoute>} />
          <Route path="/landlord/assistant" element={<ProtectedRoute requireLandlord><LandlordAssistant /></ProtectedRoute>} />
          <Route path="/landlord/listings/new" element={<ProtectedRoute requireLandlord><LandlordListingForm /></ProtectedRoute>} />
          <Route path="/landlord/listings/:id/edit" element={<ProtectedRoute requireLandlord><LandlordListingForm /></ProtectedRoute>} />
          <Route path="/landlord/applications/:propertyId" element={<ProtectedRoute requireLandlord><LandlordApplications /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/verifications" element={<ProtectedRoute requireAdmin><AdminVerifications /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute requireAdmin><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/properties" element={<ProtectedRoute requireAdmin><AdminProperties /></ProtectedRoute>} />
          <Route path="/admin/abuse" element={<ProtectedRoute requireAdmin><AdminAbuse /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div className="relative isolate min-h-screen bg-slate-950">
        <div className="relative z-20">
          <Toaster />
          <Sonner />
          <SuspendedBanner />
          <AnimatedRoutes />
        </div>
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
