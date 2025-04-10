"use client"

import type React from "react"
import { InventoryItem } from "@/types"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  deleteField,  // Add this import
  where, 
  writeBatch, 
  serverTimestamp,
  getDoc,
  setDoc,
  Timestamp
} from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, AlertTriangle } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

const entradas = [
  {
    name: "Coxinha",
    description: "Coxinha de frango",
    price: 10.0,
  },
  {
    name: "Pão de Queijo",
    description: "Pão de queijo fresco",
    price: 8.0,
  }
];

const pratosPrincipais = [
  {
    name: "Feijoada",
    description: "Feijoada com arroz e farofa",
    price: 25.0,
  },
  {
    name: "Churrasco",
    description: "Churrasco de carne com arroz e feijão",
    price: 30.0,
  }
];

const saladas = [
  {
    name: "Salada de Frutas",
    description: "Salada de frutas frescas",
    price: 15.0,
  },
  {
    name: "Salada de Folhas",
    description: "Salada de folhas verdes com frutas secas",
    price: 12.0,
  }
];

const bebidas = [
  {
    name: "Água",
    description: "Água mineral",
    price: 5.0,
  },
  {
    name: "Refrigerante",
    description: "Refrigerante de cola",
    price: 8.0,
  }
];

const sobremesas = [
  {
    name: "Torta de Chocolate",
    description: "Torta de chocolate com cobertura de chocolate",
    price: 18.0,
  },
  {
    name: "Mousse de Maracujá",
    description: "Mousse de maracujá com calda de maracujá",
    price: 15.0,
  }
];

const porcoesExtras = [
  {
    name: "Arroz",
    description: "Arroz branco",
    price: 5.0,
  },
  {
    name: "Feijão",
    description: "Feijão preto",
    price: 5.0,
  }
];

