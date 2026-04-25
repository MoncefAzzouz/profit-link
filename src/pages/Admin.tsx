import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet,
  Settings, Menu, X, TrendingUp, CheckCircle, XCircle,
  Truck, Clock, Eye, Edit, Ban, Search, Filter, Plus, Trophy, Sparkles,
  BarChart3, ChevronLeft, AlertTriangle, SlidersHorizontal, Store, UserPlus, Check, MapPin, CreditCard,
  Video, Star, EyeOff, Trash2, Upload, FileText, Film, Image as ImageIcon, User, LayoutTemplate, Layers, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { mockProducts, Product } from "@/data/mockProducts";
import { mockAffiliates, mockAdminStats, mockAllOrders, mockSellers, mockWithdrawalRequests, WithdrawalRequest, mockJoinRequests, JoinRequest } from "@/data/mockAdminData";
import { wilayas } from "@/data/mockAffiliateData";
import { ShippingRate, shippingRegions } from "@/data/mockShippingData";
import { LandingSettings, defaultLandingSettings } from "@/data/landingSettings";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import LandingPageBuilder from "@/components/seller/LandingPageBuilder";

type Tab = "overview" | "affiliates" | "join_requests" | "orders" | "products" | "categories" | "analytics" | "withdrawals" | "settings" | "shipping" | "landing_editor" | "landing_pages" | "levels";

const statusConfig = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
  shipped: { label: "قيد التوصيل", icon: Truck, color: "text-purple-600 bg-purple-100" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-secondary bg-secondary/10" },
  cancelled: { label: "ملغي", icon: XCircle, color: "text-destructive bg-destructive/10" }
};

const affiliateStatusConfig = {
  active: { label: "نشط", color: "text-secondary bg-secondary/10" },
  suspended: { label: "موقوف", color: "text-destructive bg-destructive/10" },
  pending: { label: "قيد المراجعة", color: "text-yellow-600 bg-yellow-100" },
};

const revenueData = [
  { month: "يناير", revenue: 850000, commissions: 390000 },
  { month: "فبراير", revenue: 1200000, commissions: 552000 },
  { month: "مارس", revenue: 980000, commissions: 450800 },
  { month: "أبريل", revenue: 1450000, commissions: 667000 },
  { month: "مايو", revenue: 1680000, commissions: 772800 },
  { month: "يونيو", revenue: 2100000, commissions: 966000 },
];

