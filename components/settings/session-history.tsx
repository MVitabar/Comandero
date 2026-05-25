"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, User, Filter, Loader2, LogIn, LogOut } from "lucide-react"
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { UserRole } from "@/types/permissions"

interface Session {
  sessionId: string
  userId: string
  username: string
  email: string
  role: UserRole
  loginTime: Timestamp
  logoutTime: Timestamp | null
  status: 'active' | 'completed'
  device: {
    type: string
    os: string
    browser: string
  }
  duration?: {
    loginTime: Timestamp
    logoutTime: Timestamp
  }
}

export function SessionHistory() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()

  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [filterUser, setFilterUser] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const canViewSessionHistory = user?.role === UserRole.OWNER || 
                                 user?.role === UserRole.ADMIN || 
                                 user?.role === UserRole.MANAGER

  useEffect(() => {
    if (user?.establishmentId && db && canViewSessionHistory) {
      loadSessions()
    }
  }, [user, db, canViewSessionHistory])

  const loadSessions = async () => {
    if (!user?.establishmentId || !db) return

    setLoading(true)
    try {
      const sessionsRef = collection(db, 'restaurants', user.establishmentId, 'sessions')
      let q = query(sessionsRef, orderBy('loginTime', 'desc'))
      
      const querySnapshot = await getDocs(q)
      const sessionsData = querySnapshot.docs.map(doc => ({
        sessionId: doc.id,
        ...doc.data()
      } as Session))

      setSessions(sessionsData)
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDuration = (loginTime: Timestamp, logoutTime: Timestamp | null): string => {
    if (!logoutTime) return t("settings.sessionHistory.active")
    
    const login = loginTime.toDate()
    const logout = logoutTime.toDate()
    const diffMs = logout.getTime() - login.getTime()
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (timestamp: Timestamp): string => {
    return timestamp.toDate().toLocaleString()
  }

  const filteredSessions = sessions.filter(session => {
    // Exclude owner sessions
    if (session.role === UserRole.OWNER) return false
    if (filterUser !== "all" && session.userId !== filterUser) return false
    if (filterStatus !== "all" && session.status !== filterStatus) return false
    return true
  })

  const uniqueUsers = Array.from(new Set(sessions.map(s => s.userId)))

  if (!canViewSessionHistory) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t("settings.sessionHistory.title")}</h2>
          <p className="text-muted-foreground">{t("settings.sessionHistory.description")}</p>
        </div>
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            {t("settings.sessionHistory.noPermission")}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("settings.sessionHistory.title")}</h2>
        <p className="text-muted-foreground">{t("settings.sessionHistory.description")}</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">{t("settings.sessionHistory.filters")}:</span>
          </div>
          
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("settings.sessionHistory.filterByUser")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("settings.sessionHistory.allUsers")}</SelectItem>
              {uniqueUsers.map(userId => {
                const userSession = sessions.find(s => s.userId === userId)
                return (
                  <SelectItem key={userId} value={userId}>
                    {userSession?.username || userId}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("settings.sessionHistory.filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("settings.sessionHistory.allStatuses")}</SelectItem>
              <SelectItem value="active">{t("settings.sessionHistory.active")}</SelectItem>
              <SelectItem value="completed">{t("settings.sessionHistory.completed")}</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={loadSessions} variant="outline" size="sm">
            {t("settings.sessionHistory.refresh")}
          </Button>
        </div>
      </Card>

      {/* Sessions List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            {t("settings.sessionHistory.noSessions")}
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div key={session.sessionId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{session.username}</p>
                      <p className="text-sm text-muted-foreground">{session.email}</p>
                    </div>
                  </div>
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status === 'active' ? t("settings.sessionHistory.active") : t("settings.sessionHistory.completed")}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">{t("settings.sessionHistory.login")}:</span>
                    <span className="font-medium">{formatDate(session.loginTime)}</span>
                  </div>

                  {session.logoutTime && (
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">{t("settings.sessionHistory.logout")}:</span>
                      <span className="font-medium">{formatDate(session.logoutTime)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-muted-foreground">{t("settings.sessionHistory.role")}:</span>
                    <span className="font-medium capitalize">{session.role}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <p>{t("settings.sessionHistory.device")}: {session.device?.type} - {session.device?.os}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
