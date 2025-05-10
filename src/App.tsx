import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/admin/Login";

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";
import ClientDeliveries from "./pages/client/Deliveries";
import NewDelivery from "./pages/client/NewDelivery";
import DeliveryDetails from "./pages/client/DeliveryDetails";
import ClientProfile from "./pages/client/Profile.tsx";
import ClientPayments from "./pages/client/Payments.tsx";
import FindDrivers from "./pages/client/FindDrivers.tsx";

// Driver Pages
import DriverDashboard from "./pages/driver/Dashboard.tsx";
import DriverProfile from "./pages/driver/Profile.tsx";
import DeliveriesPage from '@/pages/driver/DeliveriesPage';
import EarningsPage from '@/pages/driver/EarningsPage';
import DeliveryDetailPage from './pages/driver/DeliveryDetailPage';
import UpdateStatusPage from './pages/driver/UpdateStatusPage';  
import SettingsPage from './pages/driver/SettingsPage';  // Correct case


// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Client Routes */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/deliveries" element={<ClientDeliveries />} />
          <Route path="/client/deliveries/new" element={<NewDelivery />} />
          <Route path="/client/deliveries/:id" element={<DeliveryDetails />} />
          <Route path="/client/profile" element={<ClientProfile />} />
          <Route path="/client/payments" element={<ClientPayments />} />
          <Route path="/client/find-drivers" element={<FindDrivers />} />
          
          {/* Driver Routes */}
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/profile" element={<DriverProfile />} />
          <Route path="/driver/DeliveriesPage" element={<DeliveriesPage />} />
          <Route path="/driver/EarningsPage" element={<EarningsPage />} />
          <Route path="/driver/DeliveryDetailPage" element={<DeliveryDetailPage />} />
          <Route path="/driver/UpdateStatusPage" element={<UpdateStatusPage />} />
          <Route path="/driver/SettingsPage" element={<SettingsPage />} />



          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;