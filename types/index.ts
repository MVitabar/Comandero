// types/index.ts

import type React from "react"
import type { User as FirebaseUser } from 'firebase/auth'
import { UserRole } from './permissions';

// Subscription Plan Types
export type SubscriptionPlan = 'basic' | 'professional' | 'enterprise';

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type SubscriptionPaymentMethod = 'stripe' | 'paypal' | 'mercadopago' | 'manual';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';

export interface Payment {
  id?: string;
  userId: string;
  establishmentId: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
  status: PaymentStatus;
  paymentMethod: SubscriptionPaymentMethod;
  paymentId?: string;
  createdAt?: any; // Firestore Timestamp or Date
  updatedAt?: any; // Firestore Timestamp or Date
}

export interface Subscription {
  userId: string;
  establishmentId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate?: any; // Firestore Timestamp or Date
  endDate?: any; // Firestore Timestamp or Date
  trialEndDate?: any; // Firestore Timestamp or Date
  autoRenew: boolean;
  paymentMethod?: string;
  createdAt?: any; // Firestore Timestamp or Date
  updatedAt?: any; // Firestore Timestamp or Date
}

export interface SubscriptionPlanLimits {
  maxUsers: number;
  maxInventoryItems: number;
  features: {
    orderManagement: boolean;
    tableManagement: boolean;
    basicReports: boolean;
    advancedReports: boolean;
    inventoryManagement: boolean;
    deliveryIntegrations: boolean;
    emailSupport: boolean;
    chatSupport: boolean;
    prioritySupport: boolean;
    mobileApp: boolean;
    basicApi: boolean;
    advancedApi: boolean;
    multipleLocations: boolean;
    accountManager: boolean;
    fullCustomization: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanLimits> = {
  basic: {
    maxUsers: 3,
    maxInventoryItems: 50,
    features: {
      orderManagement: true,
      tableManagement: true,
      basicReports: true,
      advancedReports: false,
      inventoryManagement: true,
      deliveryIntegrations: false,
      emailSupport: true,
      chatSupport: false,
      prioritySupport: false,
      mobileApp: true,
      basicApi: false,
      advancedApi: false,
      multipleLocations: false,
      accountManager: false,
      fullCustomization: false,
    },
  },
  professional: {
    maxUsers: 10,
    maxInventoryItems: 200,
    features: {
      orderManagement: true,
      tableManagement: true,
      basicReports: true,
      advancedReports: true,
      inventoryManagement: true,
      deliveryIntegrations: true,
      emailSupport: true,
      chatSupport: true,
      prioritySupport: false,
      mobileApp: true,
      basicApi: true,
      advancedApi: false,
      multipleLocations: false,
      accountManager: false,
      fullCustomization: false,
    },
  },
  enterprise: {
    maxUsers: -1, // -1 means unlimited
    maxInventoryItems: -1, // -1 means unlimited
    features: {
      orderManagement: true,
      tableManagement: true,
      basicReports: true,
      advancedReports: true,
      inventoryManagement: true,
      deliveryIntegrations: true,
      emailSupport: true,
      chatSupport: true,
      prioritySupport: true,
      mobileApp: true,
      basicApi: true,
      advancedApi: true,
      multipleLocations: true,
      accountManager: true,
      fullCustomization: true,
    },
  },
};

// Tipos de enumeración y métodos de pago
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit' | 'debit' | 'other';

export type BaseOrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'closed' | 'ordering' | 'served' | 'finished' | 'null';

export type OrderStatus = BaseOrderStatus;

export type FlexibleOrderStatus = BaseOrderStatus;

// Enums adicionales
export enum MenuItemCategory {
  Appetizer = 'appetizer',
  MainCourse = 'main_course',
  Dessert = 'dessert',
  Drink = 'drink',
  Sides = 'sides',
  Salad = "Salad"
}

export enum InventoryCategory {
  Produce = 'produce',
  Meat = 'meat',
  Dairy = 'dairy',
  Pantry = 'pantry',
  Beverages = 'beverages'
}

// Global Application Types

// User and Authentication
export interface User {
  uid: string
  id?: string
  email: string | null
  username?: string
  displayName?: string
  role: UserRole
  
  // Establishment-related properties
  establishmentId?: string
  currentEstablishmentName?: string
  restaurantName?: string
  currency?: string
  
  // Subscription plan
  subscriptionPlan?: SubscriptionPlan
  
  // Trial period
  trialStartDate?: Date
  trialEndDate?: Date
  isTrialActive?: boolean
  
  // Enhanced authentication and status properties
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  emailVerified: boolean
  
  // Optional personal details
  phoneNumber?: string | null
  position?: string
  
  // Timestamps
  createdAt?: Date
  lastLogin?: Date
  
  // Authentication methods with enhanced typing
  loading: boolean
  login: (email: string, password: string) => Promise<{
    success: boolean
    error?: string
  }>
  logout: () => Promise<{
    success: boolean
    error?: string
  }>
  signUp: (
    email: string, 
    password: string, 
    options?: {
      username?: string
      establishmentName?: string
      role?: UserRole
      subscriptionPlan?: string
      trialStartDate?: Date
      trialEndDate?: Date
      isTrialActive?: boolean
    }
  ) => Promise<{
    success: boolean
    error?: string
    userId?: string
    needsPasswordChange?: boolean
  }>

  // Enhanced activity tracking
  activity?: UserActivity
  
  // Security-related fields
  twoFactorEnabled?: boolean
  securityLevel?: 'low' | 'medium' | 'high'
  
  // Opcional: Player ID de OneSignal para notificaciones push
  oneSignalPlayerId?: string;
}

export interface LoginAttempt {
  timestamp: Date
  success: boolean
  error?: string
  ipAddress?: string
  location?: {
    country?: string
    city?: string
  }
  device?: {
    type?: string
    os?: string
    browser?: string
  }
}

export interface UserActivity {
  loginAttempts?: LoginAttempt[]
  lastSuccessfulLogin?: Date
  failedLoginCount?: number
  accountCreated: Date
  lastPasswordChange?: Date
}

// Inventory Management
export interface InventoryItem {
  uid: string;  
  id?: string
  name: string
  category: string
  categoryName?: string
  controlsStock: boolean
  quantity: number
  unit?: string
  price: number
  minQuantity: number
  description?: string
  supplier?: string
  restaurantId?: string
  createdAt?: Date
  updatedAt?: Date
  lowStockThreshold?: number
}

export interface InventoryItemSourceData {
  id?: string
  name: string
  category: string
  quantity: number
  minQuantity?: number
  lowStockThreshold?: number
  price: number
  unit: string
  description?: string
  supplier?: string
  restaurantId?: string
  createdAt?: Date
  updatedAt?: Date
  uid?: string
  purchaseDate?: Date
  expirationDate?: Date
  reorderPoint?: number
  notes?: string
  categoryName?: string
}

// Menu and Order Management
export interface MenuItem {
  uid: string;
  name: string;
  price: number;
  category?: MenuItemCategory;
  description?: string;
  available?: boolean;
  image?: string;
  restaurantId?: string;
  unit?: string;
  stock?: number;
  minimumStock?: number;
  dietaryInfo?: DietaryRestriction;
}

export interface DietaryRestriction {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  lactoseFree: boolean;
  nutFree?: boolean;
  shellfishFree?: boolean;
  eggFree?: boolean;
}

export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'finished';

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  stock: number;
  unit: string;
  notes?: string;
  description?: string;
  customDietaryRestrictions?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isLactoseFree?: boolean;
  status?: OrderItemStatus; // Opcional para compatibilidad retroactiva
}

export interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  tip?: number;
  lastFourDigits?: string;
  transactionId?: string;
  reference?: string;
  processedAt?: Date;
}