const orderDistribution = [
  { name: "مسلّمة", value: 3890, color: "hsl(142, 76%, 36%)" },
  { name: "قيد التوصيل", value: 320, color: "hsl(262, 83%, 58%)" },
  { name: "مؤكدة", value: 180, color: "hsl(217, 91%, 60%)" },
  { name: "ملغاة", value: 177, color: "hsl(0, 84%, 60%)" },
];

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [affiliateStatus, setAffiliateStatus] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("الكل");
  const [productPriceRange, setProductPriceRange] = useState(0);
  const [productSort, setProductSort] = useState("default");
  const [productStockFilter, setProductStockFilter] = useState("all");
  const [showProductFilters, setShowProductFilters] = useState(false);
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatus, setSellerStatus] = useState("all");
  const [withdrawalSearch, setWithdrawalSearch] = useState("");
  const [withdrawalStatus, setWithdrawalStatus] = useState("all");
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(mockJoinRequests);
  const [joinSearch, setJoinSearch] = useState("");
  const [joinRole, setJoinRole] = useState("all");
  const [shippingSearch, setShippingSearch] = useState("");
  const [shippingRatesData, setShippingRatesData] = useState<any[]>([]);
  const [isFetchingShipping, setIsFetchingShipping] = useState(false);
  const [shippingPage, setShippingPage] = useState(1);
  const shippingItemsPerPage = 10;

  // Admin Dashboard Stats (live from DB)
  const [adminStats, setAdminStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    confirmationRate: 0,
    totalAffiliates: 0,
    activeAffiliates: 0,
    ordersThisMonth: 0,
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isFetchingWithdrawals, setIsFetchingWithdrawals] = useState(false);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [isFetchingAffiliates, setIsFetchingAffiliates] = useState(false);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  // Authentication & Authorization Check
  useEffect(() => {
    const userStr = localStorage.getItem("affiliate_user");
    if (!userStr) {
      navigate("/auth");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      const role = (user.role || "").toUpperCase();
      if (role !== "ADMIN") {
        toast({ 
          variant: "destructive", 
          title: "غير مصرح", 
          description: "ليس لديك صلاحية للوصول لصفحة الإدارة" 
        });
        navigate("/dashboard");
      }
    } catch (e) {
      localStorage.removeItem("affiliate_user");
      localStorage.removeItem("token");
      navigate("/auth");
    }
  }, [navigate, toast]);

  // Fetch admin stats from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchAdminStats = async () => {
      try {
        const res = await fetch('https://profit-link-3eri.onrender.com/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdminStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      }
    };

    fetchAdminStats();
    const interval = setInterval(fetchAdminStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWithdrawals = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setIsFetchingWithdrawals(true);
    try {
      const res = await fetch('https://profit-link-3eri.onrender.com/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals', err);
    } finally {
      setIsFetchingWithdrawals(false);
    }
  };

  const fetchAffiliates = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsFetchingAffiliates(true);
    try {
      const res = await fetch('https://profit-link-3eri.onrender.com/api/admin/affiliates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAffiliates(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch affiliates', err);
    } finally {
      setIsFetchingAffiliates(false);
    }
  };

  const fetchAllOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsFetchingOrders(true);
    try {
      const res = await fetch('https://profit-link-3eri.onrender.com/api/orders/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch all orders', err);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    fetchAffiliates();
    fetchAllOrders();
  }, []);

  const updateWithdrawalStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`https://profit-link-3eri.onrender.com/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast({ 
          title: status === 'approved' ? "تم قبول الطلب" : "تم رفض الطلب", 
          description: status === 'approved' ? "سيتم تحويل المبلغ قريباً" : "تم تحديث الحالة بنجاح" 
        });
        fetchWithdrawals(); // Refresh list
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      toast({ title: "خطأ", description: "فشل تحديث الحالة", variant: "destructive" });
    }
  };
  
  // Landing Page Editor State
  const [landingSettings, setLandingSettings] = useState<LandingSettings>(() => {
    const saved = localStorage.getItem("landing_page_settings");
    return saved ? JSON.parse(saved) : defaultLandingSettings;
  });

  const saveLandingSettings = () => {
    localStorage.setItem("landing_page_settings", JSON.stringify(landingSettings));
    toast({
      title: "تم حفظ الإعدادات بنجاح ✅",
      description: "سيتم تطبيق التغييرات على الصفحة الرئيسية فوراً.",
    });
  };
  
  // Product Management States
  const [products, setProducts] = useState<any[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productToEditLandingPage, setProductToEditLandingPage] = useState<any>(null);
  const [productFormData, setProductFormData] = useState<any>({
    name: "",
    description: "",
    adText: "",
    price: 0,
    originalPrice: 0,
    commission: 0,
    category: "إلكترونيات",
    stock: 0,
    image: "",
    videoUrl: "",
    isVisible: true,
    isTrend: false,
    isFeatured: false,
    adMaterials: []
  });

  // Category Management States
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<any>({ name: "", icon: "📦", isActive: true });

  // Levels Management States
  const [dbLevels, setDbLevels] = useState<any[]>([]);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any | null>(null);
  const [levelFormData, setLevelFormData] = useState<any>({ 
    name: "", 
    levelNumber: 1, 
    targetOrders: 0, 
    reward: "", 
    color: "blue" 
  });

  const activeCategories = useMemo(() => {
    return ["الكل", ...dbCategories.filter(c => c.isActive).map(c => c.name)];
  }, [dbCategories]);

  // Fetch categories from DB
  const fetchCategories = async () => {
    try {
      const res = await fetch('https://profit-link-3eri.onrender.com/api/products/categories/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const json = await res.json();
        setDbCategories(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  // Fetch products from DB
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch('https://profit-link-3eri.onrender.com/api/products/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    // Load persisted requests
    const persistedReqs = JSON.parse(localStorage.getItem("admin_join_requests") || "[]");
    const uniqueReqs = [...persistedReqs, ...mockJoinRequests].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    setJoinRequests(uniqueReqs);

    // Fetch products from backend
    fetchProducts();
    fetchCategories();
    fetchLevels();
  }, []);

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

  const handleSaveLevel = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const url = editingLevel 
        ? `https://profit-link-3eri.onrender.com/api/levels/${editingLevel.id}`
        : 'https://profit-link-3eri.onrender.com/api/levels';
      const method = editingLevel ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(levelFormData)
      });

      if (res.ok) {
        toast({ title: "تم الحفظ بنجاح ✅" });
        setIsLevelDialogOpen(false);
        fetchLevels();
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast({ title: "خطأ", description: "فشل حفظ المستوى", variant: "destructive" });
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستوى؟")) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`https://profit-link-3eri.onrender.com/api/levels/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "تم الحذف بنجاح" });
        fetchLevels();
      }
    } catch (err) {
      toast({ title: "خطأ", description: "فشل حذف المستوى", variant: "destructive" });
    }
  };

  // Fetch Shipping Rates
  useEffect(() => {
    if (activeTab === "shipping") {
      const fetchShipping = async () => {
        setIsFetchingShipping(true);
        try {
          const res = await fetch('https://profit-link-3eri.onrender.com/api/delivery/all-rates');
          const data = await res.json();
          if (res.ok) {
            setShippingRatesData(data.data);
          }
        } catch (error) {
          console.error('Error fetching shipping fees:', error);
          toast({ title: "خطأ في جلب بيانات الشحن", variant: "destructive" });
        } finally {
          setIsFetchingShipping(false);
        }
      };
      fetchShipping();
    }
  }, [activeTab]);

  // Reset shipping page on search
  useEffect(() => {
    setShippingPage(1);
  }, [shippingSearch]);



  const sidebarItems = [
    { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "products" as Tab, label: "المنتجات", icon: Package },
    { id: "categories" as Tab, label: "التصنيفات", icon: Layers },
    { id: "affiliates" as Tab, label: "المسوّقين", icon: Users },

    { id: "join_requests" as Tab, label: "طلبات الانضمام", icon: UserPlus },
    { id: "orders" as Tab, label: "الطلبيات", icon: ShoppingCart },
    { id: "withdrawals" as Tab, label: "طلبات السحب", icon: Wallet },
    { id: "levels" as Tab, label: "المستويات", icon: Trophy },
    { id: "shipping" as Tab, label: "التوصيل", icon: Truck },
    { id: "landing_editor" as Tab, label: "تعديل الواجهة", icon: LayoutTemplate },
    { id: "landing_pages" as Tab, label: "صفحات الهبوط", icon: FileText },
    { id: "analytics" as Tab, label: "الإحصائيات", icon: BarChart3 },
    { id: "settings" as Tab, label: "الإعدادات", icon: Settings },
  ];

  const getAffiliateLevel = (confirmedCount: number) => {
    if (confirmedCount >= 500) return "5";
    if (confirmedCount >= 200) return "4";
    if (confirmedCount >= 50) return "3";
    if (confirmedCount >= 10) return "2";
    return "1";
  };

  const getWilayaName = (codeOrName: string) => {
    if (!codeOrName) return "";
    const rate = shippingRatesData.find(r => r.code === codeOrName || r.wilaya === codeOrName);
    if (rate) return rate.wilaya;
    return codeOrName;
  };

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter((affiliate) => {
      const matchesSearch = affiliate.name.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
        affiliate.email.toLowerCase().includes(affiliateSearch.toLowerCase());
      const matchesStatus = affiliateStatus === "all" || affiliate.status === affiliateStatus;
      return matchesSearch && matchesStatus;
    });
  }, [affiliates, affiliateSearch, affiliateStatus]);

  const filteredSellers = useMemo(() => {
    return mockSellers.filter((seller) => {
      const matchesSearch = seller.name.includes(sellerSearch) ||
        seller.email.includes(sellerSearch) ||
        seller.storeName.includes(sellerSearch) ||
        seller.phone.includes(sellerSearch);
      const matchesStatus = sellerStatus === "all" || seller.status === sellerStatus;
      return matchesSearch && matchesStatus;
    });
  }, [sellerSearch, sellerStatus]);

  const filteredOrders = useMemo(() => {
    return dbOrders.filter((order) => {
      const productName = order.product?.name || order.productName || "";
      const affiliateName = order.affiliate?.name || order.affiliateName || "";
      const matchesSearch = productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        affiliateName.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatus === "all" || order.status.toLowerCase() === orderStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [dbOrders, orderSearch, orderStatus]);

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((req) => {
      const name = req.requesterName || "";
      const details = req.accountDetails || "";
      const matchesSearch = name.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
        details.toLowerCase().includes(withdrawalSearch.toLowerCase());
      const matchesStatus = withdrawalStatus === "all" || req.status === withdrawalStatus;
      return matchesSearch && matchesStatus;
    });
  }, [withdrawals, withdrawalSearch, withdrawalStatus]);

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
  }, [productSearch, productCategory, productPriceRange, productSort, productStockFilter]);

  const filteredJoinRequests = useMemo(() => {
    return joinRequests.filter((req) => {
      const matchesSearch = req.name.includes(joinSearch) || req.email.includes(joinSearch) || req.phone.includes(joinSearch);
      const matchesRole = joinRole === "all" || req.role === joinRole;
      return matchesSearch && matchesRole;
    });
  }, [joinRequests, joinSearch, joinRole]);

  const handleApproveJoin = (id: string) => {
    setJoinRequests(prev => {
      const updated = prev.filter(r => r.id !== id);
      // Persist to localStorage (only the ones not in mock data ideally, but for simulation let's just save the current ones minus mocks if we want, or just filter localStorage)
      const persisted = JSON.parse(localStorage.getItem("admin_join_requests") || "[]");
      localStorage.setItem("admin_join_requests", JSON.stringify(persisted.filter((r: any) => r.id !== id)));
      return updated;
    });
    toast({ title: "تم قبول الطلب بنجاح ✅", description: "تم تفعيل حساب المستخدم وإرسال بريد إلكتروني له." });
  };

  const handleRejectJoin = (id: string) => {
    setJoinRequests(prev => {
      const updated = prev.filter(r => r.id !== id);
      const persisted = JSON.parse(localStorage.getItem("admin_join_requests") || "[]");
      localStorage.setItem("admin_join_requests", JSON.stringify(persisted.filter((r: any) => r.id !== id)));
      return updated;
    });
    toast({ title: "تم رفض الطلب", variant: "destructive" });
  };

  // Category CRUD Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: "", icon: "📦", isActive: true });
    setIsCategoryDialogOpen(true);
  };

  const handleOpenEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({ ...category });
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const url = editingCategory
        ? `https://profit-link-3eri.onrender.com/api/products/categories/${editingCategory.id}`
        : 'https://profit-link-3eri.onrender.com/api/products/categories';

      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryFormData)
      });

      if (!res.ok) throw new Error('Failed to save category');

      setIsCategoryDialogOpen(false);
      fetchCategories();
      toast({ title: editingCategory ? "تم تحديث التصنيف بنجاح" : "تم إضافة التصنيف بنجاح" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://profit-link-3eri.onrender.com/api/products/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchCategories();
      toast({ title: "تم حذف التصنيف", variant: "destructive" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://profit-link-3eri.onrender.com/api/products/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchCategories();
      toast({ title: "تم تحديث حالة التصنيف" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  // Product CRUD Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      name: "",
      description: "",
      adText: "",
      price: 0,
      originalPrice: 0,
      commission: 0,
      category: "إلكترونيات",
      stock: 0,
      image: "",
      videoUrl: "",
      isVisible: true,
      isTrend: false,
      isFeatured: false,
      adMaterials: []
    });
    setIsProductDialogOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({ ...product });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      const payload = {
        name: productFormData.name,
        description: productFormData.description,
        adText: productFormData.adText,
        price: productFormData.price,
        originalPrice: productFormData.originalPrice,
        commission: productFormData.commission,
        category: productFormData.category,
        stock: productFormData.stock,
        image: productFormData.image,
        images: productFormData.image ? [productFormData.image] : [],
        videoUrl: productFormData.videoUrl,
        isVisible: productFormData.isVisible,
        isTrend: productFormData.isTrend,
        isFeatured: productFormData.isFeatured,
        features: productFormData.features || []
      };

      const url = editingProduct
        ? `https://profit-link-3eri.onrender.com/api/products/${editingProduct.id}`
        : 'https://profit-link-3eri.onrender.com/api/products';

      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save product');

      setIsProductDialogOpen(false);
      fetchProducts(); // Refresh list from DB
      toast({
        title: editingProduct ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح",
        description: `المنتج "${productFormData.name}" جاهز الآن.`,
      });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://profit-link-3eri.onrender.com/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchProducts();
      toast({ title: "تم حذف المنتج", variant: "destructive" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleProductStatus = async (id: string, field: string) => {
    const token = localStorage.getItem("token");
    const product = products.find(p => p.id === id);
    if (!product) return;

    try {
      const res = await fetch(`https://profit-link-3eri.onrender.com/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: !product[field] })
      });
      if (!res.ok) throw new Error('Failed to update');
      fetchProducts();
      toast({ title: "تم تحديث حالة المنتج" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const { paginatedShippingRates, totalShippingPages } = useMemo(() => {
    const listToFilter = shippingRatesData;
    const filtered = listToFilter.filter(rate => 
      rate.wilaya.includes(shippingSearch)
    );
    // Sort by code numerically
    filtered.sort((a, b) => parseInt(a.code || "0") - parseInt(b.code || "0"));
    
    const totalPages = Math.ceil(filtered.length / shippingItemsPerPage);
    const paginated = filtered.slice((shippingPage - 1) * shippingItemsPerPage, shippingPage * shippingItemsPerPage);
    
    return { 
      paginatedShippingRates: paginated, 
      totalShippingPages: totalPages 
    };
  }, [shippingSearch, shippingRatesData, shippingPage]);

  const handleSuspendAffiliate = (id: string) => {
    toast({ title: "تم إيقاف المسوّق" });
  };

  const handleUpdateOrderStatus = (id: string, status: string) => {
    toast({ title: `تم تحديث حالة الطلبية إلى ${status}` });
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate_user");
    localStorage.removeItem("token");
    toast({ title: "تم تسجيل الخروج" });
    navigate("/");
  };

  return (
    <div className="dashboard-page-admin">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 shrink-0 bg-gradient-to-b from-slate-900 via-[hsl(222,47%,12%)] to-[hsl(222,47%,7%)] text-white border-l border-white/[0.07] shadow-[4px_0_40px_-12px_rgba(0,0,0,0.45)] transform transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 pt-5 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-white/10">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight">LinkDZ</span>
                  <span className="block text-xs text-emerald-200/85 font-medium">لوحة الإدارة</span>
                </div>
              </Link>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${activeTab === item.id
                    ? "bg-white/[0.12] text-white shadow-lg shadow-black/25 ring-1 ring-emerald-400/35"
                    : "text-white/65 hover:bg-white/[0.08] hover:text-white"
                  }`}
              >
                <item.icon className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08] shrink-0">
            <Link to="/dashboard">
              <Button variant="secondary" className="w-full gap-2 rounded-xl bg-white/10 text-white border-white/15 hover:bg-white/20 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
                العودة للداشبورد
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-border/50 bg-white/90 backdrop-blur-xl px-4 md:px-6 py-3.5 shadow-sm supports-[backdrop-filter]:bg-white/80 dark:bg-slate-950/80">
          <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto w-full">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-muted/90 border border-transparent hover:border-border/60 transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-center lg:justify-start">
              <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight truncate">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5 py-1 rounded-full bg-muted/90 border border-border/50">
                Admin
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-navy-800 flex items-center justify-center ring-2 ring-emerald-500/20 shadow-md">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
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

        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="dash-card-interactive p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">إجمالي الإيرادات</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {adminStats.totalRevenue.toLocaleString()}
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
                  className="dash-card-interactive p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">المسوّقين النشطين</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {adminStats.activeAffiliates}
                      </p>
                      <p className="text-sm text-secondary">من {adminStats.totalAffiliates}</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="dash-card-interactive p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">إجمالي الطلبيات</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {adminStats.totalOrders}
                      </p>
                      <p className="text-sm text-secondary">+{adminStats.ordersThisMonth} هذا الشهر</p>
                    </div>
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="dash-card-interactive p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">نسبة التأكيد</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {adminStats.confirmationRate}%
                      </p>
                      <p className="text-sm text-secondary">معدل ممتاز</p>
                    </div>
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-secondary" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="dash-card-interactive p-6"
                >
                  <h3 className="text-lg font-bold text-foreground mb-4">الإيرادات والعمولات</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [`${value.toLocaleString()} دج`, ""]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" fill="url(#revenueGradient)" name="الإيرادات" />
                        <Area type="monotone" dataKey="commissions" stroke="hsl(217, 91%, 60%)" fill="url(#commissionGradient)" name="العمولات" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="dash-card-interactive p-6"
                >
                  <h3 className="text-lg font-bold text-foreground mb-4">توزيع الطلبيات</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {orderDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} طلبية`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {orderDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="dash-card overflow-hidden"
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">آخر الطلبيات</h2>
                  <button onClick={() => setActiveTab("orders")} className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline">
                    عرض الكل <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                  {dbOrders.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>لا توجد طلبيات حالياً</p>
                    </div>
                  ) : (
                    dbOrders.slice(0, 5).map((order) => {
                      const status = (statusConfig as any)[order.status.toLowerCase()] || statusConfig.pending;
                      const productName = order.product?.name || order.productName || "منتج غير معروف";
                      const affiliateName = order.affiliate?.name || order.affiliateName || "مسوّق غير معروف";
                      return (
                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.color}`}>
                              <status.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{productName}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <Users className="w-3 h-3" /> {affiliateName} 
                                <span className="opacity-30">•</span> 
                                <MapPin className="w-3 h-3" /> {getWilayaName(order.wilaya)}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-foreground text-sm">{order.totalAmount.toLocaleString()} دج</p>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
              </motion.div>
            </div>
          )}

          {/* Affiliates Tab */}
          {activeTab === "affiliates" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن مسوّق..."
                    value={affiliateSearch}
                    onChange={(e) => setAffiliateSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={affiliateStatus} onValueChange={setAffiliateStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="suspended">موقوف</SelectItem>
                    <SelectItem value="pending">قيد المراجعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Affiliates Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">المسوّق</th>
                        <th className="text-right p-4 font-semibold text-foreground">المستوى</th>
                        <th className="text-right p-4 font-semibold text-foreground">الطلبيات</th>
                        <th className="text-right p-4 font-semibold text-foreground">الأرباح</th>
                        <th className="text-right p-4 font-semibold text-foreground">نسبة التأكيد</th>
                        <th className="text-right p-4 font-semibold text-foreground">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isFetchingAffiliates ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                              <p className="text-muted-foreground animate-pulse">جاري جلب المسوّقين...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredAffiliates.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>لا يوجد مسوّقون مطابقون للبحث</p>
                          </td>
                        </tr>
                      ) : (
                        filteredAffiliates.map((affiliate) => {
                          const status = affiliateStatusConfig[affiliate.status as keyof typeof affiliateStatusConfig] || affiliateStatusConfig.active;
                          const level = getAffiliateLevel(affiliate.confirmedOrders);
                          return (
                            <tr key={affiliate.id} className="hover:bg-muted/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {affiliate.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground text-sm">{affiliate.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">{affiliate.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-lg">
                                  المستوى {level}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm font-medium">
                                <span className="text-foreground">{affiliate.confirmedOrders}</span>
                                <span className="text-muted-foreground mx-1">/</span>
                                <span className="text-muted-foreground">{affiliate.totalOrders}</span>
                              </td>
                              <td className="p-4 font-bold text-secondary text-sm">
                                {affiliate.earnings.toLocaleString()} دج
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${affiliate.confirmationRate >= 80 ? "bg-secondary" : affiliate.confirmationRate >= 60 ? "bg-yellow-500" : "bg-destructive"}`}
                                      style={{ width: `${affiliate.confirmationRate}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-muted-foreground">{affiliate.confirmationRate}%</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                  {status.label}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => {/* handle Suspend */}}
                                  >
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* Join Requests Tab */}
          {activeTab === "join_requests" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث في طلبات الانضمام..."
                    value={joinSearch}
                    onChange={(e) => setJoinSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={joinRole} onValueChange={setJoinRole}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="affiliate">مسوّق</SelectItem>
                    <SelectItem value="seller">بائع</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Join Requests Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">الاسم</th>
                        <th className="text-right p-4 font-semibold text-foreground">النوع</th>
                        <th className="text-right p-4 font-semibold text-foreground">الموقع / النشاط</th>
                        <th className="text-right p-4 font-semibold text-foreground">التاريخ</th>
                        <th className="text-right p-4 font-semibold text-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredJoinRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-foreground">{req.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{req.email}</p>
                              <p className="text-[10px] text-muted-foreground">{req.phone}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${req.role === "affiliate" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                              }`}>
                              {req.role === "affiliate" ? "مسوّق" : "بائع"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {req.wilaya}
                              </p>
                              {req.role === "seller" && (
                                <p className="text-xs text-secondary font-bold flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5" /> {req.storeName}
                                </p>
                              )}
                              {req.role === "affiliate" && (
                                <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5" /> {req.ccp}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground font-medium">{req.date}</td>
                          <td className="p-4 text-left">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="hero"
                                className="bg-secondary hover:bg-secondary/90 h-9 px-4 rounded-xl gap-2 shadow-lg shadow-secondary/20"
                                onClick={() => handleApproveJoin(req.id)}
                              >
                                <Check className="w-4 h-4" /> قبول
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-4 rounded-xl gap-2 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
                                onClick={() => handleRejectJoin(req.id)}
                              >
                                <X className="w-4 h-4" /> رفض
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredJoinRequests.length === 0 && (
                  <div className="text-center py-20 bg-muted/20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50 shadow-inner">
                      <UserPlus className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground font-bold">لا توجد طلبات انضمام حالياً</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">سيظهر الطلبات الجديدة هنا للمراجعة والقبول.</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن طلبية..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
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
              </div>

              {/* Orders Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">المنتج</th>
                        <th className="text-right p-4 font-semibold text-foreground">الزبون</th>
                        <th className="text-right p-4 font-semibold text-foreground">المسوّق</th>
                        <th className="text-right p-4 font-semibold text-foreground">الولاية</th>
                        <th className="text-right p-4 font-semibold text-foreground">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isFetchingOrders ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                              <p className="text-muted-foreground animate-pulse">جاري جلب الطلبيات...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-muted-foreground">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>لا توجد طلبيات مطابقة للبحث</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const status = (statusConfig as any)[order.status.toLowerCase()] || statusConfig.pending;
                          const productName = order.product?.name || order.productName || "منتج غير معروف";
                          const affiliateName = order.affiliate?.name || order.affiliateName || "مسوّق غير معروف";
                          return (
                            <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-foreground text-sm">{productName}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{order.id.slice(0, 8)}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-medium text-foreground text-sm">{order.customerName}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{order.customerPhone}</p>
                              </td>
                              <td className="p-4">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-none rounded-lg text-[10px]">
                                  {affiliateName}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm font-medium text-muted-foreground">
                                {getWilayaName(order.wilaya)}
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-foreground text-sm">{order.totalAmount.toLocaleString()} دج</p>
                                <p className="text-[10px] text-secondary font-bold">العمولة: {order.commissionAmount.toLocaleString()} دج</p>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold ${status.color}`}>
                                  {status.label}
                                </span>
                              </td>
                              <td className="p-4 text-left">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-secondary">
                                    <Truck className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">إدارة التصنيفات</h3>
                  <Button className="gap-2 rounded-xl" onClick={handleOpenAddCategory}>
                    <Plus className="w-4 h-4" />
                    إضافة تصنيف
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {dbCategories.map((cat) => (
                    <div key={cat.id} className="p-4 bg-muted/30 rounded-2xl border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                          {cat.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{cat.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                            {cat.isActive ? "نشط" : "مخفي"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleCategoryStatus(cat.id, cat.isActive)}>
                          {cat.isActive ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditCategory(cat)}>
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                    <Button className="h-12 gap-2 rounded-xl" onClick={handleOpenAddProduct}>
                      <Plus className="w-4 h-4" />
                      إضافة منتج
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
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="dash-card overflow-hidden"
                  >
                    <div className="aspect-video relative group">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                         <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0" onClick={() => handleToggleProductStatus(product.id, 'isVisible')}>
                            {product.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                         </Button>
                         <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0" onClick={() => handleToggleProductStatus(product.id, 'isTrend')}>
                            <TrendingUp className={`w-4 h-4 ${product.isTrend ? "text-orange-500" : ""}`} />
                         </Button>
                         <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0" onClick={() => handleToggleProductStatus(product.id, 'isFeatured')}>
                            <Star className={`w-4 h-4 ${product.isFeatured ? "text-yellow-500 fill-yellow-500" : ""}`} />
                         </Button>
                      </div>
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {!product.isVisible && <Badge variant="destructive" className="font-bold">مخفي</Badge>}
                        {product.isTrend && <Badge className="bg-orange-500 hover:bg-orange-600 font-bold border-none shadow-lg">ترند 🔥</Badge>}
                        {product.isFeatured && <Badge className="bg-yellow-500 hover:bg-yellow-600 font-bold border-none shadow-lg text-black">مميز ⭐</Badge>}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                        {product.stock} قـطـعـة
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] py-0">{product.category}</Badge>
                        {product.videoUrl && <Video className="w-4 h-4 text-primary animate-pulse" />}
                      </div>
                      <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                      <div className="flex justify-between items-end mt-4">
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground line-through opacity-50">{product.originalPrice.toLocaleString()} دج</p>
                          <p className="text-xl font-black text-secondary">{product.price.toLocaleString()} دج</p>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-muted-foreground font-bold">العمولة</p>
                          <p className="font-bold text-primary">{product.commission.toLocaleString()} دج</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button variant="default" className="flex-1 gap-2 rounded-xl h-10 font-bold text-[10px] bg-secondary hover:bg-secondary/90 text-white" onClick={() => {
                          setProductToEditLandingPage(product);
                          setActiveTab("landing_pages");
                        }}>
                          <LayoutTemplate className="w-3.5 h-3.5" />
                          صفحة الهبوط
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2 rounded-xl h-10 font-bold text-xs" onClick={() => handleOpenEditProduct(product)}>
                          <Edit className="w-3.5 h-3.5" />
                          تعديل
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl shrink-0" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="space-y-6">
              {/* Stats for Withdrawals */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "طلبات معلقة", value: withdrawals.filter(r => r.status === "pending").length, color: "text-amber-600 bg-amber-50" },
                  { label: "إجمالي السحوبات", value: `${withdrawals.filter(r => r.status === "approved").reduce((sum, r) => sum + r.amount, 0).toLocaleString()} دج`, color: "text-emerald-600 bg-emerald-50 col-span-2" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`dash-card p-4 flex flex-col items-center justify-center text-center ${stat.color}`}>
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs font-bold opacity-80">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن اسم أو حساب..."
                    value={withdrawalSearch}
                    onChange={(e) => setWithdrawalSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={withdrawalStatus} onValueChange={setWithdrawalStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="completed">تم الدفع</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المستفيد</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">طريقة الدفع</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">التاريخ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-foreground text-sm">{req.requesterName}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${req.requesterRole === "SELLER" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                              {req.requesterRole === "SELLER" ? "بائع" : "مسوّق"}
                            </span>
                          </td>
                          <td className="p-4 font-black text-foreground text-sm">
                            {req.amount.toLocaleString()} دج
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-bold text-foreground">{req.method}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{req.accountDetails}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${req.status === "pending" ? "bg-amber-100 text-amber-700" :
                                req.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                  "bg-red-100 text-red-700"
                              }`}>
                              {req.status === "pending" ? "قيد الانتظار" : req.status === "approved" ? "تم الدفع" : "مرفوض"}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString('ar-DZ')}</td>
                          <td className="p-4">
                            {req.status === "pending" && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700" 
                                  onClick={() => updateWithdrawalStatus(req.id, 'approved')}
                                >
                                  قبول
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="h-8 text-[10px]" 
                                  onClick={() => updateWithdrawalStatus(req.id, 'rejected')}
                                >
                                  رفض
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">لا توجد طلبات سحب حالياً</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Levels Tab */}
          {activeTab === "levels" && (
            <div className="space-y-6">
              <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-foreground flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-secondary" />
                      إدارة مستويات المسوّقين
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">حدد الأهداف والمكافآت لكل مستوى لتحفيز المسوّقين.</p>
                  </div>
                  <Button 
                    className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto" 
                    onClick={() => {
                      setEditingLevel(null);
                      setLevelFormData({ name: "", levelNumber: dbLevels.length + 1, targetOrders: 0, reward: "", color: "blue" });
                      setIsLevelDialogOpen(true);
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    إضافة مستوى جديد
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                  {dbLevels.map((level) => (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-muted/20 rounded-[2.5rem] p-8 border border-border/50 relative group hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary border border-border/50">
                          <Sparkles className="w-7 h-7" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setEditingLevel(level);
                              setLevelFormData(level);
                              setIsLevelDialogOpen(true);
                            }}
                          >
                            <Edit className="w-5 h-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteLevel(level.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-2xl tracking-tight">{level.name}</h4>
                          <Badge variant="outline" className={`rounded-xl border-${level.color}-500/20 text-${level.color}-600 bg-${level.color}-500/5 font-black px-3 py-1`}>
                            Lvl {level.levelNumber}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 py-4 border-y border-border/40">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">الهدف المطلوب</p>
                            <p className="font-black text-lg">{level.targetOrders} طلبية مؤكدة</p>
                          </div>
                        </div>

                        {level.reward && (
                          <div className="mt-4 bg-white/40 p-4 rounded-2xl border border-dashed border-border/60">
                             <p className="text-[10px] text-muted-foreground font-bold mb-1 opacity-60">المكافآت الحصرية 🎁</p>
                             <p className="text-xs font-bold text-foreground/80 leading-relaxed italic">
                               "{level.reward}"
                             </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dash-card-interactive p-6"
              >
                <h3 className="text-lg font-bold text-foreground mb-6">تحليل المبيعات الشهرية</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()} دج`, ""]}
                      />
                      <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="الإيرادات" />
                      <Bar dataKey="commissions" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="العمولات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div className="dash-card-interactive p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">إعدادات المنصة</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">نسبة العمولة الافتراضية</p>
                      <p className="text-sm text-muted-foreground">النسبة التي يحصل عليها المسوّق</p>
                    </div>
                    <span className="text-xl font-bold text-secondary">50%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">يوم الدفع</p>
                      <p className="text-sm text-muted-foreground">يتم تحويل الأرباح كل</p>
                    </div>
                    <span className="text-lg font-bold text-foreground">نهاية الأسبوع</span>
                  </div>
                </div>
              </div>
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
                      
                      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-lg" dir="rtl">
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
                <div className="lg:w-2/3 space-y-6" dir="rtl">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-primary to-navy-900 text-white rounded-3xl p-6 shadow-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold">التوصيل للمنزل</h4>
                      </div>
                      <p className="text-white/80 text-sm mb-4">يستلم الزبون المنتج في مقر سكنه في كافة الولايات.</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs">يبدأ من</span>
                        <span className="text-3xl font-black">300 دج</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-secondary to-orange-700 text-white rounded-3xl p-6 shadow-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold">التوصيل للمكتب</h4>
                      </div>
                      <p className="text-white/80 text-sm mb-4">سعر مخفض عند استلام الزبون للطلب من مكتب الشركة.</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs">يبدأ من</span>
                        <span className="text-3xl font-black">200 دج</span>
                      </div>
                    </div>
                  </div>

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

              {/* Wilaya Pricing Table */}
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
                        onChange={(e) => setShippingSearch(e.target.value)}
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
                      {isFetchingShipping && (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-muted-foreground">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
                            <p>جاري تحميل الأسعار من Ecotrack...</p>
                          </td>
                        </tr>
                      )}
                      {!isFetchingShipping && paginatedShippingRates.length > 0 ? (
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
                            <td className="p-6">
                              <span className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
                                <Clock className="w-4 h-4" />
                                {rate.deliveryTime}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : !isFetchingShipping && (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-muted-foreground">
                            لا توجد ولاية تطابق البحث "{shippingSearch}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Shipping Pagination Footer */}
                {!isFetchingShipping && totalShippingPages > 1 && (
                  <div className="p-6 border-t border-border flex items-center justify-between bg-muted/20" dir="rtl">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={shippingPage === 1}
                        onClick={() => setShippingPage(prev => Math.max(1, prev - 1))}
                        className="rounded-xl"
                      >
                        السابق
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={shippingPage === totalShippingPages}
                        onClick={() => setShippingPage(prev => Math.min(totalShippingPages, prev + 1))}
                        className="rounded-xl"
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

          {/* Landing pages Tab */}
          {activeTab === "landing_pages" && (
            <div className="space-y-6">
              <LandingPageBuilder initialProductToEdit={productToEditLandingPage} />
            </div>
          )}

          {/* Landing page Editor Tab */}
          {activeTab === "landing_editor" && (
            <div className="space-y-8 max-w-5xl" dir="rtl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-2xl font-black text-foreground">تعديل الصفحة الرئيسية</h3>
                  <p className="text-muted-foreground mt-1 text-sm">قم بتخصيص النصوص والروابط في الواجهة الأمامية للمنصة.</p>
                </div>
                <Button onClick={saveLandingSettings} variant="hero" className="shadow-lg px-8 w-full sm:w-auto h-12 rounded-2xl">
                  حفظ التغييرات
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hero section */}
                <div className="dash-card-interactive p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold">قسم الهيرو (الرئيسي)</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-sm">البادج (النص الصغير في الأعلى)</Label>
                      <Input 
                        value={landingSettings.hero.badge}
                        onChange={(e) => setLandingSettings({...landingSettings, hero: {...landingSettings.hero, badge: e.target.value}})}
                        className="bg-muted/30 border-none rounded-xl h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">العنوان (الجزء الأول)</Label>
                        <Input 
                          value={landingSettings.hero.titlePart1}
                          onChange={(e) => setLandingSettings({...landingSettings, hero: {...landingSettings.hero, titlePart1: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">النص الملون (Gradient)</Label>
                        <Input 
                          value={landingSettings.hero.titleGradient}
                          onChange={(e) => setLandingSettings({...landingSettings, hero: {...landingSettings.hero, titleGradient: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-11 font-bold text-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-sm">العنوان (الجزء الثاني)</Label>
                      <Input 
                        value={landingSettings.hero.titlePart2}
                        onChange={(e) => setLandingSettings({...landingSettings, hero: {...landingSettings.hero, titlePart2: e.target.value}})}
                        className="bg-muted/30 border-none rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-sm">الوصف التفصيلي</Label>
                      <Textarea 
                        value={landingSettings.hero.description}
                        onChange={(e) => setLandingSettings({...landingSettings, hero: {...landingSettings.hero, description: e.target.value}})}
                        className="bg-muted/30 border-none rounded-xl min-h-[100px] leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">نص الزر الأساسي</Label>
                        <Input 
                          value={landingSettings.hero.primaryBtn}
                          onChange={(e) => setLandingSettings({...landingSettings, hero: {...landingSettings.hero, primaryBtn: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">نص الزر الثانوي</Label>
                        <Input 
                          value={landingSettings.hero.secondaryBtn}
                          onChange={(e) => setLandingSettings({...landingSettings, hero: {...landingSettings.hero, secondaryBtn: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features & Navbar */}
                <div className="space-y-8">
                  <div className="dash-card-interactive p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h4 className="text-lg font-bold">المميزات الرئيسية</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-600 flex items-center justify-center text-xs">1</span>
                          الميزة الأولى
                        </Label>
                        <Input 
                          value={landingSettings.features.item1}
                          onChange={(e) => setLandingSettings({...landingSettings, features: {...landingSettings.features, item1: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-xs">2</span>
                          الميزة الثانية
                        </Label>
                        <Input 
                          value={landingSettings.features.item2}
                          onChange={(e) => setLandingSettings({...landingSettings, features: {...landingSettings.features, item2: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs">3</span>
                          الميزة الثالثة
                        </Label>
                        <Input 
                          value={landingSettings.features.item3}
                          onChange={(e) => setLandingSettings({...landingSettings, features: {...landingSettings.features, item3: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="dash-card-interactive p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                        <Menu className="w-5 h-5" />
                      </div>
                      <h4 className="text-lg font-bold">روابط القائمة العلوية</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {landingSettings.navbar.links.map((link, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground pr-1">رابط {idx + 1}</Label>
                          <Input 
                            value={link.name}
                            onChange={(e) => {
                              const newLinks = [...landingSettings.navbar.links];
                              newLinks[idx].name = e.target.value;
                              setLandingSettings({...landingSettings, navbar: {...landingSettings.navbar, links: newLinks}});
                            }}
                            className="bg-muted/30 border-none rounded-xl h-10 text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label className="font-bold text-xs pr-1">زر الدخول</Label>
                        <Input 
                          value={landingSettings.navbar.loginBtn}
                          onChange={(e) => setLandingSettings({...landingSettings, navbar: {...landingSettings.navbar, loginBtn: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-xs pr-1">زر التسجيل</Label>
                        <Input 
                          value={landingSettings.navbar.registerBtn}
                          onChange={(e) => setLandingSettings({...landingSettings, navbar: {...landingSettings.navbar, registerBtn: e.target.value}})}
                          className="bg-muted/30 border-none rounded-xl h-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Product Management Dialog */}
      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl border-none font-cairo" dir="rtl">
          <DialogHeader className="text-right mb-4">
            <DialogTitle className="text-xl font-black">
              {editingCategory ? "تعديل تصنيف" : "إضافة تصنيف جديد"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-sm">اسم التصنيف</Label>
              <Input 
                value={categoryFormData.name} 
                onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})} 
                placeholder="مثال: إلكترونيات" 
                className="h-12 rounded-xl bg-muted/30 border-none px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm">أيقونة (إيموجي)</Label>
              <Input 
                value={categoryFormData.icon} 
                onChange={e => setCategoryFormData({...categoryFormData, icon: e.target.value})} 
                placeholder="💻" 
                className="h-12 rounded-xl bg-muted/30 border-none px-4"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label className="font-bold text-sm">تفعيل التصنيف</Label>
                <p className="text-xs text-muted-foreground">التصنيفات المخفية لن تظهر للمسوّقين.</p>
              </div>
              <Switch 
                checked={categoryFormData.isActive}
                onCheckedChange={v => setCategoryFormData({...categoryFormData, isActive: v})}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsCategoryDialogOpen(false)}>إلغاء</Button>
              <Button type="submit" className="rounded-xl px-8">حفظ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      {/* Levels Dialog */}
      <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-8 shadow-2xl border-none" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-3xl font-black flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Trophy className="w-6 h-6" />
               </div>
               {editingLevel ? "تعديل المستوى" : "إضافة مستوى جديد"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pr-1">أدخل تفاصيل المستوى والأهداف والمكافآت للمسوّقين.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="font-bold text-sm pr-1">اسم المستوى</Label>
              <Input 
                value={levelFormData.name}
                onChange={(e) => setLevelFormData({...levelFormData, name: e.target.value})}
                placeholder="مثال: المستوى 1 - مبتدئ"
                className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-lg font-bold focus-visible:ring-primary/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-sm pr-1">رقم الترتيب</Label>
                <Input 
                  type="number"
                  value={levelFormData.levelNumber}
                  onChange={(e) => setLevelFormData({...levelFormData, levelNumber: parseInt(e.target.value)})}
                  className="h-12 rounded-2xl bg-muted/40 border-none px-6 font-bold focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm pr-1">هدف الطلبيات</Label>
                <Input 
                  type="number"
                  value={levelFormData.targetOrders}
                  onChange={(e) => setLevelFormData({...levelFormData, targetOrders: parseInt(e.target.value)})}
                  className="h-12 rounded-2xl bg-muted/40 border-none px-6 font-bold focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm pr-1">المكافآت (اختياري)</Label>
              <Textarea 
                value={levelFormData.reward}
                onChange={(e) => setLevelFormData({...levelFormData, reward: e.target.value})}
                placeholder="صف المكافآت التي يحصل عليها المسوّق عند الوصول لهذا المستوى..."
                className="min-h-[120px] rounded-[2rem] bg-muted/40 border-none p-6 font-medium focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm pr-1">اللون المميز في الواجهة</Label>
              <Select value={levelFormData.color} onValueChange={(v) => setLevelFormData({...levelFormData, color: v})}>
                <SelectTrigger className="h-12 rounded-2xl bg-muted/40 border-none px-6 font-bold focus-visible:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[1.5rem] p-2">
                  <SelectItem value="blue" className="rounded-xl font-bold text-blue-600">أزرق</SelectItem>
                  <SelectItem value="green" className="rounded-xl font-bold text-green-600">أخضر</SelectItem>
                  <SelectItem value="purple" className="rounded-xl font-bold text-purple-600">أرجواني</SelectItem>
                  <SelectItem value="orange" className="rounded-xl font-bold text-orange-600">برتقالي</SelectItem>
                  <SelectItem value="gold" className="rounded-xl font-bold text-yellow-600">ذهبي</SelectItem>
                  <SelectItem value="red" className="rounded-xl font-bold text-red-600">أحمر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-start pt-4">
            <Button variant="ghost" className="rounded-2xl h-12 px-8 font-bold" onClick={() => setIsLevelDialogOpen(false)}>إلغاء</Button>
            <Button className="rounded-2xl h-12 px-10 font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all" onClick={handleSaveLevel}>
              {editingLevel ? "تحديث المستوى" : "إنشاء المستوى"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-none font-cairo" dir="rtl">
          <DialogHeader className="p-8 pb-0 text-right">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                {editingProduct ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <div>
                <p>{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</p>
                <p className="text-xs text-muted-foreground font-bold mt-1">أدخل معلومات المنتج بعناية لجذب المسوّقين</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="p-8 pt-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-sm">اسم المنتج</Label>
                  <Input 
                    value={productFormData.name} 
                    onChange={e => setProductFormData({...productFormData, name: e.target.value})} 
                    placeholder="مثال: ساعة ذكية الترا" 
                    className="h-12 rounded-xl bg-muted/30 border-none px-4"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-sm">الفئة (Niche)</Label>
                    <Select 
                      value={productFormData.category} 
                      onValueChange={v => setProductFormData({...productFormData, category: v})}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none px-4 text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {activeCategories.filter(c => c !== "الكل").map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-sm">المخزون المتوفر</Label>
                    <Input 
                      type="number"
                      value={productFormData.stock} 
                      onChange={e => setProductFormData({...productFormData, stock: Number(e.target.value)})} 
                      className="h-12 rounded-xl bg-muted/30 border-none px-4"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-sm">وصف المنتج (مميزات)</Label>
                  <Textarea 
                    value={productFormData.description} 
                    onChange={e => setProductFormData({...productFormData, description: e.target.value})} 
                    placeholder="اشرح مميزات المنتج التقنية..." 
                    className="min-h-[100px] rounded-xl bg-muted/30 border-none p-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-sm text-secondary">النص الإعلاني الجاهز</Label>
                  <Textarea 
                    value={productFormData.adText} 
                    onChange={e => setProductFormData({...productFormData, adText: e.target.value})} 
                    placeholder="اكتب نصاً جذاباً للمسوّقين لنسخه مباشرة..." 
                    className="min-h-[120px] rounded-xl bg-secondary/5 border-secondary/20 p-4 font-medium"
                  />
                </div>
              </div>

              {/* Right Column: Pricing & Media */}
              <div className="space-y-6">
                 <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/10 space-y-4">
                    <h4 className="font-black text-sm text-secondary flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> إدارة الأسعار والعمولة
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold opacity-70">السعر الأصلي</Label>
                        <Input 
                          type="number"
                          value={productFormData.originalPrice} 
                          onChange={e => setProductFormData({...productFormData, originalPrice: Number(e.target.value)})} 
                          placeholder="المشطوب"
                          className="h-11 rounded-xl bg-white border-none px-3 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">سعر البيع النهائي</Label>
                        <Input 
                          type="number"
                          value={productFormData.price} 
                          onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} 
                          placeholder="السعر الفعلي"
                          className="h-11 rounded-xl bg-white border-none px-3 font-mono font-bold text-secondary"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-primary">العمولة (دج)</Label>
                      <div className="flex items-center gap-3">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="icon" 
                          onClick={() => setProductFormData({...productFormData, commission: Math.max(0, (productFormData.commission || 0) - 100)})}
                          className="h-12 w-12 rounded-xl border-primary/20 text-primary hover:bg-primary/10 shrink-0"
                        >
                          -
                        </Button>
                        <div className="relative flex-1">
                          <Input 
                            type="number"
                            value={productFormData.commission} 
                            onChange={e => setProductFormData({...productFormData, commission: Number(e.target.value)})} 
                            placeholder="50% من سعر البيع؟"
                            className="h-14 rounded-xl bg-primary/5 border-primary/20 px-4 font-black text-primary text-2xl text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setProductFormData({...productFormData, commission: (productFormData.price || 0) * 0.5})}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 text-[10px] font-black hover:bg-primary/10 px-2"
                          >
                            حساب 50%
                          </Button>
                        </div>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="icon" 
                          onClick={() => setProductFormData({...productFormData, commission: (productFormData.commission || 0) + 100})}
                          className="h-12 w-12 rounded-xl border-primary/20 text-primary hover:bg-primary/10 shrink-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="font-bold text-sm">صورة المنتج الرئيسية</Label>
                    <div className="flex flex-col items-center gap-3">
                      {productFormData.image && (
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-muted/30 border border-dashed border-border">
                          <img src={productFormData.image} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <label className="w-full cursor-pointer">
                        <div className="flex items-center justify-center gap-2 h-12 rounded-xl bg-muted/30 border border-dashed border-border hover:bg-muted/50 transition-colors px-4">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {productFormData.image ? "تغيير الصورة" : "اختر صورة المنتج"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const token = localStorage.getItem("token");
                            const formData = new FormData();
                            formData.append("image", file);
                            try {
                              const res = await fetch("https://profit-link-3eri.onrender.com/api/upload/image", {
                                method: "POST",
                                headers: { "Authorization": `Bearer ${token}` },
                                body: formData,
                              });
                              const json = await res.json();
                              if (res.ok && json.url) {
                                setProductFormData({ ...productFormData, image: json.url });
                                toast({ title: "تم رفع الصورة بنجاح ✅" });
                              } else {
                                throw new Error(json.error || "Upload failed");
                              }
                            } catch (err: any) {
                              toast({ title: "خطأ في رفع الصورة", description: err.message, variant: "destructive" });
                            }
                          }}
                        />
                      </label>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="font-bold text-sm">رابط فيديو المراجعة</Label>
                    <div className="relative">
                      <Video className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={productFormData.videoUrl} 
                        onChange={e => setProductFormData({...productFormData, videoUrl: e.target.value})} 
                        placeholder="Youtube / Instagram link..." 
                        className="h-12 pr-12 rounded-xl bg-muted/30 border-none px-4"
                      />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium">ملاحظة: سيتم نشر المنتج فوراً وبشكل مرئي للمسوّقين.</p>
                 </div>
              </div>
            </div>

            {/* Ad Materials Section */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-4">
               <h4 className="font-black text-sm flex items-center gap-2">
                 <Upload className="w-4 h-4 text-primary" /> رفع محتوى إعلاني جاهز (صور + نصوص)
               </h4>
               <p className="text-[10px] text-muted-foreground font-bold">يمكنك إضافة روابط لصور إضافية أو نصوص إعلانية بديلة ليستخدمها المسوّقون</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="h-11 rounded-xl border-dashed gap-2" onClick={() => setProductFormData({
                    ...productFormData, 
                    adMaterials: [...(productFormData.adMaterials || []), { type: 'image', content: '' }]
                  })}>
                    <ImageIcon className="w-4 h-4" /> إضافة رابط صورة
                  </Button>
                  <Button type="button" variant="outline" className="h-11 rounded-xl border-dashed gap-2" onClick={() => setProductFormData({
                    ...productFormData, 
                    adMaterials: [...(productFormData.adMaterials || []), { type: 'text', content: '' }]
                  })}>
                    <FileText className="w-4 h-4" /> إضافة مسودة نص
                  </Button>
               </div>

               {productFormData.adMaterials && productFormData.adMaterials.length > 0 && (
                 <div className="space-y-3 mt-4">
                   {productFormData.adMaterials.map((mat, i) => (
                      <div key={i} className="flex gap-2 items-center">
                         <div className="flex-1 bg-white rounded-xl border border-slate-200 p-1 pr-3 flex items-center gap-3">
                            {mat.type === 'image' ? <ImageIcon className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                            <Input 
                              value={mat.content} 
                              onChange={e => {
                                const newMats = [...productFormData.adMaterials!];
                                newMats[i].content = e.target.value;
                                setProductFormData({...productFormData, adMaterials: newMats});
                              }}
                              placeholder={mat.type === 'image' ? "رابط الصورة..." : "النص الإعلاني..."}
                              className="border-none shadow-none h-9 text-xs"
                            />
                         </div>
                         <Button type="button" variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => {
                            const newMats = productFormData.adMaterials!.filter((_, index) => index !== i);
                            setProductFormData({...productFormData, adMaterials: newMats});
                         }}>
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                   ))}
                 </div>
               )}
            </div>

            <DialogFooter className="pt-6 sm:justify-start gap-3">
              <Button type="submit" variant="hero" className="w-full sm:w-auto h-14 px-12 rounded-2xl shadow-xl shadow-primary/20 font-black">
                {editingProduct ? "تحديث المنتج" : "حفظ المنتج ونشره"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsProductDialogOpen(false)} className="w-full sm:w-auto h-14 px-8 rounded-2xl font-bold">
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
