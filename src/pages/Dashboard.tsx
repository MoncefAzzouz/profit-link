import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, Trophy, 
  HelpCircle, LogOut, Menu, X, Copy, Check, TrendingUp,
  Clock, CheckCircle, XCircle, Truck, Eye, ChevronLeft,
  Calendar, Filter, Search, SlidersHorizontal, Store, Sparkles,
  Heart, Download, PlusCircle, User, Phone, MapPin, PackagePlus, MessageSquare, Plus, Trash2, Maximize2, LayoutTemplate,
  Save, Globe, Facebook, Instagram, Palette, Layers,
  Image as ImageIcon, ShieldCheck, CreditCard, Type, MessageCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { ar } from "date-fns/locale";

import { mockOrders, mockAffiliateStats, Order, wilayas } from "@/data/mockAffiliateData";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import EarningsChart from "@/components/dashboard/EarningsChart";
import { ShippingRate, shippingRegions } from "@/data/mockShippingData";
import { mockWithdrawalRequests } from "@/data/mockAdminData";
import { mockSellerStats, sellerEarningsData } from "@/data/mockSellerData";
import { StoreSettings, defaultStoreSettings } from "@/data/storeSettings";
import LandingPageBuilder from "@/components/seller/LandingPageBuilder";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  AreaChart, Area
} from "recharts";
import { createAndersonShipment } from "@/services/andersonShipping";

type Tab = "overview" | "products" | "my_store" | "my_store_edit" | "favorites" | "landing_pages" | "orders" | "earnings" | "withdrawals" | "levels" | "shipping" | "support";

