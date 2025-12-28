import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth, RequireRole } from "./routes/guards";

/* ---------- Public ---------- */
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Careers from "./pages/public/Careers";
import Contact from "./pages/public/Contact";
import Board from "./pages/public/Board";
import Privacy from "./pages/public/Privacy";
import Terms from "./pages/public/Terms";
import BecomeLandlord from "./pages/public/BecomeLandlord";
import { RentForecast } from "./pages/public/RentForecast";

/* ---------- User ---------- */
import Dashboard from "./pages/user/Dashboard";
import ProfileSetup from "./pages/user/ProfileSetup";
import Browse from "./pages/user/Browse";
import Properties from "./pages/user/Properties";
import PropertyDetail from "./pages/user/PropertyDetail";
import Groups from "./pages/user/Groups";
import GroupDetail from "./pages/user/GroupDetail";
import Messages from "./pages/user/Messages";
import Verification from "./pages/user/Verification";
import Subscription from "./pages/user/Subscription";
import IncomeVerification from "./pages/user/IncomeVerification";
import Swipe from "./pages/user/Swipe";
import Subscribe from "./pages/Subscribe";

/* ---------- Landlord ---------- */
import LandlordDashboard from "./pages/landlord/Dashboard";
import Listings from "./pages/landlord/Listings";
import Assistant from "./pages/landlord/Assistant";
import NewListing from "./pages/landlord/NewListing";
import Applications from "./pages/landlord/Applications";

/* ---------- Admin ---------- */
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminVerifications from "./pages/admin/Verifications";
import AdminLogs from "./pages/admin/Logs";
import AdminProperties from "./pages/admin/Properties";
import Abuse from "./pages/admin/Abuse";

/* ---------- Fallback ---------- */
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="relative isolate min-h-screen bg-[#0B0D10]">
          <Toaster />
          <Sonner />
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/board" element={<Board />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/become-landlord" element={<BecomeLandlord />} />
            <Route path="/rent-forecast" element={<RentForecast />} />

            {/* USER - New routes */}
            <Route path="/app" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/app/profile-setup" element={<RequireAuth><ProfileSetup /></RequireAuth>} />
            <Route path="/app/browse" element={<RequireAuth><Browse /></RequireAuth>} />
            <Route path="/app/properties" element={<RequireAuth><Properties /></RequireAuth>} />
            <Route path="/app/properties/:id" element={<RequireAuth><PropertyDetail /></RequireAuth>} />
            <Route path="/app/groups" element={<RequireAuth><Groups /></RequireAuth>} />
            <Route path="/app/groups/:id" element={<RequireAuth><GroupDetail /></RequireAuth>} />
            <Route path="/app/messages" element={<RequireAuth><Messages /></RequireAuth>} />
            <Route path="/app/verification" element={<RequireAuth><Verification /></RequireAuth>} />
            <Route path="/app/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
            <Route path="/app/income-verification" element={<RequireAuth><IncomeVerification /></RequireAuth>} />
            <Route path="/app/swipe" element={<RequireAuth><Swipe /></RequireAuth>} />
            <Route path="/app/swipe/:mode" element={<RequireAuth><Swipe /></RequireAuth>} />
            <Route path="/app/subscribe" element={<RequireAuth><Subscribe /></RequireAuth>} />

            {/* USER - Legacy routes (backward compatibility) */}
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/profile-setup" element={<RequireAuth><ProfileSetup /></RequireAuth>} />
            <Route path="/browse" element={<RequireAuth><Browse /></RequireAuth>} />
            <Route path="/properties" element={<RequireAuth><Properties /></RequireAuth>} />
            <Route path="/properties/:id" element={<RequireAuth><PropertyDetail /></RequireAuth>} />
            <Route path="/groups" element={<RequireAuth><Groups /></RequireAuth>} />
            <Route path="/groups/:id" element={<RequireAuth><GroupDetail /></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
            <Route path="/verification" element={<RequireAuth><Verification /></RequireAuth>} />
            <Route path="/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
            <Route path="/income-verification" element={<RequireAuth><IncomeVerification /></RequireAuth>} />
            <Route path="/swipe" element={<RequireAuth><Swipe /></RequireAuth>} />
            <Route path="/swipe/:mode" element={<RequireAuth><Swipe /></RequireAuth>} />
            <Route path="/subscribe" element={<RequireAuth><Subscribe /></RequireAuth>} />

            {/* LANDLORD */}
            <Route path="/landlord" element={<RequireAuth><RequireRole role="landlord"><LandlordDashboard /></RequireRole></RequireAuth>} />
            <Route path="/landlord/listings" element={<RequireAuth><RequireRole role="landlord"><Listings /></RequireRole></RequireAuth>} />
            <Route path="/landlord/assistant" element={<RequireAuth><RequireRole role="landlord"><Assistant /></RequireRole></RequireAuth>} />
            <Route path="/landlord/new" element={<RequireAuth><RequireRole role="landlord"><NewListing /></RequireRole></RequireAuth>} />
            <Route path="/landlord/edit/:id" element={<RequireAuth><RequireRole role="landlord"><NewListing /></RequireRole></RequireAuth>} />
            <Route path="/landlord/applications" element={<RequireAuth><RequireRole role="landlord"><Applications /></RequireRole></RequireAuth>} />

            {/* ADMIN */}
            <Route path="/admin" element={<RequireAuth><RequireRole role="admin"><AdminDashboard /></RequireRole></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth><RequireRole role="admin"><AdminUsers /></RequireRole></RequireAuth>} />
            <Route path="/admin/verifications" element={<RequireAuth><RequireRole role="admin"><AdminVerifications /></RequireRole></RequireAuth>} />
            <Route path="/admin/logs" element={<RequireAuth><RequireRole role="admin"><AdminLogs /></RequireRole></RequireAuth>} />
            <Route path="/admin/properties" element={<RequireAuth><RequireRole role="admin"><AdminProperties /></RequireRole></RequireAuth>} />
            <Route path="/admin/abuse" element={<RequireAuth><RequireRole role="admin"><Abuse /></RequireRole></RequireAuth>} />

            {/* FALLBACK */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
