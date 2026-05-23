"use client";

import type React from "react";
import { InventoryItem, isDrinkCategory } from "@/types";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/components/i18n-provider";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { usePermissions } from "@/components/permissions-provider";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function InventoryPage() {
  const { user } = useAuth();
  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const { t } = useI18n();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category Management State
  const [categories, setCategories] = useState<
    { id: string; name: string; description?: string; color?: string; type?: "food" | "drink" }[]
  >([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    id: "",
    name: "",
    description: "",
    color: "#3b82f6",
    type: "food" as "food" | "drink",
  });
  const [categoryDialogMode, setCategoryDialogMode] = useState<"add" | "edit">(
    "add",
  );
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<{
    id: string;
    name: string;
    description?: string;
    color?: string;
  } | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const presetColors = [
    { value: "#3b82f6", name: "Blue" },
    { value: "#10b981", name: "Emerald" },
    { value: "#f43f5e", name: "Rose" },
    { value: "#8b5cf6", name: "Violet" },
    { value: "#f97316", name: "Orange" },
    { value: "#f59e0b", name: "Amber" },
    { value: "#6b7280", name: "Slate" },
  ];

  const getCategoryName = (categoryId: string, name?: string) => {
    const defaultKeys = [
      "drinks",
      "appetizers",
      "main_courses",
      "desserts",
      "salads",
      "sides",
    ];
    if (defaultKeys.includes(categoryId)) {
      return t(`inventory.categories.${categoryId}`);
    }
    return name || categoryId;
  };

  // Inventory Item Management State
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    price: 0,
    minQuantity: 0,
    description: "",
    supplier: "",
    controlsStock: false,
    lowStockThreshold: 0,
  });

  // Estados para el diálogo de añadir stock
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [selectedItemForStockAdd, setSelectedItemForStockAdd] =
    useState<InventoryItem | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(0);
  const [isSavingStock, setIsSavingStock] = useState(false);

  // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState("");

  // Verificar si el usuario puede ver el inventario
  if (!canView("inventory")) {
    return <UnauthorizedAccess />;
  }

  // Fetch Inventory Items and Categories
  const fetchInventoryItems = async () => {
    const establishmentId = user?.establishmentId;

    if (!establishmentId) {
      setError(t("inventory.noEstablishmentError"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch categories from database
      const inventoryRef = collection(
        db,
        "restaurants",
        establishmentId,
        "inventory",
      );
      const categoriesSnapshot = await getDocs(inventoryRef);

      const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || doc.id,
        description: doc.data().description || "",
        color: doc.data().color || "#3b82f6",
        type: doc.data().type || (isDrinkCategory(doc.id) ? "drink" : "food"),
      }));

      setCategories(fetchedCategories);

      if (fetchedCategories.length === 0) {
        setInventoryItems([]);
        setLoading(false);
        return;
      }

      // Fetch items for each category
      const itemsPromises = fetchedCategories.map(async (category) => {
        const categoryRef = doc(
          db,
          "restaurants",
          establishmentId,
          "inventory",
          category.id,
        );

        const itemsRef = collection(categoryRef, "items");

        const itemsQuery = query(itemsRef, orderBy("name"));

        try {
          const itemsSnapshot = await getDocs(itemsQuery);

          return itemsSnapshot.docs.map((itemDoc) => {
            const itemData = itemDoc.data();
            return {
              uid: itemDoc.id,
              category: category.id,
              categoryName: category.name,
              name: itemData.name || "",
              quantity: itemData.quantity || 0,
              unit: itemData.unit || "",
              price: itemData.price || 0,
              minQuantity: itemData.minQuantity || 0,
              description: itemData.description || "",
              supplier: itemData.supplier || "",
              controlsStock: itemData.controlsStock || false,
              lowStockThreshold: itemData.lowStockThreshold || 0,
              createdAt: itemData.createdAt || new Date(),
              updatedAt: itemData.updatedAt || new Date(),
            } as InventoryItem;
          });
        } catch (categoryErr) {
          console.error(
            `Error fetching items for category ${category.id}:`,
            categoryErr,
          );
          return [];
        }
      });

      // Combine all items from all categories
      const allItems = await Promise.all(itemsPromises);
      const flattenedItems = allItems.flat();

      setInventoryItems(flattenedItems);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(t("inventory.fetchError"));
      setLoading(false);
    }
  };

  // Save Category (Create or Edit)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.establishmentId) {
      toast.error(t("commons.error"), {
        description: t("inventory.noEstablishmentError"),
      });
      return;
    }

    if (!categoryFormData.name.trim()) {
      toast.error(t("commons.error"), {
        description:
          t("inventory.fillRequiredFieldsMsg") ||
          "Por favor, completa los campos requeridos",
      });
      return;
    }

    setIsSavingCategory(true);
    try {
      const categoryId =
        categoryDialogMode === "add"
          ? categoryFormData.name
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "_")
          : selectedCategoryForEdit!.id;

      if (categoryDialogMode === "add") {
        const exists = categories.some((c) => c.id === categoryId);
        if (exists) {
          toast.error(t("commons.error"), {
            description:
              t("inventory.categoryAlreadyExists") || "La categoría ya existe",
          });
          setIsSavingCategory(false);
          return;
        }
      }

      const categoryRef = doc(
        db,
        "restaurants",
        user.establishmentId,
        "inventory",
        categoryId,
      );
      const categoryData = {
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim(),
        color: categoryFormData.color,
        type: categoryFormData.type,
        id: categoryId,
      };

      if (categoryDialogMode === "add") {
        await setDoc(categoryRef, {
          ...categoryData,
          createdAt: serverTimestamp(),
          items: [],
        });
      } else {
        await updateDoc(categoryRef, {
          ...categoryData,
          updatedAt: serverTimestamp(),
        });
      }

      toast.success(
        t("inventory.saveSuccess") || "Categoría guardada correctamente",
      );
      setIsCategoryDialogOpen(false);
      setCategoryFormData({
        id: "",
        name: "",
        description: "",
        color: "#3b82f6",
        type: "food",
      });
      setSelectedCategoryForEdit(null);
      fetchInventoryItems();
    } catch (err) {
      console.error("Error saving category:", err);
      toast.error(t("commons.error"), {
        description:
          t("inventory.saveError") || "Error al guardar la categoría",
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Delete Category with Guard
  const handleDeleteCategory = async (categoryId: string) => {
    if (!user?.establishmentId) {
      toast.error(t("commons.error"), {
        description: t("inventory.noEstablishmentError"),
      });
      return;
    }

    try {
      // Check if there are items inside this category
      const itemsRef = collection(
        db,
        "restaurants",
        user.establishmentId,
        "inventory",
        categoryId,
        "items",
      );
      const itemsSnapshot = await getDocs(itemsRef);

      if (!itemsSnapshot.empty) {
        toast.error(t("commons.error"), {
          description:
            t("inventory.categoryNotEmpty") ||
            "No se puede eliminar la categoría porque contiene productos.",
        });
        return;
      }

      const categoryRef = doc(
        db,
        "restaurants",
        user.establishmentId,
        "inventory",
        categoryId,
      );
      await deleteDoc(categoryRef);

      toast.success(
        t("inventory.deleteSuccess") || "Categoría eliminada correctamente",
      );
      fetchInventoryItems();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error(t("commons.error"), {
        description:
          t("inventory.deleteError") || "Error al eliminar la categoría",
      });
    }
  };

  // Initialize data fetch
  useEffect(() => {
    if (user?.establishmentId) {
      fetchInventoryItems();
    }
  }, [user?.establishmentId]);

  // Add/Edit Inventory Item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.establishmentId) {
      toast.error(t("commons.error"), {
        description: t("inventory.noEstablishmentError"),
      });
      return;
    }

    try {
      const itemData: Partial<InventoryItem> = {
        ...formData,
        restaurantId: user.establishmentId,
        updatedAt: new Date(),
        createdAt: formData.createdAt || new Date(),
      };

      // Verify category is selected
      if (!itemData.category) {
        toast.error(t("commons.error"), {
          description: t("inventory.noCategoryError"),
        });
        return;
      }

      // Find the original category of the selected item
      const originalCategory = selectedItem?.category;

      // Reference to the item in its original category
      const itemRef = originalCategory
        ? doc(
            db,
            "restaurants",
            user.establishmentId,
            "inventory",
            originalCategory,
            "items",
            selectedItem?.uid,
          )
        : null;

      // If category changed, delete from old category and add to new
      if (originalCategory && originalCategory !== itemData.category) {
        // Delete from original category
        if (itemRef) await deleteDoc(itemRef);

        // Add to new category
        const newCategoryRef = doc(
          db,
          "restaurants",
          user.establishmentId,
          "inventory",
          itemData.category,
        );
        const newItemsInCategoryRef = collection(newCategoryRef, "items");
        const newDocRef = await addDoc(newItemsInCategoryRef, itemData);

        // Update local state
        setInventoryItems((prev) =>
          prev
            .filter((item) => item.uid !== selectedItem?.uid)
            .concat({
              ...itemData,
              uid: newDocRef.id,
              category: itemData.category,
            } as InventoryItem),
        );
      } else {
        if (dialogMode === "add") {
          // Add new item to category
          const categoryRef = doc(
            db,
            "restaurants",
            user.establishmentId,
            "inventory",
            itemData.category,
          );
          const itemsInCategoryRef = collection(categoryRef, "items");
          const docRef = await addDoc(itemsInCategoryRef, itemData);

          // Update local state
          setInventoryItems((prev) => [
            ...prev,
            {
              ...itemData,
              uid: docRef.id,
            } as InventoryItem,
          ]);
        } else {
          // Update in the same category
          if (itemRef) await updateDoc(itemRef, itemData);

          setInventoryItems((prev) =>
            prev.map((item) =>
              item.uid === selectedItem?.uid
                ? ({ ...item, ...itemData } as InventoryItem)
                : item,
            ),
          );
        }
      }

      toast.success(t("inventory.saveSuccess"), {
        description: t("inventory.itemSaved"),
      });

      // Reset form and close dialog
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        price: 0,
        minQuantity: 0,
        description: "",
        supplier: "",
        controlsStock: false,
        lowStockThreshold: 0,
      });
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Error saving inventory item:", err);
      toast.error(t("commons.error"), {
        description: t("inventory.saveError"),
      });
    }
  };

  // Delete Inventory Item
  const handleDelete = async (itemId: string, categoryId: string) => {
    if (!user?.establishmentId) {
      toast.error(t("commons.error"), {
        description: t("inventory.noEstablishmentError"),
      });
      return;
    }

    try {
      const itemRef = doc(
        db,
        "restaurants",
        user.establishmentId,
        "inventory",
        categoryId,
        "items",
        itemId,
      );
      await deleteDoc(itemRef);

      setInventoryItems((prev) => prev.filter((item) => item.uid !== itemId));

      toast.success(t("inventory.deleteSuccess"), {
        description: t("inventory.itemDeleted"),
      });
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      toast.error(t("commons.error"), {
        description: t("inventory.deleteError"),
      });
    }
  };

  // Filtered and Sorted Inventory
  const filteredInventory = useMemo(() => {
    return inventoryItems.sort((a, b) => (a.quantity < b.quantity ? 1 : -1));
  }, [inventoryItems]);

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(
      (item) =>
        item.controlsStock && // Solo considerar si controla stock
        item.quantity <=
          (item.lowStockThreshold !== undefined
            ? item.lowStockThreshold
            : item.minQuantity) &&
        (item.lowStockThreshold !== undefined
          ? item.lowStockThreshold
          : item.minQuantity) > 0,
    );
  }, [inventoryItems]);

  // First, create a function to check if user can perform any actions
  const canPerformActions = canUpdate("inventory") || canDelete("inventory");

  useEffect(() => {
    // Notificar productos con bajo stock
    if (lowStockItems.length > 0) {
      toast.warning(`${lowStockItems.length} productos con bajo stock`);

      // Notificación push solo si hay items críticos
      const criticalItems = lowStockItems.filter(
        (item) => item.quantity <= (item.minQuantity || 0) / 2,
      );
      if (criticalItems.length > 0) {
        // OneSignal has been removed - no push notification
      }
    }
  }, [lowStockItems]);

  const handleSave = async () => {
    if (!user || !user.establishmentId) {
      toast.error(t("inventory.noEstablishmentErrorMsg"));
      return;
    }

    // Basic validation (example)
    if (!formData.name || !formData.category) {
      toast.error(t("inventory.fillRequiredFieldsMsg"));
      return;
    }

    // Prepare data for saving
    let dataToSave: Partial<InventoryItem> = {
      ...formData,
      name: formData.name!,
      category: formData.category!,
      price: Number(formData.price) || 0, // Ensure price is a number, default to 0
    };

    if (formData.controlsStock) {
      dataToSave.quantity = Number(formData.quantity) || 0;
      dataToSave.minQuantity = Number(formData.minQuantity) || 0;
      dataToSave.unit = formData.unit || undefined; // Keep as is or set to undefined if empty
      dataToSave.lowStockThreshold = Number(formData.lowStockThreshold) || 0;
    } else {
      dataToSave.quantity = 0;
      dataToSave.minQuantity = 0;
      dataToSave.unit = undefined; // Explicitly set to undefined if not controlling stock
      dataToSave.lowStockThreshold = 0; // Or undefined
    }

    // Remove id if it exists to avoid issues with addDoc, or ensure it's used for updateDoc correctly
    if (dialogMode === "add") {
      delete dataToSave.id; // Firestore generates ID on addDoc
      delete dataToSave.uid; // uid should also be managed carefully, often same as id or set by backend
    }

    setLoading(true);
    try {
      if (dialogMode === "edit" && selectedItem && selectedItem.id) {
        const itemRef = doc(
          db,
          "restaurants",
          user.establishmentId,
          "inventory",
          selectedItem.category,
          "items",
          selectedItem.id,
        );
        await updateDoc(itemRef, {
          ...dataToSave,
          updatedAt: serverTimestamp(),
        });
        toast.success(t("inventory.itemUpdatedMsg"));
      } else {
        // For adding, ensure category is part of the path
        if (!dataToSave.category) {
          toast.error(t("inventory.categoryRequiredMsg"));
          setLoading(false);
          return;
        }
        const itemsCollectionRef = collection(
          db,
          "restaurants",
          user.establishmentId,
          "inventory",
          dataToSave.category,
          "items",
        );
        await addDoc(itemsCollectionRef, {
          ...dataToSave,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // restaurantId: user.establishmentId, // Already part of path, but can be good for denormalization/rules
        });
        toast.success(t("inventory.itemAddedMsg"));
      }
      fetchInventoryItems(); // Refresh list
      setIsDialogOpen(false); // Close dialog
    } catch (error) {
      console.error("Error saving item: ", error);
      toast.error(t("inventory.errorSavingItemMsg"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAddStock = async () => {
    if (
      !selectedItemForStockAdd ||
      !selectedItemForStockAdd.uid ||
      !selectedItemForStockAdd.category
    ) {
      toast.error(t("inventory.errorNoItemSelectedToAddStock"));
      return;
    }
    if (!user || !user.establishmentId) {
      toast.error(t("inventory.noEstablishmentErrorMsg"));
      return;
    }
    if (quantityToAdd <= 0) {
      toast.error(t("inventory.errorQuantityToAddPositive"));
      return;
    }

    setIsSavingStock(true);
    try {
      const itemRef = doc(
        db,
        "restaurants",
        user.establishmentId,
        "inventory",
        selectedItemForStockAdd.category,
        "items",
        selectedItemForStockAdd.uid,
      );

      await updateDoc(itemRef, {
        quantity: increment(quantityToAdd),
        updatedAt: serverTimestamp(),
      });

      toast.success(t("inventory.stockAddedSuccessfullyMsg"));
      fetchInventoryItems(); // Refresh list
      setIsAddStockDialogOpen(false); // Close dialog
      setSelectedItemForStockAdd(null); // Clear selected item
      setQuantityToAdd(0); // Reset quantity to add
    } catch (error) {
      console.error("Error adding stock: ", error);
      toast.error(t("inventory.errorAddingStockMsg"));
    } finally {
      setIsSavingStock(false);
    }
  };

  // Filtrar inventario basado en searchQuery en múltiples campos
  const filteredInventoryItems = inventoryItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query) ||
      (item.supplier || "").toLowerCase().includes(query) ||
      (item.unit || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div>
              <CardTitle className="text-xl md:text-2xl">{t("inventory.title")}</CardTitle>
              <CardDescription className="text-sm md:text-base">{t("inventory.subtitle")}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {canUpdate("inventory") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategoryDialogMode("add");
                    setCategoryFormData({
                      id: "",
                      name: "",
                      description: "",
                      color: "#3b82f6",
                      type: "food",
                    });
                    setIsCategoryDialogOpen(true);
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />{" "}
                  {t("inventory.manageCategories") || "Categorías"}
                </Button>
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  {canCreate("inventory") && (
                    <Button
                      onClick={() => {
                        setDialogMode("add");
                        setFormData({});
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      <Plus className="mr-2 h-4 w-4" /> {t("inventory.addItem")}
                    </Button>
                  )}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {dialogMode === "add"
                        ? t("inventory.addItemTitle")
                        : t("inventory.editItemTitle")}
                    </DialogTitle>
                    <DialogDescription>
                      {dialogMode === "add"
                        ? t("inventory.addItemDescription")
                        : t("inventory.editItemDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form fields for inventory item */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("inventory.name")}</Label>
                        <Input
                          value={formData.name || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("inventory.category")}</Label>
                        <Select
                          value={formData.category || ""}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("inventory.selectCategory")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.length === 0 ? (
                              <SelectItem value="no_categories" disabled>
                                {t("inventory.noCategoriesFound") ||
                                  "Crea una categoría primero"}
                              </SelectItem>
                            ) : (
                              categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {getCategoryName(cat.id, cat.name)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <Switch
                        id="controlsStock"
                        checked={!!formData.controlsStock} // Asegura que sea booleano
                        onCheckedChange={(
                          checked, // Switch pasa un booleano directamente
                        ) =>
                          setFormData((prev) => {
                            if (!checked) {
                              // Si el control de stock se desactiva
                              return {
                                ...prev,
                                controlsStock: false,
                                quantity: 0,
                                minQuantity: 0,
                                unit: undefined,
                                lowStockThreshold: 0,
                              };
                            } // Si se activa
                            return { ...prev, controlsStock: true };
                          })
                        }
                      />
                      <Label htmlFor="controlsStock">
                        {t("inventory.controlsStockLabel")}
                      </Label>
                    </div>
                    {formData.controlsStock && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t("inventory.quantity")}</Label>
                            <Input
                              value={formData.quantity || 0}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  quantity: Number(e.target.value),
                                }))
                              }
                              type="number"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("inventory.unit")}</Label>
                            <Input
                              value={formData.unit || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  unit: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t("inventory.minQuantity")}</Label>
                            <Input
                              value={formData.minQuantity || 0}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  minQuantity: Number(e.target.value),
                                }))
                              }
                              type="number"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("inventory.lowStockThreshold")}</Label>
                            <Input
                              value={formData.lowStockThreshold || 0}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  lowStockThreshold: Number(e.target.value),
                                }))
                              }
                              type="number"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label>{t("inventory.price")}</Label>
                      <Input
                        value={formData.price || 0}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                          }))
                        }
                        type="number"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("inventory.description")}</Label>
                      <Input
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("inventory.supplier")}</Label>
                      <Input
                        value={formData.supplier || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            supplier: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {dialogMode === "add"
                          ? t("inventory.add")
                          : t("inventory.update")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {/* Sección de Búsqueda */}
          <div className="relative w-full max-w-md mb-4 md:mb-6 mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("inventory.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                <p className="text-sm md:text-base text-yellow-800">
                  {t("inventory.lowStockAlert", {
                    count: lowStockItems.length,
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Inventory Table - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.name")}</TableHead>
                  <TableHead>{t("inventory.category")}</TableHead>
                  <TableHead>{t("inventory.quantity")}</TableHead>
                  <TableHead className="py-3 px-1 w-12 sm:w-16 md:w-auto md:px-2 lg:px-3">
                    {t("inventory.unit")}
                  </TableHead>
                  {/* Only show actions column if user has permissions */}
                  {canPerformActions && (
                    <TableHead>{t("inventory.actions")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventoryItems.length > 0 ? (
                  filteredInventoryItems.map((item) => (
                  <TableRow
                    key={item.uid}
                    className={
                      item.controlsStock &&
                      typeof item.lowStockThreshold === "number" &&
                      item.quantity < item.lowStockThreshold
                        ? "bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800"
                        : "hover:bg-muted/50"
                    }
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {getCategoryName(
                        item.category,
                        item.categoryName || item.category,
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.controlsStock && // Solo considerar si controla stock
                          item.quantity <=
                            (item.lowStockThreshold !== undefined
                              ? item.lowStockThreshold
                              : item.minQuantity) &&
                          (item.lowStockThreshold !== undefined
                            ? item.lowStockThreshold
                            : item.minQuantity) > 0
                            ? "destructive"
                            : "default"
                        }
                      >
                        {item.quantity} {item.unit}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-1 w-12 sm:w-16 md:w-auto md:px-2 lg:px-3">
                      {item.unit}
                    </TableCell>
                    {/* Only show actions cell if user has permissions */}
                    {canPerformActions && (
                      <TableCell className="py-3 px-1 md:px-2 lg:px-3 text-right">
                        <div className="flex flex-col sm:flex-row sm:space-x-2 items-end space-y-1 sm:space-y-0">
                          {canUpdate("inventory") && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setFormData(item);
                                      setDialogMode("edit");
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("inventory.editBtn")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {item.controlsStock && canUpdate("inventory") && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItemForStockAdd(item);
                                      setQuantityToAdd(0); // Resetear cantidad a añadir
                                      setIsAddStockDialogOpen(true);
                                    }}
                                  >
                                    <PlusCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("inventory.addStockBtn")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {canDelete("inventory") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDelete(item.uid, item.category)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={canPerformActions ? 5 : 4}
                    className="text-center py-4"
                  >
                    {t("inventory.noItemsFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {filteredInventoryItems.length > 0 ? (
              filteredInventoryItems.map((item) => (
                <Card key={item.uid} className="w-full">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm md:text-base">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryName(
                            item.category,
                            item.categoryName || item.category,
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.controlsStock &&
                          item.quantity <=
                            (item.lowStockThreshold !== undefined
                              ? item.lowStockThreshold
                              : item.minQuantity) &&
                          (item.lowStockThreshold !== undefined
                            ? item.lowStockThreshold
                            : item.minQuantity) > 0
                            ? "destructive"
                            : item.controlsStock &&
                              item.quantity <=
                                (item.lowStockThreshold !== undefined
                                  ? item.lowStockThreshold
                                  : item.minQuantity) * 1.5
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.controlsStock
                          ? `${item.quantity} ${item.unit || ""}`
                          : "N/A"}
                      </Badge>
                    </div>
                    {item.controlsStock && (
                      <div className="text-xs text-muted-foreground mb-2">
                        Min: {item.lowStockThreshold !== undefined ? item.lowStockThreshold : item.minQuantity} {item.unit || ""}
                      </div>
                    )}
                    {canPerformActions && (
                      <div className="flex gap-1 mt-2">
                        {canUpdate("inventory") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setFormData(item);
                              setDialogMode("edit");
                              setIsDialogOpen(true);
                            }}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        )}
                        {canUpdate("inventory") && item.controlsStock && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItemForStockAdd(item);
                              setQuantityToAdd(0);
                              setIsAddStockDialogOpen(true);
                            }}
                            className="flex-1"
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> Stock
                          </Button>
                        )}
                        {canDelete("inventory") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.uid, item.category)}
                            className="flex-1 text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                {t("inventory.noItemsFound")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogo para añadir stock */}
      <Dialog
        open={isAddStockDialogOpen}
        onOpenChange={setIsAddStockDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("inventory.addStockTo")} {selectedItemForStockAdd?.name}
            </DialogTitle>
            <DialogDescription>
              {t("inventory.currentQuantity")}:{" "}
              {selectedItemForStockAdd?.quantity}{" "}
              {selectedItemForStockAdd?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="quantityToAdd">
              {t("inventory.quantityToAddLabel")}
            </Label>
            <Input
              id="quantityToAdd"
              type="number"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(Number(e.target.value))}
              placeholder={t("inventory.enterQuantityPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddStockDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleConfirmAddStock} disabled={isSavingStock}>
              {isSavingStock
                ? t("common.saving")
                : t("inventory.addStockConfirmBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Manager Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("inventory.manageCategories") || "Gestionar Categorías"}
            </DialogTitle>
            <DialogDescription>
              {t("inventory.manageCategoriesDesc") ||
                "Crea, edita o elimina las categorías para organizar tu inventario."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Category List */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("inventory.existingCategories") || "Categorías Existentes"}
              </h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {t("inventory.noCategoriesYet") ||
                      "No hay categorías creadas."}
                  </p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color || "#3b82f6" }}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium leading-none">
                              {getCategoryName(cat.id, cat.name)}
                            </p>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase shrink-0">
                              {cat.type === 'drink' 
                                ? (t("inventory.categoryTypes.drink") || "Bebida") 
                                : (t("inventory.categoryTypes.food") || "Comida")}
                            </Badge>
                          </div>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setCategoryDialogMode("edit");
                            setSelectedCategoryForEdit(cat);
                            setCategoryFormData({
                              id: cat.id,
                              name: cat.name,
                              description: cat.description || "",
                              color: cat.color || "#3b82f6",
                              type: cat.type || (isDrinkCategory(cat.id) ? "drink" : "food"),
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category Form */}
            <form
              onSubmit={handleSaveCategory}
              className="space-y-4 border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0"
            >
              <h3 className="text-sm font-medium text-muted-foreground">
                {categoryDialogMode === "add"
                  ? t("inventory.addNewCategory") || "Nueva Categoría"
                  : t("inventory.editCategory") || "Editar Categoría"}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="categoryName">
                  {t("inventory.categoryName") || "Nombre"}
                </Label>
                <Input
                  id="categoryName"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder={
                    t("inventory.categoryNamePlaceholder") ||
                    "Ej. Bebidas, Carnes"
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryDescription">
                  {t("inventory.categoryDescription") || "Descripción"}
                </Label>
                <Input
                  id="categoryDescription"
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={
                    t("inventory.categoryDescPlaceholder") ||
                    "Descripción de la categoría"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryType">
                  {t("inventory.categoryType") || "Tipo de Categoría"}
                </Label>
                <Select
                  value={categoryFormData.type}
                  onValueChange={(value: "food" | "drink") =>
                    setCategoryFormData((prev) => ({
                      ...prev,
                      type: value,
                    }))
                  }
                >
                  <SelectTrigger id="categoryType">
                    <SelectValue placeholder={t("inventory.selectType") || "Seleccionar tipo"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">
                      {t("inventory.categoryTypes.food") || "Comida"}
                    </SelectItem>
                    <SelectItem value="drink">
                      {t("inventory.categoryTypes.drink") || "Bebida"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("inventory.categoryColor") || "Color"}</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shrink-0 ${
                        categoryFormData.color === color.value
                          ? "border-foreground ring-2 ring-ring ring-offset-2"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() =>
                        setCategoryFormData((prev) => ({
                          ...prev,
                          color: color.value,
                        }))
                      }
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {categoryDialogMode === "edit" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCategoryDialogMode("add");
                      setSelectedCategoryForEdit(null);
                      setCategoryFormData({
                        id: "",
                        name: "",
                        description: "",
                        color: "#3b82f6",
                        type: "food",
                      });
                    }}
                  >
                    {t("common.cancel") || "Cancelar"}
                  </Button>
                )}
                <Button type="submit" disabled={isSavingCategory}>
                  {isSavingCategory
                    ? t("common.saving") || "Guardando..."
                    : categoryDialogMode === "add"
                      ? t("inventory.createCategory") || "Crear"
                      : t("inventory.updateCategory") || "Actualizar"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
