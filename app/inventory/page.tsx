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
  deleteField,  
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
  const fetchCategories = async (): Promise<string[]> => {
    if (!db || !user) return [];

    try {
      // Use the specific restaurant path
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')
      const querySnapshot = await getDocs(inventoryRef)

      // Extract unique categories from the subcollections
      const fetchedCategories = new Set<string>()
      
      // Iterate through each category document
      for (const categoryDoc of querySnapshot.docs) {
        fetchedCategories.add(categoryDoc.id)
      }

      // Combine default and fetched categories, removing duplicates
      const uniqueCategories = [
        ...new Set([
          ...Object.keys(categoryTranslations),
          ...fetchedCategories
        ])
      ].sort()

      setCategories(uniqueCategories)
      setAvailableCategories(uniqueCategories)

      return uniqueCategories
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: t('inventory.fetchCategoriesError'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      })
      return []
    }
  }

  // Fetch categories when user and db are available
  useEffect(() => {
    fetchCategories()
  }, [db, user]);

  // Fetch items from Firestore
  const fetchItems = async () => {
    if (!db || !user) {
      setLoading(false)
      return
    }

    try {
      // Fetch items from all categories
      const categories = await fetchCategories()
      const fetchedItems: InventoryItem[] = []

      // Define a type for item data to help TypeScript
      type ItemData = {
        name?: string;
        quantity?: number;
        price?: number;
        minimumStock?: number;
        description?: string;
        notes?: string;
        createdAt?: { seconds: number };
        updatedAt?: { seconds: number };
        uid?: string;
        unit?: string;
        minQuantity?: number;
      }

      // Type guard to check if data is a valid ItemData
      const isValidItemData = (data: unknown): data is ItemData => {
        return data !== null && typeof data === 'object'
      }

      for (const category of categories) {
        const categoryRef = doc(
          db, 
          'restaurants', 
          user.uid, 
          'inventory', 
          category
        )
        const categoryDoc = await getDoc(categoryRef)
        
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data()
          
          // Check if the category has items
          if (categoryData && categoryData.items) {
            Object.entries(categoryData.items).forEach(([itemId, itemData]) => {
              // Additional type checking
              if (isValidItemData(itemData)) {
                fetchedItems.push({
                  id: itemId,
                  name: String(itemData.name || ''),
                  category: category,
                  quantity: Number(itemData.quantity || 0),
                  price: Number(itemData.price || 0),
                  minimumStock: Number(itemData.minimumStock || 0),
                  description: String(itemData.description || ''),
                  notes: String(itemData.notes || ''),
                  createdAt: itemData.createdAt 
                    ? new Date(itemData.createdAt.seconds * 1000) 
                    : new Date(),
                  updatedAt: itemData.updatedAt 
                    ? new Date(itemData.updatedAt.seconds * 1000) 
                    : undefined,
                  restaurantId: user.uid,
                  uid: String(itemData.uid || ''),
                  unit: String(itemData.unit || ''),
                  minQuantity: Number(itemData.minQuantity || 0)
                })
              }
            })
          }
        }
      }

      setItems(fetchedItems)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching items:", error)
      setLoading(false)
      toast({
        title: t('inventory.fetchItemsError'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      })
    }
  }

  // Add initial items to Firestore if not already added
  const addInitialItems = async () => {
    if (!db || !user || initialItemsAdded) return

    try {
      // Use the specific restaurant path
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')

      // Batch write initial items
      const batch = writeBatch(db)

      const initialItemSets = [
        { category: 'entradas', items: entradas },
        { category: 'pratosPrincipais', items: pratosPrincipais },
        { category: 'saladas', items: saladas },
        { category: 'bebidas', items: bebidas },
        { category: 'sobremesas', items: sobremesas },
        { category: 'porcoesExtras', items: porcoesExtras }
      ]

      initialItemSets.forEach(({ category, items }) => {
        items.forEach((item) => {
          const itemRef = doc(inventoryRef, `${category}_${item.name.toLowerCase().replace(/\s+/g, '_')}`)
          batch.set(itemRef, {
            ...item,
            category,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        })
      })

      await batch.commit()
      setInitialItemsAdded(true)
    } catch (error) {
      console.error("Error adding initial items:", error)
    }
  }

  // Add new item to Firestore
  const addItem = async (newItem: Omit<InventoryItem, 'id'>) => {
    if (!db || !user) return

    // Convert name to string and validate
    const itemName = typeof newItem.name === 'string' 
      ? newItem.name.trim() 
      : ''

    // Validate required fields
    if (!itemName || !newItem.category) {
      toast({
        title: t('inventory.addItemError'),
        description: t('inventory.missingFields'),
        variant: 'destructive'
      })
      return
    }

    // Prepare item data with explicit type conversion
    const preparedItem = {
      name: String(itemName),
      category: String(newItem.category),
      quantity: Number(newItem.quantity || 0),
      price: Number(newItem.price || 0),
      minimumStock: Number(newItem.minimumStock || 0),
      description: String(newItem.description || ''),
      uid: user.uid,
      restaurantId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      unit: String(newItem.unit || ''),
      minQuantity: Number(newItem.minQuantity || 0)
    }

    try {
      // Use the specific restaurant path with category
      const categoryRef = doc(
        db, 
        'restaurants', 
        user.uid, 
        'inventory', 
        preparedItem.category
      )
      
      // Generate a unique ID for the new item
      const newItemId = doc(collection(db, 'temp')).id
      
      // Update the category document with the new item
      await updateDoc(categoryRef, {
        [`items.${newItemId}`]: {
          ...preparedItem,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      })

      // Show success toast
      toast({
        title: t('inventory.addItemSuccess'),
        description: `${preparedItem.name} ${t('inventory.addedToCategory')} ${preparedItem.category}`,
        variant: 'default'
      })

      // Refresh items and categories
      await fetchItems()
      await fetchCategories()
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        title: t('inventory.addItemError'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      })
    }
  }

  // Update item in Firestore
  const updateItem = async (updatedItem: InventoryItem) => {
    if (!db || !user) return

    try {
      // Use the specific restaurant path
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')

      // Ensure the item has a valid ID and sanitize it
      const sanitizedId = String(updatedItem.id)
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')

      // Prepare the sanitized item for update
      const preparedItem = {
        ...updatedItem,
        id: sanitizedId,
        updatedAt: serverTimestamp()
      }

      // Create a direct document reference using the sanitized ID
      const itemRef = doc(inventoryRef, sanitizedId)
      
      await updateDoc(itemRef, preparedItem)

      // Refresh items
      await fetchItems()

      // Optional: Show success toast
      toast({
        title: t('inventory.updateItemSuccess'),
        description: `${updatedItem.name} updated`,
        variant: 'default'
      })
    } catch (error) {
      console.error("Error updating item:", error)
      toast({
        title: t('inventory.updateItemError'),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      })
    }
  }

  // Delete item from Firestore
  const deleteItem = async (itemId: string) => {
    if (!db || !user) return

    try {
      // Use the specific restaurant path
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')
      const itemRef = doc(inventoryRef, itemId)
      
      await deleteDoc(itemRef)

      // Refresh items and categories
      await fetchItems()
      await fetchCategories()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: t('inventory.deleteItemError'),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      })
    }
  }

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
      // Use the specific restaurant path
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')

      // Batch write to create categories efficiently
      const batch = writeBatch(db);

      DEFAULT_CATEGORIES.forEach(categoryName => {
        const categoryDocRef = doc(inventoryRef, categoryName);
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
        // Use the specific restaurant path
        const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')
        const categoriesSnapshot = await getDocs(inventoryRef);
        
        console.log('Categories Found:', categoriesSnapshot.docs.map(doc => doc.id));

        // If no categories exist, create default ones
        if (categoriesSnapshot.empty) {
          await initializeDefaultCategories();
          
          // Refetch categories after initialization
          const reInitializedCategoriesSnapshot = await getDocs(inventoryRef);
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
                updatedAt: itemData.updatedAt?.toDate() || undefined,
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
        // Use the specific restaurant path
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
      // Use the specific restaurant path
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')
      const categoryRef = doc(inventoryRef, formData.category);

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
      // Use the specific restaurant path
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')
      const categoryRef = doc(inventoryRef, selectedItem.category);
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
      // Use the specific restaurant path
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')
      const categoryRef = doc(inventoryRef, item.category);
      
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

  // Form data state for adding new item
  const [newFormData, setNewFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    price: 0,
    description: ''
  })

  // Handle input changes in the form
  const handleNewInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minQuantity' || name === 'price' 
        ? Number(value) 
        : value
    }))
  }

  // Handle adding a new item
  const handleNewAddItem = async () => {
    // Validate required fields
    if (!newFormData.name || !newFormData.category) {
      toast({
        title: t('inventory.addItemError'),
        description: 'Nome e categoria são obrigatórios',
        variant: 'destructive'
      })
      return
    }

    try {
      // Prepare the new item for Firestore
      const newItem: Omit<InventoryItem, 'id'> = {
        name: newFormData.name,
        category: newFormData.category,
        quantity: newFormData.quantity || 0,
        unit: newFormData.unit || '',
        minQuantity: newFormData.minQuantity || 0,
        price: newFormData.price || 0,
        description: newFormData.description || '',
        uid: user?.uid || '',
        restaurantId: user?.uid || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Call the addItem function to save to Firestore
      await addItem(newItem)

      // Reset form and close dialog
      setNewFormData({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        minQuantity: 0,
        price: 0,
        description: ''
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        title: t('inventory.addItemError'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      })
    }
  }

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
                    value={newFormData.name} 
                    onChange={handleNewInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">{t("inventory.addItem.categoryPlaceholder")}</Label>
                  <Select 
                    value={newFormData.category} 
                    onValueChange={(value) => {
                      setNewFormData(prev => ({
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
                    value={newFormData.quantity}
                    onChange={handleNewInputChange}
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
                    value={newFormData.unit} 
                    onChange={handleNewInputChange} 
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
                    value={newFormData.minQuantity}
                    onChange={handleNewInputChange}
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
                    value={newFormData.price}
                    onChange={handleNewInputChange}
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
                  value={newFormData.description} 
                  onChange={handleNewInputChange} 
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
                onClick={handleNewAddItem}
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