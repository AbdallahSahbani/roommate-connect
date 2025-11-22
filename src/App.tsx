import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import LandlordListings from "./pages/LandlordListings";
import LandlordListingForm from "./pages/LandlordListingForm";
import Messages from "./pages/Messages";
import Verification from "./pages/Verification";
import Subscription from "./pages/Subscription";
import IncomeVerification from "./pages/IncomeVerification";
import AdminDashboard from "./pages/AdminDashboard";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Board from "./pages/Board";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/landlord/listings" element={<LandlordListings />} />
          <Route path="/landlord/listings/new" element={<LandlordListingForm />} />
          <Route path="/landlord/listings/:id/edit" element={<LandlordListingForm />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/income-verification" element={<IncomeVerification />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/board" element={<Board />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