export default function InventoryPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const { toast } = useToast()

  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Track if initial items have been added
  const [initialItemsAdded, setInitialItemsAdded] = useState(false);

  // State for storing categories
  const [categories, setCategories] = useState<string[]>([
    'entradas', 
    'pratosPrincipais', 
    'saladas', 
    'bebidas', 
    'sobremesas', 
    'porcoesExtras'
  ]);

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    if (!db || !user) return;

    try {
      const inventoryRef = doc(db, 'restaurants', user.uid);
      const categoriesRef = collection(inventoryRef, 'inventory');
      const categoriesSnapshot = await getDocs(categoriesRef);

      const fetchedCategories = categoriesSnapshot.docs
        .map(doc => doc.id)
        .filter(category => 
          !['entradas', 'pratosPrincipais', 'saladas', 'bebidas', 'sobremesas', 'porcoesExtras']
            .includes(category)
        );

      // Combine default and fetched categories, removing duplicates
      const uniqueCategories = [
        ...new Set([
          ...categories,
          ...fetchedCategories
        ])
      ].sort();

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Use effect to fetch categories when user and db are ready
  useEffect(() => {
    if (db && user) {
      fetchCategories();
    }
  }, [db, user]);

  // Add detailed logging for debugging
  useEffect(() => {
    console.group('🏪 Inventory Page Initialization');
    console.log('Current User:', user);
    console.log('Current Database:', db);
    console.log('Initial Items:', items);
    console.groupEnd();
  }, [user, db]);

  // Default categories to create if none exist
  const DEFAULT_CATEGORIES = [
    'entradas', 
    'pratosPrincipais', 
    'saladas', 
    'bebidas', 
    'sobremesas', 
    'porcoesExtras'
  ];

  // Method to create default categories
  const initializeDefaultCategories = async () => {
    if (!db || !user) return;

    try {
      const inventoryRef = doc(db, 'restaurants', user.uid);
      const categoriesRef = collection(inventoryRef, 'inventory');

      // Batch write to create categories efficiently
      const batch = writeBatch(db);

      DEFAULT_CATEGORIES.forEach(categoryName => {
        const categoryDocRef = doc(categoriesRef, categoryName);
        batch.set(categoryDocRef, {
          name: categoryName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      await batch.commit();
      console.log('Default categories created successfully');
    } catch (error) {
      console.error('Error creating default categories:', error);
      toast({
        title: "Erro ao Criar Categorias",
        description: "Não foi possível criar categorias padrão",
        variant: "destructive"
      });
    }
  };

  // Comprehensive useEffect for fetching inventory items
  useEffect(() => {
    const safelyFetchInventoryItems = async () => {
      console.group('📦 Fetching Inventory Items');
      console.log('User:', user);
      console.log('Database:', db);

      if (!db || !user) {
        console.warn('Database or user not available');
        setItems([]);
        console.groupEnd();
        return;
      }

      const allItems: InventoryItem[] = [];

      try {
        // Fetch all categories first
        const categoriesRef = collection(db, 'restaurants', user.uid, 'inventory');
        const categoriesSnapshot = await getDocs(categoriesRef);
        
        console.log('Categories Found:', categoriesSnapshot.docs.map(doc => doc.id));

        // If no categories exist, create default ones
        if (categoriesSnapshot.empty) {
          await initializeDefaultCategories();
          
          // Refetch categories after initialization
          const reInitializedCategoriesSnapshot = await getDocs(categoriesRef);
          categoriesSnapshot.docs.push(...reInitializedCategoriesSnapshot.docs);
        }

        // Fetch items for each category synchronously
        for (const categoryDoc of categoriesSnapshot.docs) {
          const category = categoryDoc.id;
          const categoryData = categoryDoc.data();
          
          // Check if the category has items
          if (categoryData && categoryData.items) {
            const categoryItems = Object.values(categoryData.items);
            
            console.log(`Items in Category ${category}:`, categoryItems.length);

            categoryItems.forEach((itemData: any) => {
              const inventoryItem: InventoryItem = {
                id: itemData.id || itemData.uid,
                uid: itemData.id || itemData.uid,
                name: itemData.name || '',
                category: category,
                quantity: itemData.quantity || 0,
                unit: itemData.unit || '',
                price: itemData.price || 0,
                description: itemData.description || '',
                minQuantity: itemData.minQuantity || 0,
                notes: itemData.notes || '',
                supplier: itemData.supplier || '',
                reorderPoint: itemData.reorderPoint || 0,
                createdAt: itemData.createdAt?.toDate() || new Date(),
                updatedAt: itemData.updatedAt?.toDate() || new Date(),
                restaurantId: user.uid,
                ...itemData
              };

              allItems.push(inventoryItem);
            });
          }
        }

        console.log('Total Items Fetched:', allItems.length);
        
        // Sort items by creation date
        const sortedItems = allItems.sort((a, b) => {
          // Helper function to convert various date representations to Date
          const normalizeDate = (value: any): Date => {
            // If already a Date, return as-is
            if (value instanceof Date) return value;

            // If Firestore Timestamp, convert to Date
            if (value && typeof value === 'object' && 'toDate' in value) {
              return (value as Timestamp).toDate();
            }

            // If string, try to parse as Date
            if (typeof value === 'string') {
              const parsedDate = new Date(value);
              return !isNaN(parsedDate.getTime()) ? parsedDate : new Date(0);
            }

            // Fallback to epoch start
            return new Date(0);
          };

          // Convert and compare dates
          const aCreatedAt = normalizeDate(a.createdAt);
          const bCreatedAt = normalizeDate(b.createdAt);

          // Compare timestamps, with most recent first
          return bCreatedAt.getTime() - aCreatedAt.getTime();
        });

        setItems(sortedItems);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
        toast({
          title: "Erro ao Buscar Itens",
          description: "Não foi possível carregar os itens do inventário",
          variant: "destructive"
        });
        setItems([]);
      }
    };

    safelyFetchInventoryItems();
  }, [db, user]);

  // Filter items based on search query
  const filteredItems = searchQuery 
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  // State to store available categories
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Fetch categories when user and db are available
  useEffect(() => {
    const fetchCategories = async () => {
      if (!db || !user) return;

      try {
        const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory');
        
        const categoriesSnapshot = await getDocs(inventoryRef);
        const categories = categoriesSnapshot.docs.map(doc => doc.id);
        
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [db, user]);

  // Add new inventory item to restaurant's inventory
  const addInventoryItem = async (formData: Partial<InventoryItem>) => {
    if (!db || !user) return;

    try {
      // Validate category
      if (!formData.category) {
        toast({
          title: "Categoria Obrigatória",
          description: "Por favor, selecione uma categoria",
          variant: "destructive"
        });
        return;
      }

      // Create a reference to the specific category document
      const categoryRef = doc(
        db, 
        'restaurants', 
        user.uid, 
        'inventory', 
        formData.category
      );

      // Generate a unique ID for the new item
      const newItemId = doc(collection(db, 'temp')).id;

      // Prepare the item data
      const newItemData = {
        ...formData,
        id: newItemId,
        uid: newItemId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        restaurantId: user.uid
      };

      // Update the category document with the new item
      await updateDoc(categoryRef, {
        [`items.${newItemId}`]: newItemData
      });

      // Update local state
      const newItem: InventoryItem = {
        ...newItemData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as InventoryItem;

      setItems(prevItems => [newItem, ...prevItems]);

      // Reset form and close dialog
      setIsAddDialogOpen(false);

      toast({
        title: "Item Adicionado",
        description: `${formData.name} foi adicionado com sucesso`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      toast({
        title: "Erro ao Adicionar Item",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  // Generate a unique, category-specific ID
  const generateItemId = (category: string, existingItems: InventoryItem[]) => {
    // Map category to its two-letter prefix
    const categoryPrefixes: { [key: string]: string } = {
      'entradas': 'EN',
      'pratosPrincipais': 'PP',
      'saladas': 'SA',
      'bebidas': 'BE',
      'sobremesas': 'SO',
      'porcoesExtras': 'PE'
    };

    // Get the prefix, default to 'IT' if category not found
    const prefix = categoryPrefixes[category] || 'IT';

    // Filter existing items in this category and sort by their numeric part
    const categoryItems = existingItems.filter(item => item.category === category);
    const existingNumbers = categoryItems
      .map(item => {
        // Extract numeric part from the ID
        const match = item.uid.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .sort((a, b) => a - b);

    // Find the next available number
    let nextNumber = 1;
    for (const num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    // Format the ID with leading zeros
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  };

  // Form state
  const [formData, setFormData] = useState<InventoryItem>({
    uid: '',
    id: '',
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    price: 0,
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    restaurantId: user?.uid || '',
    supplier: '',
    notes: '',
    reorderPoint: 0,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
      restaurantId: user?.uid || prevData.restaurantId
    }))
  }

  const handleAddItem = async () => {
    await addInventoryItem(formData);
  }

  const handleEditItem = async () => {
    if (!db || !user || !selectedItem || !selectedItem.id) return

    try {
      const inventoryRef = doc(db, 'restaurants', user.uid);
      const categoryRef = doc(inventoryRef, 'inventory', selectedItem.category);
      await updateDoc(categoryRef, {
        [`items.${selectedItem.id}`]: {
          name: formData.name,
          description: formData.description,
          quantity: formData.quantity,
          unit: formData.unit,
          minQuantity: formData.minQuantity,
          price: formData.price,
          category: formData.category,
          updatedAt: serverTimestamp()
        }
      })

      setItems(prevItems => 
        prevItems.map(item => 
          item.id === selectedItem.id 
            ? { ...item, ...formData, updatedAt: new Date() } 
            : item
        )
      );

      setIsEditDialogOpen(false);
      toast({
        title: "Item Updated",
        description: `${formData.name} ${t("inventory.editItem.updated")}`,
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Update Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  }

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!db || !user || !item) return;

    try {
      const inventoryRef = doc(db, 'restaurants', user.uid);
      const categoryRef = doc(inventoryRef, 'inventory', item.category);
      
      // Remove the specific item from the category's items map
      await updateDoc(categoryRef, {
        [`items.${item.id}`]: deleteField()
      });

      // Remove the item from local state
      setItems(items.filter(i => i.id !== item.id));

      toast({
        title: "Item Removido",
        description: `${item.name} foi removido do inventário`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast({
        title: "Erro ao Remover Item",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setFormData({
      uid: item.uid,
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minQuantity: item.minQuantity,
      price: item.price,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: new Date(),
      restaurantId: item.restaurantId,
      supplier: item.supplier,
      notes: item.notes,
      reorderPoint: item.reorderPoint,
    })
    setIsEditDialogOpen(true)
  }

  const renderLowStockWarning = () => {
    const lowStockItems = items.filter(item => item.quantity <= item.minQuantity)
    
    if (lowStockItems.length === 0) return null

    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center">
            <AlertTriangle className="absolute left-2.5 top-2.5 h-5 w-5 text-amber-500 mr-2" />
            <span className="font-medium text-amber-800">
              {t(`inventory.lowStockWarning.${lowStockItems.length}`)}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  // Translate category names
  const categoryTranslations: { [key: string]: string } = {
    'entradas': 'Entradas',
    'pratosPrincipais': 'Pratos Principais',
    'saladas': 'Saladas',
    'bebidas': 'Bebidas',
    'sobremesas': 'Sobremesas',
    'porcoesExtras': 'Porções Extras'
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventário</h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Buscar item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Item
          </Button>
        </div>
      </div>

      {/* Categories and Items Display */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {categoryTranslations[category] || category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card 
                key={String(item.id || item.uid)} 
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <Badge variant="secondary">{item.category}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {item.description || 'Sem descrição'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantidade</p>
                      <p className="font-semibold">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Preço</p>
                      <p className="font-semibold">
                        R$ {Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                      <p className="font-semibold">
                        {item.minQuantity} {item.unit}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditDialog(item)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteItem(item)}
                  >
                    Excluir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Existing dialogs and modals */}
      {isAddDialogOpen && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto no-scrollbar sm:max-w-[380px] p-6">
            <DialogHeader className="mb-4 text-center">
              <DialogTitle className="text-lg">{t("inventory.addItem.title")}</DialogTitle>
              <DialogDescription className="text-sm">{t("inventory.addItem.description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">{t("inventory.addItem.namePlaceholder")}</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    className="w-full max-w-[300px] self-center"
                    placeholder={t("inventory.addItem.namePlaceholder")}
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">{t("inventory.addItem.categoryPlaceholder")}</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        category: value
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full max-w-[300px]">
                      <SelectValue placeholder={t("inventory.addItem.categoryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm">{t("inventory.addItem.quantityPlaceholder")}</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    className="w-full max-w-[300px] self-center"
                    placeholder={t("inventory.addItem.quantityPlaceholder")}
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm">{t("inventory.addItem.unitPlaceholder")}</Label>
                  <Input 
                    id="unit" 
                    name="unit" 
                    className="w-full max-w-[300px] self-center"
                    placeholder={t("inventory.addItem.unitPlaceholder")}
                    value={formData.unit} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="minQuantity" className="text-sm">{t("inventory.addItem.minQuantityPlaceholder")}</Label>
                  <Input
                    id="minQuantity"
                    name="minQuantity"
                    type="number"
                    className="w-full max-w-[300px] self-center"
                    placeholder={t("inventory.addItem.minQuantityPlaceholder")}
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm">{t("inventory.addItem.pricePlaceholder")}</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    className="w-full max-w-[300px] self-center"
                    placeholder={t("inventory.addItem.pricePlaceholder")}
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">{t("inventory.addItem.descriptionPlaceholder")}</Label>
                <Input 
                  id="description" 
                  name="description" 
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.descriptionPlaceholder")}
                  value={formData.description} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            <DialogFooter className="mt-6 flex justify-center space-x-2">
              <Button 
                variant="outline" 
                className="w-[120px]"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("inventory.addItem.cancel")}
              </Button>
              <Button 
                className="w-[120px]"
                onClick={handleAddItem}
              >
                {t("inventory.addItem.title")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto no-scrollbar sm:max-w-[380px] p-6">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="text-lg">{t("inventory.editItem.title")}</DialogTitle>
            <DialogDescription className="text-sm">{t("inventory.editItem.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm">{t("inventory.addItem.namePlaceholder")}</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.namePlaceholder")}
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">{t("inventory.addItem.categoryLabel")}</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      category: value
                    }));
                  }}
                >
                  <SelectTrigger className="w-full max-w-[300px]">
                    <SelectValue placeholder={t("inventory.addItem.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="text-sm">{t("inventory.addItem.quantityPlaceholder")}</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.quantityPlaceholder")}
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit" className="text-sm">{t("inventory.addItem.unitPlaceholder")}</Label>
                <Input 
                  id="edit-unit" 
                  name="unit" 
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.unitPlaceholder")}
                  value={formData.unit} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-minQuantity" className="text-sm">{t("inventory.addItem.minQuantityPlaceholder")}</Label>
                <Input
                  id="edit-minQuantity"
                  name="minQuantity"
                  type="number"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.minQuantityPlaceholder")}
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm">{t("inventory.addItem.pricePlaceholder")}</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.pricePlaceholder")}
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm">{t("inventory.addItem.descriptionPlaceholder")}</Label>
              <Input 
                id="edit-description" 
                name="description" 
                className="w-full max-w-[300px] self-center"
                placeholder={t("inventory.addItem.descriptionPlaceholder")}
                value={formData.description} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-center space-x-2">
            <Button 
              variant="outline" 
              className="w-[120px]"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("inventory.editItem.cancel")}
            </Button>
            <Button 
              className="w-[120px]"
              onClick={handleEditItem}
            >
              {t("inventory.editItem.title")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

}