import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, X, MessageSquare, Truck, Check } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface OrdersTabProps {
  filteredOrders: any[];
  orders: any[];
  orderSearch: string;
  setOrderSearch: (val: string) => void;
  orderStatus: string;
  setOrderStatus: (val: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  isDateFromOpen: boolean;
  setIsDateFromOpen: (val: boolean) => void;
  isDateToOpen: boolean;
  setIsDateToOpen: (val: boolean) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  statusConfig: Record<string, any>;
  processingOrderId: string | null;
  handleWhatsAppConfirm: (order: any) => void;
  handleAndersonShip: (order: any) => void;
  handleAndersonExpedite: (order: any) => void;
  getWilayaName: (code: any) => string;
}

const OrdersTab: React.FC<OrdersTabProps> = ({
  filteredOrders,
  orders,
  orderSearch,
  setOrderSearch,
  orderStatus,
  setOrderStatus,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  isDateFromOpen,
  setIsDateFromOpen,
  isDateToOpen,
  setIsDateToOpen,
  hasActiveFilters,
  clearFilters,
  statusConfig,
  processingOrderId,
  handleWhatsAppConfirm,
  handleAndersonShip,
  handleAndersonExpedite,
  getWilayaName
}) => {
  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج أو زبون..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="pr-10 h-11 rounded-xl"
            />
          </div>

          {/* Status Filter */}
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger className="w-[160px] h-11 rounded-xl">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
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
              <Button variant="outline" className="h-11 rounded-xl gap-2 min-w-[140px]">
                <Calendar className="w-4 h-4" />
                {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "من تاريخ"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden" align="start">
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
              <Button variant="outline" className="h-11 rounded-xl gap-2 min-w-[140px]">
                <Calendar className="w-4 h-4" />
                {dateTo ? format(dateTo, "dd/MM/yyyy") : "إلى تاريخ"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden" align="start">
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
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-destructive hover:bg-destructive/10 h-11 px-4 rounded-xl">
              <X className="w-4 h-4" />
              مسح الفلاتر
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-muted-foreground text-sm font-bold">
          عرض <span className="text-foreground">{filteredOrders.length}</span> من <span className="text-foreground">{orders.length}</span> طلبية
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-[2.5rem] shadow-sm border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="text-right p-5 font-black text-xs uppercase tracking-wider text-muted-foreground">المنتج</th>
                <th className="text-right p-5 font-black text-xs uppercase tracking-wider text-muted-foreground">الزبون</th>
                <th className="text-right p-5 font-black text-xs uppercase tracking-wider text-muted-foreground">عنوان التوصيل</th>
                <th className="text-right p-5 font-black text-xs uppercase tracking-wider text-muted-foreground">الحالة</th>
                <th className="text-right p-5 font-black text-xs uppercase tracking-wider text-muted-foreground">العمولة</th>
                <th className="text-right p-5 font-black text-xs uppercase tracking-wider text-muted-foreground">التاريخ</th>
                <th className="text-right p-5 font-black text-xs uppercase tracking-wider text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const isProcessing = processingOrderId === order.id;
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="p-5 font-medium text-foreground">
                        <div className="space-y-1">
                          <p className="font-black text-sm">{order.productName}</p>
                          {(order.selectedOffer || order.quantity > 1 || order.selectedColor || order.selectedSize) && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {order.selectedOffer && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-orange-100 text-orange-700 border border-orange-200">
                                  📦 {order.selectedOffer}
                                </span>
                              )}
                              {order.quantity > 1 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                                  الكمية: {order.quantity}
                                </span>
                              )}
                              {order.selectedColor && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-primary/10 text-primary border border-primary/20">
                                  اللون: {order.selectedColor}
                                </span>
                              )}
                              {order.selectedSize && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-secondary/10 text-secondary border border-secondary/20">
                                  المقاس: {order.selectedSize}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-black text-sm text-foreground">{order.customerName}</p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{order.customerPhone}</p>
                      </td>
                      <td className="p-5">
                        <div className="space-y-1">
                          <p className="font-black text-xs text-foreground">{getWilayaName(order.wilaya)}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{order.commune || "لم يتم تحديد البلدية"}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black mt-1 ${order.stopDesk === 1 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                            {order.stopDesk === 1 ? "مكتب (Stop Desk)" : "منزل (Home Delivery)"}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black shadow-sm ${status.color}`}>
                          <status.icon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-5 font-black text-sm text-secondary">{order.commission.toLocaleString()} دج</td>
                      <td className="p-5 text-[11px] font-bold text-muted-foreground">{order.date}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-9 h-9 p-0 rounded-xl text-green-600 border-green-200 hover:bg-green-50 shadow-sm" 
                            onClick={() => handleWhatsAppConfirm(order)}
                            title="تأكيد عبر واتساب"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          {(order.status === "pending" || order.status === "confirmed") && !order.trackingNumber && (
                            <Button
                              size="sm"
                              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200"
                              disabled={isProcessing}
                              onClick={() => handleAndersonShip(order)}
                            >
                              {isProcessing ? (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                              ) : (
                                <Truck className="w-4 h-4 ml-1.5" />
                              )}
                              {isProcessing ? "" : "شحن"}
                            </Button>
                          )}
                          {order.trackingNumber && order.status === "shipped" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-4 rounded-xl border-2 font-black text-xs border-primary text-primary hover:bg-primary hover:text-white shadow-sm"
                              disabled={isProcessing}
                              onClick={() => handleAndersonExpedite(order)}
                            >
                              {isProcessing ? (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full inline-block" />
                              ) : (
                                <Check className="w-3.5 h-3.5 ml-1.5" />
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
                  <td colSpan={7} className="p-16 text-center text-muted-foreground bg-muted/5">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                      <Filter className="w-8 h-8" />
                    </div>
                    <p className="font-black text-sm">لا توجد طلبيات تطابق الفلاتر المحددة</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;