export interface Order {
  id: string;
  tableNumber?: number;
  orderType: 'table' | 'counter' | 'takeaway';
  type?: 'table' | 'counter' | 'takeaway';
  status: BaseOrderStatus;
  userId?: string;
  restaurantId: string;
  items: Record<string, OrderItem> | OrderItem[];
  subtotal: number;
  total: number;
  discount?: number;
  tax?: number;
  createdAt: Date;
  updatedAt: Date;
  tableId?: string;
  mapId?: string;
  waiter?: string;
  specialRequests?: string;
  dietaryRestrictions?: string[];
  paymentMethod?: PaymentMethod;
  paymentInfo?: PaymentInfo;
  closedAt?: Date | null;
  uid?: string;
  docId?: string;
  debugContext?: {
    userInfo?: {
      uid?: string;
      displayName?: string | null;
      email?: string | null;
      establishmentId?: string;
    };
    orderContext?: {
      orderType?: string;
      tableNumber?: string | number;
      tableId?: string;
      mapId?: string;
    };
    timestamp?: Date;
  };
  createdBy: {
    uid: string;
    displayName: string;
    username?: string;
    email: string | null;
    role: UserRole;
  };
}

// Table and Seating Management
export interface TableItem {
  uid: string
  number: number
  seats: number
  shape: "square" | "round" | "rectangle"
  width: number
  height: number
  x: number
  y: number
  status: "available" | "occupied" | "reserved" | "maintenance" | "ordering" | "preparing" | "ready" | "served"
  activeOrderId?: string
  restaurantId?: string
  id?: string
  name?: string
  mapId: string
}

