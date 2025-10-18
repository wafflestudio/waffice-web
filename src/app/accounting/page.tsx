'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountingOverview } from '@/components/accounting/accounting-overview';
import { TransactionTable } from '@/components/accounting/transaction-table';
import { apiClient } from '@/lib/api';
import { Transaction, TransactionCreate, AccountBalance } from '@/types';
import { Plus } from 'lucide-react';

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: 1,
    amount: 1000,
    description: 'Club membership fees',
    transaction_type: 'income',
    comments: 'Monthly membership collection',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    amount: 150,
    description: 'Project materials',
    transaction_type: 'expense',
    comments: 'Arduino boards and sensors',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 3,
    amount: 500,
    description: 'Event venue rental',
    transaction_type: 'expense',
    comments: 'Monthly meetup venue',
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  {
    id: 4,
    amount: 200,
    description: 'Sponsorship from TechCorp',
    transaction_type: 'income',
    comments: 'Q1 sponsorship payment',
    created_at: '2025-01-25T00:00:00Z',
    updated_at: '2025-01-25T00:00:00Z',
  },
];

const mockBalance: AccountBalance = {
  total_income: 1200,
  total_expense: 650,
  balance: 550,
  transaction_count: 4,
};

export default function AccountingPage() {
  const queryClient = useQueryClient();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [balance, setBalance] = useState<AccountBalance>(mockBalance);

  // In a real app, you would use these queries:
  // const { data: transactions = [] } = useQuery({
  //   queryKey: ['transactions'],
  //   queryFn: () => apiClient.getTransactions(),
  // });
  // const { data: balance } = useQuery({
  //   queryKey: ['account-balance'],
  //   queryFn: () => apiClient.getAccountBalance(),
  // });

  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionCreate) => apiClient.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['account-balance'] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['account-balance'] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['account-balance'] });
    },
  });

  const handleCreateTransaction = async (data: TransactionCreate) => {
    // For demo, add to local state
    const newTransaction: Transaction = {
      id: Math.max(...transactions.map(t => t.id)) + 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update balance
    const amount = data.transaction_type === 'income' ? data.amount : -data.amount;
    setBalance(prev => ({
      total_income: data.transaction_type === 'income' ? prev.total_income + data.amount : prev.total_income,
      total_expense: data.transaction_type === 'expense' ? prev.total_expense + data.amount : prev.total_expense,
      balance: prev.balance + amount,
      transaction_count: prev.transaction_count + 1,
    }));
  };

  const handleUpdateTransaction = async (id: number, data: any) => {
    // For demo, update local state
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t)
    );
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm('이 거래를 삭제하시겠습니까?')) {
      // For demo, remove from local state
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        
        // Update balance
        const amount = transaction.transaction_type === 'income' ? -transaction.amount : transaction.amount;
        setBalance(prev => ({
          total_income: transaction.transaction_type === 'income' ? prev.total_income - transaction.amount : prev.total_income,
          total_expense: transaction.transaction_type === 'expense' ? prev.total_expense - transaction.amount : prev.total_expense,
          balance: prev.balance + amount,
          transaction_count: prev.transaction_count - 1,
        }));
      }
    }
  };

  const handleAddComment = async (id: number, comment: string) => {
    // For demo, update local state
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, comments: comment, updated_at: new Date().toISOString() } : t)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">회계 관리</h1>
        <Button onClick={() => {/* Add transaction form */}}>
          <Plus className="mr-2 h-4 w-4" />
          거래 추가
        </Button>
      </div>

      <AccountingOverview balance={balance} />

      <Card>
        <CardHeader>
          <CardTitle>거래 내역 ({transactions.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable
            transactions={transactions}
            onUpdate={handleUpdateTransaction}
            onDelete={handleDeleteTransaction}
            onAddComment={handleAddComment}
          />
        </CardContent>
      </Card>
    </div>
  );
}
