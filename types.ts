
export type Role = 'SUPER_ADMIN' | 'MARKET_ADMIN' | 'COUNTER_STAFF' | 'VENDOR' | 'SUPPLIER' | 'USER';

export interface UserSettings {
  lowStockThreshold: number;
  criticalStockThreshold: number;
  notifications: {
    email: boolean;
    browser: boolean;
    sms: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  kycStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NONE';
  mfaEnabled: boolean;
  profileImage?: string;
  appliedRole?: Role;
  settings?: UserSettings;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'PENDING_APPROVAL' | 'UNDER_REVIEW';
  kycStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NONE';
  products: number;
  joinedDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  city: string;
  market: string;
  rentDue: number;
  vatDue: number;
  level?: string;
  section?: string;
  storeType?: 'STALL' | 'KIOSK' | 'SHOP' | 'WAREHOUSE';
  ownershipType?: 'LEASED' | 'OWNED' | 'SUB-LEASED';
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  vendor: string;
  stock: number;
  price: number;
  status: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'PENDING_APPROVAL';
  category: string;
  isFeatured?: boolean;
  images?: string[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'RENT' | 'SERVICE_CHARGE' | 'LICENSE' | 'VAT' | 'GATE_FEE' | 'SALE_REVENUE' | 'PAYOUT' | 'WITHDRAWAL' | 'SUPPLY_PAYMENT' | 'SUPPLY_REVENUE';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  method: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK' | 'CASH' | 'CARD';
  referenceId?: string;
  direction?: 'IN' | 'OUT';
}

export interface Market {
  id: string;
  name: string;
  city: string;
  type: 'WHOLESALE' | 'RETAIL' | 'MIXED';
  ownership: 'PUBLIC' | 'PRIVATE' | 'PPP';
  establishedDate: string;
  primaryProducts: string[];
  capacity: number;
}

export interface StockLog {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  vendor: string;
  type: 'INBOUND' | 'OUTBOUND';
  timestamp: string;
  inspector: string;
  status: 'VERIFIED' | 'FLAGGED' | 'PENDING';
}

export interface ParkingSlot {
  id: string;
  zone: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  vehiclePlate?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  context: 'SUPPORT' | 'ASSET' | 'SUPPLY' | 'COMPLAINT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  creatorId: string;
  creatorName: string;
  createdAt: string;
  attachmentUrl?: string;
  assetType?: string;
  assignedToId?: string;
  assignedToName?: string;
}

export interface SupplierShowcaseItem {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  category: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  category: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  warehouseLocation: string;
  suppliedItemsCount: number;
  rating: number;
  totalRatings: number;
  kycValidated: boolean;
  walletBalance: number;
  showcase?: SupplierShowcaseItem[];
  onboardingDate?: string;
  totalRevenue?: number;
  pendingPayouts?: number;
}

export interface CityMarketData {
  city: string;
  markets: string[];
}

export interface Bid {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  deliveryTime: string;
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface Requisition {
  id: string;
  vendorId: string;
  vendorName: string;
  itemName: string;
  quantity: number;
  unit: string;
  budget: number;
  status: 'OPEN' | 'BIDDING' | 'CLOSED';
  createdAt: string;
  description: string;
  bids: Bid[];
}

export interface ManifestItem {
  id: string;
  vendorId: string;
  vendorName: string;
  itemName: string;
  qty: number;
  estPrice: number;
  paid: boolean;
}

export interface BridgeLogistics {
  id: string;
  dispatchDate: string;
  status: 'PREPARING' | 'EN_ROUTE' | 'COMPLETED';
  capacity: number;
  items: ManifestItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  vendorName: string;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  type: 'INCOMING' | 'OUTGOING';
  tags?: string[];
}

export interface GateRecord {
    id: string;
    plate: string;
    type: string;
    timeIn: string;
    timeOut?: string;
    status: 'INSIDE' | 'EXITED';
    charge: number;
    paymentStatus: 'PAID' | 'PENDING';
    token: string;
}