"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, Zap, Tv, Wifi, Home, Plus, Edit2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';

interface BillEntry {
  amount: number;
  dueDate: Date;
  isPaid?: boolean;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
}

interface Bills {
  _id: string;
  family_id: string;
  electricity?: BillEntry;
  cable?: BillEntry;
  wifi?: BillEntry;
  tax?: BillEntry;
}

interface BillCategory {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  key: keyof Omit<Bills, '_id' | 'family_id'>;
}

const BillOverview = () => {
  const { data: session } = useSession();
  const [bills, setBills] = useState<Bills | null>(null);
  const [editingBill, setEditingBill] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingBill, setAddingBill] = useState<string | null>(null);

  const billCategories: BillCategory[] = [
    { name: 'Electricity', icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50', key: 'electricity' },
    { name: 'Cable TV', icon: Tv, color: 'text-blue-500', bgColor: 'bg-blue-50', key: 'cable' },
    { name: 'Internet', icon: Wifi, color: 'text-purple-500', bgColor: 'bg-purple-50', key: 'wifi' },
    { name: 'Property Tax', icon: Home, color: 'text-red-500', bgColor: 'bg-red-50', key: 'tax' }
  ];

  // Fetch bills from API
  const fetchBills = async () => {
    try {
      const response = await fetch('/api/overview');
      if (response.ok) {
        const data = await response.json();
        setBills(data.bills);
        
        // Check and update overdue status
        if (data.bills) {
          await checkAndUpdateOverdueStatus(data.bills);
        }
      } else {
        setBills(null);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills(null);
    } finally {
      setLoading(false);
    }
  };

  // Check and update overdue status for bills
  const checkAndUpdateOverdueStatus = async (currentBills: Bills) => {
    const today = new Date();
    const overdueUpdates: { [key: string]: any } = {};

    // Check each bill type
    ['electricity', 'cable', 'wifi', 'tax'].forEach(billType => {
      const bill = currentBills[billType as keyof Bills] as BillEntry | undefined;
      if (bill && bill.status !== 'paid') {
        const dueDate = new Date(bill.dueDate);
        if (dueDate < today && bill.status !== 'overdue') {
          overdueUpdates[billType] = {
            ...bill,
            status: 'overdue'
          };
        }
      }
    });

    // Update overdue bills
    for (const [billType, billUpdates] of Object.entries(overdueUpdates)) {
      try {
        await fetch('/api/overview', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            billType,
            updates: billUpdates
          })
        });
      } catch (error) {
        console.error(`Error updating overdue status for ${billType}:`, error);
      }
    }

    // Refresh bills if any were updated
    if (Object.keys(overdueUpdates).length > 0) {
      await fetchBills();
    }
  };

  useEffect(() => {
    if (session?.user?._id) {
      fetchBills();
    }
  }, [session?.user?._id]);

  const resetBillToOriginal = async (billType: string) => {
    if (!bills) return;
    
    try {
      const response = await fetch('/api/overview', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billType,
          updates: {
            amount: 0,
            dueDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            isPaid: false,
            paidDate: undefined
          }
        })
      });

      if (response.ok) {
        await fetchBills();
        setEditingBill(null);
      }
    } catch (error) {
      console.error('Error resetting bill:', error);
    }
  };

  const addBillForCategory = async (category: BillCategory) => {
    console.log('Adding bill for category:', category.key);
    setAddingBill(category.key);
    
    try {
      const requestBody = {
        [category.key]: {
          amount: 0,
          dueDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          isPaid: false
        }
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        await fetchBills();
        setEditingBill(category.key);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error response:', errorData);
        alert(`Failed to add bill: ${errorData.error || errorData.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding bill:', error);
      alert('Failed to add bill. Please try again.');
    } finally {
      setAddingBill(null);
    }
  };

  const updateBill = async (billType: string, field: string, value: any) => {
    if (!bills) return;
    
    try {
      const currentBill = bills[billType as keyof Bills] as BillEntry | undefined;
      if (!currentBill) return;
      
      const updates = {
        ...currentBill,
        [field]: value
      };

      const response = await fetch('/api/overview', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billType,
          updates
        })
      });

      if (response.ok) {
        await fetchBills();
      }
    } catch (error) {
      console.error('Error updating bill:', error);
    }
  };

  const markBillAsPaid = async (billType: string) => {
    if (!bills) return;
    
    try {
      const currentBill = bills[billType as keyof Bills] as BillEntry | undefined;
      if (!currentBill) return;
      
      const updates = {
        ...currentBill,
        status: 'paid',
        isPaid: true,
        paidDate: new Date()
      };

      const response = await fetch('/api/overview', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billType,
          updates
        })
      });

      if (response.ok) {
        await fetchBills();
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  // Helper function to get only bill entries (excluding _id and family_id)
  const getBillEntries = () => {
    if (!bills) return [];
    return [
      bills.electricity,
      bills.cable, 
      bills.wifi,
      bills.tax
    ].filter(bill => bill !== undefined && bill !== null);
  };

  const getDaysLeft = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (daysLeft: number, status: string) => {
    if (status === 'paid') return 'bg-green-500';
    if (status === 'overdue' || daysLeft < 0) return 'bg-red-500';
    if (daysLeft <= 3) return 'bg-orange-500';
    if (daysLeft <= 7) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getProgressWidth = (daysLeft: number) => {
    const maxDays = 30;
    if (daysLeft < 0) return 100;
    const percentage = Math.max(0, Math.min(100, ((maxDays - daysLeft) / maxDays) * 100));
    return percentage;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || statusStyles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bill Management</h1>
          <p className="text-slate-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bill Management</h1>
        <p className="text-slate-600">Track and manage your recurring bills</p>
      </div>

      <div className="grid gap-6">
        {billCategories.map((category) => {
          const existingBill = bills ? bills[category.key] as BillEntry : null;
          
          if (!existingBill) {
            // Show add button for categories without bills
            const IconComponent = category.icon;
            return (
              <div key={category.name} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${category.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                      <p className="text-sm text-slate-500">No bill added yet</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addBillForCategory(category)}
                    disabled={addingBill === category.key}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{addingBill === category.key ? 'Adding...' : 'Add Bill'}</span>
                  </button>
                </div>
              </div>
            );
          }

          // Show existing bill
          const bill = existingBill;
          const IconComponent = category.icon;
          const daysLeft = getDaysLeft(bill.dueDate);
          const isEditing = editingBill === category.key;

          return (
            <div key={category.name} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${category.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      {getStatusBadge(bill.status)}
                      <span className="text-sm text-slate-500">
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {bill.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setEditingBill(isEditing ? null : category.key)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={bill.amount}
                        onChange={(e) => updateBill(category.key, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-2"
                      />
                      <button
                        onClick={() => markBillAsPaid(category.key)}
                        className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors mb-2"
                      >
                        Mark as Paid
                      </button>
                      <button
                        onClick={() => resetBillToOriginal(category.key)}
                        className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={new Date(bill.dueDate).toISOString().split('T')[0]}
                        onChange={(e) => updateBill(category.key, 'dueDate', new Date(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Status
                      </label>
                      <select
                        value={bill.status}
                        onChange={(e) => updateBill(category.key, 'status', e.target.value)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => setEditingBill(null)}
                        className="w-full px-4 py-2 bg-slate-600 text-white text-sm rounded-md hover:bg-slate-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">
                    {bill.status === 'paid' ? 'Paid' : 
                     daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` :
                     daysLeft === 0 ? 'Due today' :
                     `${daysLeft} days left`}
                  </span>
                  <span className="text-slate-500">
                    {bill.status === 'paid' ? '100%' : `${Math.round(getProgressWidth(daysLeft))}%`}
                  </span>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(daysLeft, bill.status)}`}
                    style={{ 
                      width: bill.status === 'paid' ? '100%' : `${getProgressWidth(daysLeft)}%` 
                    }}
                  />
                </div>

                {(bill.status === 'overdue' || daysLeft <= 3) && bill.status !== 'paid' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {bill.status === 'overdue' 
                        ? `This bill is ${Math.abs(daysLeft)} days overdue!`
                        : `This bill is due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!`
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">
              {bills ? getBillEntries().filter((bill: any) => bill.status === 'paid').length : 0}
            </div>
            <div className="text-sm text-slate-600">Paid</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">
              {bills ? getBillEntries().filter((bill: any) => bill.status === 'pending').length : 0}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-800">
              {bills ? getBillEntries().filter((bill: any) => bill.status === 'overdue').length : 0}
            </div>
            <div className="text-sm text-red-600">Overdue</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-800">
              {bills ? getBillEntries().reduce((sum: number, bill: any) => sum + bill.amount, 0).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-green-600">Total Amount</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillOverview;