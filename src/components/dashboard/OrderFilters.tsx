import { useState } from "react";
import { Calendar, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export interface OrderFilters {
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  search: string;
}

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
}

const statusOptions = [
  { value: "all", label: "جميع الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "shipped", label: "قيد التوصيل" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

const OrderFiltersComponent = ({ filters, onFiltersChange }: OrderFiltersProps) => {
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  const hasActiveFilters = 
    filters.status !== "all" || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.search;

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      dateFrom: undefined,
      dateTo: undefined,
      search: "",
    });
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منتج أو زبون..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pr-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy") : "من تاريخ"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => {
                onFiltersChange({ ...filters, dateFrom: date });
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
              {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy") : "إلى تاريخ"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => {
                onFiltersChange({ ...filters, dateTo: date });
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
  );
};

export default OrderFiltersComponent;