export interface TableCardProps {
  table: TableItem
  hasActiveOrder?: boolean
  orderStatus?: string
  onEdit?: () => void
  onDelete?: () => void
  onCreateOrder?: () => void
  onViewOrder?: (order: Order) => void
  onMarkAsServed?: () => void
  onCloseOrder?: () => void
  isEditing?: boolean
}

export interface TableMap {
  id: string;
  uid: string;
  name: string;
  description?: string;
  tables: TableItem[];
  createdAt: Date;
  updatedAt: Date;
  restaurantId?: string;
}

// Restaurant Table Types
export interface RestaurantTable {
  id?: string;
  name: string;
  capacity: number;
  x?: number;
  y?: number;
  mapId: string;
  status: 'available' | 'occupied' | 'reserved';
}

// Reporting and Analytics
export interface ReportData {
  orders?: {
    summary: { label: string; value: string | number }[];
    data: Order[];
    charts?: { title: string; type: string; data: any }[];
  };
  inventory?: {
    summary: { label: string; value: string | number }[];
    data: InventoryItem[];
    charts?: { title: string; type: string; data: any }[];
  };
  sales?: {
    summary: { label: string; value: string | number }[];
    data: SalesData[];
    charts?: { title: string; type: string; data: any }[];
  };
  financial?: {
    summary: { label: string; value: string | number }[];
    data: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    charts?: { title: string; type: string; data: any }[];
  };
  staff?: {
    summary: { label: string; value: string | number }[];
    data: {
      name: string;
      role: string;
      performance: number;
      shifts: number;
    }[];
    charts?: { title: string; type: string; data: any }[];
  };
  customers?: {
    summary: { label: string; value: string | number }[];
    data: {
      id: string;
      name: string;
      visits: number;
      lastVisit: Date;
      totalSpent: number;
    }[];
    charts?: { title: string; type: string; data: any }[];
  };
  reservations?: {
    summary: { label: string; value: string | number }[];
    data: {
      date: Date;
      time: string;
      guests: number;
      status: 'cancelled' | 'pending' | 'confirmed';
    }[];
    charts?: { title: string; type: string; data: any }[];
  };
}

export interface ReportDataAdvanced {
  orders: Order[];
  inventory: InventoryItem[];
  sales: SalesDataAdvanced;
  financial: FinancialData;
  staff: StaffData;
  customers: CustomersData;
  reservations: ReservationsData;
}

export interface SalesData {
  date: Date;
  totalRevenue: number;
  orderCount: number;
  averageTicket: number;
  topSellingItems?: Array<{
    itemName: string;
    quantity: number;
    revenue: number;
  }>;
  data?: any[];
  financial?: any;
  staff?: any;
  customers?: any;
  reservations?: any;
}

