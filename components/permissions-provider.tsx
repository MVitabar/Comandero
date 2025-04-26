"use client"

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { ModulePermissions, Permission, hasPermission, UserRole } from "@/types/permissions";

interface PermissionsContextType {
  canView: (module: keyof ModulePermissions) => boolean;
  canCreate: (module: keyof ModulePermissions) => boolean;
  canUpdate: (module: keyof ModulePermissions) => boolean;
  canDelete: (module: keyof ModulePermissions) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const checkPermission = (
    module: keyof ModulePermissions,
    action: keyof Permission
  ): boolean => {
    if (!user || !user.role) {
      return false;
    }

    // Si es OWNER, dar acceso total
    if (user.role === UserRole.OWNER) { // Use enum instead of string
      return true;
    }

    return hasPermission(user.role as UserRole, module, action);
  };

  const value = {
    canView: (module: keyof ModulePermissions) => checkPermission(module, "view"),
    canCreate: (module: keyof ModulePermissions) => checkPermission(module, "create"),
    canUpdate: (module: keyof ModulePermissions) => checkPermission(module, "update"),
    canDelete: (module: keyof ModulePermissions) => checkPermission(module, "delete"),
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