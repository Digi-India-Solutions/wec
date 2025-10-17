
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'distributor' | 'retailer';
}

export interface DashboardStats {
  totalAMCs: number;
  activeContracts: number;
  expiringThisMonth: number;
  totalRevenue: number;
  totalDistributors?: number;
  totalRetailers?: number;
}

export interface Distributor {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  walletBalance: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  totalRetailers: number;
  totalAMCs: number;
}

export interface Retailer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  assignedDistributor: string;
  distributorId: string;
  walletBalance: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  totalAMCs: number;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  type?: string;
  model?: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface AMC {
  id: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  productCategory: string;
  productBrand: string;
  productType: string;
  productModel: string;
  purchaseValue: number;
  amcPercentage: number;
  amcAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired' | 'renewed';
  retailerId: string;
  retailerName: string;
  distributorId: string;
  distributorName: string;
  createdDate: string;
  renewalCount: number;
  lastServiceDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  totalAMCs: number;
  activeAMCs: number;
  totalSpent: number;
  joinedDate: string;
  lastPurchase: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userType: 'distributor' | 'retailer';
  userName: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  clientAmount?: number;
  percentage?: number;
  createdBy: string;
  createdDate: string;
  balanceAfter: number;
}
