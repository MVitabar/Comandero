// types/permissions.ts
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager', 
  CHEF = 'chef',
  WAITER = 'waiter',
  BARMAN = 'barman'
}

export interface RolePermissions {
  views: string[];
  actions: {
    [key: string]: boolean;
  };
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.OWNER]: {
    views: [
      'dashboard',
      'users-management',
      'settings',
      'reports',
      'menu-management',
      'orders',
      'tables',
      'inventory'
    ],
    actions: {
      createUser: true,
      deleteUser: true,
      editUser: true,
      createOrder: true,
      cancelOrder: true,
      modifyMenu: true,
      modifyPrices: true,
      generateReports: true,
      manageTables: true,
      modifyInventory: true
    }
  },
  [UserRole.ADMIN]: {
    views: [
      'dashboard',
      'users-management',
      'settings',
      'reports',
      'menu-management',
      'orders',
      'tables',
      'inventory'
    ],
    actions: {
      createUser: true,
      deleteUser: true,
      editUser: true,
      createOrder: true,
      cancelOrder: true,
      modifyMenu: true,
      modifyPrices: true,
      generateReports: true,
      manageTables: true,
      modifyInventory: true
    }
  },
  [UserRole.MANAGER]: {
    views: [
      'dashboard',
      'reports',
      'menu-management',
      'orders',
      'tables',
      'inventory'
    ],
    actions: {
      createUser: false,
      deleteUser: false,
      editUser: false,
      createOrder: true,
      cancelOrder: true,
      modifyMenu: true,
      modifyPrices: false,
      generateReports: true,
      manageTables: true,
      modifyInventory: true
    }
  },
  [UserRole.CHEF]: {
    views: [
      'orders',
      'menu-management'
    ],
    actions: {
      createUser: false,
      deleteUser: false,
      editUser: false,
      createOrder: false,
      cancelOrder: false,
      modifyMenu: false,
      modifyPrices: false,
      generateReports: false,
      manageTables: false,
      modifyInventory: false,
      updateOrderStatus: true,
      viewOrderDetails: true
    }
  },
  [UserRole.WAITER]: {
    views: [
      'orders',
      'tables'
    ],
    actions: {
      createUser: false,
      deleteUser: false,
      editUser: false,
      createOrder: true,
      cancelOrder: true,
      modifyMenu: false,
      modifyPrices: false,
      generateReports: false,
      manageTables: false,
      modifyInventory: false,
      viewOrderDetails: true
    }
  },
  [UserRole.BARMAN]: {
    views: [
      'orders',
      'menu-management'
    ],
    actions: {
      createUser: false,
      deleteUser: false,
      editUser: false,
      createOrder: false,
      cancelOrder: false,
      modifyMenu: false,
      modifyPrices: false,
      generateReports: false,
      manageTables: false,
      modifyInventory: false,
      updateOrderStatus: true,
      viewOrderDetails: true,
      prepareDrinks: true
    }
  }
}

export function hasPermission(
  role: UserRole, 
  view?: string, 
  action?: keyof RolePermissions['actions']
): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  
  if (view && !permissions.views.includes(view)) {
    return false
  }
  
  if (action && permissions.actions[action] !== true) {
    return false
  }
  
  return true
}