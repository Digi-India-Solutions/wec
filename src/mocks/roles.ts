export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermission[];
  status: 'active' | 'inactive';
  createdDate: string;
  createdBy: string;
}

export interface ModulePermission {
  module: string;
  permissions: string[];
}

export const availableModules = [
  'Dashboard',
  'Distributors',
  'Retailers',
  'Products',
  'AMC Management',
  'Wallet Management',
  'Reports',
  'Claims Management',
  'Staff Management',
  'Settings'
];

export const availablePermissions = ['read', 'write', 'edit', 'delete'];

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: availableModules.map(module => ({
      module,
      permissions: ['read', 'write', 'edit', 'delete']
    })),
    status: 'active',
    createdDate: '2023-01-01',
    createdBy: 'System'
  },
  {
    id: '2',
    name: 'Support Manager',
    description: 'Manage claims and customer support operations',
    permissions: [
      { module: 'Dashboard', permissions: ['read'] },
      { module: 'Claims Management', permissions: ['read', 'write', 'edit'] },
      { module: 'AMC Management', permissions: ['read', 'edit'] },
      { module: 'Reports', permissions: ['read'] }
    ],
    status: 'active',
    createdDate: '2023-01-15',
    createdBy: 'Super Admin'
  },
  {
    id: '3',
    name: 'Accounts Manager',
    description: 'Handle financial operations and wallet management',
    permissions: [
      { module: 'Dashboard', permissions: ['read'] },
      { module: 'Wallet Management', permissions: ['read', 'write', 'edit'] },
      { module: 'Reports', permissions: ['read', 'write'] },
      { module: 'Claims Management', permissions: ['read', 'edit'] }
    ],
    status: 'active',
    createdDate: '2023-01-20',
    createdBy: 'Super Admin'
  },
  {
    id: '4',
    name: 'Sales Supervisor',
    description: 'Oversee distributor and retailer operations',
    permissions: [
      { module: 'Dashboard', permissions: ['read'] },
      { module: 'Distributors', permissions: ['read', 'write', 'edit'] },
      { module: 'Retailers', permissions: ['read', 'write', 'edit'] },
      { module: 'AMC Management', permissions: ['read', 'write'] },
      { module: 'Reports', permissions: ['read'] }
    ],
    status: 'active',
    createdDate: '2023-02-01',
    createdBy: 'Super Admin'
  },
  {
    id: '5',
    name: 'Read Only User',
    description: 'View-only access to system data',
    permissions: availableModules.map(module => ({
      module,
      permissions: ['read']
    })),
    status: 'inactive',
    createdDate: '2023-02-15',
    createdBy: 'Super Admin'
  }
];