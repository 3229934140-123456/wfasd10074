export type VendorCategory =
  | 'photography'
  | 'venue'
  | 'florist'
  | 'host'
  | 'band'
  | 'makeup'
  | 'dress'
  | 'candy';

export interface PortfolioItem {
  id: string;
  title: string;
  images: string[];
  description: string;
  date: string;
}

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  content: string;
  images?: string[];
  date: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  avatar: string;
  coverImages: string[];
  rating: number;
  reviewCount: number;
  priceRange: { min: number; max: number };
  description: string;
  portfolio: PortfolioItem[];
  reviews: Review[];
  packages: ServicePackage[];
  contact: { phone: string; wechat?: string };
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'wechat' | 'alipay' | 'credit_card';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: '现金',
  bank_transfer: '银行转账',
  wechat: '微信支付',
  alipay: '支付宝',
  credit_card: '信用卡',
};

export interface PaymentRecord {
  method?: PaymentMethod;
  note?: string;
  voucherImage?: string;
  transactionId?: string;
}

export interface Payment {
  id: string;
  type: 'deposit' | 'midterm' | 'final';
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'pending' | 'paid' | 'overdue';
  record?: PaymentRecord;
}

export interface ServiceContract {
  id: string;
  projectId: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar?: string;
  category?: VendorCategory;
  packageId: string;
  packageName: string;
  totalPrice: number;
  status: 'draft' | 'pending' | 'signed' | 'completed' | 'cancelled';
  signedAt?: string;
  payments: Payment[];
  serviceDate: string;
  notes?: string;
}

export type TodoCategory = 'document' | 'vendor' | 'preparation' | 'guest' | 'dayof';
export type Priority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  category: TodoCategory;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  assigneeId?: string;
  reminderDays: number;
  reminded: boolean;
}

export type CollaboratorRole = 'groom_family' | 'bride_family' | 'bridesmaid' | 'groomsman' | 'friend' | 'couple';

export interface Collaborator {
  id: string;
  projectId: string;
  name: string;
  avatar: string;
  role: CollaboratorRole;
  roleLabel: string;
  phone: string;
  tasksAssigned: number;
  tasksCompleted: number;
}

export type GuestRelation = 'groom' | 'bride' | 'both';
export type RsvpStatus = 'pending' | 'confirmed' | 'declined';

export interface Guest {
  id: string;
  projectId: string;
  name: string;
  relation: GuestRelation;
  relationLabel: string;
  phone: string;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  tableId?: string;
  seatNumber?: number;
  dietaryNote?: string;
  gift?: string;
}

export type TableShape = 'round' | 'rectangle';

export interface SeatTable {
  id: string;
  projectId: string;
  tableNumber: number;
  name?: string;
  capacity: number;
  shape: TableShape;
  position: { x: number; y: number };
  guestIds: string[];
}

export interface SeatingPlanVersion {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  tables: SeatTable[];
  isActive: boolean;
}

export type VendorConfirmationStatus = 'pending' | 'confirmed' | 'needs_changes';

export const VENDOR_CONFIRMATION_LABELS: Record<VendorConfirmationStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  needs_changes: '需调整',
};

export interface VendorConfirmation {
  vendorId: string;
  status: VendorConfirmationStatus;
  confirmedAt?: string;
  contactPerson?: string;
  contactPhone?: string;
  note?: string;
}

export interface WeddingTimelineItem {
  id: string;
  projectId: string;
  time: string;
  title: string;
  location: string;
  description?: string;
  responsibleIds: string[];
  responsibleType: 'collaborator' | 'vendor' | 'both';
  vendorIds?: string[];
  vendorConfirmations?: VendorConfirmation[];
}

export type WeddingStyle = 'romantic' | 'modern' | 'vintage' | 'chinese' | 'outdoor';

export interface WeddingProject {
  id: string;
  coupleName: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  location: string;
  budget: {
    total: number;
    used: number;
  };
  style: WeddingStyle;
  styleNote?: string;
  createdAt: string;
}

export type UserRole = 'couple' | 'collaborator' | 'vendor';

export interface CurrentUser {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  projectId: string;
}

export const CATEGORY_LABELS: Record<VendorCategory, string> = {
  photography: '婚礼摄影',
  venue: '婚礼场地',
  florist: '花艺布置',
  host: '婚礼主持',
  band: '乐队演出',
  makeup: '化妆造型',
  dress: '婚纱礼服',
  candy: '喜糖伴手礼',
};

export const CATEGORY_ICONS: Record<VendorCategory, string> = {
  photography: 'Camera',
  venue: 'Building2',
  florist: 'Flower2',
  host: 'Mic2',
  band: 'Music',
  makeup: 'Sparkles',
  dress: 'Shirt',
  candy: 'Gift',
};

export const TODO_CATEGORY_LABELS: Record<TodoCategory, string> = {
  document: '证件文书',
  vendor: '供应商',
  preparation: '筹备事项',
  guest: '宾客相关',
  dayof: '婚礼当天',
};

export const WEDDING_STYLE_LABELS: Record<WeddingStyle, string> = {
  romantic: '浪漫唯美',
  modern: '现代简约',
  vintage: '复古典雅',
  chinese: '中式传统',
  outdoor: '户外自然',
};

export const COLLABORATOR_ROLE_LABELS: Record<CollaboratorRole, string> = {
  couple: '新人',
  groom_family: '男方家人',
  bride_family: '女方家人',
  bridesmaid: '伴娘',
  groomsman: '伴郎',
  friend: '好友',
};
