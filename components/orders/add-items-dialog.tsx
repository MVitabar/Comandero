import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Order, MenuItem } from "@/types";
import { useFirebase } from "@/components/firebase-provider";
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";

// Ajuste: Definición local de Category (solo id, opcional name)
type Category = {
  id: string;
  name?: string;
};

interface AddItemsDialogProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onItemsAdded?: () => void;
}

export function AddItemsDialog({ order, open, onClose, onItemsAdded }: AddItemsDialogProps) {
  const { t } = useI18n();
  const { db } = useFirebase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Cargar categorías (igual que en OrderForm)
  useEffect(() => {
    if (!db || !order.restaurantId || !open) return;
    const fetchCategories = async () => {
      const inventoryRef = collection(db, `restaurants/${order.restaurantId}/inventory`);
      const snap = await getDocs(inventoryRef);
      setCategories(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id })));
    };
    fetchCategories();
  }, [db, order.restaurantId, open]);

  // Cargar items de la categoría seleccionada (igual que en OrderForm)
  useEffect(() => {
    if (!db || !order.restaurantId || !selectedCategory) return;
    const fetchItems = async () => {
      const itemsRef = collection(db, `restaurants/${order.restaurantId}/inventory/${selectedCategory}/items`);
      const snap = await getDocs(itemsRef);
      setItems(snap.docs.map(itemDoc => {
        const itemData = itemDoc.data();
        let stock = 0;
        if (typeof itemData.quantity === 'number') {
          stock = itemData.quantity;
        } else if (typeof itemData.quantity === 'string') {
          const parsedStock = parseInt(itemData.quantity, 10);
          stock = !isNaN(parsedStock) ? parsedStock : 0;
        }
        return {
          uid: itemDoc.id,
          name: itemData.name || 'Unnamed Item',
          category: selectedCategory,
          price: Number(itemData.price || 0),
          stock: stock,
          unit: itemData.unit || '',
          description: itemData.description || '',
        } as MenuItem;
      }));
    };
    fetchItems();
  }, [db, order.restaurantId, selectedCategory]);

  const handleAddItem = async () => {
    if (!selectedItem || quantity < 1) return;
    if (!order.docId) {
      toast.error(t("orders.addItemsDialog.errors.orderDocIdMissing"));
      return;
    }
    try {
      const item = items.find(i => i.uid === selectedItem);
      if (!item) return;
      // Usa docId para la referencia
      const orderRef = doc(db, `restaurants/${order.restaurantId}/orders/${order.docId}`);
      console.log("Agregando item al pedido:", item, "Cantidad:", quantity, "Pedido:", order.docId);
      
      // Get current order to check if items is an array or object
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        toast.error(t("orders.addItemsDialog.errors.orderNotFound"));
        return;
      }
      
      const currentOrder = orderSnap.data();
      const currentItems = currentOrder.items;
      
      // Convert current items to array if needed
      let itemsArray: any[] = [];
      if (Array.isArray(currentItems)) {
        itemsArray = [...currentItems];
      } else if (typeof currentItems === 'object' && currentItems !== null) {
        itemsArray = Object.values(currentItems);
      }
      
      // Check if item already exists in the order
      const existingItemIndex = itemsArray.findIndex(
        (existingItem) => existingItem.itemId === item.uid || existingItem.id === item.uid
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        // Item exists, update its quantity
        newItems = itemsArray.map((existingItem, index) => 
          index === existingItemIndex
            ? { ...existingItem, quantity: (Number(existingItem.quantity) || 0) + quantity }
            : existingItem
        );
      } else {
        // Item doesn't exist, add it as new item
        const newItem = {
          ...item,
          quantity,
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemId: item.uid,
          status: 'pending'
        };
        newItems = [...itemsArray, newItem];
      }
      
      // Remove duplicate items with the same itemId (keep the one with higher quantity)
      const uniqueItems = newItems.reduce((acc: any[], item) => {
        const existingIndex = acc.findIndex(existing => 
          existing.itemId === item.itemId || existing.id === item.itemId
        );
        if (existingIndex >= 0) {
          // Merge quantities
          acc[existingIndex] = {
            ...acc[existingIndex],
            quantity: (Number(acc[existingIndex].quantity) || 0) + (Number(item.quantity) || 0)
          };
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      
      // Calculate new total
      const newTotal = uniqueItems.reduce((sum, item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQuantity = Number(item.quantity) || 1;
        return sum + (itemPrice * itemQuantity);
      }, 0);
      
      const newSubtotal = newTotal;
      
      await updateDoc(orderRef, {
        items: uniqueItems,
        total: newTotal,
        subtotal: newSubtotal,
        updatedAt: new Date()
      });
      console.log("Item agregado al pedido con éxito");
      toast.success(t("orders.addItemsDialog.success"));
      if (onItemsAdded) onItemsAdded();
      onClose();
    } catch (error) {
      console.error("Error agregando item al pedido:", error);
      let errorMessage = "";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
      }
      toast.error(t("orders.addItemsDialog.errors.addFailed", { message: errorMessage }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="add-items-description">
        <DialogHeader>
          <DialogTitle>{t("orders.addItemsDialog.title")}</DialogTitle>
          <DialogDescription id="add-items-description">
            {t("orders.addItemsDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name || t("orders.addItemsDialog.selectCategory")
                : t("orders.addItemsDialog.selectCategory")}
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name || cat.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedItem} onValueChange={setSelectedItem} disabled={!selectedCategory}>
            <SelectTrigger>
              {selectedItem
                ? items.find(i => i.uid === selectedItem)?.name || t("orders.addItemsDialog.selectProduct")
                : t("orders.addItemsDialog.selectProduct")}
            </SelectTrigger>
            <SelectContent>
              {items.map(item => (
                <SelectItem key={item.uid} value={item.uid}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            placeholder={t("orders.addItemsDialog.quantity")}
            disabled={!selectedItem}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("commons.cancel")}</Button>
          <Button onClick={handleAddItem} disabled={!selectedItem || quantity < 1}>{t("orders.addItemsDialog.add")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}