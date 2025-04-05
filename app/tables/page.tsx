"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { 
  Map, 
  Grid2X2, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"

interface TableMap {
  id: string
  name: string
  description: string
  tables: TableItem[]
  createdAt: Date
}

interface TableItem {
  id: string
  number: number
  seats: number
  status: "available" | "occupied"
}

export default function TablesPage() {
  const { db } = useFirebase()
  const router = useRouter()
  const { t } = useI18n()
  const { toast } = useToast()

  const [tableMaps, setTableMaps] = useState<TableMap[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMap, setSelectedMap] = useState<TableMap | null>(null)

  useEffect(() => {
    async function fetchTableMaps() {
      if (!db) return

      try {
        const mapsCollection = collection(db, "tableMaps")
        const mapsQuery = query(mapsCollection, orderBy("createdAt", "desc"))
        const mapsSnapshot = await getDocs(mapsQuery)
        
        const mapsList = mapsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })) as TableMap[]
        
        setTableMaps(mapsList)
      } catch (error) {
        toast({
          title: t("error"),
          description: t("failedToFetchTableMaps"),
          variant: "destructive"
        })
        console.error("Error fetching table maps:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTableMaps()
  }, [db, toast, t])

  const handleCreateMap = () => {
    router.push("/tables/create")
  }

  const handleEditMap = (map: TableMap) => {
    router.push(`/tables/${map.id}/edit`)
  }

  const handleViewMap = (map: TableMap) => {
    router.push(`/tables/${map.id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="animate-spin">
          <AlertCircle className="h-12 w-12 text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("tableMaps")}</h1>
        <Button onClick={handleCreateMap} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {t("createNewMap")}
        </Button>
      </div>

      {tableMaps.length === 0 ? (
        <div className="text-center space-y-4 p-12 border rounded-lg">
          <Map className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">
            {t("noTableMapsYet")}
          </p>
          <Button onClick={handleCreateMap} variant="outline">
            {t("createFirstMap")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tableMaps.map((map) => (
            <Card key={map.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{map.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {map.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {map.tables.length} {t("tables")}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewMap(map)}
                  >
                    <Grid2X2 className="h-4 w-4 mr-2" />
                    {t("view")}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditMap(map)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit")}
                  </Button>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setSelectedMap(map)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!selectedMap} 
        onOpenChange={() => setSelectedMap(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTableMap")}</DialogTitle>
          </DialogHeader>
          <p>{t("deleteTableMapConfirmation", { name: selectedMap?.name })}</p>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedMap(null)}
            >
              {t("cancel")}
            </Button>
            <Button 
              variant="destructive"
              // Add delete logic here
            >
              {t("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}