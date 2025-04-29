import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Order, MenuItem } from "@/types";
import { useFirebase } from "@/components/firebase-provider";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { toast } from "sonner";

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
      toast.error("No se encontró el ID del documento de la orden.");
      return;
    }
    try {
      const item = items.find(i => i.uid === selectedItem);
      if (!item) return;
      // Usa docId para la referencia
      const orderRef = doc(db, `restaurants/${order.restaurantId}/orders/${order.docId}`);
      console.log("Agregando item al pedido:", item, "Cantidad:", quantity, "Pedido:", order.docId);
      await updateDoc(orderRef, {
        items: arrayUnion({ ...item, quantity }),
      });
      console.log("Item agregado al pedido con éxito");
      toast.success("Item agregado al pedido");
      if (onItemsAdded) onItemsAdded();
      onClose();
    } catch (error) {
      console.error("Error agregando item al pedido:", error);
      toast.error("Error al agregar item: " + (error instanceof Error ? error.message : ""));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="add-items-description">
        <DialogHeader>
          <DialogTitle>Agregar ítems al pedido</DialogTitle>
          <DialogDescription id="add-items-description">
            Selecciona los ítems y la cantidad a agregar al pedido.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name || "Seleccionar categoría"
                : "Seleccionar categoría"}
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
                ? items.find(i => i.uid === selectedItem)?.name || "Seleccionar producto"
                : "Seleccionar producto"}
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
            placeholder="Cantidad"
            disabled={!selectedItem}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAddItem} disabled={!selectedItem || quantity < 1}>Agregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}