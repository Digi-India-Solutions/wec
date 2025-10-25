export const mockStaff = [
  {
    id: '1',
    name: 'Rahul Verma',
    email: 'rahul.verma@amcmanagement.com',
    role: 'supervisor',
    assignedModules: ['users', 'amcs', 'wallet', 'reports'],
    permissions: {
      users: { read: true, write: true, edit: true, delete: false },
      amcs: { read: true, write: true, edit: true, delete: true },
      wallet: { read: true, write: true, edit: false, delete: false },
      reports: { read: true, write: false, edit: false, delete: false }
    },
    status: 'active',
    createdDate: '2023-06-15',
    lastLogin: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sneha Patel',
    email: 'sneha.patel@amcmanagement.com',
    role: 'support',
    assignedModules: ['amcs', 'customers', 'claims'],
    permissions: {
      amcs: { read: true, write: false, edit: false, delete: false },
      customers: { read: true, write: false, edit: false, delete: false },
      claims: { read: true, write: true, edit: true, delete: false }
    },
    status: 'active',
    createdDate: '2023-07-20',
    lastLogin: '2024-01-14'
  },
  {
    id: '3',
    name: 'Arjun Kumar',
    email: 'arjun.kumar@amcmanagement.com',
    role: 'accounts',
    assignedModules: ['wallet', 'reports', 'claims'],
    permissions: {
      wallet: { read: true, write: true, edit: true, delete: false },
      reports: { read: true, write: false, edit: false, delete: false },
      claims: { read: true, write: false, edit: true, delete: false }
    },
    status: 'active',
    createdDate: '2023-08-10',
    lastLogin: '2024-01-13'
  },
  {
    id: '4',
    name: 'Meera Joshi',
    email: 'meera.joshi@amcmanagement.com',
    role: 'manager',
    assignedModules: ['users', 'products', 'amcs', 'wallet', 'reports', 'claims'],
    permissions: {
      users: { read: true, write: true, edit: true, delete: true },
      products: { read: true, write: true, edit: true, delete: true },
      amcs: { read: true, write: true, edit: true, delete: true },
      wallet: { read: true, write: true, edit: true, delete: false },
      reports: { read: true, write: false, edit: false, delete: false },
      claims: { read: true, write: true, edit: true, delete: true }
    },
    status: 'active',
    createdDate: '2023-05-05',
    lastLogin: '2024-01-15'
  },
  {
    id: '5',
    name: 'Karan Sharma',
    email: 'karan.sharma@amcmanagement.com',
    role: 'support',
    assignedModules: ['customers', 'amcs'],
    permissions: {
      customers: { read: true, write: false, edit: false, delete: false },
      amcs: { read: true, write: false, edit: false, delete: false }
    },
    status: 'inactive',
    createdDate: '2023-09-12',
    lastLogin: '2023-12-20'
  }
];