const orderStatusPieData = [
  { name: "مسلّمة", value: 812, color: "hsl(160, 84%, 39%)" },
  { name: "قيد التوصيل", value: 64, color: "hsl(262, 83%, 58%)" },
  { name: "معلّقة", value: 23, color: "hsl(45, 93%, 47%)" },
  { name: "ملغاة", value: 45, color: "hsl(0, 84%, 60%)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
        <p className="font-semibold text-foreground text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name === "revenue" ? "الإيرادات" : "الطلبيات"}: {entry.value.toLocaleString()}
            {entry.name === "revenue" && " دج"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const statusConfig = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
  shipped: { label: "قيد التوصيل", icon: Truck, color: "text-purple-600 bg-purple-100" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-secondary bg-secondary/10" },
  cancelled: { label: "ملغي", icon: XCircle, color: "text-destructive bg-destructive/10" }
};

// Function to get current level info based on confirmed orders and fetched levels
const getLevelInfo = (confirmedCount: number, levels: any[]) => {
  if (!levels || levels.length === 0) {
    return { name: "المستوى 1 - مبتدئ", next: "المستوى 2", target: 10, prevTarget: 0, levelNumber: 1, color: "blue" };
  }
  
  const sortedLevels = [...levels].sort((a, b) => b.levelNumber - a.levelNumber);
  
  for (const level of sortedLevels) {
    if (confirmedCount >= level.targetOrders) {
      const nextLevel = levels.find(l => l.levelNumber === level.levelNumber + 1);
      return {
        name: level.name,
        next: nextLevel ? nextLevel.name : null,
        target: nextLevel ? nextLevel.targetOrders : level.targetOrders,
        prevTarget: level.targetOrders,
        levelNumber: level.levelNumber,
        color: level.color,
        reward: level.reward
      };
    }
  }
  
  // Fallback if no levels match (though level 1 usually starts at 0)
  const level1 = levels.find(l => l.levelNumber === 1) || { name: "المستوى 1", targetOrders: 0 };
  const level2 = levels.find(l => l.levelNumber === 2) || { name: "المستوى 2", targetOrders: 10 };
  return { 
    name: level1.name, 
    next: level2.name, 
    target: level2.targetOrders, 
    prevTarget: 0,
    levelNumber: 1,
    color: level1.color || "blue"
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem("affiliate_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [productToEditLandingPage, setProductToEditLandingPage] = useState<any>(null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  const activeCategories = useMemo(() => {
    return ["الكل", ...dbCategories.filter(c => c.isActive).map(c => c.name)];
  }, [dbCategories]);

  const getWilayaName = (codeOrName: string) => {
    if (!codeOrName) return "";
    const rate = shippingRates.find(r => r.code === codeOrName);
    return rate ? rate.wilaya : codeOrName;
  };

  // Fetch shipping rates from API on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/delivery/all-rates');
        const json = await res.json();
        if (res.ok && json.data) {
          setShippingRates(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch shipping rates', err);
      }
    };
    fetchRates();

    // Fetch products from backend
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/products');
        const json = await res.json();
        if (res.ok && json.data) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();

    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/products/categories');
        const json = await res.json();
        if (res.ok && json.data) {
          setDbCategories(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();

    // Fetch saved store products from backend
    const fetchStoreProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/store/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setStoreProducts(new Set(json.data));
          }
        }
      } catch (err) {
        console.error('Failed to fetch store products', err);
      }
    };
    fetchStoreProducts();

    // Fetch saved favorites from backend
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/store/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setFavorites(new Set(json.data));
          }
        }
      } catch (err) {
        console.error('Failed to fetch favorites', err);
      }
    };
    fetchFavorites();
  }, []);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingEarnings: 0,
    confirmationRate: 0,
    confirmedOrders: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    const fetchStoreSettings = async () => {
      try {
        if (!token) return;
        const res = await fetch('https://profit-link-3eri.onrender.com/api/store/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            // Merge with defaultStoreSettings to ensure missing fields exist
            setStoreSettings({ ...defaultStoreSettings, ...json.data });
          }
        }
      } catch (err) {
        console.error("Failed to fetch store settings", err);
      }
    };

    const fetchWithdrawals = async () => {
      try {
        if (!token) return;
        const res = await fetch('https://profit-link-3eri.onrender.com/api/finance/withdraw', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) setWithdrawals(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch withdrawals", err);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        if (!token) return;
        const res = await fetch('https://profit-link-3eri.onrender.com/api/finance/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardStats({
            totalRevenue: data.totalEarnings || 0,
            totalOrders: data.totalOrders || 0,
            pendingEarnings: data.pendingEarnings || 0,
            confirmationRate: data.confirmationRate || 0,
            confirmedOrders: data.confirmedOrders || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/orders/affiliate', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok && json.data) {
          const fetchedOrders = json.data.map((o: any) => ({
            id: o.id,
            productName: o.product?.name || "منتج محذوف",
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            wilaya: o.wilaya,
            address: o.address,
            status: o.status.toLowerCase(),
            amount: o.totalAmount || 0, // Fallback to 0
            commission: o.commissionAmount || 0,
            date: new Date(o.createdAt).toLocaleDateString('ar-DZ'),
            trackingNumber: o.trackingNumber
          }));
          setOrders(fetchedOrders);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchLevels = async () => {
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/levels');
        if (res.ok) {
          const json = await res.json();
          setDbLevels(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch levels', err);
      }
    };

    fetchDashboardStats();
    fetchOrders();
    fetchStoreSettings();
    fetchWithdrawals();
    fetchLevels();
    // Refresh interval
    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchOrders();
      fetchWithdrawals();
      fetchLevels();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Product filter states
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("الكل");
  const [productPriceRange, setProductPriceRange] = useState(0);
  const [productSort, setProductSort] = useState("default");
  const [productStockFilter, setProductStockFilter] = useState("all");
  const [showProductFilters, setShowProductFilters] = useState(false);

  // Filter states
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Withdrawal states
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("CCP");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Product Redesign States
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [storeProducts, setStoreProducts] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [communes, setCommunes] = useState<any[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    wilaya: "",
    commune: "",
    address: "",
    deliveryType: "home" as "home" | "office",
    stopDesk: 0,
    deliveryFee: 500
  });

  // Store Editor State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);

  // Levels state
  const [dbLevels, setDbLevels] = useState<any[]>([]);

  const currentLevelInfo = useMemo(() => {
    return getLevelInfo(dashboardStats.confirmedOrders, dbLevels);
  }, [dashboardStats.confirmedOrders, dbLevels]);

  // Shipping filter states
  const [shippingSearch, setShippingSearch] = useState("");
  const [shippingPage, setShippingPage] = useState(1);
  const shippingItemsPerPage = 10;

  const filteredShippingRates = shippingRates.filter(rate => 
    rate.wilaya.toLowerCase().includes(shippingSearch.toLowerCase()) ||
    rate.code.includes(shippingSearch)
  );

  const totalShippingPages = Math.ceil(filteredShippingRates.length / shippingItemsPerPage);
  const paginatedShippingRates = filteredShippingRates.slice(
    (shippingPage - 1) * shippingItemsPerPage,
    shippingPage * shippingItemsPerPage
  );

  const saveStoreSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch('https://profit-link-3eri.onrender.com/api/store/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeSettings)
      });

      if (res.ok) {
        toast({
          title: "تم حفظ إعدادات المتجر! ✅",
          description: "تم تحديث مظهر متجرك العام بنجاح.",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast({
        title: "خطأ",
        description: "تعذر حفظ إعدادات المتجر.",
        variant: "destructive"
      });
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://profit-link-3eri.onrender.com/api/upload/image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const json = await response.json();
        if (type === 'logo') {
          setStoreSettings({ ...storeSettings, storeLogo: json.url });
        } else {
          setStoreSettings({ 
            ...storeSettings, 
            hero: { ...storeSettings.hero, bannerUrl: json.url } 
          });
        }
        toast({ title: "✅ تم رفع الصورة بنجاح" });
      } else {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "❌ فشل رفع الصورة",
        description: err.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate delivery fee automatically
  useEffect(() => {
    if (orderFormData.wilaya) {
      const rate = shippingRates.find(r => r.code === orderFormData.wilaya);
      if (rate) {
        // Validation: If selected commune doesn't support stop desk, force home
        let targetType = orderFormData.deliveryType;
        const selectedCommuneObj = communes.find(c => c.nom === orderFormData.commune);
        if (selectedCommuneObj && selectedCommuneObj.has_stop_desk === 0 && targetType === "office") {
          targetType = "home";
        }

        const fee = targetType === "home" ? rate.homePrice : rate.officePrice;
        setOrderFormData(prev => ({ 
          ...prev, 
          deliveryType: targetType,
          deliveryFee: fee,
          stopDesk: targetType === "office" ? 1 : 0 
        }));
      }
    }
  }, [orderFormData.wilaya, orderFormData.deliveryType, orderFormData.commune, communes]);

  // Fetch communes when wilaya changes
  useEffect(() => {
    const fetchCommunes = async () => {
      if (!orderFormData.wilaya || shippingRates.length === 0) {
        setCommunes([]);
        return;
      }
      
      setLoadingCommunes(true);
      try {
        const wilayaData = shippingRates.find(r => r.code === orderFormData.wilaya);
        const wilayaId = wilayaData?.code || "";
        
        if (wilayaId) {
          const response = await fetch(`https://profit-link-3eri.onrender.com/api/delivery/communes?wilaya_id=${parseInt(wilayaId)}`);
          const res = await response.json();
          if (response.ok) {
            setCommunes(res.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch communes", err);
      } finally {
        setLoadingCommunes(false);
      }
    };

    fetchCommunes();
  }, [orderFormData.wilaya, shippingRates]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("affiliate_user");
    localStorage.removeItem("token");
    toast({ title: "تم تسجيل الخروج" });
    navigate("/");
  };

  const copyAffiliateLink = (productId: string, productName: string) => {
    const link = `${window.location.origin}/product/${productId}/${user?.id || "aff-demo"}`;
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    toast({ title: "تم نسخ الرابط! 🔗" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Order Action Handlers
  const handleWhatsAppConfirm = (order: any) => {
    const defaultText = `مرحباً ${order.customerName}، نتواصل معك من متجرنا لتأكيد طلبك لمنتج ${order.productName} بسعر ${order.amount?.toLocaleString() || "0"} دج. هل العنوان ${getWilayaName(order.wilaya)} صحيح؟`;
    const encodedText = encodeURIComponent(defaultText);
    window.open(`https://wa.me/213${order.customerPhone || "000000000"}?text=${encodedText}`, "_blank");
  };

  const handleAndersonShip = async (order: any) => {
    setProcessingOrderId(order.id);
    try {
      const response = await fetch(`https://profit-link-3eri.onrender.com/api/orders/${order.id}/push-ecotrack`, {
        method: 'POST'
      });
      const res = await response.json();
      
      if (response.ok) {
        toast({ 
          title: "تم إرسال الطلب لشركة الشحن", 
          description: `رقم التتبع: ${res.tracking}` 
        });
        
        setOrders(orders.map(o => o.id === order.id ? { 
          ...o, 
          status: "shipped", 
          trackingNumber: res.tracking 
        } as any : o));
      } else {
        throw new Error(res.error || "Failed to push to Ecotrack");
      }
    } catch (err: any) {
      toast({ title: "خطأ في الإرسال", description: err.message, variant: "destructive" });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleAndersonExpedite = async (order: any) => {
    if (!order.trackingNumber) return;
    setProcessingOrderId(order.id);
    try {
      const response = await fetch(`https://profit-link-3eri.onrender.com/api/orders/${order.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ askCollection: true })
      });
      const res = await response.json();
      
      if (response.ok) {
        toast({ 
          title: "تم تأكيد الشحن بنجاح! 🚀", 
          description: "تمت معالجة الطلب في Ecotrack." 
        });
        setOrders(orders.map(o => o.id === order.id ? { ...o, status: "shipped" } as any : o));
      } else {
        throw new Error(res.error || "Failed to expedite order");
      }
    } catch (err: any) {
      toast({ title: "خطأ في التأكيد", description: err.message, variant: "destructive" });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const toggleFavorite = async (productId: string) => {
    const token = localStorage.getItem("token");
    const newSet = new Set(favorites);
    if (newSet.has(productId)) {
      newSet.delete(productId);
      toast({ title: "تمت الإزالة من المفضلة" });
    } else {
      newSet.add(productId);
      toast({ title: "تمت الإضافة للمفضلة ❤️" });
    }
    setFavorites(newSet);

    try {
      await fetch('https://profit-link-3eri.onrender.com/api/store/favorites', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds: Array.from(newSet) })
      });
    } catch (err) {
      console.error('Failed to save favorites', err);
    }
  };

  const toggleStoreProduct = async (productId: string) => {
    const token = localStorage.getItem("token");
    const newSet = new Set(storeProducts);
    if (newSet.has(productId)) {
      newSet.delete(productId);
      toast({ title: "تمت الإزالة من متجرك" });
    } else {
      newSet.add(productId);
      toast({ title: "تمت الإضافة لمتجرك ➕" });
    }
    setStoreProducts(newSet);

    // Save to backend
    try {
      await fetch('https://profit-link-3eri.onrender.com/api/store/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds: Array.from(newSet) })
      });
    } catch (err) {
      console.error('Failed to save store products', err);
    }
  };

  const openProductDetail = (product: any) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const openOrderForm = (product: any) => {
    setSelectedProduct(product);
    setIsOrderDialogOpen(true);
  };

  const clearFilters = () => {
    setOrderSearch("");
    setOrderStatus("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = orderSearch || orderStatus !== "all" || dateFrom || dateTo;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      const matchesSearch = order.productName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                           order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.wilaya.toLowerCase().includes(orderSearch.toLowerCase());
      
      // Status filter
      const matchesStatus = orderStatus === "all" || order.status === orderStatus;
      
      // Date filters - for simplicity in this demo, skipping complex date filtering 
      // if the date is already a formatted string from the backend.
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatus, dateFrom, dateTo]);

  const productPriceRanges = [
    { label: "الكل", min: 0, max: Infinity },
    { label: "أقل من 2,000 دج", min: 0, max: 2000 },
    { label: "2,000 - 5,000 دج", min: 2000, max: 5000 },
    { label: "5,000 - 10,000 دج", min: 5000, max: 10000 },
    { label: "أكثر من 10,000 دج", min: 10000, max: Infinity },
  ];

  const productSortOptions = [
    { value: "default", label: "الافتراضي" },
    { value: "price-asc", label: "السعر: من الأقل" },
    { value: "price-desc", label: "السعر: من الأعلى" },
    { value: "commission-desc", label: "العمولة: من الأعلى" },
    { value: "stock-desc", label: "المخزون: الأكثر" },
  ];

  const filteredProducts = useMemo(() => {
    const range = productPriceRanges[productPriceRange];
    return products
      .filter((product) => {
        const matchesSearch = product.name.includes(productSearch) || product.description.includes(productSearch);
        const matchesCategory = productCategory === "الكل" || product.category === productCategory;
        const matchesPrice = product.price >= range.min && product.price <= range.max;
        const matchesStock = productStockFilter === "all" || (productStockFilter === "in-stock" && product.stock > 0) || (productStockFilter === "low" && product.stock <= 50 && product.stock > 0);
        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (productSort === "price-asc") return a.price - b.price;
        if (productSort === "price-desc") return b.price - a.price;
        if (productSort === "commission-desc") return b.commission - a.commission;
        if (productSort === "stock-desc") return b.stock - a.stock;
        return 0;
      });
  }, [productSearch, productCategory, productPriceRange, productSort, productStockFilter, products]);

  const sidebarItems = [
    { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "products" as Tab, label: "المنتجات", icon: Package },
    { id: "my_store" as Tab, label: "متجري", icon: Store },
    { id: "my_store_edit" as Tab, label: "تعديل متجري", icon: LayoutTemplate },
    { id: "favorites" as Tab, label: "المنتجات المفضلة", icon: Heart },
    { id: "landing_pages" as Tab, label: "صفحات الهبوط", icon: LayoutTemplate },
    { id: "orders" as Tab, label: "طلبياتي", icon: ShoppingCart },
    { id: "earnings" as Tab, label: "الأرباح", icon: Wallet },
    { id: "withdrawals" as Tab, label: "طلبات السحب", icon: CheckCircle },
    { id: "shipping" as Tab, label: "التوصيل", icon: Truck },
    { id: "levels" as Tab, label: "المستويات", icon: Trophy },
    { id: "support" as Tab, label: "الدعم", icon: HelpCircle },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-card border-l border-border transform transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">LinkDZ</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="bg-muted rounded-xl p-4">
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-70 select-all" title="Click to copy your Affiliate ID">ID: {user?.id}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                  {currentLevelInfo.name}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h1>
             <div className="flex items-center gap-3">
               <Link to="/products">
                 <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                   <Package className="w-4 h-4" />
                   <span className="hidden sm:inline">تصفح المنتجات</span>
                 </Button>
               </Link>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={handleLogout}
                 className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                 title="تسجيل الخروج"
               >
                 <LogOut className="w-5 h-5" />
               </Button>
             </div>
          </div>
        </header>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">إجمالي الأرباح</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {dashboardStats.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">دج</p>
                    </div>
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                      <Wallet className="w-7 h-7 text-secondary" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">الأرباح المعلّقة</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {dashboardStats.pendingEarnings.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">دج</p>
                    </div>
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">إجمالي الطلبيات</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {dashboardStats.totalOrders}
                      </p>
                      <p className="text-sm text-secondary">+{dashboardStats.confirmedOrders} مؤكد</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">نسبة التأكيد</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {dashboardStats.confirmationRate}%
                      </p>
                      <p className="text-sm text-secondary">ممتاز</p>
                    </div>
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-secondary" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Level Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-primary to-navy-800 rounded-2xl p-6 text-primary-foreground shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/5 pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div>
                    <p className="text-primary-foreground/70 text-sm">مستواك الحالي</p>
                    <p className="text-2xl font-bold">{currentLevelInfo.name}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Trophy className="w-10 h-10 text-accent animate-pulse-glow" />
                  </div>
                </div>
                
                {currentLevelInfo.next && (
                  <>
                    <div className="bg-white/10 rounded-full h-3 mb-3 relative z-10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (dashboardStats.confirmedOrders / currentLevelInfo.target) * 100)}%` }}
                        className="bg-gradient-to-r from-secondary to-accent h-full rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      />
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      <p className="text-xs text-primary-foreground/70">
                        باقي {Math.max(0, currentLevelInfo.target - dashboardStats.confirmedOrders)} طلبيات مؤكدة للترقية لـ {currentLevelInfo.next}
                      </p>
                      <p className="text-[10px] font-mono text-primary-foreground/50">
                        {dashboardStats.confirmedOrders} / {currentLevelInfo.target}
                      </p>
                    </div>
                  </>
                )}
                {!currentLevelInfo.next && (
                  <p className="text-sm text-accent font-bold mt-2 relative z-10">
                    أنت الآن في أعلى مستوى متاح! تهانينا 🎉
                  </p>
                )}
                    تهانينا! لقد وصلت لأعلى مستوى حالياً 🎉
                  </p>
                )}
              </motion.div>
              {/* Revenue Evolution Chart from Seller Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="dash-card-interactive p-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">تطور الإيرادات</h3>
                    <p className="text-sm text-muted-foreground mt-1">نظرة سريعة على مبيعاتك المحققة</p>
                  </div>
                  <Select defaultValue="6months">
                    <SelectTrigger className="w-32 h-9 rounded-xl text-xs">
                      <SelectValue placeholder="الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                      <SelectItem value="6months">آخر 6 أشهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sellerEarningsData}>
                      <defs>
                        <linearGradient id="sellerRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(160, 84%, 39%)" 
                        strokeWidth={3} 
                        fill="url(#sellerRevenueGradient)" 
                        name="revenue" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-2xl shadow-sm"
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">آخر الطلبيات</h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline"
                  >
                    عرض الكل
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>لا توجد طلبيات بعد</p>
                    </div>
                  ) : (
                    orders.slice(0, 5).map((order) => {
                      const status = (statusConfig as any)[order.status] || statusConfig.pending;
                      return (
                        <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.color}`}>
                              <status.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{order.productName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{order.date}</span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] text-muted-foreground">{order.customerName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-foreground text-sm">{order.amount.toLocaleString()} دج</p>
                            <p className="text-[10px] text-secondary">ربحك: {order.commission.toLocaleString()} دج</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="ابحث عن منتج..."
                      className="pr-12 h-12"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={productSort} onValueChange={setProductSort}>
                      <SelectTrigger className="w-[180px] h-12 rounded-xl">
                        <SelectValue placeholder="ترتيب حسب" />
                      </SelectTrigger>
                      <SelectContent>
                        {productSortOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={showProductFilters ? "default" : "outline"}
                      onClick={() => setShowProductFilters(!showProductFilters)}
                      className="h-12 gap-2 rounded-xl"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      فلاتر
                    </Button>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 flex-wrap">
                  {activeCategories.map((category) => (
                    <Button
                      key={category}
                      variant={productCategory === category ? "default" : "outline"}
                      onClick={() => setProductCategory(category)}
                      className="rounded-full"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Advanced filters */}
                {showProductFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border"
                  >
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">نطاق السعر</label>
                      <Select value={String(productPriceRange)} onValueChange={(v) => setProductPriceRange(Number(v))}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {productPriceRanges.map((range, i) => (
                            <SelectItem key={i} value={String(i)}>{range.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">المخزون</label>
                      <Select value={productStockFilter} onValueChange={setProductStockFilter}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="in-stock">متوفر</SelectItem>
                          <SelectItem value="low">مخزون منخفض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setProductPriceRange(0); setProductStockFilter("all"); setProductSort("default"); setProductCategory("الكل"); setProductSearch(""); }}
                        className="gap-1.5 text-destructive"
                      >
                        <X className="w-4 h-4" /> مسح الفلاتر
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Active filter count */}
                {(productCategory !== "الكل" || productPriceRange !== 0 || productStockFilter !== "all") && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    <span>{filteredProducts.length} منتج من أصل {products.length}</span>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => {
                  const isFavorite = favorites.has(product.id);
                  const isInStore = storeProducts.has(product.id);
                  const profit = product.price - (product.originalPrice / 2); // Assuming 50% commission is calculated this way or use product.commission
                  
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all group"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => openProductDetail(product)}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <button 
                          onClick={() => toggleFavorite(product.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                            isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-muted-foreground hover:bg-white"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-primary border border-primary/20">
                          {product.category}
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground line-through">{product.originalPrice.toLocaleString()} دج</p>
                            <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} دج</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] text-muted-foreground">ربحك الصافي</p>
                            <p className="text-lg font-bold text-secondary">{product.commission.toLocaleString()} دج</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button 
                            onClick={() => openOrderForm(product)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-10 text-xs font-bold"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            طلب المنتج
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => toggleStoreProduct(product.id)}
                            className={`gap-2 rounded-xl h-10 text-xs font-bold ${
                              isInStore ? "border-secondary text-secondary bg-secondary/5" : "border-border hover:bg-muted"
                            }`}
                          >
                            {isInStore ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                            {isInStore ? "في المتجر" : "إضافة للمتجر"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground">لا توجد منتجات مطابقة للبحث</p>
                </div>
              )}
            </div>
          )}

          {/* My Store Tab */}
          {activeTab === "my_store" && (
            <div className="space-y-8">
              {/* Store Link Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary via-primary to-navy-800 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-right flex-1">
                    <h2 className="text-4xl font-black mb-4">متجرك الخاص جاهز! 🚀</h2>
                    <p className="text-primary-foreground/80 mb-10 max-w-2xl text-xl leading-relaxed">شارك رابط متجرك واكسب عمولة على كل منتج يشتريه الزبائن من خلالك. متجرك يحتوي حالياً على <b>{storeProducts.size}</b> منتجات.</p>
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                      <div className="bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/20 font-mono text-sm break-all flex-1 flex items-center justify-center lg:justify-start text-left" dir="ltr">
                        {window.location.origin}/store/{user?.storeName || user?.id || "aff-demo"}
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => {
                            const link = `${window.location.origin}/store/${user?.storeName || user?.id || "aff-demo"}`;
                            navigator.clipboard.writeText(link);
                            toast({ title: "تم نسخ رابط المتجر! 🔗" });
                          }}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-16 px-10 rounded-2xl gap-3 shadow-xl shadow-secondary/20 font-black text-lg transition-all hover:scale-105 active:scale-95"
                        >
                          <Copy className="w-6 h-6" />
                          نسخ الرابط
                        </Button>
                        <a href={`/store/${user?.storeName || user?.id || "aff-demo"}`} target="_blank" rel="noopener noreferrer">
                          <Button 
                            variant="outline"
                            className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-16 px-8 rounded-2xl gap-3 backdrop-blur-sm font-bold"
                          >
                            <Eye className="w-6 h-6" />
                            معاينة
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="hidden xl:flex w-64 h-64 bg-white/10 rounded-[3rem] items-center justify-center backdrop-blur-md border border-white/20 rotate-6 shadow-2xl relative group transition-transform hover:rotate-0 duration-500">
                    <Store className="w-32 h-32 text-white opacity-80 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[120px] opacity-50" />
                <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[120px] opacity-50" />
              </motion.div>

              {/* Store Products Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <Package className="w-6 h-6 text-primary" />
                    المنتجات المضافة لمتجرك
                  </h3>
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full font-bold">
                    {storeProducts.size} منتج
                  </Badge>
                </div>

                {storeProducts.size > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.filter(p => storeProducts.has(p.id)).map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 group"
                      >
                        <div className="aspect-square relative">
                          <img src={product.image} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => toggleStoreProduct(product.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-foreground line-clamp-1 mb-2">{product.name}</h4>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-primary font-bold">{product.price.toLocaleString()} دج</span>
                            <span className="text-xs text-secondary font-bold">ربحك: {product.commission.toLocaleString()} دج</span>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full text-xs font-bold gap-2 hover:bg-primary hover:text-white transition-colors"
                            onClick={() => {
                              setProductToEditLandingPage(product);
                              setActiveTab("landing_pages");
                            }}
                          >
                            <LayoutTemplate className="w-4 h-4" />
                            تعديل صفحة الهبوط
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-[2.5rem] p-20 text-center border-2 border-dashed border-border/60">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <PlusCircle className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-2">متجرك فارغ حالياً</h4>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                      ابدأ بتصفح المنتجات وأضف ما تراه مناسباً لجمهورك لتبدأ في جني الأرباح.
                    </p>
                    <Button onClick={() => setActiveTab("products")} className="rounded-2xl h-12 px-8 font-bold">
                      تصفح المنتجات الآن
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-border/60 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-foreground">المنتجات المفضلة ❤️</h2>
                  <p className="text-muted-foreground mt-1">المنتجات التي قمت بحفظها للوصول إليها لاحقاً.</p>
                </div>
                <Badge className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full text-lg font-bold">
                  {favorites.size} منتج
                </Badge>
              </div>

              {favorites.size > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.filter(p => favorites.has(p.id)).map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all group"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => openProductDetail(product)}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <button 
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white shadow-lg"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-primary">{product.price.toLocaleString()} دج</p>
                          <p className="text-xs font-bold text-secondary">الربح: {product.commission.toLocaleString()} دج</p>
                        </div>
                        <Button 
                          onClick={() => openOrderForm(product)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-10 text-xs font-bold"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          طلب المنتج
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-[2.5rem] p-20 text-center border-2 border-dashed border-border/60">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">قائمة المفضلة فارغة</h4>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    لم تقم بإضافة أي منتجات للمفضلة بعد. ابحث عن المنتجات التي تعجبك واضغط على أيقونة القلب.
                  </p>
                  <Button onClick={() => setActiveTab("products")} variant="outline" className="rounded-2xl h-12 px-8 font-bold">
                    الذهاب للمتجر
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Landing Pages Tab */}
          {activeTab === "landing_pages" && (
            <div className="space-y-6">
              <LandingPageBuilder initialProductToEdit={productToEditLandingPage} />
            </div>
          )}

          {/* Orders Tab with Advanced Filtering */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-card rounded-2xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن منتج أو زبون..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="shipped">قيد التوصيل</SelectItem>
                      <SelectItem value="delivered">تم التسليم</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date From */}
                  <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "من تاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={(date) => {
                          setDateFrom(date);
                          setIsDateFromOpen(false);
                        }}
                        locale={ar}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Date To */}
                  <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy") : "إلى تاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={(date) => {
                          setDateTo(date);
                          setIsDateToOpen(false);
                        }}
                        locale={ar}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-destructive">
                      <X className="w-4 h-4" />
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  عرض {filteredOrders.length} من {orders.length} طلبية حقيقية
                </p>
              </div>

              {/* Orders Table */}
              <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">المنتج</th>
                        <th className="text-right p-4 font-semibold text-foreground">الزبون</th>
                        <th className="text-right p-4 font-semibold text-foreground">الولاية</th>
                        <th className="text-right p-4 font-semibold text-foreground">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground">العمولة</th>
                        <th className="text-right p-4 font-semibold text-foreground">التاريخ</th>
                        <th className="text-right p-4 font-semibold text-foreground">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                          const status = statusConfig[order.status as keyof typeof statusConfig];
                          const isProcessing = processingOrderId === order.id;
                          return (
                            <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                              <td className="p-4 font-medium text-foreground">{order.productName}</td>
                              <td className="p-4 text-muted-foreground">{order.customerName}</td>
                              <td className="p-4 text-muted-foreground">{getWilayaName(order.wilaya)}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                  <status.icon className="w-4 h-4" />
                                  {status.label}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-secondary">{order.commission.toLocaleString()} دج</td>
                              <td className="p-4 text-muted-foreground">{order.date}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleWhatsAppConfirm(order)}>
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                  {(order.status === "pending" || order.status === "confirmed") && (
                                    <Button 
                                      size="sm" 
                                      className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" 
                                      disabled={isProcessing} 
                                      onClick={() => handleAndersonShip(order)}
                                    >
                                      {isProcessing ? (
                                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                                      ) : (
                                        <Truck className="w-4 h-4" />
                                      )}
                                      {isProcessing ? "" : "شحن"}
                                    </Button>
                                  )}
                                  {order.trackingNumber && order.status !== "delivered" && order.status !== "cancelled" && (
                                    <Button 
                                      size="sm" 
                                      variant="hero"
                                      className="gap-2 h-8 px-3 text-[10px] font-black" 
                                      disabled={isProcessing} 
                                      onClick={() => handleAndersonExpedite(order)}
                                    >
                                      {isProcessing ? (
                                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      {isProcessing ? "" : "تأكيد الشحن"}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            لا توجد طلبيات تطابق الفلاتر المحددة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Tab ported from Seller Dashboard */}
          {activeTab === "earnings" && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { 
                    label: "الإيرادات الإجمالية", 
                    value: `${dashboardStats.totalRevenue.toLocaleString()} دج`, 
                    color: "text-foreground",
                    sub: "إجمالي المبيعات المحققة",
                    icon: Wallet,
                    bg: "bg-primary/5"
                  },
                  { 
                    label: "إجمالي الطلبيات", 
                    value: dashboardStats.totalOrders.toLocaleString(), 
                    color: "text-accent",
                    sub: "عدد الطلبات المسجلة",
                    icon: Trophy,
                    bg: "bg-accent/5"
                  },
                  { 
                    label: "نسبة التأكيد", 
                    value: `${dashboardStats.confirmationRate}%`, 
                    color: "text-secondary",
                    sub: "بناءً على الطلبات الشحن",
                    icon: TrendingUp,
                    bg: "bg-secondary/5"
                  },
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-card rounded-[2rem] p-8 shadow-sm border border-border/50 relative overflow-hidden group hover:shadow-xl transition-all duration-500 ${stat.bg}`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
                          <stat.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium text-sm">{stat.label}</p>
                      </div>
                      <p className={`text-4xl font-black tabular-nums transition-transform duration-500 group-hover:scale-105 ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground/80 mt-2 font-medium">{stat.sub}</p>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-[0.03] rounded-full" />
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Monthly Revenue Bar Chart */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-foreground">الإيرادات الشهرية</h3>
                    <Select defaultValue="6months">
                      <SelectTrigger className="w-32 h-9 rounded-xl text-xs">
                        <SelectValue placeholder="الفترة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                        <SelectItem value="6months">آخر 6 أشهر</SelectItem>
                        <SelectItem value="year">هذا العام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sellerEarningsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)', radius: 8 }} />
                        <Bar 
                          dataKey="revenue" 
                          fill="hsl(160, 84%, 39%)" 
                          radius={[10, 10, 10, 10]} 
                          barSize={32}
                          name="revenue" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Order Distribution Pie Chart */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col items-center"
                >
                  <div className="w-full text-right mb-4">
                    <h3 className="text-xl font-bold text-foreground">توزيع الحالات</h3>
                    <p className="text-xs text-muted-foreground mt-1 text-right">نسبة الطلبيات حسب حالة التسليم</p>
                  </div>
                  
                  <div className="h-[280px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={orderStatusPieData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={70} 
                          outerRadius={100} 
                          paddingAngle={8} 
                          dataKey="value"
                          stroke="none"
                        >
                          {orderStatusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: any) => [`${value} طلبية`, ""]} 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))", 
                            borderRadius: "16px",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-black text-foreground">{dashboardStats.totalOrders}</span>
                      <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">إجمالي الطلبات</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mt-6">
                    {orderStatusPieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/40 transition-all hover:bg-muted/50">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground">{item.value} طلبية</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-[2rem] p-8 border border-primary/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    تفاصيل الدفع التلقائي
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    يتم تجميع الأرباح طوال الأسبوع وتحويلها تلقائياً إلى حسابكم يوم الخميس من كل أسبوع. تأكد من صحة بيانات السحب الخاصة بك.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 px-6">
                  تعديل بيانات الدفع
                </Button>
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">طلبات السحب</h2>
                <Button onClick={() => setWithdrawalDialogOpen(true)} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl">
                  <Wallet className="w-4 h-4" />
                  سحب جديد
                </Button>
              </div>

              <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="font-bold text-foreground">سجل عمليات السحب</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">طريقة الدفع</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {withdrawals
                        .map((req: any) => (
                          <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4 font-bold text-foreground text-sm">{req.amount.toLocaleString()} دج</td>
                            <td className="p-4">
                              <p className="text-xs font-medium text-foreground">{req.method}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{req.accountDetails}</p>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                req.status === "pending" ? "bg-amber-100 text-amber-700" :
                                req.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {req.status === "pending" ? "قيد الانتظار" : req.status === "approved" ? "تم الدفع" : "مرفوض"}
                                </span>
                            </td>
                            <td className="p-4 text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString('ar-DZ')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Levels Tab */}
          {activeTab === "levels" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbLevels.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-card border-2 rounded-[2.5rem] p-8 relative overflow-hidden transition-all shadow-sm ${
                    currentLevelInfo.levelNumber === tier.levelNumber ? "border-primary shadow-xl shadow-primary/10" : "border-border/50 hover:border-primary/30"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${
                    tier.color === 'blue' ? 'from-blue-500 to-blue-700' :
                    tier.color === 'green' ? 'from-green-500 to-green-700' :
                    tier.color === 'purple' ? 'from-purple-500 to-purple-700' :
                    tier.color === 'orange' ? 'from-orange-500 to-orange-700' :
                    tier.color === 'gold' ? 'from-yellow-400 to-yellow-600' :
                    'from-gray-500 to-gray-700'
                  }`}>
                    <Trophy className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-3xl font-black text-foreground">المستوى {tier.levelNumber}</h3>
                    <p className="text-xl font-bold text-muted-foreground">{tier.name}</p>
                  </div>

                  <div className="mt-8 space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-foreground/80">{tier.targetOrders}+ طلبية مؤكدة</span>
                    </div>
                    {tier.reward && (
                      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl border border-dashed border-border">
                        <span className="text-xl">🎁</span>
                        <p className="text-xs font-bold leading-relaxed text-muted-foreground">{tier.reward}</p>
                      </div>
                    )}
                  </div>

                  {currentLevelInfo.levelNumber === tier.levelNumber && (
                    <div className="mt-6 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                      <Sparkles className="w-4 h-4" />
                      مستواك الحالي
                    </div>
                  )}

                  {currentLevelInfo.levelNumber < tier.levelNumber && (
                    <div className="mt-6 bg-muted/50 text-muted-foreground rounded-xl px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2">
                       قيد التقدم
                    </div>
                  )}

                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === "shipping" && (
            <div className="space-y-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Algeria Map Illustration */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="lg:w-1/3 bg-card rounded-[2.5rem] p-8 shadow-sm border border-border/50 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="relative z-10 w-full h-full flex flex-col items-center">
                    <h3 className="text-xl font-bold text-foreground mb-6 self-start">تغطية التوصيل عبر الوطن</h3>
                    <div className="w-full aspect-[4/5] relative">
                      {/* Stylized SVG Map of Algeria */}
                      <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-2xl">
                        <path
                          d="M150,50 L250,50 L300,100 L350,150 L350,250 L300,350 L250,450 L100,450 L50,350 L50,150 L100,100 Z"
                          className="fill-primary/10 stroke-primary/30 stroke-2"
                        />
                        {/* Highlights (North) */}
                        <path d="M150,50 L250,50 L300,100 L350,150 L250,150 L150,150 Z" className="fill-secondary/20 hover:fill-secondary/40 transition-colors cursor-pointer" />
                        {/* Cities dots */}
                        <circle cx="200" cy="80" r="5" className="fill-secondary animate-pulse" /> {/* Algiers */}
                        <circle cx="120" cy="120" r="4" className="fill-primary" /> {/* Oran */}
                        <circle cx="280" cy="110" r="4" className="fill-primary" /> {/* Constantine */}
                      </svg>
                      
                      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-secondary" />
                          <span className="text-xs font-bold">توصيل سريع (24-48 ساعة)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary/40" />
                          <span className="text-xs font-bold">توصيل عادي (3-7 أيام)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative backgrounds */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
                </motion.div>

                {/* Pricing Summary */}
                <div className="lg:w-2/3 space-y-6">
                  <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        مواعيد التسليم المتوقعة
                      </h4>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">الشمال</p>
                          <p className="font-bold text-lg">24 - 48 ساعة</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">الهضاب</p>
                          <p className="font-bold text-lg">2 - 4 أيام</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">الجنوب</p>
                          <p className="font-bold text-lg">5 - 10 أيام</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-[2.5rem] shadow-sm border border-border/50 overflow-hidden" dir="rtl">
                <div className="p-8 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-foreground">قائمة الأسعار حسب الولايات</h3>
                    <p className="text-muted-foreground mt-1 text-sm">تفاصيل تكاليف الشحن ومدة التوصيل لكل ولاية.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-64">
                    <div className="relative w-full">
                      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="ابحث عن ولاية..." 
                        value={shippingSearch}
                        onChange={(e) => {
                          setShippingSearch(e.target.value);
                          setShippingPage(1);
                        }}
                        className="pr-10 rounded-xl h-10 w-full border-border/60" 
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="p-6 font-bold text-foreground">الولاية</th>
                        <th className="p-6 font-bold text-foreground">التوصيل للمنزل</th>
                        <th className="p-6 font-bold text-foreground">التوصيل للمكتب</th>
                        <th className="p-6 font-bold text-foreground text-center">وقت التوصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border relative">
                      {paginatedShippingRates.length > 0 ? (
                        paginatedShippingRates.map((rate, idx) => (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                            <td className="p-6">
                              <span className="font-bold text-foreground text-lg">{rate.wilaya}</span>
                            </td>
                            <td className="p-6">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-black rounded-lg text-sm">
                                {rate.homePrice} دج
                              </span>
                            </td>
                            <td className="p-6">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary font-black rounded-lg text-sm">
                                {rate.officePrice} دج
                              </span>
                            </td>
                            <td className="p-6 text-center">
                              <span className="inline-flex items-center gap-2 text-muted-foreground font-medium">
                                <Clock className="w-4 h-4" />
                                {rate.deliveryTime}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-muted-foreground font-bold">
                            لا توجد ولاية تطابق البحث "{shippingSearch}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {totalShippingPages > 1 && (
                  <div className="p-6 border-t border-border flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={shippingPage === 1}
                        onClick={() => setShippingPage(prev => Math.max(1, prev - 1))}
                        className="rounded-xl font-bold"
                      >
                        السابق
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={shippingPage === totalShippingPages}
                        onClick={() => setShippingPage(prev => Math.min(totalShippingPages, prev + 1))}
                        className="rounded-xl font-bold"
                      >
                        التالي
                      </Button>
                    </div>
                    <div className="text-sm font-bold text-muted-foreground">
                      الصفحة {shippingPage} من {totalShippingPages}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">تواصل معنا</h3>
                <div className="space-y-4">
                  <a
                    href="https://wa.me/213555123456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-secondary/10 rounded-xl hover:bg-secondary/20 transition-colors"
                  >
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                      <span className="text-xl">💬</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">واتساب</p>
                      <p className="text-sm text-muted-foreground">رد سريع خلال 24 ساعة</p>
                    </div>
                  </a>
                  <a
                    href="mailto:support@linkdz.com"
                    className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">البريد الإلكتروني</p>
                      <p className="text-sm text-muted-foreground">support@linkdz.com</p>
                    </div>
                  </a>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">أسئلة شائعة</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="font-semibold text-foreground">متى تُحتسب العمولة؟</p>
                    <p className="text-sm text-muted-foreground mt-1">تُحتسب العمولة فقط على الطلبيات المسلّمة بنجاح.</p>
                  </div>
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="font-semibold text-foreground">كيف يتم الدفع؟</p>
                    <p className="text-sm text-muted-foreground mt-1">يتم التحويل تلقائياً كل نهاية أسبوع عبر CCP أو Baridimob.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Store Edit Tab */}
          {activeTab === "my_store_edit" && (
            <div className="space-y-8 max-w-5xl" dir="rtl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                    <LayoutTemplate className="w-8 h-8 text-primary" />
                    تخصيص مظهر المتجر
                  </h2>
                  <p className="text-muted-foreground mt-1">اجعل متجرك فريداً وجذاباً لزيادة المبيعات</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                   <Button 
                    variant="outline"
                    className="flex-1 sm:flex-none h-12 px-6 rounded-2xl gap-2 font-bold"
                    onClick={() => window.open('/products', '_blank')}
                  >
                    <Eye className="w-5 h-5" />
                    معاينة
                  </Button>
                  <Button 
                    onClick={saveStoreSettings}
                    className="flex-1 sm:flex-none bg-primary text-primary-foreground h-12 px-8 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Identity Section */}
                <div className="space-y-6">
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Store className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">الهوية البصرية</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">شريط الترحيب (Top Bar)</Label>
                        <Input 
                          value={storeSettings.welcomeBarText}
                          onChange={(e) => setStoreSettings({...storeSettings, welcomeBarText: e.target.value})}
                          placeholder="مثال: أهلاً بكم في متجرنا الرسمي..."
                          className="h-12 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">شعار المتجر (Logo)</Label>
                        <div className="flex items-center gap-4">
                          {storeSettings.storeLogo ? (
                            <div className="relative group w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-md bg-muted">
                              <img src={storeSettings.storeLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                                  <PlusCircle className="w-6 h-6" />
                                </div>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, 'logo');
                                  }}
                                />
                              </label>
                              <button 
                                onClick={() => setStoreSettings({...storeSettings, storeLogo: ""})}
                                className="absolute top-1 right-1 bg-destructive/80 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex-1 h-24 rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-all gap-2 group">
                              <div className="bg-primary/10 p-2 rounded-full text-primary/50 group-hover:text-primary transition-colors">
                                {isUploading ? <Sparkles className="w-6 h-6 animate-spin" /> : <PlusCircle className="w-6 h-6" />}
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary">ارفع شعار المتجر</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                disabled={isUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, 'logo');
                                }}
                              />
                            </label>
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="text-xs font-bold">هوية متجرك</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">يظهر الشعار في أعلى المتجر وفي فواتير الطلبيات. يفضل استخدام خلفية شفافة.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">اسم المتجر</Label>
                        <Input 
                          value={storeSettings.storeName}
                          onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                          placeholder="مثال: متجر النخبة"
                          className="h-12 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">نبذة عن المتجر</Label>
                        <Textarea 
                          value={storeSettings.storeIntro}
                          onChange={(e) => setStoreSettings({...storeSettings, storeIntro: e.target.value})}
                          placeholder="اكتب وصفاً قصيراً يظهر تحت اسم المتجر..."
                          className="min-h-[100px] rounded-xl bg-muted/30 border-none p-4"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Banner Manager Section */}
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">قسم الواجهة (Hero)</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">تفعيل</Label>
                        <input 
                          type="checkbox" 
                          checked={storeSettings.hero?.enabled ?? true}
                          onChange={(e) => setStoreSettings({...storeSettings, hero: {...storeSettings.hero, enabled: e.target.checked}})}
                          className="w-5 h-5 accent-primary cursor-pointer border-border rounded"
                        />
                      </div>
                    </div>

                    <div className={`space-y-4 transition-opacity ${(!storeSettings.hero?.enabled) ? "opacity-50 pointer-events-none" : ""}`}>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">العنوان الرئيسي</Label>
                        <Input 
                          value={storeSettings.hero?.title || ""}
                          onChange={(e) => setStoreSettings({...storeSettings, hero: {...storeSettings.hero, title: e.target.value}})}
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">العنوان الفرعي</Label>
                        <Input 
                          value={storeSettings.hero?.subtitle || ""}
                          onChange={(e) => setStoreSettings({...storeSettings, hero: {...storeSettings.hero, subtitle: e.target.value}})}
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">صورة الواجهة (Banner)</Label>
                        <div className="w-full">
                          {storeSettings.hero?.bannerUrl ? (
                            <div className="relative group w-full aspect-[21/9] rounded-[2rem] overflow-hidden border-2 border-primary/20 shadow-lg bg-muted">
                              <img src={storeSettings.hero.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-2">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                                  {isUploading ? <Sparkles className="w-8 h-8 animate-spin" /> : <PlusCircle className="w-8 h-8" />}
                                </div>
                                <span className="font-bold text-sm">تغيير الصورة</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, 'banner');
                                  }}
                                />
                              </label>
                              <button 
                                onClick={() => setStoreSettings({...storeSettings, hero: {...storeSettings.hero, bannerUrl: ""}})}
                                className="absolute top-4 right-4 bg-destructive/90 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full h-40 rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-all gap-3 group">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary/50 group-hover:text-primary transition-colors">
                                {isUploading ? <Sparkles className="w-8 h-8 animate-spin" /> : <PlusCircle className="w-8 h-8" />}
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold text-foreground">ارفع صورة الواجهة</p>
                                <p className="text-[10px] text-muted-foreground mt-1">المقاس الموصى به: 1920x800</p>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                disabled={isUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, 'banner');
                                }}
                              />
                            </label>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                           {[
                             { name: "تجميل", url: "https://images.unsplash.com/photo-1596462502278-27bfac4033c8?auto=format&fit=crop&q=80&w=800" },
                             { name: "تقنية", url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800" },
                             { name: "عام", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" }
                           ].map(p => (
                             <button 
                               key={p.url}
                               onClick={() => setStoreSettings({...storeSettings, hero: {...storeSettings.hero, bannerUrl: p.url}})}
                               className={`text-[10px] py-2 rounded-lg transition-all border ${storeSettings.hero?.bannerUrl === p.url ? "bg-primary text-white border-primary" : "bg-muted hover:bg-primary/10 border-transparent"}`}
                             >
                               {p.name}
                             </button>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template Selection Section */}
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">قالب المتجر</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: "modern", label: "مودرن جلاس", desc: "شفافية وعصرية", color: "from-blue-500/20 to-purple-500/20" },
                        { id: "minimal", label: "مينيمال", desc: "بسيط وأنيق", color: "from-gray-100 to-gray-200" },
                        { id: "bold", label: "جريء وحيوي", desc: "ألوان قوية", color: "from-primary/20 to-primary/40" },
                        { id: "dark", label: "كلاسيك داكن", desc: "فخامة وأناقة", color: "from-slate-800 to-slate-900" }
                      ].map((tpl) => (
                        <div 
                          key={tpl.id}
                          onClick={() => setStoreSettings({...storeSettings, templateId: tpl.id as any})}
                          className={`
                            relative cursor-pointer p-4 rounded-2xl border-2 transition-all group
                            ${storeSettings.templateId === tpl.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-muted/30"}
                          `}
                        >
                          <div className={`aspect-video rounded-xl mb-3 bg-gradient-to-br ${tpl.color} flex items-center justify-center`}>
                            {storeSettings.templateId === tpl.id && (
                              <div className="bg-primary text-white p-1 rounded-full shadow-lg">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <p className={`font-bold text-sm ${storeSettings.templateId === tpl.id ? "text-primary" : "text-foreground"}`}>{tpl.label}</p>
                          <p className="text-[10px] text-muted-foreground">{tpl.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <LayoutDashboard className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">تنسيق العرض</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                        <div className="space-y-0.5">
                          <Label className="font-bold">عدد المنتجات في السطر</Label>
                          <p className="text-xs text-muted-foreground">ينطبق على شاشات الحاسوب فقط</p>
                        </div>
                        <Select 
                          value={String(storeSettings.gridColumns)} 
                          onValueChange={(v) => setStoreSettings({...storeSettings, gridColumns: Number(v)})}
                        >
                          <SelectTrigger className="w-24 border-none bg-background rounded-xl h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">منشورين (2)</SelectItem>
                            <SelectItem value="3">3 منشورات</SelectItem>
                            <SelectItem value="4">4 منشورات</SelectItem>
                            <SelectItem value="5">5 منشورات</SelectItem>
                            <SelectItem value="6">6 منشورات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Color Customization Section */}
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                        <Palette className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">ألوان العلامة التجارية</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                        <div className="space-y-0.5">
                          <Label className="font-bold">اللون الأساسي</Label>
                          <p className="text-xs text-muted-foreground">سيطبق على الأزرار والأيقونات واللمسات الجمالية</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden" 
                            style={{ backgroundColor: storeSettings.primaryColor }}
                          >
                            <Input 
                              type="color" 
                              value={storeSettings.primaryColor}
                              onChange={(e) => setStoreSettings({...storeSettings, primaryColor: e.target.value})}
                              className="w-16 h-16 cursor-pointer opacity-0"
                            />
                          </div>
                          <Input 
                            value={storeSettings.primaryColor}
                            onChange={(e) => setStoreSettings({...storeSettings, primaryColor: e.target.value})}
                            className="w-24 h-10 rounded-lg text-xs font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography Selection Section */}
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                        <Type className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">خطوط المتجر</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                        <div className="space-y-0.5">
                          <Label className="font-bold">نوع الخط</Label>
                          <p className="text-xs text-muted-foreground">الخط يؤثر على انطباع الزوار</p>
                        </div>
                        <Select 
                          value={storeSettings.fontFamily || "Cairo"} 
                          onValueChange={(v) => setStoreSettings({...storeSettings, fontFamily: v as any})}
                        >
                          <SelectTrigger className="w-32 border-none bg-background rounded-xl h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cairo">Cairo (عصري)</SelectItem>
                            <SelectItem value="Tajawal">Tajawal (أنيق)</SelectItem>
                            <SelectItem value="IBM Plex Sans Arabic">IBM Plex (رسمي)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Analytics & Tracking Section */}
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                        <BarChart className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">التتبع والبيكسل (Tracking)</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">Facebook Pixel ID</Label>
                        <Input 
                          value={storeSettings.pixels?.facebook || ""}
                          onChange={(e) => setStoreSettings({
                            ...storeSettings, 
                            pixels: { ...storeSettings.pixels, facebook: e.target.value } as any
                          })}
                          placeholder="123456789012345"
                          className="h-11 rounded-xl bg-muted/30 border-none px-4 font-mono"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">TikTok Pixel ID</Label>
                        <Input 
                          value={storeSettings.pixels?.tiktok || ""}
                          onChange={(e) => setStoreSettings({
                            ...storeSettings, 
                            pixels: { ...storeSettings.pixels, tiktok: e.target.value } as any
                          })}
                          placeholder="CDG123456789ABCDEF"
                          className="h-11 rounded-xl bg-muted/30 border-none px-4 font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                </div>
                {/* Social & Contact Section */}
                <div className="space-y-6">
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">التواصل والروابط</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1 flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-[#1877F2]" /> فيسبوك
                        </Label>
                        <Input 
                          value={storeSettings.socialLinks.facebook}
                          onChange={(e) => setStoreSettings({...storeSettings, socialLinks: {...storeSettings.socialLinks, facebook: e.target.value}})}
                          placeholder="https://facebook.com/your-page"
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1 flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-[#E4405F]" /> انستغرام
                        </Label>
                        <Input 
                          value={storeSettings.socialLinks.instagram}
                          onChange={(e) => setStoreSettings({...storeSettings, socialLinks: {...storeSettings.socialLinks, instagram: e.target.value}})}
                          placeholder="https://instagram.com/your-profile"
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-secondary" /> رقم الهاتف
                        </Label>
                        <Input 
                          value={storeSettings.socialLinks.phone}
                          onChange={(e) => setStoreSettings({...storeSettings, socialLinks: {...storeSettings.socialLinks, phone: e.target.value}})}
                          placeholder="05xx xx xx xx"
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-500" /> واتساب
                        </Label>
                        <Input 
                          value={storeSettings.socialLinks.whatsapp}
                          onChange={(e) => setStoreSettings({...storeSettings, socialLinks: {...storeSettings.socialLinks, whatsapp: e.target.value}})}
                          placeholder="رقم الواتساب..."
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>
                      <Label className="text-sm font-bold flex items-center justify-between p-4 bg-muted/30 rounded-2xl cursor-pointer">
                        <span className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-emerald-500" /> 
                          إظهار زر الواتساب العائم للزوار
                        </span>
                        <input 
                          type="checkbox" 
                          checked={storeSettings.support?.whatsappFloating ?? true}
                          onChange={(e) => setStoreSettings({...storeSettings, support: {...storeSettings.support, whatsappFloating: e.target.checked}})}
                          className="w-5 h-5 accent-emerald-500 cursor-pointer border-border rounded"
                        />
                      </Label>
                    </div>
                  </div>

                  {/* Trust Badges (USPs) Section */}
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">شعارات الثقة (USPs)</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">تفعيل</Label>
                        <input 
                          type="checkbox" 
                          checked={storeSettings.usp?.enabled ?? true}
                          onChange={(e) => setStoreSettings({...storeSettings, usp: {...storeSettings.usp, enabled: e.target.checked}})}
                          className="w-5 h-5 accent-primary cursor-pointer border-border rounded"
                        />
                      </div>
                    </div>

                    <div className={`space-y-4 transition-opacity ${(!storeSettings.usp?.enabled) ? "opacity-50 pointer-events-none" : ""}`}>
                      <p className="text-xs text-muted-foreground mb-4">هذه الشعارات تظهر تحت قسم الواجهة الرئيسي وتزيد من ثقة العملاء.</p>
                      {storeSettings.usp?.items.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Select 
                            value={item.icon} 
                            onValueChange={(v) => {
                              const newItems = [...storeSettings.usp.items];
                              newItems[index].icon = v;
                              setStoreSettings({...storeSettings, usp: {...storeSettings.usp, items: newItems}});
                            }}
                          >
                            <SelectTrigger className="w-[120px] bg-muted/30 border-none rounded-xl h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Truck">سيارة التوصيل</SelectItem>
                              <SelectItem value="ShieldCheck">درع الحماية</SelectItem>
                              <SelectItem value="CreditCard">بطاقة بنك</SelectItem>
                              <SelectItem value="Package">صندوق</SelectItem>
                              <SelectItem value="Heart">قلب</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input 
                            value={item.text}
                            onChange={(e) => {
                              const newItems = [...storeSettings.usp.items];
                              newItems[index].text = e.target.value;
                              setStoreSettings({...storeSettings, usp: {...storeSettings.usp, items: newItems}});
                            }}
                            className="h-11 rounded-xl bg-muted/30 border-none px-4 flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 space-y-4">
                    <div className="flex items-center gap-4 text-primary">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">معاينة مباشرة للمتجر</h4>
                        <p className="text-xs opacity-70">شاهد كيف يظهر متجرك للعملاء</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-2xl border-primary/20 text-primary bg-background hover:bg-primary hover:text-white transition-all gap-2"
                      onClick={() => window.open('/products', '_blank')}
                    >
                      <Eye className="w-5 h-5" />
                      فتح رابط المتجر
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===== WITHDRAWAL REQUEST DIALOG ===== */}
      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Wallet className="w-5 h-5 text-secondary" /> طلب سحب الأرباح
            </DialogTitle>
            <DialogDescription>
              أدخل المبلغ وبيانات التحويل لسحب أرباحك.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">المبلغ المطلوب (دج)</Label>
              <Input
                type="number"
                placeholder="أدخل المبلغ..."
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="rounded-xl h-12 text-lg font-bold"
              />
              <p className="text-[11px] text-muted-foreground">الرصيد القابل للسحب: {dashboardStats.totalRevenue.toLocaleString()} دج</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">طريقة السحب</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CCP">CCP (البريد الجزائري)</SelectItem>
                  <SelectItem value="Baridimob">Baridimob</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">رقم الحساب / RIP</Label>
              <Input
                placeholder="أدخل رقم الحساب..."
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-start gap-2">
            <Button
              className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-bold"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  const res = await fetch('https://profit-link-3eri.onrender.com/api/finance/withdraw', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({
                      amount: withdrawAmount,
                      method: withdrawMethod,
                      accountDetails: withdrawAccount
                    })
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error || "Failed to request withdrawal");
                  
                  toast({ title: "تم إرسال طلب السحب بنجاح! ✅" });
                  setWithdrawalDialogOpen(false);
                  setWithdrawAmount("");
                  setWithdrawAccount("");
                } catch (err: any) {
                  toast({ title: "خطأ", description: err.message, variant: "destructive" });
                }
              }}
            >
              تأكيد الطلب
            </Button>
            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => setWithdrawalDialogOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PRODUCT DETAIL DIALOG ===== */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none bg-background shadow-2xl" dir="rtl">
          {selectedProduct && (
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Gallery Side */}
              <div className="lg:w-1/2 p-6 lg:p-10 bg-muted/30 relative">
                <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-inner mb-6 space-y-4">
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={selectedProduct.image}
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {selectedProduct.images.map((img: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedProduct({...selectedProduct, image: img})}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedProduct.image === img ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute top-10 left-10 rounded-full gap-2 backdrop-blur-md"
                  onClick={() => {
                    // Logic to download image would go here
                    toast({ title: "بدأ تحميل الصور... 📥" });
                  }}
                >
                  <Download className="w-4 h-4" />
                  تحميل الصور
                </Button>
              </div>

              {/* Content Side */}
              <div className="lg:w-1/2 p-8 lg:p-12 space-y-8 flex flex-col">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <button 
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={`p-2.5 rounded-full transition-all ${favorites.has(selectedProduct.id) ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.has(selectedProduct.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-3xl font-black text-foreground">{selectedProduct.name}</h2>
                    <Button variant="ghost" size="icon" onClick={() => {
                      navigator.clipboard.writeText(selectedProduct.name);
                      toast({ title: "تم نسخ الاسم" });
                    }}>
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-muted/50 p-4 rounded-2xl">
                    <p className="text-xs text-muted-foreground mb-1">سعر البيع النهائي</p>
                    <p className="text-2xl font-black text-primary">{selectedProduct.price.toLocaleString()} دج</p>
                  </div>
                  <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">عمولتك الصافية</p>
                    <p className="text-2xl font-black text-secondary">{selectedProduct.commission.toLocaleString()} دج</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      النص الإعلاني الجاهز
                    </h4>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={() => {
                      navigator.clipboard.writeText(selectedProduct.adText);
                      toast({ title: "تم نسخ النص الإعلاني ✨" });
                    }}>
                      <Copy className="w-3.5 h-3.5" />
                      نسخ النص
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-5 rounded-2xl border border-border/50 text-sm leading-relaxed text-muted-foreground italic">
                    {selectedProduct.adText || "لا يوجد نص إعلاني متوفر حالياً لهذا المنتج."}
                  </div>
                </div>

                <div className="mt-auto pt-6 flex gap-4">
                  <Button 
                    className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg gap-3 shadow-xl shadow-primary/20"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      openOrderForm(selectedProduct);
                    }}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    اطلب المنتج الآن
                  </Button>
                  <Link 
                    to={`/product/${selectedProduct.id}/${user?.id || "aff-demo"}`} 
                    target="_blank"
                    className="flex-1"
                  >
                    <Button 
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-2 font-black text-lg gap-3"
                    >
                      <Globe className="w-6 h-6" />
                      صفحة المنتج
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className={`h-14 w-14 rounded-2xl border-2 flex items-center justify-center ${storeProducts.has(selectedProduct.id) ? "border-secondary text-secondary bg-secondary/5" : "border-border"}`}
                    onClick={() => toggleStoreProduct(selectedProduct.id)}
                  >
                    <PackagePlus className="w-7 h-7" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== MANUAL ORDER DIALOG ===== */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 border-none overflow-hidden max-h-[95vh] flex flex-col" dir="rtl">
          <DialogHeader className="hidden">
            <DialogTitle>تسجيل طلب يدوي</DialogTitle>
            <DialogDescription>سيتم تسجيل هذا الطلب باسمك وستحصل على العمولة بعد التسليم.</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="bg-primary p-8 text-primary-foreground flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-1">تسجيل طلب يدوي</h2>
                  <p className="opacity-80">سيتم تسجيل هذا الطلب باسمك وستحصل على العمولة بعد التسليم.</p>
                </div>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <User className="w-4 h-4 text-primary" /> الاسم الأول
                    </Label>
                    <Input 
                      value={orderFormData.firstName}
                      onChange={(e) => setOrderFormData({ ...orderFormData, firstName: e.target.value })}
                      placeholder="محمد"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <User className="w-4 h-4 text-primary" /> اللقب (العائلة)
                    </Label>
                    <Input 
                      value={orderFormData.lastName}
                      onChange={(e) => setOrderFormData({ ...orderFormData, lastName: e.target.value })}
                      placeholder="عزوز"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <Phone className="w-4 h-4 text-primary" /> رقم الهاتف
                    </Label>
                    <Input 
                      value={orderFormData.phone}
                      onChange={(e) => setOrderFormData({ ...orderFormData, phone: e.target.value })}
                      placeholder="0XXXXXXXXX"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <MapPin className="w-4 h-4 text-primary" /> الولاية
                    </Label>
                    <Select 
                      value={orderFormData.wilaya} 
                      onValueChange={(v) => setOrderFormData({ ...orderFormData, wilaya: v, commune: "" })}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="اختر الولاية" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {shippingRates.map((rate) => (
                          <SelectItem key={rate.code} value={rate.code}>
                            {rate.code} - {rate.wilaya}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <MapPin className="w-4 h-4 text-primary" /> البلدية
                    </Label>
                    <Select 
                      value={orderFormData.commune} 
                      onValueChange={(v) => {
                        const communeObj = communes.find(c => c.nom === v);
                        const isStopDeskAvailable = communeObj?.has_stop_desk !== 0;
                        setOrderFormData({ 
                          ...orderFormData, 
                          commune: v,
                          deliveryType: (!isStopDeskAvailable && orderFormData.deliveryType === "office") ? "home" : orderFormData.deliveryType
                        });
                      }}
                      disabled={!orderFormData.wilaya || loadingCommunes}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder={loadingCommunes ? "جاري التحميل..." : "اختر البلدية"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {communes.map((c: any) => (
                          <SelectItem key={c.nom || c.commune_id} value={c.nom || c.commune_name}>
                            {c.nom || c.commune_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <Truck className="w-4 h-4 text-primary" /> نوع التوصيل
                    </Label>
                    <Select 
                      value={orderFormData.deliveryType} 
                      onValueChange={(v: any) => setOrderFormData({ ...orderFormData, deliveryType: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home" className="text-right" dir="rtl">توصيل للمنزل</SelectItem>
                        <SelectItem 
                          value="office" 
                          className="text-right" 
                          dir="rtl"
                          disabled={communes.find(c => c.commune_name === orderFormData.commune)?.has_stop_desk === 0}
                        >
                          توصيل للمكتب (Stop Desk) {!communes.find(c => c.commune_name === orderFormData.commune)?.has_stop_desk && orderFormData.commune && "(غير متوفر)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                    <MapPin className="w-4 h-4 text-primary" /> العنوان بالتفصيل
                  </Label>
                  <Input 
                    placeholder="رقم المنزل، الشارع، البلدية..." 
                    className="h-12 rounded-2xl border-border/60"
                    value={orderFormData.address}
                    onChange={(e) => setOrderFormData({...orderFormData, address: e.target.value})}
                  />
                </div>

                <div className="bg-muted/40 p-6 rounded-[2rem] border border-border/40 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">سعر المنتج:</span>
                    <span className="font-bold">{selectedProduct.price.toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground text-sm">سعر التوصيل:</span>
                    <div className="w-32">
                      <Input 
                        type="number" 
                        value={orderFormData.deliveryFee}
                        onChange={(e) => setOrderFormData({...orderFormData, deliveryFee: Number(e.target.value)})}
                        className="h-10 rounded-xl font-bold text-center bg-background border-none shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="h-px bg-border/60 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">السعر الكلي:</span>
                    <span className="text-3xl font-black text-secondary">
                      {(selectedProduct.price + orderFormData.deliveryFee).toLocaleString()} دج
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 h-16 rounded-[1.5rem] bg-secondary text-secondary-foreground font-black text-xl shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={async () => {
                      if (!orderFormData.firstName || !orderFormData.lastName || !orderFormData.phone || !orderFormData.address || !orderFormData.wilaya || !orderFormData.commune) {
                        toast({ title: "يرجى ملء كافة البيانات الأساسية", description: "تأكد من اختيار البلدية واللقب", variant: "destructive" });
                        return;
                      }

                      try {
                        const response = await fetch('https://profit-link-3eri.onrender.com/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            productId: selectedProduct.id,
                            affiliateId: user?.id || "aff-demo-123",
                            customerName: `${orderFormData.firstName} ${orderFormData.lastName}`,
                            customerPhone: orderFormData.phone,
                            wilaya: orderFormData.wilaya,
                            commune: orderFormData.commune, // Added
                            address: orderFormData.address,
                            quantity: 1,
                            totalAmount: selectedProduct.price + orderFormData.deliveryFee,
                            commissionAmount: selectedProduct.commission,
                            shippingFee: orderFormData.deliveryFee, // Added
                            stopDesk: orderFormData.stopDesk // Added
                          })
                        });

                        if (!response.ok) throw new Error('Order failed');

                        toast({ title: "تم تسجيل الطلب بنجاح! 🚀", description: "سيتم تتبع الطلب من قسم طلبياتي." });
                        setIsOrderDialogOpen(false);
                        setOrderFormData({ firstName: "", lastName: "", phone: "", wilaya: "", commune: "", address: "", deliveryType: "home", stopDesk: 0, deliveryFee: 500 });
                        
                        // Refetch orders immediately
                        const currentToken = localStorage.getItem("token");
                        const res = await fetch('https://profit-link-3eri.onrender.com/api/orders/affiliate', {
                          headers: { 'Authorization': `Bearer ${currentToken}` }
                        });
                        const data = await res.json();
                        if (res.ok) {
                            setOrders(data.data.map((o: any) => ({
                                id: o.id,
                                productName: o.product?.name || "منتج محذوف",
                                customerName: o.customerName,
                                customerPhone: o.customerPhone,
                                wilaya: o.wilaya,
                                address: o.address,
                                status: o.status.toLowerCase(),
                                amount: o.totalAmount, // Final sale price
                                commission: o.commissionAmount,
                                date: new Date(o.createdAt).toLocaleDateString('ar-DZ'),
                                trackingNumber: o.trackingNumber
                            })));
                        }
                      } catch (error) {
                        toast({ title: "فشل تسجيل الطلب", description: "يرجى المحاولة مرة أخرى", variant: "destructive" });
                      }
                    }}
                  >
                    تأكيد الطلب نهائياً
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 px-8 rounded-[1.5rem] border-2"
                    onClick={() => setIsOrderDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
