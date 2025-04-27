"use client"

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { ModulePermissions, Permission, hasPermission, UserRole } from "@/types/permissions";
import { PermissionsContextType } from '@/types';

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const checkPermission = (
    module: string | number,
    action: keyof Permission
  ): boolean => {
    if (!user || !user.role) {
      return false;
    }

    // Si es OWNER, dar acceso total
    if (user.role === UserRole.OWNER) { // Use enum instead of string
      return true;
    }

    return hasPermission(user.role as UserRole, module as keyof ModulePermissions, action);
  };

  const value: PermissionsContextType = {
    canView: (module: string | number) => checkPermission(module, "view"),
    canCreate: (module: string | number) => checkPermission(module, "create"),
    canUpdate: (module: string | number) => checkPermission(module, "update"),
    canDelete: (module: string | number) => checkPermission(module, "delete"),
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}