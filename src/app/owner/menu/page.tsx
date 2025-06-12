'use client';
import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import NextImage from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils, PlusCircle, Edit3, Trash2, Image as ImageIcon, DollarSign, Tag, Loader2, AlertTriangle, LayoutDashboard, List, Users, ReceiptText, Truck, CheckCircle, Move, XCircle, Info, Eye, Copy, ToggleRight, ToggleLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import {
  doc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, getDoc as getFirestoreDoc, writeBatch, query, getDoc, setDoc, orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { UserDocument } from '@/lib/types';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";

// --- Types ---
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  outOfStock?: boolean;
  imageUrl?: string;
  imagePath?: string;
  createdAt?: any;
  updatedAt?: any;
  order?: number;
};
type MenuCategory = {
  id: string;
  name: string;
  createdAt?: any;
  order?: number;
};
// --- Preset tags ---
const PRESET_TAGS = [
  "Vegan", "Vegetarian", "Gluten-free", "Spicy", "Dairy-free", "Nut-free"
];
// --- Utility: Remove undefined fields ---
function removeUndefinedFields<T extends Record<string, any>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}
// --- Utility: Draft storage ---
const DRAFT_KEY = "foodietruck_menuitem_draft";
const DRAFT_CATEGORY_KEY = "foodietruck_category_draft";

// --- Utility: Category Color Coding ---
const CATEGORY_COLORS = [
  "bg-blue-100 text-blue-900",
  "bg-green-100 text-green-900",
  "bg-yellow-100 text-yellow-900",
  "bg-purple-100 text-purple-900",
  "bg-pink-100 text-pink-900",
  "bg-orange-100 text-orange-900",
];
function getCategoryColor(idx: number) {
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
}

