// Member types
export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface MemberCreate {
  name: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface MemberUpdate {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  budget?: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  members: Member[];
}

export interface ProjectCreate {
  name: string;
  description?: string;
  budget?: number;
  status?: 'planning' | 'active' | 'completed' | 'cancelled';
  member_ids: number[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  budget?: number;
  status?: 'planning' | 'active' | 'completed' | 'cancelled';
  member_ids?: number[];
}

// Expense Claim types
export interface ExpenseClaim {
  id: number;
  member_id: number;
  project_id: number;
  amount: number;
  description: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseClaimCreate {
  amount: number;
  description: string;
  project_id: number;
  receipt_url?: string;
}

export interface ExpenseClaimUpdate {
  amount?: number;
  description?: string;
  receipt_url?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

// Transaction types
export interface Transaction {
  id: number;
  amount: number;
  description: string;
  transaction_type: 'income' | 'expense';
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  amount: number;
  description: string;
  transaction_type: 'income' | 'expense';
  comments?: string;
}

export interface TransactionUpdate {
  amount?: number;
  description?: string;
  comments?: string;
}

// Account Balance types
export interface AccountBalance {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
}
