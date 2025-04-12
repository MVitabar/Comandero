// components/user-management.tsx
import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { UnauthorizedAccess } from './unauthorized'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc 
} from "firebase/firestore"
import { useFirebase } from '@/components/firebase-provider'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'

// Definir una interfaz para el tipo de usuario
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function UserManagement() {
  const { canView, canDo } = usePermissions()
  const { db } = useFirebase()
  
  // Especificar el tipo de estado como User[]
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  // Solo accesible para admin
  if (!canView('users-management')) {
    return <UnauthorizedAccess />
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      
      // Mapear los documentos con tipado correcto
      const usersList: User[] = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<User, 'id'>)
      }))
      
      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!canDo('deleteUser')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'users', userId))
      
      // Filtrar el usuario eliminado del estado
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {canDo('deleteUser') && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Eliminar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}