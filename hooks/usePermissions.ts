// hooks/usePermissions.ts
import { useAuth } from "@/components/auth-provider"
import { UserRole, hasPermission, ROLE_PERMISSIONS } from "@/types/permissions"

export function usePermissions() {
  const { user } = useAuth()
  
  const checkPermission = (
    view?: string, 
    action?: string
  ) => {
    // Si no hay usuario, retornar false
    if (!user) return false
    
    // Validar que el rol sea un UserRole válido
    const normalizedRole = (user.role || 'owner').toLowerCase() as UserRole
    
    // Verificar si el rol existe en UserRole
    const isValidRole = Object.values(UserRole).includes(normalizedRole)
    
    // Si no es un rol válido, usar 'owner' por defecto
    const safeRole = isValidRole ? normalizedRole : UserRole.OWNER
    
    return hasPermission(
      safeRole, 
      view, 
      action
    )
  }
  
  return {
    canView: (view: string) => checkPermission(view),
    canDo: (action: string) => checkPermission(undefined, action)
  }
}