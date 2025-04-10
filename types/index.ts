// types/index.ts

import type React from "react"
import type { User as FirebaseUser } from 'firebase/auth'

// Tipos de enumeración y métodos de pago
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit' | 'debit' | 'other';

export type BaseOrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'closed' | 'ordering' | 'served' | 'finished' | 'null';

export type OrderStatus = BaseOrderStatus;

export type FlexibleOrderStatus = BaseOrderStatus;

// Enums adicionales
export enum UserRole {
  Owner = 'owner',
  Manager = 'manager',
  Staff = 'staff'
}

export enum MenuItemCategory {
  Appetizer = 'appetizer',
  MainCourse = 'main_course',
  Dessert = 'dessert',
  Drink = 'drink',
  Sides = 'sides'
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
export interface User extends FirebaseUser {
  uid: string;
  username?: string;
  role?: string;
  phoneNumber: string | null;
  position?: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

// Inventory Management
export interface InventoryItem {
  [x: string]: string | number | Date | undefined;
  uid: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  price: number;
  description?: string;
  supplier?: string;
  purchaseDate?: Date;
  expirationDate?: Date;
  reorderPoint?: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  restaurantId: string;
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

export interface OrderItem {
  [x: string]: string | number | boolean | Date | DietaryRestriction | string[] | undefined;
  uid?: string;
  itemId: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  notes?: string;
  unit?: string;
  dietaryInfo?: DietaryRestriction;
  customDietaryRestrictions?: string[];
  preparationInstructions?: string;
  allergenWarnings?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isLactoseFree?: boolean;
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
  items: OrderItem[];
  subtotal: number;
  total: number;
  discount?: number;
  tax?: number;
  createdAt: Date;
  updatedAt: Date;
  tableId?: string;
  tableMapId?: string;
  waiter?: string;
  specialRequests?: string;
  dietaryRestrictions?: string[];
  paymentInfo: PaymentInfo;
  closedAt?: Date | null;
  uid?: string;
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
  mapId?: string
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
  tableMapId: string;
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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
export interface LoginAttempt {
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

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