// --- Sidebar (move to components/ownersidebar.tsx if you wish) ---
function OwnerSidebar({ active }: { active: string }) {
  const nav = [
    { href: '/owner/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '/owner/menu', icon: <List />, label: 'Menu' },
    { href: '/owner/orders', icon: <ReceiptText />, label: 'Orders' },
    { href: '/owner/team', icon: <Users />, label: 'Team' },
    { href: '/owner/truck', icon: <Truck />, label: 'My Truck' }
  ];
  return (
    <aside className="sidebar-nav sticky top-0 h-screen hidden md:flex flex-col bg-white border-r min-w-[220px] z-10">
      <div className="sidebar-header font-bold text-lg px-6 py-4 border-b">Owner Panel</div>
      <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
        {nav.map(link => (
          <Link key={link.href} href={link.href} className={`sidebar-link flex items-center gap-2 p-2 rounded-md transition-all ${active === link.href ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/70'}`}>
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// --- Main Page ---
export default function OwnerMenuPage() {
  const { toast } = useToast();
  const router = useRouter();
  // --- STATE ---
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentCategoryName, setCurrentCategoryName] = useState('');
  const [categoryOrder, setCategoryOrder] = useState(0);
  // --- Item Dialog ---
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategoryName, setItemCategoryName] = useState('');
  const [itemTags, setItemTags] = useState<string[]>([]);
  const [itemCustomTag, setItemCustomTag] = useState('');
  const [itemOutOfStock, setItemOutOfStock] = useState(false);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | undefined>(undefined);
  const [itemOrder, setItemOrder] = useState(0);
  const [todaysMenuIds, setTodaysMenuIds] = useState<string[]>([]);
  const [menuActionLog, setMenuActionLog] = useState<{id: string, count: number, name: string}[]>([]);
  const [savingTodayMenu, setSavingTodayMenu] = useState(false);
  // --- New for upgrades ---
  const [isMenuLive, setIsMenuLive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkSelect, setBulkSelect] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  // --- AUTH & OWNER TRUCK RESOLUTION ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setCurrentUser(null);
      setTruckId(null);
      if (!user) {
        router.replace('/login?redirect=/owner/menu');
        return;
      }
      setCurrentUser(user);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getFirestoreDoc(userDocRef);
        if (!userDocSnap.exists()) {
          toast({ title: "Error", description: "User profile not found.", variant: "destructive" });
          router.replace('/login');
          return;
        }
        const userData = userDocSnap.data() as UserDocument;
        if (userData.role !== 'owner') {
          toast({ title: "Access Denied", description: "You are not an authorized owner.", variant: "destructive" });
          router.replace('/login');
          return;
        }
        setTruckId(userData.truckId || user.uid);
      } catch (e: any) {
        toast({ title: "Error", description: e.message || "Unknown error.", variant: "destructive" });
        router.replace('/login');
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, [router, toast]);

  // --- FETCH MENU DATA ---
  async function fetchMenuData(silent = false) {
    if (!truckId) return;
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const categoriesPath = collection(db, "trucks", truckId, "menuCategories");
      const itemsPath = collection(db, "trucks", truckId, "menuItems");
      const truckDocRef = doc(db, "trucks", truckId);

      const [catsSnap, itemsSnap, truckSnap] = await Promise.all([
        getDocs(query(categoriesPath, orderBy("order", "asc"))),
        getDocs(query(itemsPath, orderBy("order", "asc"))),
        getDoc(truckDocRef),
      ]);
      const fetchedCategories = catsSnap.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data } as MenuCategory;
      });
      setCategories(fetchedCategories);

      const fetchedItems = itemsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
          tags: Array.isArray(data.tags) ? data.tags : [],
          outOfStock: !!data.outOfStock,
          order: typeof data.order === "number" ? data.order : 0,
        } as MenuItem;
      });
      setMenuItems(fetchedItems);

      if (truckSnap.exists() && Array.isArray(truckSnap.data().todaysMenu)) {
        setTodaysMenuIds(truckSnap.data().todaysMenu);
      } else {
        setTodaysMenuIds([]);
      }
      // --- Analytics: Frequency log ---
      if (truckSnap.exists() && truckSnap.data().menuActionLog) {
        setMenuActionLog(truckSnap.data().menuActionLog);
      } else {
        setMenuActionLog([]);
      }
      // --- Menu Publish Toggle ---
      if (truckSnap.exists() && typeof truckSnap.data().menuLive === "boolean") {
        setIsMenuLive(!!truckSnap.data().menuLive);
      } else {
        setIsMenuLive(true);
      }

      if (fetchedCategories.length > 0 && !itemCategoryName) {
        setItemCategoryName(fetchedCategories[0].name);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load menu data.");
      toast({ title: "Data Load Error", description: err.message || "Failed to load menu data.", variant: "destructive" });
    } finally {
      if (!silent) setIsLoading(false);
    }
  }
  useEffect(() => {
    if (!truckId) {
      setIsLoading(false);
      return;
    }
    fetchMenuData();
  // eslint-disable-next-line
  }, [truckId]);

  // --- IMAGE HANDLER ---
  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setItemImageFile(file);
      setItemImagePreview(URL.createObjectURL(file));
    } else {
      setItemImageFile(null);
      setItemImagePreview(editingItem?.imageUrl || undefined);
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleSaveCategory = async () => {
    if (!currentCategoryName.trim() || !truckId) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const order = categories.length;
      const categoryCollectionRef = collection(db, "trucks", truckId, "menuCategories");
      if (editingCategory) {
        await updateDoc(doc(categoryCollectionRef, editingCategory.id), removeUndefinedFields({
          name: currentCategoryName,
          updatedAt: serverTimestamp(),
        }));
        toast({ title: "Category Updated", description: `Category "${currentCategoryName}" updated.` });
      } else {
        await addDoc(categoryCollectionRef, removeUndefinedFields({
          name: currentCategoryName,
          createdAt: serverTimestamp(),
          order,
        }));
        toast({ title: "Category Added", description: `Category "${currentCategoryName}" added.` });
      }
      await fetchMenuData(true);
    } catch (e: any) {
      toast({ title: "Error saving category", description: e.message || String(e), variant: "destructive" });
    }
    setCurrentCategoryName('');
    setEditingCategory(null);
    setIsCategoryDialogOpen(false);
    setIsSubmitting(false);
    localStorage.removeItem(DRAFT_CATEGORY_KEY);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!truckId) return;
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This will also delete all menu items within this category.`)) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      const itemsToDelete = menuItems.filter(item => item.category === categoryName);
      for (const item of itemsToDelete) {
        if (item.imagePath) { try { await deleteObject(ref(storage, item.imagePath)); } catch { } }
        batch.delete(doc(db, "trucks", truckId, "menuItems", item.id));
      }
      batch.delete(doc(db, "trucks", truckId, "menuCategories", categoryId));
      await batch.commit();
      toast({ title: "Category Deleted", description: `Category "${categoryName}" and all its items deleted.`, variant: "destructive" });
      await fetchMenuData(true);
    } catch (e: any) {
      toast({ title: "Error deleting category", description: e.message || String(e), variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  // --- DND ORDERING ---
  const onDragEndCategory = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = Array.from(categories);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setCategories(reordered);
    // Persist new order
    if (!truckId) return;
    const batch = writeBatch(db);
    reordered.forEach((cat, idx) => {
      batch.update(doc(db, "trucks", truckId, "menuCategories", cat.id), { order: idx });
    });
    await batch.commit();
  };
  const onDragEndItem = async (catId: string, result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const itemsOfCat = menuItems.filter(i => i.category === categories.find(c => c.id === catId)?.name);
    const reordered = Array.from(itemsOfCat);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    // Update orders locally:
    const updatedMenuItems = menuItems.map(item =>
      reordered.find(i => i.id === item.id)
        ? { ...item, order: reordered.findIndex(i => i.id === item.id) }
        : item
    );
    setMenuItems(updatedMenuItems);
    // Persist new order:
    if (!truckId) return;
    const batch = writeBatch(db);
    reordered.forEach((item, idx) => {
      batch.update(doc(db, "trucks", truckId, "menuItems", item.id), { order: idx });
    });
    await batch.commit();
  };

  // --- MENU ITEM HANDLERS ---
  const handleSaveItem = async () => {
    if (!itemName || !itemPrice || !itemCategoryName || !truckId) {
      toast({ title: "Missing Fields", description: "Name, price, and category are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    let imageUrlToSave: string | undefined = editingItem?.imageUrl;
    let imagePathToSave: string | undefined = editingItem?.imagePath;
    if (itemImageFile) {
      if (editingItem?.imagePath) { try { await deleteObject(ref(storage, editingItem.imagePath)); } catch { } }
      try {
        const imageName = `${itemImageFile.name}_${Date.now()}`;
        imagePathToSave = `trucks/${truckId}/menuImages/${imageName}`;
        const imageRef = ref(storage, imagePathToSave);
        await uploadBytes(imageRef, itemImageFile);
        imageUrlToSave = await getDownloadURL(imageRef);
      } catch (uploadError: any) {
        toast({ title: "Image Upload Failed", description: uploadError.message || "Could not upload image.", variant: "destructive" });
        setIsSubmitting(false); return;
      }
    }
    let itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> & { updatedAt: any, createdAt?: any } = {
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice),
      category: itemCategoryName,
      tags: itemTags,
      outOfStock: !!itemOutOfStock,
      imageUrl: imageUrlToSave,
      imagePath: imagePathToSave,
      order: itemOrder,
      updatedAt: serverTimestamp(),
    };
    const cleanedItemData = removeUndefinedFields(itemData);

    try {
      const itemCollectionRef = collection(db, "trucks", truckId, "menuItems");
      if (editingItem) {
        await updateDoc(doc(itemCollectionRef, editingItem.id), cleanedItemData);
        toast({ title: "Item Updated", description: `"${itemName}" updated.` });
      } else {
        cleanedItemData.createdAt = serverTimestamp();
        cleanedItemData.order = menuItems.filter(i => i.category === itemCategoryName).length;
        await addDoc(itemCollectionRef, cleanedItemData);
        toast({ title: "Item Added", description: `"${itemName}" added to ${itemCategoryName}.` });
      }
      await fetchMenuData(true);
    } catch (e: any) {
      toast({ title: "Error saving item", description: e.message || String(e), variant: "destructive" });
    }
    resetItemFormAndDialog();
    setIsSubmitting(false);
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleDeleteItem = async (itemToDelete: MenuItem) => {
    if (!truckId) return;
    if (!confirm(`Are you sure you want to delete the menu item "${itemToDelete.name}"?`)) return;
    setIsSubmitting(true);
    try {
      if (itemToDelete.imagePath) { try { await deleteObject(ref(storage, itemToDelete.imagePath)); } catch { } }
      await deleteDoc(doc(db, "trucks", truckId, "menuItems", itemToDelete.id));
      toast({ title: "Item Deleted", variant: "destructive" });
      await fetchMenuData(true);
    } catch (e: any) {
      toast({ title: "Error deleting item", description: e.message || String(e), variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  // --- Duplicate Menu Item ---
  const handleDuplicateItem = (item: MenuItem) => {
    setEditingItem(null);
    setIsItemDialogOpen(true);
    setItemName(item.name + " (Copy)");
    setItemDescription(item.description || "");
    setItemPrice(item.price?.toString() || "");
    setItemCategoryName(item.category || "");
    setItemTags(item.tags || []);
    setItemCustomTag('');
    setItemOutOfStock(false);
    setItemImageFile(null);
    setItemImagePreview(item.imageUrl || undefined);
    setItemOrder(0);
  };

  // --- TODAY'S MENU HANDLER ---
  const handleToggleTodayMenu = async (itemId: string) => {
    if (!truckId) return;
    setSavingTodayMenu(true);
    let updatedMenu: string[];
    let actionType: "add" | "remove";
    if (todaysMenuIds.includes(itemId)) {
      updatedMenu = todaysMenuIds.filter(id => id !== itemId);
      actionType = "remove";
    } else {
      updatedMenu = [...todaysMenuIds, itemId];
      actionType = "add";
    }
    try {
      // Analytics log
      const updatedLog = [...menuActionLog];
      const idx = updatedLog.findIndex(l => l.id === itemId);
      if (idx >= 0) updatedLog[idx].count += 1;
      else {
        const item = menuItems.find(i => i.id === itemId);
        updatedLog.push({ id: itemId, count: 1, name: item?.name || "" });
      }
      await setDoc(doc(db, "trucks", truckId), {
        todaysMenu: updatedMenu,
        menuActionLog: updatedLog
      }, { merge: true });
      setTodaysMenuIds(updatedMenu);
      setMenuActionLog(updatedLog);
      toast({ title: "Today's Menu Updated", icon: <CheckCircle className="text-green-600" /> });
    } catch (e: any) {
      toast({ title: "Error updating today's menu", description: e.message || String(e), variant: "destructive" });
    }
    setSavingTodayMenu(false);
  };

  // --- Bulk Out-Of-Stock ---
  const handleBulkOutOfStock = async () => {
    if (!truckId || bulkSelect.length === 0) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      bulkSelect.forEach(itemId => {
        batch.update(doc(db, "trucks", truckId, "menuItems", itemId), { outOfStock: true });
      });
      await batch.commit();
      toast({ title: "Bulk Out-Of-Stock", description: `Set ${bulkSelect.length} item(s) out of stock.` });
      setBulkSelect([]);
      await fetchMenuData(true);
    } catch (e: any) {
      toast({ title: "Bulk Out-Of-Stock Error", description: e.message || String(e), variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  // --- Menu Live Toggle ---
  const handleMenuLiveToggle = async () => {
    if (!truckId) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, "trucks", truckId), { menuLive: !isMenuLive }, { merge: true });
      setIsMenuLive(!isMenuLive);
      toast({ title: "Menu Publish State Changed", description: `Menu is now ${!isMenuLive ? "Live" : "Draft"}.` });
    } catch (e: any) {
      toast({ title: "Error toggling menu live state", description: e.message || String(e), variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  // --- DIALOG AND FORM HELPERS ---
  const openEditCategoryDialog = (category: MenuCategory) => {
    setEditingCategory(category);
    setCurrentCategoryName(category.name);
    setIsCategoryDialogOpen(true);
    localStorage.setItem(DRAFT_CATEGORY_KEY, JSON.stringify({ name: category.name }));
  };
  const openNewCategoryDialog = () => {
    setEditingCategory(null);
    setCurrentCategoryName(localStorage.getItem(DRAFT_CATEGORY_KEY)
      ? JSON.parse(localStorage.getItem(DRAFT_CATEGORY_KEY) || '{}').name || ''
      : '');
    setIsCategoryDialogOpen(true);
  };

  const resetItemFormAndDialog = () => {
    setItemName(''); setItemDescription(''); setItemPrice('');
    setItemCategoryName(categories.length > 0 ? categories[0].name : '');
    setItemTags([]); setItemCustomTag(''); setItemOutOfStock(false); setItemOrder(0);
    setItemImageFile(null); setItemImagePreview(undefined);
    setEditingItem(null); setIsItemDialogOpen(false);
    localStorage.removeItem(DRAFT_KEY);
  };
  const openEditItemDialog = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name); setItemDescription(item.description);
    setItemPrice(item.price.toString()); setItemCategoryName(item.category);
    setItemTags(item.tags || []); setItemCustomTag('');
    setItemOutOfStock(!!item.outOfStock);
    setItemImageFile(null); setItemImagePreview(item.imageUrl || undefined);
    setItemOrder(item.order || 0);
    setIsItemDialogOpen(true);
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      name: item.name, description: item.description, price: item.price, category: item.category,
      tags: item.tags, outOfStock: item.outOfStock, order: item.order
    }));
  };
  const openNewItemDialog = () => {
    const draft = localStorage.getItem(DRAFT_KEY) ? JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') : {};
    setEditingItem(null);
    setItemName(draft.name || ''); setItemDescription(draft.description || '');
    setItemPrice(draft.price?.toString() || '');
    setItemCategoryName(draft.category || (categories.length > 0 ? categories[0].name : ''));
    setItemTags(draft.tags || []); setItemCustomTag('');
    setItemOutOfStock(!!draft.outOfStock);
    setItemImageFile(null); setItemImagePreview(undefined);
    setItemOrder(draft.order || 0);
    setIsItemDialogOpen(true);
  };

  // --- AUTOSAVE DRAFTS (Items) ---
  useEffect(() => {
    if (!isItemDialogOpen) return;
    const draft = {
      name: itemName, description: itemDescription, price: itemPrice, category: itemCategoryName,
      tags: itemTags, outOfStock: itemOutOfStock, order: itemOrder
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [isItemDialogOpen, itemName, itemDescription, itemPrice, itemCategoryName, itemTags, itemOutOfStock, itemOrder]);

  // --- TAG HANDLING ---
  const handleTagChange = (tag: string, checked: boolean) => {
    setItemTags(checked ? [...itemTags, tag] : itemTags.filter(t => t !== tag));
  };
  const handleAddCustomTag = () => {
    if (itemCustomTag && !itemTags.includes(itemCustomTag)) setItemTags([...itemTags, itemCustomTag]);
    setItemCustomTag('');
  };

  // --- SEARCH & FILTER ---
  function filterItems(items: MenuItem[]) {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.trim().toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term))) ||
      (item.category && item.category.toLowerCase().includes(term))
    );
  }

  // --- FAB Scroll to top on mobile ---
  useEffect(() => {
    if (isItemDialogOpen && fabRef.current) {
      fabRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isItemDialogOpen]);

  // --- RENDER ---
  return (
    <div className="flex min-h-screen bg-background">
      <OwnerSidebar active="/owner/menu" />
      <main className="flex-1 px-2 md:px-8 py-8">
        {/* --- Mobile FABs --- */}
        <button
          ref={fabRef}
          className="md:hidden fixed z-40 right-6 bottom-24 w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/80 transition-all text-3xl"
          onClick={openNewItemDialog}
          aria-label="Add New Item"
        >
          <PlusCircle className="w-9 h-9" />
        </button>
        <button
          className="md:hidden fixed z-40 right-6 bottom-6 w-14 h-14 flex items-center justify-center rounded-full bg-muted text-primary border shadow-lg hover:bg-primary/10 transition-all"
          onClick={openNewCategoryDialog}
          aria-label="Add New Category"
        >
          <List className="w-7 h-7" />
        </button>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-xl text-muted-foreground">Loading menu management...</p>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto py-16">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Menu Data</AlertTitle>
              <AlertDescription>{error}{truckId ? "" : " Truck ID is missing."}</AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button asChild variant="outline">
                <Link href="/owner/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-0 md:px-2">
            {/* --- Title & Menu Live Toggle --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
                <Utensils className="mr-3 h-8 w-8" /> Manage Your Menu
              </h1>
              <div className="flex gap-3 items-center">
                <Button asChild variant="outline" className="hidden md:block">
                  <Link href="/owner/dashboard">Back to Dashboard</Link>
                </Button>
                <Button variant={showPreview ? "secondary" : "outline"} onClick={() => setShowPreview(p => !p)}><Eye className="mr-2 w-4 h-4" /> {showPreview ? "Hide" : "Show"} Customer Preview</Button>
                <button
                  className={`ml-2 flex items-center px-3 py-2 rounded-md shadow border cursor-pointer ${isMenuLive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
                  onClick={handleMenuLiveToggle}
                  disabled={isSubmitting}
                  title="Toggle menu published/draft"
                >
                  {isMenuLive ? <ToggleRight className="mr-1 w-5 h-5 text-green-600" /> : <ToggleLeft className="mr-1 w-5 h-5 text-gray-600" />}
                  {isMenuLive ? 'Menu Live' : 'Draft'}
                </button>
              </div>
            </div>
            {/* --- Search Bar and Bulk Out-Of-Stock --- */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
              <div className="relative w-full sm:w-80">
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search menu by name, tag, category..."
                  className="pl-9"
                />
                <Search className="absolute left-2 top-2.5 w-5 h-5 text-muted-foreground" />
              </div>
              <Button
                variant={bulkSelect.length > 0 ? "destructive" : "outline"}
                disabled={bulkSelect.length === 0 || isSubmitting}
                onClick={handleBulkOutOfStock}
                className="ml-0 sm:ml-4"
              >
                Set Out of Stock ({bulkSelect.length})
              </Button>
              <div className="flex-1" />
            </div>
            {/* --- Today's Menu (at the top) --- */}
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Today's Menu Selection</CardTitle>
                </div>
                <CardDescription>Select which menu items are visible as “Today’s Menu” for customers. Out of stock items are disabled.</CardDescription>
                {savingTodayMenu && <Loader2 className="animate-spin h-5 w-5 text-primary ml-2" />}
              </CardHeader>
              <CardContent>
                {categories.length === 0 || menuItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Add categories and menu items below to select your daily menu.</div>
                ) : (
                  <div className="space-y-4">
                    {categories.map((category, idx) => {
                      const items = filterItems(menuItems.filter(item => item.category === category.name)).sort((a,b) => (a.order||0)-(b.order||0));
                      if (!items.length) return null;
                      return (
                        <div key={category.id} className="mb-2">
                          <div className={`font-semibold px-2 py-1 rounded mb-2 inline-block ${getCategoryColor(idx)}`}>{category.name}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {items.map(item => (
                              <div key={item.id} className="flex items-center gap-2 p-2 border rounded bg-muted/60">
                                <Checkbox
                                  id={`todaymenu-${item.id}`}
                                  checked={todaysMenuIds.includes(item.id)}
                                  disabled={savingTodayMenu || !!item.outOfStock}
                                  onCheckedChange={() => handleToggleTodayMenu(item.id)}
                                />
                                <Label htmlFor={`todaymenu-${item.id}`} className="flex-grow cursor-pointer">{item.name}
                                  {item.outOfStock && <span className="ml-2 text-xs text-destructive">(Out of stock)</span>}
                                </Label>
                                <span className="text-xs text-accent font-semibold">${item.price.toFixed(2)}</span>
                                {item.tags && item.tags.length > 0 && (
                                  <span className="ml-2 flex gap-1 flex-wrap">
                                    {item.tags.map(t => (
                                      <span key={t} className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px]">{t}</span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* --- Image Optimization Notice --- */}
            <Alert variant="info" className="mb-8">
              <Info className="w-4 h-4" />
              <AlertTitle>Pro tip:</AlertTitle>
              <AlertDescription>
                For best customer experience, keep food photos under <b>1MB</b> and use clear, well-lit images. 
                <br />
                Tag items (e.g. Vegan, Gluten-free) and use “Out of stock” to hide unavailable items.
              </AlertDescription>
            </Alert>
            {/* --- Categories Dialog --- */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input id="categoryName" value={currentCategoryName} onChange={e => setCurrentCategoryName(e.target.value)} placeholder="e.g., Appetizers, Main Courses, Drinks" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSaveCategory} disabled={isSubmitting || !currentCategoryName.trim()}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* --- Items Dialog --- */}
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                  <DialogDescription>Fill in the details for your menu item. You can add tags and set “out of stock”.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div><Label htmlFor="itemName"><Tag className="inline mr-1 h-4 w-4" />Item Name</Label><Input id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g., Gourmet Burger" /></div>
                  <div><Label htmlFor="itemDescription">Description</Label><Textarea id="itemDescription" value={itemDescription} onChange={e => setItemDescription(e.target.value)} placeholder="Ingredients, preparation, etc." /></div>
                  <div><Label htmlFor="itemPrice"><DollarSign className="inline mr-1 h-4 w-4" />Price ($)</Label><Input id="itemPrice" type="number" step="0.01" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="e.g., 9.99" /></div>
                  <div>
                    <Label htmlFor="itemCategorySelect">Category</Label>
                    <Select value={itemCategoryName} onValueChange={setItemCategoryName} disabled={categories.length === 0}>
                      <SelectTrigger id="itemCategorySelect"><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>))}</SelectContent>
                    </Select>
                    {categories.length === 0 && <p className="text-xs text-destructive mt-1">Please add a category first via the 'Menu Categories' card.</p>}
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {PRESET_TAGS.map(tag => (
                        <label key={tag} className="flex items-center gap-1 text-xs bg-green-100 px-2 py-0.5 rounded cursor-pointer">
                          <Checkbox checked={itemTags.includes(tag)} onCheckedChange={c => handleTagChange(tag, !!c)} />
                          {tag}
                        </label>
                      ))}
                      {/* Custom tag input */}
                      <Input
                        className="w-24 h-7 text-xs ml-2"
                        value={itemCustomTag}
                        placeholder="Custom"
                        onChange={e => setItemCustomTag(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { handleAddCustomTag(); e.preventDefault(); } }}
                        onBlur={handleAddCustomTag}
                      />
                    </div>
                    {itemTags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {itemTags.map(tag => (
                          <span key={tag} className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-[11px]">
                            {tag} <button className="ml-1 text-xs" onClick={()=>setItemTags(itemTags.filter(t=>t!==tag))}><XCircle className="inline h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={itemOutOfStock} onCheckedChange={v => setItemOutOfStock(!!v)} id="itemOutOfStock" />
                    <Label htmlFor="itemOutOfStock">Out of stock (item hidden from ordering)</Label>
                  </div>
                  <div>
                    <Label htmlFor="itemImageFile"><ImageIcon className="inline mr-1 h-4 w-4" />Item Image (Optional)</Label>
                    <Input id="itemImageFile" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageFileChange} className="mt-1" />
                    {itemImagePreview && <div className="mt-2 relative w-24 h-24"><NextImage src={itemImagePreview} alt="Preview" fill className="rounded object-cover border" loading="lazy" /></div>}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" onClick={resetItemFormAndDialog} disabled={isSubmitting}>Cancel</Button></DialogClose>
                  <Button onClick={handleSaveItem} disabled={isSubmitting || categories.length === 0 || !itemName || !itemPrice || !itemCategoryName}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* --- Main Cards --- */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* DragDrop for Categories */}
              <Card className="md:col-span-1 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center"><CardTitle className="text-xl">Menu Categories</CardTitle><Button variant="ghost" size="icon" onClick={openNewCategoryDialog} aria-label="Add new category"><PlusCircle className="h-5 w-5 text-primary" /></Button></div>
                  <CardDescription>Organize your menu sections. Drag to reorder.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  <DragDropContext onDragEnd={onDragEndCategory}>
                    <Droppable droppableId="categories">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {categories.length > 0 ? categories.map((cat, idx) => (
                            <Draggable key={cat.id} draggableId={cat.id} index={idx}>
                              {(prov, snap) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  className={`flex justify-between items-center p-2.5 border rounded-md ${getCategoryColor(idx)} hover:bg-opacity-80 mb-1 transition-all duration-200 ${snap.isDragging ? "shadow-lg scale-[1.01]" : ""}`}
                                >
                                  <span {...prov.dragHandleProps} title="Drag to reorder"><Move className="inline w-4 h-4 mr-1 text-muted-foreground cursor-move" /></span>
                                  <span className="font-medium flex-1">{cat.name}</span>
                                  <div className="space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEditCategoryDialog(cat)} aria-label={`Edit category ${cat.name}`}> <Edit3 className="h-4 w-4" /> </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id, cat.name)} aria-label={`Delete category ${cat.name}`}> <Trash2 className="h-4 w-4 text-destructive" /> </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )) : <p className="text-sm text-muted-foreground text-center py-4">No categories yet. Click '+' to add one.</p>}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </CardContent>
              </Card>
              {/* DragDrop for Items within categories */}
              <Card className="md:col-span-2 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center"><CardTitle className="text-xl">Menu Items</CardTitle>
                    <div className="flex gap-2">
                      <Button onClick={openNewItemDialog} disabled={categories.length === 0} className="hidden md:flex"><PlusCircle className="mr-2 h-4 w-4" /> Add New Item</Button>
                    </div>
                  </div>
                  <CardDescription>Add, edit, duplicate, or remove items from your menu. Items are grouped by category below. Drag to reorder within category.</CardDescription>
                  {categories.length === 0 && <p className="text-xs text-destructive pt-2">Please add a category before adding menu items.</p>}
                </CardHeader>
                <CardContent className="space-y-6">
                  {categories.length > 0 ? categories.map((category, catIdx) => {
                    const items = filterItems(menuItems.filter(item => item.category === category.name)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    return items.length > 0 ? (
                      <div key={category.id}>
                        <h3 className={`text-lg font-semibold mb-3 border-b pb-1 px-2 inline-block rounded ${getCategoryColor(catIdx)}`}>{category.name}</h3>
                        <DragDropContext onDragEnd={result => onDragEndItem(category.id, result)}>
                          <Droppable droppableId={category.id}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                                {items.map((item, idx) => (
                                  <Draggable key={item.id} draggableId={item.id} index={idx}>
                                    {(prov, snap) => (
                                      <Card
                                        ref={prov.innerRef}
                                        {...prov.draggableProps}
                                        className={`bg-card p-0 overflow-hidden shadow-sm transition-all duration-200 ${snap.isDragging ? "ring-2 ring-primary/40 scale-[1.01]" : ""}`}
                                      >
                                        <div className="flex flex-col sm:flex-row relative">
                                          <span {...prov.dragHandleProps} title="Drag to reorder" className="flex-none">
                                            <Move className="w-4 h-4 text-muted-foreground cursor-move m-3" />
                                          </span>
                                          <Checkbox
                                            className="absolute right-4 top-4"
                                            checked={bulkSelect.includes(item.id)}
                                            onCheckedChange={c => setBulkSelect(c ? [...bulkSelect, item.id] : bulkSelect.filter(id => id !== item.id))}
                                            aria-label="Select for bulk"
                                          />
                                          {item.imageUrl && (
                                            <div className="w-full sm:w-1/3 h-40 sm:h-auto relative min-w-[140px] max-w-[180px]">
                                              <NextImage src={item.imageUrl} alt={item.name} fill className="object-cover" loading="lazy" />
                                            </div>
                                          )}
                                          <div className={`flex-1 p-4 flex flex-col justify-between ${item.imageUrl ? 'sm:w-2/3' : 'w-full'}`}>
                                            <div>
                                              <CardTitle className="text-lg mb-1 flex items-center gap-2">
                                                {todaysMenuIds.includes(item.id) && (
                                                  <CheckCircle className="inline h-4 w-4 text-green-600" title="In Today's Menu" />
                                                )}
                                                {item.name}
                                                {item.outOfStock && <span className="ml-2 text-xs text-destructive">(Out of stock)</span>}
                                              </CardTitle>
                                              <CardDescription className="text-xs text-accent font-semibold mb-1">${item.price.toFixed(2)}</CardDescription>
                                              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{item.description}</p>
                                              {item.tags && item.tags.length > 0 && (
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                  {item.tags.map(t => (
                                                    <span key={t} className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px]">{t}</span>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex flex-wrap justify-end gap-2 mt-auto pt-2">
                                              <Button variant="outline" size="sm" onClick={() => openEditItemDialog(item)}> <Edit3 className="mr-1 h-3 w-3" /> Edit </Button>
                                              <Button variant="secondary" size="sm" onClick={() => handleDuplicateItem(item)}><Copy className="mr-1 h-3 w-3" /> Duplicate</Button>
                                              <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item)}> <Trash2 className="mr-1 h-3 w-3" /> Delete </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </Card>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>
                    ) : null;
                  }) : <p className="text-sm text-muted-foreground py-10 text-center">No categories or menu items yet. Start by adding a category, then items.</p>}
                  {categories.length > 0 && menuItems.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">No menu items added yet for the existing categories.</p>}
                </CardContent>
              </Card>
            </div>
            {/* --- Customer Preview Card --- */}
            {showPreview && (
              <Card className="mt-10 shadow-xl border-2 border-green-400/60 bg-gradient-to-br from-white to-green-50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2"><Eye className="w-7 h-7 text-green-500" /> Customer Menu Preview (Live)</CardTitle>
                  <CardDescription>This is exactly how your menu looks to customers right now.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {categories.map((category, idx) => {
                      const items = menuItems.filter(item => item.category === category.name && !item.outOfStock && todaysMenuIds.includes(item.id)).sort((a,b) => (a.order||0)-(b.order||0));
                      if (!items.length) return null;
                      return (
                        <div key={category.id}>
                          <div className={`font-bold mb-3 px-2 py-1 rounded text-lg ${getCategoryColor(idx)}`}>{category.name}</div>
                          <div className="space-y-3">
                            {items.map(item => (
                              <Card key={item.id} className="overflow-hidden shadow-sm">
                                {item.imageUrl && <div className="w-full h-36 relative"><NextImage src={item.imageUrl} alt={item.name} fill className="object-cover" loading="lazy" /></div>}
                                <div className="p-3">
                                  <div className="font-semibold text-base">{item.name}</div>
                                  <div className="text-xs font-bold text-green-700 mb-1">${item.price.toFixed(2)}</div>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                  {item.tags && item.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mt-1">
                                      {item.tags.map(t => (
                                        <span key={t} className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px]">{t}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Add this missing icon if not imported already
function LineChart(props: any) { return <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }

// Fade in for preview (add to global.css or use tailwind plugin)
// .animate-fade-in { animation: fadeIn 0.5s ease; }
// @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