export interface SalesDataAdvanced {
  summary: { 
    label: string; 
    value: string | number 
  }[];
  data: {
    category?: string;
    amount?: number;
    percentage?: number;
    uid?: string;
    tableNumber?: number;
    status?: string;
    items?: number;
    total?: number;
    createdAt?: Date;
  }[];
}

export interface FinancialData {
  summary: { 
    label: string; 
    value: string 
  }[];
  data: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface StaffData {
  summary: { 
    label: string; 
    value: string 
  }[];
  data: {
    name: string;
    role: string;
    performance: number;
    shifts: number;
  }[];
}

export interface CustomersData {
  [x: string]: any;
  summary: { 
    label: string; 
    value: string 
  }[];
  data: {
    uid: string;
    name: string;
    visits: number;
    lastVisit: Date;
    totalSpent: number;
  }[];
}

export interface ReservationsData {
  summary: { 
    label: string; 
    value: string 
  }[];
  data: {
    date: Date;
    time: string;
    guests: number;
    status: 'cancelled' | 'pending' | 'confirmed';
  }[];
}

export interface SalesDataSummary {
  summary: { 
    label: string; 
    value: string | number 
  }[];
  data: any[];
  charts?: { 
    title: string; 
    type: string; 
    data: any 
  }[];
}

export interface AdvancedReportProps {
  data?: ReportData;
  startDate?: Date;
  endDate?: Date;
  restaurantId: string;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  status?: string;
}

export interface AnalyticsMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    itemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  customerRetentionRate?: number;
}

// Notification Management
export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  pushNotifications?: boolean;
  orderUpdates?: boolean;
  inventoryAlerts?: boolean;
  lowInventoryAlerts?: boolean;
  newOrders?: boolean;
  systemAnnouncements?: boolean;
  dailyReports?: boolean;
  soundAlerts?: boolean;
  emailNotifications?: boolean;
}

// Theme and UI
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent?: string;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
}

// Internationalization
export interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  changeLanguage: (lang: string) => void;
}

export interface LanguageConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  fallbackLanguage?: string;
}

// Firebase and Authentication Context
export interface FirebaseContextType {
  app: any;
  auth: any;
  db: any;
  user?: User | null;
  isInitialized?: boolean;
  error?: Error | null;
}

export interface AuthContextType {
  user: User | null;
  currentUser: FirebaseUser | User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    needsPasswordChange: boolean;
    success: boolean
    error?: string
  }>
  logout: () => Promise<{
    success: boolean
    error?: string
  }>
  signUp: (
    email: string, 
    password: string, 
    options?: {
      username?: string
      establishmentName?: string
      role?: UserRole
      subscriptionPlan?: string
      trialStartDate?: Date
      trialEndDate?: Date
      isTrialActive?: boolean
    }
  ) => Promise<{
    success: boolean
    error?: string
    userId?: string
    needsPasswordChange?: boolean
  }>
}

// Tipos de utilidad
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Tipos para configuración de restaurante
export interface RestaurantSettings {
  name: string;
  address?: string;
  phone?: string;
  taxRate?: number;
  currency?: string;
  timezone?: string;
  operatingHours?: {
    open: string;
    close: string;
    days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
  };
  logo?: string;
}

// Tipos para autenticación y seguridad
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

// Tipos para integración de pagos
export interface PaymentGatewayConfig {
  provider: 'stripe' | 'paypal' | 'square' | 'custom';
  apiKey?: string;
  webhookSecret?: string;
  testMode?: boolean;
}

// Tipos para gestión de inventario
export interface InventoryAlert {
  itemId: string;
  currentQuantity: number;
  minimumThreshold: number;
  status: 'low' | 'critical' | 'normal';
}

export type InventoryItemStatus = 'critical' | 'warning' | 'healthy' | 'default';

