import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const Products = lazy(() => import("./pages/Products"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const SellerRegister = lazy(() => import("./pages/SellerRegister"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const LandingPageView = lazy(() => import("./pages/LandingPageView"));
const Storefront = lazy(() => import("./pages/Storefront"));
const ProductRouteManager = lazy(() => import("./pages/ProductRouteManager"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:productId/:affiliateId" element={<ProductRouteManager />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/seller-register" element={<SellerRegister />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/lp/:pageId" element={<LandingPageView />} />
            <Route path="/store/:storeName" element={<Storefront />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
