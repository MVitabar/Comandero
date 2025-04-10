"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, UserPlus } from "lucide-react"
import Link from "next/link"
import { User } from "@/types"

export default function UsersPage() {
  const { t } = useI18n() as { t: (key: string, options?: any) => string }
  const { db } = useFirebase()
  const { user } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      if (!db || !user) return

      try {
        // Query users subcollection for the current restaurant (user's own restaurant)
        const usersRef = collection(db, "restaurants", user.uid, "users")
        const q = query(usersRef, orderBy("createdAt", "desc"))
        
        const querySnapshot = await getDocs(q)
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as User[]

        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: t("users.errors.fetchUsers"),
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [db, user])

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase()
    return (
      (user.username || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      (user.role || '').toLowerCase().includes(query)
    )
  });

  // Render loading state
  if (loading) {
    return <div>{t("commons.loading")}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("users.pageTitle")}</h1>
        <Button asChild>
          <Link href="/users/add">
            <UserPlus className="mr-2 h-4 w-4" />
            {t("users.addUser")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder={t("users.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("users.userList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("users.username")}</TableHead>
                <TableHead>{t("users.email")}</TableHead>
                <TableHead>{t("users.role")}</TableHead>
                <TableHead>{t("users.status")}</TableHead>
                <TableHead className="text-right">{t("users.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t("users.noUsers")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`users.roles.${(user.role || 'default').toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          "bg-green-100 text-green-800"
                        }
                      >
                        {t("users.userStatus.active")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t("users.openMenu")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => navigator.clipboard.writeText(user.uid)}
                          >
                            {t("users.copyId")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