// Tipos para eventos del sistema
export interface SystemEvent {
  type: 'order_created' | 'inventory_low' | 'user_login' | 'system_error';
  timestamp: Date;
  userId?: string;
  details?: Record<string, any>;
}

// Tipos para integraciones
export interface ExternalIntegration {
  type: 'accounting' | 'delivery' | 'crm' | 'marketing';
  name: string;
  isEnabled: boolean;
  configuration?: Record<string, string>;
}

// Interfaces para componentes y props
export interface OrderFormProps {
  onSubmit: (order: Order) => void;
  initialOrder?: Partial<Order>;
  onCancel?: () => void;
  initialData?: Partial<Order>;
  initialTable?: Partial<TableItem>;
}

export interface OrderDetailsDialogProps {
  order: Order;
  onClose: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  table?: TableItem;
  onEditOrder?: () => void;
}

export interface ExcelReportGeneratorProps {
  reportData: {
    orders?: Order[];
    inventory?: InventoryItem[];
    sales?: SalesData;
    financial?: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    staff?: {
      name: string;
      role: string;
      performance: number;
      shifts: number;
    }[];
    customers?: {
      uid: string;
      name: string;
      visits: number;
      lastVisit: Date;
      totalSpent: number;
    }[];
    reservations?: {
      date: Date;
      time: string;
      guests: number;
      status: 'cancelled' | 'pending' | 'confirmed';
    }[];
  };
}

export interface ExcelReportTableProps {
  title: string;
  data: 
    | SalesData 
    | Order[] 
    | InventoryItem[] 
    | {
        category?: string;
        amount?: number;
        percentage?: number;
        summary?: { label: string; value: string | number }[];
        data?: any[];
        charts?: { title: string; type: string; data: any }[];
      }[]
    | {
        name?: string;
        role?: string;
        performance?: number;
        shifts?: number;
        uid?: string;
        visits?: number;
        totalSpent?: number;
        lastVisit?: Date;
        summary?: { label: string; value: string | number }[];
        data?: any[];
        charts?: { title: string; type: string; data: any }[];
      }[]
    | {
        date?: Date;
        time?: string;
        guests?: number;
        status?: 'cancelled' | 'pending' | 'confirmed';
        summary?: { label: string; value: string | number }[];
        data?: any[];
        charts?: { title: string; type: string; data: any }[];
      }[]
    | undefined
  headerColor: string;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
}

export interface TableGridViewProps {
  tables: TableItem[];
  orders?: Record<string, Order>;
  onTableClick?: (table: TableItem) => void;
  onCreateOrder?: (table: TableItem) => void;
  onViewOrder?: (table: TableItem) => void;
  onMarkAsServed?: (table: TableItem, orderId: string) => void;
  onCloseOrder?: (table: TableItem, orderId: string) => void;
  onAddTable?: () => void;
  onEditTable?: (table: TableItem) => void;
  onDeleteTable?: (table: TableItem) => void;
  isEditing?: boolean;
}

export interface TableMapEditorProps {
  mapUid: string;
  tables: TableItem[];
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onTablesChange?: (tables: TableItem[]) => void;
}

