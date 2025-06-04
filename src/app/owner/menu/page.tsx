'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import NextImage from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils, PlusCircle, Edit3, Trash2, Image as ImageIcon, DollarSign, Tag, Loader2, AlertTriangle, LayoutDashboard, List, Users, ReceiptText, Truck } from "lucide-react";
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
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import {
  doc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, getDoc as getFirestoreDoc, writeBatch, query
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { UserDocument } from '@/lib/types';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  imagePath?: string;
  createdAt?: any;
  updatedAt?: any;
};

type MenuCategory = {
  id: string;
  name: string;
  createdAt?: any;
};

function OwnerSidebar({ active }: { active: string }) {
  const nav = [
    { href: '/owner/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '/owner/menu', icon: <List />, label: 'Menu' },
    { href: '/owner/orders', icon: <ReceiptText />, label: 'Orders' },
    { href: '/owner/team', icon: <Users />, label: 'Team' },
    { href: '/owner/truck', icon: <Truck />, label: 'My Truck' }
  ];
  return (
    <aside className="sidebar-nav">
      <div className="sidebar-header">Owner Panel</div>
      {nav.map(link => (
        <Link key={link.href} href={link.href} className={`sidebar-link${active === link.href ? ' active' : ''}`}>
          {link.icon}
          {link.label}
        </Link>
      ))}
    </aside>
  );
}

export default function OwnerMenuPage() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

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
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategoryName, setItemCategoryName] = useState('');
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | undefined>(undefined);

  // Auth and Owner truck resolution
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getFirestoreDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserDocument;
          if (userData.role === 'owner') {
            setTruckId(userData.truckId || user.uid);
          } else {
            toast({ title: "Access Denied", description: "You are not an authorized owner.", variant: "destructive" });
            router.push('/login');
          }
        } else {
          toast({ title: "Error", description: "User profile not found.", variant: "destructive" });
          router.push('/login');
        }
      } else {
        router.push('/login?redirect=/owner/menu');
      }
    });
    return () => unsub();
    // eslint-disable-next-line
  }, [router, toast]);

  // Fetch menu categories and items for this truck
  useEffect(() => {
    if (!truckId) {
      if (currentUser) setIsLoading(false);
      return;
    }
    const fetchMenuData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const categoriesPath = collection(db, "trucks", truckId, "menuCategories");
        const itemsPath = collection(db, "trucks", truckId, "menuItems");
        const [catsSnap, itemsSnap] = await Promise.all([
          getDocs(query(categoriesPath)),
          getDocs(query(itemsPath))
        ]);
        const fetchedCategories = catsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuCategory));
        setCategories(fetchedCategories);
        setMenuItems(itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
        if (fetchedCategories.length > 0 && !itemCategoryName) {
          setItemCategoryName(fetchedCategories[0].name);
        }
      } catch (err: any) {
        console.error("Menu data fetch error:", err);
        setError(err.message || "Failed to load menu data.");
        toast({ title: "Data Load Error", description: err.message || "Failed to load menu data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuData();
    // eslint-disable-next-line
  }, [truckId]);

  // --- Dialog/Event handlers and helpers below (same as your code, trimmed for space) ---

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

  const handleSaveCategory = async () => {
    if (!currentCategoryName.trim() || !truckId) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const categoryCollectionRef = collection(db, "trucks", truckId, "menuCategories");
      if (editingCategory) {
        const oldCategoryName = editingCategory.name;
        await updateDoc(doc(categoryCollectionRef, editingCategory.id), { name: currentCategoryName, updatedAt: serverTimestamp() });
        // Update items that were in the old category
        const batch = writeBatch(db);
        menuItems.filter(item => item.category === oldCategoryName).forEach(item => {
          const itemRef = doc(db, "trucks", truckId, "menuItems", item.id);
          batch.update(itemRef, { category: currentCategoryName });
        });
        await batch.commit();
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: currentCategoryName } : c));
        setMenuItems(menuItems.map(item => item.category === oldCategoryName ? { ...item, category: currentCategoryName } : item));
        toast({ title: "Category Updated", description: `Category "${currentCategoryName}" updated. Associated items also updated.` });
      } else {
        const docRef = await addDoc(categoryCollectionRef, {
          name: currentCategoryName,
          createdAt: serverTimestamp()
        });
        setCategories([...categories, { id: docRef.id, name: currentCategoryName }]);
        toast({ title: "Category Added", description: `Category "${currentCategoryName}" added.` });
      }
    } catch (e: any) {
      toast({ title: "Error saving category", description: e.message || String(e), variant: "destructive" });
    }
    setCurrentCategoryName('');
    setEditingCategory(null);
    setIsCategoryDialogOpen(false);
    setIsSubmitting(false);
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
      setCategories(categories.filter(c => c.id !== categoryId));
      setMenuItems(menuItems.filter(item => item.category !== categoryName));
      toast({ title: "Category Deleted", description: `Category "${categoryName}" and all its items deleted.`, variant: "destructive" });
    } catch (e: any) {
      toast({ title: "Error deleting category", description: e.message || String(e), variant: "destructive" });
    }
    setIsSubmitting(false);
  };

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
    const itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> & { updatedAt: any, createdAt?: any } = {
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice),
      category: itemCategoryName,
      imageUrl: imageUrlToSave,
      imagePath: imagePathToSave,
      updatedAt: serverTimestamp(),
    };
    try {
      const itemCollectionRef = collection(db, "trucks", truckId, "menuItems");
      if (editingItem) {
        await updateDoc(doc(itemCollectionRef, editingItem.id), itemData);
        setMenuItems(menuItems.map(item =>
          item.id === editingItem.id ? { ...editingItem, ...itemData } : item
        ));
        toast({ title: "Item Updated", description: `"${itemName}" updated.` });
      } else {
        itemData.createdAt = serverTimestamp();
        const docRef = await addDoc(itemCollectionRef, itemData);
        setMenuItems([...menuItems, { ...itemData, id: docRef.id, createdAt: new Date() }]);
        toast({ title: "Item Added", description: `"${itemName}" added to ${itemCategoryName}.` });
      }
    } catch (e: any) {
      toast({ title: "Error saving item", description: e.message || String(e), variant: "destructive" });
    }
    resetItemFormAndDialog();
    setIsSubmitting(false);
  };

  const handleDeleteItem = async (itemToDelete: MenuItem) => {
    if (!truckId) return;
    if (!confirm(`Are you sure you want to delete the menu item "${itemToDelete.name}"?`)) return;
    setIsSubmitting(true);
    try {
      if (itemToDelete.imagePath) { try { await deleteObject(ref(storage, itemToDelete.imagePath)); } catch { } }
      await deleteDoc(doc(db, "trucks", truckId, "menuItems", itemToDelete.id));
      setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
      toast({ title: "Item Deleted", variant: "destructive" });
    } catch (e: any) {
      toast({ title: "Error deleting item", description: e.message || String(e), variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const openEditCategoryDialog = (category: MenuCategory) => {
    setEditingCategory(category);
    setCurrentCategoryName(category.name);
    setIsCategoryDialogOpen(true);
  };
  const openNewCategoryDialog = () => {
    setEditingCategory(null);
    setCurrentCategoryName('');
    setIsCategoryDialogOpen(true);
  };
  const resetItemFormAndDialog = () => {
    setItemName(''); setItemDescription(''); setItemPrice('');
    setItemCategoryName(categories.length > 0 ? categories[0].name : '');
    setItemImageFile(null); setItemImagePreview(undefined);
    setEditingItem(null); setIsItemDialogOpen(false);
  };
  const openEditItemDialog = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name); setItemDescription(item.description);
    setItemPrice(item.price.toString()); setItemCategoryName(item.category);
    setItemImageFile(null); setItemImagePreview(item.imageUrl || undefined);
    setIsItemDialogOpen(true);
  };
  const openNewItemDialog = () => {
    setEditingItem(null);
    setItemName(''); setItemDescription(''); setItemPrice('');
    setItemCategoryName(categories.length > 0 ? categories[0].name : '');
    setItemImageFile(null); setItemImagePreview(undefined);
    setIsItemDialogOpen(true);
  };

  // --- Render ---

  return (
    <div className="flex min-h-screen bg-background">
      {/* --- Sidebar (Desktop) --- */}
      <OwnerSidebar active="/owner/menu" />
      <main className="flex-1 px-2 md:px-8 py-8">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
                <Utensils className="mr-3 h-8 w-8" /> Manage Your Menu
              </h1>
              <Button asChild variant="outline">
                <Link href="/owner/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
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
                  <DialogDescription>Fill in the details for your menu item.</DialogDescription>
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
                    <Label htmlFor="itemImageFile"><ImageIcon className="inline mr-1 h-4 w-4" />Item Image (Optional)</Label>
                    <Input id="itemImageFile" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageFileChange} className="mt-1" />
                    {itemImagePreview && <div className="mt-2 relative w-24 h-24"><NextImage src={itemImagePreview} alt="Preview" fill className="rounded object-cover border" /></div>}
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
              <Card className="md:col-span-1 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center"><CardTitle className="text-xl">Menu Categories</CardTitle><Button variant="ghost" size="icon" onClick={openNewCategoryDialog} aria-label="Add new category"><PlusCircle className="h-5 w-5 text-primary" /></Button></div>
                  <CardDescription>Organize your menu sections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {categories.length > 0 ? categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center p-2.5 border rounded-md bg-muted/40 hover:bg-muted/70">
                      <span className="font-medium">{cat.name}</span>
                      <div className="space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditCategoryDialog(cat)} aria-label={`Edit category ${cat.name}`}> <Edit3 className="h-4 w-4" /> </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id, cat.name)} aria-label={`Delete category ${cat.name}`}> <Trash2 className="h-4 w-4 text-destructive" /> </Button>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No categories yet. Click '+' to add one.</p>}
                </CardContent>
              </Card>
              <Card className="md:col-span-2 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center"><CardTitle className="text-xl">Menu Items</CardTitle><Button onClick={openNewItemDialog} disabled={categories.length === 0}><PlusCircle className="mr-2 h-4 w-4" /> Add New Item</Button></div>
                  <CardDescription>Add, edit, or remove items from your menu. Items are grouped by category below.</CardDescription>
                  {categories.length === 0 && <p className="text-xs text-destructive pt-2">Please add a category before adding menu items.</p>}
                </CardHeader>
                <CardContent className="space-y-6">
                  {categories.length > 0 ? categories.map(category => (
                    menuItems.filter(item => item.category === category.name).length > 0 ? (
                      <div key={category.id}>
                        <h3 className="text-lg font-semibold mb-3 text-primary border-b pb-1">{category.name}</h3>
                        <div className="space-y-4">
                          {menuItems.filter(item => item.category === category.name).map(item => (
                            <Card key={item.id} className="bg-card p-0 overflow-hidden shadow-sm">
                              <div className="flex flex-col sm:flex-row">
                                {item.imageUrl && <div className="w-full sm:w-1/3 h-40 sm:h-auto relative"><NextImage src={item.imageUrl} alt={item.name} fill className="object-cover" /></div>}
                                <div className={`flex-1 p-4 flex flex-col justify-between ${item.imageUrl ? 'sm:w-2/3' : 'w-full'}`}>
                                  <div>
                                    <CardTitle className="text-lg mb-1">{item.name}</CardTitle>
                                    <CardDescription className="text-xs text-accent font-semibold mb-1">${item.price.toFixed(2)}</CardDescription>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{item.description}</p>
                                  </div>
                                  <div className="flex justify-end space-x-2 mt-auto pt-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditItemDialog(item)}> <Edit3 className="mr-1 h-3 w-3" /> Edit </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item)}> <Trash2 className="mr-1 h-3 w-3" /> Delete </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )) : <p className="text-sm text-muted-foreground py-10 text-center">No categories or menu items yet. Start by adding a category, then items.</p>}
                  {categories.length > 0 && menuItems.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">No menu items added yet for the existing categories.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
