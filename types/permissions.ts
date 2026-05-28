export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  CHEF = 'chef',
  WAITER = 'waiter',
  BARMAN = 'barman'
}

export interface Permission {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface ModulePermissions {
  profile: Permission;
  language: Permission;
  appearance: Permission;
  notifications: Permission;
  'users-management': Permission;
  dashboard: Permission;
  orders: Permission;
  tables: Permission;
  'cash-register': Permission;
  inventory: Permission;
  purchases: Permission;
  settings: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    sections?: {
      profile: boolean;
      appearance: boolean;
      language: boolean;
      notifications: boolean;
      establishment: boolean;
      security: boolean;
      billing: boolean;
      sessionHistory: boolean;
    };
  };
  reports: Permission;
}

export const ROLE_PERMISSIONS: Record<UserRole, ModulePermissions> = {
  [UserRole.OWNER]: {
    profile: { view: true, create: true, update: true, delete: true },
    language: { view: true, create: true, update: true, delete: true },
    appearance: { view: true, create: true, update: true, delete: true },
    notifications: { view: true, create: true, update: true, delete: true },
    'users-management': { view: true, create: true, update: true, delete: true },
    dashboard: { view: true, create: true, update: true, delete: true },
    orders: { view: true, create: true, update: true, delete: true },
    tables: { view: true, create: true, update: true, delete: true },
    'cash-register': { view: true, create: true, update: true, delete: true },
    inventory: { view: true, create: true, update: true, delete: true },
    purchases: { view: true, create: true, update: true, delete: true },
    settings: {
      view: true,
      create: true,
      update: true,
      delete: true,
      sections: {
        profile: true,
        appearance: true,
        language: true,
        notifications: true,
        establishment: true,
        security: true,
        billing: true,
        sessionHistory: true
      }
    },
    reports: { view: true, create: true, update: true, delete: true }
  },
  [UserRole.ADMIN]: {
    profile: { view: true, create: true, update: true, delete: false },
    language: { view: true, create: true, update: true, delete: true },
    appearance: { view: true, create: true, update: true, delete: true },
    notifications: { view: true, create: true, update: true, delete: true },
    'users-management': { view: true, create: true, update: true, delete: false },
    dashboard: { view: true, create: true, update: true, delete: true },
    orders: { view: true, create: true, update: true, delete: true },
    tables: { view: true, create: true, update: true, delete: true },
    'cash-register': { view: true, create: true, update: true, delete: true },
    inventory: { view: true, create: true, update: true, delete: false },
    purchases: { view: true, create: true, update: true, delete: false },
    reports: { view: true, create: true, update: false, delete: false },
    settings: {
      view: true,
      create: false,
      update: true,
      delete: false,
      sections: {
        profile: true,
        appearance: true,
        language: true,
        notifications: true,
        establishment: true,
        security: false,
        billing: false,
        sessionHistory: true
      }
    }
  },

  [UserRole.MANAGER]: {
    profile: { view: true, create: false, update: true, delete: false },
    language: { view: true, create: true, update: true, delete: true },
    appearance: { view: true, create: true, update: true, delete: true },
    notifications: { view: true, create: true, update: true, delete: true },
    'users-management': { view: true, create: false, update: false, delete: false },
    dashboard: { view: true, create: false, update: false, delete: false },
    orders: { view: true, create: true, update: true, delete: true },
    tables: { view: true, create: true, update: true, delete: true },
    'cash-register': { view: true, create: true, update: true, delete: true },
    inventory: { view: true, create: true, update: true, delete: false },
    purchases: { view: true, create: true, update: true, delete: false },
    reports: { view: true, create: true, update: false, delete: false },
    settings: {
      view: true,
      create: false,
      update: true,
      delete: false,
      sections: {
        profile: true,
        appearance: true,
        language: true,
        notifications: true,
        establishment: false,
        security: false,
        billing: false,
        sessionHistory: true
      }
    }
  },

  [UserRole.CHEF]: {
    profile: { view: true, create: false, update: true, delete: false },
    language: { view: true, create: true, update: true, delete: true },
    appearance: { view: true, create: true, update: true, delete: true },
    notifications: { view: true, create: true, update: true, delete: true },
    'users-management': { view: false, create: false, update: false, delete: false },
    dashboard: { view: false, create: false, update: false, delete: false },
    orders: { view: true, create: false, update: true, delete: false },
    tables: { view: true, create: false, update: false, delete: false },
    'cash-register': { view: false, create: false, update: false, delete: false },
    inventory: { view: true, create: false, update: true, delete: false },
    purchases: { view: false, create: false, update: false, delete: false },
    reports: { view: false, create: false, update: false, delete: false },
    settings: {
      view: true,
      create: false,
      update: true,
      delete: false,
      sections: {
        profile: true,
        appearance: true,
        language: true,
        notifications: true,
        establishment: false,
        security: false,
        billing: false,
        sessionHistory: true
      }
    }
  },
  [UserRole.BARMAN]: {
    profile: { view: true, create: false, update: false, delete: false },
    language: { view: true, create: false, update: false, delete: false },
    appearance: { view: true, create: false, update: false, delete: false },
    notifications: { view: true, create: false, update: false, delete: false },
    'users-management': { view: false, create: false, update: false, delete: false },
    dashboard: { view: false, create: false, update: false, delete: false },
    orders: { view: true, create: false, update: false, delete: false },
    tables: { view: true, create: false, update: false, delete: false },
    'cash-register': { view: false, create: false, update: false, delete: false },
    inventory: { view: true, create: false, update: false, delete: false },
    purchases: { view: false, create: false, update: false, delete: false },
    reports: { view: false, create: false, update: false, delete: false },
    settings: {
      view: false,
      create: false,
      update: false,
      delete: false,
      sections: {
        profile: false,
        appearance: false,
        language: false,
        notifications: false,
        establishment: false,
        security: false,
        billing: false,
        sessionHistory: false
      }
    }
  },

  [UserRole.WAITER]: {
    profile: { view: true, create: false, update: true, delete: false },
    language: { view: true, create: true, update: true, delete: true },
    appearance: { view: true, create: true, update: true, delete: true },
    notifications: { view: true, create: true, update: true, delete: true },
    'users-management': { view: false, create: false, update: false, delete: false },
    dashboard: { view: false, create: false, update: false, delete: false },
    orders: { view: true, create: true, update: true, delete: false },
    tables: { view: true, create: true, update: true, delete: false },
    'cash-register': { view: false, create: false, update: false, delete: false },
    inventory: { view: false, create: false, update: false, delete: false },
    purchases: { view: false, create: false, update: false, delete: false },
    reports: { view: false, create: false, update: false, delete: false },
    settings: {
      view: true,
      create: false,
      update: true,
      delete: false,
      sections: {
        profile: true,
        appearance: true,
        language: true,
        notifications: true,
        establishment: false,
        security: false,
        billing: false,
        sessionHistory: true
      }
    }
  }
};

export function hasPermission(
  role: UserRole,
  module: keyof ModulePermissions,
  action: keyof Permission
): boolean {
  // Si es OWNER, siempre tiene permisos
  if (role === UserRole.OWNER) return true;
  
  // Para otros roles, verificar en ROLE_PERMISSIONS
  return ROLE_PERMISSIONS[role]?.[module]?.[action] ?? false;
}