export interface TableMapViewerProps {
  tables: TableItem[];
  selectedTable?: TableItem;
  onTableSelect?: (table: TableItem) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showControls?: boolean;
  showLegend?: boolean;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

// Dashboard-related types
export type SalesByCategory = {
  category: string;
  name?: string;
  totalSales: number;
  totalQuantity: number;
  color: string;
}

export type DailySalesData = {
  date: string
  sales: number
}

export type TopSellingItem = {
  id: string
  name: string
  quantity: number
  totalSales: number
  category?: string
}

export interface InventoryItemDetail {
  id?: string
  name: string
  category: string
  categoryName?: string
  total: number
  inStock: number
  lowStock?: number
  minQuantity?: number
  lowStockThreshold?: number
  status?: 'critical' | 'warning' | 'healthy' | 'default'
}

export interface DashboardData {
  totalOrders: number;
  totalSales: number;
  lowStockItems: number;
  recentOrders: Order[];
  monthlyGrowth: number;
  totalInventoryItems: number;
  inventoryItems: {
    total: number;
    lowStock: number;
    inStock: number;
    details: InventoryItemDetail[];
  };
  salesByCategory: SalesByCategory[];
  dailySalesData: DailySalesData[];
  topSellingItems: TopSellingItem[];
  salesList: {
    orderId: string;
    date: string;
    total: number;
    paymentMethod: PaymentMethod;
  }[];
  paymentMethodsBreakdown?: {
    method: PaymentMethod;
    total: number;
    percentage: number;
  }[];
}

// --- Helpers de categorías para filtrado de órdenes por rol ---
// Categorías consideradas comida (incluye variantes en plural y minúsculas)
export const FOOD_CATEGORIES = [
  'appetizer', 'appetizers',
  'main_course', 'main_courses',
  'dessert', 'desserts',
  'salad', 'salads',
  'sides', 'side'
];

// Categorías consideradas bebida
export const DRINK_CATEGORIES = [
  'drink', 'drinks', 'beverage', 'beverages'
];

export function isFoodCategory(category?: string): boolean {
  if (!category) return false;
  return FOOD_CATEGORIES.includes(category.toLowerCase());
}

export function isDrinkCategory(category?: string): boolean {
  if (!category) return false;
  return DRINK_CATEGORIES.includes(category.toLowerCase());
}

// --- PATCH: Corrección de tipos, unificación y compatibilidad global ---

// 1. Elimina import duplicado de FirebaseUser (solo debe haber uno al inicio del archivo)

// 2. ModulePermissions: Definición base para permisos de módulos
export type ModulePermissions = {
  [key: string]: {
    view?: boolean;
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    [action: string]: boolean | undefined;
  };
};

// 3. PermissionProps: Props para HOC de permisos
export interface PermissionProps {
  requiredView?: keyof ModulePermissions;
  requiredAction?: keyof ModulePermissions[string];
}

// 4. UserProfileData: Datos de perfil de usuario
export interface UserProfileData {
  username: string;
  email: string;
  role: UserRole;
  phoneNumber: string;
}

// 5. CustomUser: Extiende correctamente el tipo importado
export interface CustomUser extends FirebaseUser {
  role?: UserRole;
}

// 6. PermissionsContextType: Contexto de permisos
export interface PermissionsContextType {
  canView: (module: string | number) => boolean;
  canCreate: (module: string | number) => boolean;
  canUpdate: (module: string | number) => boolean;
  canDelete: (module: string | number) => boolean;
  canDo?: (module: string | number, action: string) => boolean;
}

// 7. PasswordStrengthIndicatorProps
export interface PasswordStrengthIndicatorProps {
  password: string;
}

// 8. TableCardProps: Unifica con el tipo principal
export interface TableCardProps {
  table: TableItem;
  hasActiveOrder?: boolean;
  orderStatus?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateOrder?: () => void;
  onViewOrder?: (order: Order) => void;
  onMarkAsServed?: () => void;
  onCloseOrder?: () => void;
  isEditing?: boolean;
}

// 9. OrderDetailsDialogProps: Compatibilidad con props opcionales
export interface OrderDetailsDialogProps {
  order: Order;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  table?: TableItem;
  onEditOrder?: () => void;
}


export { UserRole };
// --- END PATCH ---

// Purchases Management
export interface Supplier {
  id?: string;
  uid: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  taxId?: string;
  notes?: string;
  paymentTerms?: string;
  deliveryTime?: string;
  rating?: number;
  isActive: boolean;
  restaurantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseItem {
  id?: string;
  uid: string;
  purchaseId: string;
  inventoryItemId?: string;
  inventoryItemName?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
  notes?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Purchase {
  id?: string;
  uid: string;
  supplierId: string;
  supplierName?: string;
  purchaseNumber: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled' | 'partial';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  receivedDate?: Date;
  totalAmount: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'overdue';
  notes?: string;
  items: PurchaseItem[];
  restaurantId: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}