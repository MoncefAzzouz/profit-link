import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductPage from "./ProductPage";
import LandingPageView from "./LandingPageView";
import { motion } from "framer-motion";
import { API_BASE_URL } from '@/config/api';


const ProductRouteManager = () => {
  const { productId, affiliateId } = useParams();
  const [hasLandingPage, setHasLandingPage] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLandingPage = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/store/product-page/${productId}/${affiliateId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setHasLandingPage(true);
          } else {
            setHasLandingPage(false);
          }
        } else {
          setHasLandingPage(false);
        }
      } catch (err) {
        console.error("Error checking landing page:", err);
        setHasLandingPage(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId && affiliateId) {
      checkLandingPage();
    } else {
      setHasLandingPage(false);
      setIsLoading(false);
    }
  }, [productId, affiliateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full inline-block mb-4"
          />
          <p className="text-muted-foreground">جاري تحميل الصفحة...</p>
        </div>
      </div>
    );
  }

  if (hasLandingPage) {
    // If a custom landing page exists, render the dynamic LandingPageView
    // We pass the pageId if we had it, but LandingPageView can also be updated to fetch by productId/affiliateId
    // Actually, LandingPageView currently expects pageId in params.
    // Let's modify LandingPageView to also accept productId/affiliateId or we can pass a prop.
    return <LandingPageView />;
  }

  // Fallback to the default ProductPage
  return <ProductPage />;
};

export default ProductRouteManager;
