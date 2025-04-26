import { useContext } from 'react';
import { UserRole, ModulePermissions, Permission, hasPermission } from '@/types/permissions';
import { useAuth } from './useAuth';

export function usePermissions() {
  const { user } = useAuth();
  
  console.log('Current user in usePermissions:', user); // Debug log

  const checkPermission = (
    module: keyof ModulePermissions,
    action: keyof Permission
  ): boolean => {
    if (!user || !user.role) {
      console.log('No user or role found:', { user, role: user?.role }); // Debug log
      return false;
    }

    // Si es OWNER, dar acceso total
    if (user.role === UserRole.OWNER) {
      console.log('User is OWNER, granting access');
      return true;
    }

    const permissionGranted = hasPermission(user.role, module, action);
    console.log(`Permission check for ${module}.${action}:`, permissionGranted); // Debug log
    return permissionGranted;
  };

  return {
    canView: (module: keyof ModulePermissions) => checkPermission(module, 'view'),
    canCreate: (module: keyof ModulePermissions) => checkPermission(module, 'create'),
    canUpdate: (module: keyof ModulePermissions) => checkPermission(module, 'update'),
    canDelete: (module: keyof ModulePermissions) => checkPermission(module, 'delete'),
  };
}
