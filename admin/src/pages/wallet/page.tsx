
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import DataTable from '../../components/base/DataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import Input from '../../components/base/Input';
import WalletCalculator from '../../components/base/WalletCalculator';
import { useToast } from '../../components/base/Toast';
import { mockDistributors, mockRetailers } from '../../mocks/users';
import { mockWalletTransactions } from '../../mocks/wallet';

export default function WalletPage() {
  const { user } = useAuthStore();
  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState<'balance' | 'transactions' | 'credit'>('balance');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [loading, setLoading] = useState(false);

  // Mock data
  const [distributors, setDistributors] = useState(mockDistributors);
  const [retailers, setRetailers] = useState(mockRetailers);
  const [transactions, setTransactions] = useState(mockWalletTransactions);

  // Get users based on role
  const getAvailableUsers = () => {
    if (user?.role === 'admin') {
      return [
        ...distributors.map(d => ({ ...d, type: 'distributor' })),
        ...retailers.map(r => ({ ...r, type: 'retailer' }))
      ];
    } else if (user?.role === 'distributor') {
      return retailers.filter(r => r.distributorId === user.id).map(r => ({ ...r, type: 'retailer' }));
    }
    return [];
  };

  const availableUsers = getAvailableUsers();

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by user role
    if (user?.role === 'distributor') {
      return matchesSearch && (t.createdBy === user.name || t.userName === user.name);
    }
    
    return matchesSearch;
  });

  const balanceColumns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'type', title: 'Type', render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'distributor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )},
    { key: 'email', title: 'Email' },
    { key: 'walletBalance', title: 'Wallet Balance', render: (value: number) => (
      <span className="font-semibold text-green-600">₹{value.toLocaleString()}</span>
    )},
    { key: 'status', title: 'Status', render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )}
  ];

  const transactionColumns = [
    { key: 'createdDate', title: 'Date', render: (value: string) => 
      new Date(value).toLocaleDateString('en-IN')
    },
    { key: 'userName', title: 'User', sortable: true },
    { key: 'userType', title: 'Type', render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'distributor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )},
    { key: 'type', title: 'Transaction', render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value === 'credit' ? 'Credit' : 'Debit'}
      </span>
    )},
    { key: 'amount', title: 'Amount', render: (value: number, record: any) => (
      <span className={`font-semibold ${record.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
        {record.type === 'credit' ? '+' : '-'}₹{value.toLocaleString()}
      </span>
    )},
    { key: 'description', title: 'Description' },
    { key: 'createdBy', title: 'Created By' }
  ];

  const handleCredit = (user: any) => {
    setSelectedUser(user);
    setTransactionType('credit');
    setIsCreditModalOpen(true);
  };

  const handleDebit = (user: any) => {
    setSelectedUser(user);
    setTransactionType('debit');
    setIsCreditModalOpen(true);
  };

  const handleWalletTransaction = async (clientAmount: number, percentage: number, finalAmount: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Check if debit amount exceeds balance
      if (transactionType === 'debit' && finalAmount > selectedUser.walletBalance) {
        showToast('Insufficient wallet balance', 'error');
        setLoading(false);
        return;
      }

      const transactionAmount = transactionType === 'credit' ? finalAmount : -finalAmount;

      // Update user balance
      if (selectedUser.type === 'distributor') {
        setDistributors(prev => prev.map(d => 
          d.id === selectedUser.id 
            ? { ...d, walletBalance: d.walletBalance + transactionAmount }
            : d
        ));
      } else {
        setRetailers(prev => prev.map(r => 
          r.id === selectedUser.id 
            ? { ...r, walletBalance: r.walletBalance + transactionAmount }
            : r
        ));
      }

      // Add transaction record
      const newTransaction = {
        id: Date.now().toString(),
        userId: selectedUser.id,
        userType: selectedUser.type,
        userName: selectedUser.name,
        type: transactionType,
        amount: finalAmount,
        description: `Wallet ${transactionType} - ${percentage}% of ₹${clientAmount.toLocaleString()}`,
        clientAmount,
        percentage,
        createdBy: user?.name || 'System',
        createdDate: new Date().toISOString(),
        balanceAfter: selectedUser.walletBalance + transactionAmount
      };

      setTransactions(prev => [newTransaction, ...prev]);
      showToast(`₹${finalAmount.toLocaleString()} ${transactionType === 'credit' ? 'credited to' : 'debited from'} ${selectedUser.name}`, 'success');
      setIsCreditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      showToast(`${transactionType === 'credit' ? 'Credit' : 'Debit'} failed`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderBalanceActions = (record: any) => (
    <div className="flex space-x-2">
      <Button
        size="sm"
        onClick={() => handleCredit(record)}
        disabled={record.status !== 'active'}
      >
        <i className="ri-add-line mr-1 w-4 h-4 flex items-center justify-center"></i>
        Add
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleDebit(record)}
        disabled={record.status !== 'active' || record.walletBalance <= 0}
      >
        <i className="ri-subtract-line mr-1 w-4 h-4 flex items-center justify-center"></i>
        Remove
      </Button>
    </div>
  );

  // Calculate totals
  const totalBalance = availableUsers.reduce((sum, user) => sum + user.walletBalance, 0);
  const totalCredits = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
        {(user?.role === 'admin' || user?.role === 'distributor') && (
          <div className="flex space-x-3">
            <Button onClick={() => setIsCreditModalOpen(true)}>
              <i className="ri-add-line mr-2 w-4 h-4 flex items-center justify-center"></i>
              Add Points
            </Button>
            <Button 
              variant="secondary"
              onClick={() => {
                setTransactionType('debit');
                setIsCreditModalOpen(true);
              }}
            >
              <i className="ri-subtract-line mr-2 w-4 h-4 flex items-center justify-center"></i>
              Remove Points
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-green-600">₹{totalBalance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="ri-wallet-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalCredits.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-up-circle-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Debits</p>
              <p className="text-2xl font-bold text-red-600">₹{totalDebits.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-down-circle-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('balance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
              activeTab === 'balance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Wallet Balances ({availableUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transactions ({filteredTransactions.length})
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="flex-1">
        <Input
          placeholder={activeTab === 'balance' ? "Search users..." : "Search transactions..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon="ri-search-line"
        />
      </div>

      {/* Content */}
      {activeTab === 'balance' && (
        <DataTable
          data={availableUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          columns={balanceColumns}
          actions={renderBalanceActions}
        />
      )}

      {activeTab === 'transactions' && (
        <DataTable
          data={filteredTransactions}
          columns={transactionColumns}
        />
      )}

      {/* Transaction Modal */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => {
          setIsCreditModalOpen(false);
          setSelectedUser(null);
        }}
        title={`${transactionType === 'credit' ? 'Credit' : 'Debit'} Wallet`}
        size="lg"
      >
        <div className="space-y-6">
          {!selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User to {transactionType === 'credit' ? 'Credit' : 'Debit'}
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableUsers.filter(u => u.status === 'active' && (transactionType === 'credit' || u.walletBalance > 0)).map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.type === 'distributor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                        </span>
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          ₹{user.walletBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Selected User</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.type === 'distributor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1)}
                    </span>
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      Current Balance: ₹{selectedUser.walletBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedUser(null)}
                  className="mt-2"
                >
                  Change User
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <i className={`${transactionType === 'credit' ? 'ri-add-circle-line text-green-600' : 'ri-subtract-circle-line text-red-600'} w-5 h-5 flex items-center justify-center`}></i>
                  <h3 className="font-medium text-gray-900">
                    {transactionType === 'credit' ? 'Add Points' : 'Remove Points'}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  {transactionType === 'credit' 
                    ? 'Add points to increase the user\'s wallet balance.' 
                    : 'Remove points to decrease the user\'s wallet balance.'}
                </p>
              </div>

              <WalletCalculator
                onCredit={handleWalletTransaction}
                loading={loading}
                buttonText={transactionType === 'credit' ? 'Credit Wallet' : 'Debit Wallet'}
                buttonColor={transactionType === 'credit' ? 'primary' : 'danger'}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}