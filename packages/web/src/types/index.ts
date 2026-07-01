// ==================== USER ====================
export interface User {
  phone?: string;
  cpf?: string;
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  tenantId?: string;
  tenant?: Tenant;
  type?: string;
}

// ==================== TENANT ====================
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  active?: boolean;
}

// ==================== PRODUCT ====================
export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  sku?: string;
  barcode?: string;
  description?: string;
  mainImage?: string;
  images?: string;
  costPrice: number;
  salePrice: number;
  promotionalPrice?: number;
  profitMargin?: number;
  commissionValue?: number;
  commissionPercent?: number;
  stock: number;
  minStock: number;
  minQuantity: number;
  incrementStep: number;
  weight?: number;
  unit: string;
  available: boolean;
  featured: boolean;
  promotional: boolean;
  active: boolean;
  sortOrder: number;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

// ==================== CATEGORY ====================
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  image?: string;
  parentId?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== CART ====================
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export type DeliveryType = 'delivery' | 'pickup';

// ==================== ORDER ====================
export type OrderStatus = 'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'PICKUP_AVAILABLE' | 'PICKED_UP';

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerId?: string;
  customer?: Customer;
  status: OrderStatus;
  deliveryType: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ==================== CUSTOMER ====================
export interface Customer {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  phone?: string;
  cpf?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== ADDRESS ====================
export interface Address {
  id: string;
  customerId: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

// ==================== COUPON ====================
export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderValue?: number;
  active: boolean;
}

// ==================== BANNER ====================
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  sortOrder: number;
  active: boolean;
}

// ==================== DELIVERY ZONE ====================
export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  freeAbove?: number;
  estimatedMinutes: number;
  neighborhoods: string;
  cities: string;
  zipCodes: string;
  active: boolean;
}

// ==================== DASHBOARD ====================
export interface DashboardStats {
  todayOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  outOfStock: number;
  lowStock: number;
  monthRevenue: number;
  totalCustomers: number;
  totalEmployees: number;
  recentOrders: Order[];
  lowStockAlerts: Product[];
  salesByDay: { date: string; orders: number; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

// ==================== COMMON ====================
export type UnitType = 'KG' | 'UN' | 'L' | 'PCT' | 'DUZIA';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
