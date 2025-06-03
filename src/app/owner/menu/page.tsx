'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Utensils, PlusCircle, Edit3, Trash2, Image as ImageIcon, DollarSign, Tag, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import NextImage from "next/image";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import {
  doc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, getDoc as getFirestoreDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from 'next/navigation';
import type { UserDocument } from '@/lib/types';


// ----- TYPES -----
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string; 
};

type MenuCategory = {
  id: string;
  name: string;
};

// ----- PAGE -----
export default function OwnerMenuPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog/modal state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentCategoryName, setCurrentCategoryName] = useState('');

  // Menu item form state
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | undefined>(undefined);

  const router = useRouter();

  // AUTH & LOAD USER DATA
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login'); // Redirect to unified login
        return;
      }
      setCurrentUser(user);
      // Fetch user document to get truckId
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getFirestoreDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserDocument;
        if (userData.role === 'owner' && userData.truckId) {
          setTruckId(userData.truckId);
        } else if (userData.role === 'owner' && !userData.truckId) {
          // This owner might not have completed their truck profile setup yet
          // or the truckId is not directly on the user doc.
          // For now, we assume truckId is derived from user.uid for the 'trucks' collection.
          setTruckId(user.uid); // Assuming truckId is the same as owner's uid
        } else {
          toast({ title: "Access Denied", description: "You are not an authorized owner.", variant: "destructive" });
          router.push('/');
        }
      } else {
         toast({ title: "Error", description: "User profile not found.", variant: "destructive" });
         router.push('/');
      }
    });
    return () => unsub();
  }, [router, toast]);

  // FETCH MENU DATA once truckId is set
  useEffect(() => {
    if (!truckId) {
        // If truckId is null and currentUser exists, it means we are still waiting for userDoc lookup or there's an issue.
        // If no currentUser, auth useEffect will handle redirect.
        if(currentUser) setIsLoading(false); // If user is loaded but no truckId, stop loading.
        return;
    }
    const fetchMenuData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const categoriesPath = collection(db, "trucks", truckId, "menuCategories");
        const itemsPath = collection(db, "trucks", truckId, "menuItems");

        const [catsSnap, itemsSnap] = await Promise.all([
            getDocs(categoriesPath),
            getDocs(itemsPath)
        ]);
        
        setCategories(catsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuCategory)));
        setMenuItems(itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
      } catch (err: any) {
        setError(err.message || "Failed to load menu data.");
        toast({ title: "Data Load Error", description: err.message || "Failed to load menu data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuData();
  }, [truckId, toast]);

  // IMAGE PREVIEW
  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setItemImageFile(file);
      setItemImagePreview(URL.createObjectURL(file));
    } else {
      setItemImageFile(null);
      setItemImagePreview(editingItem?.imageUrl || undefined); // Revert to original if file removed
    }
  };

  // CATEGORY CRUD
  const handleSaveCategory = async () => {
    if (!currentCategoryName.trim() || !truckId) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive"});
      return;
    }
    try {
      const categoryCollectionRef = collection(db, "trucks", truckId, "menuCategories");
      if (editingCategory) {
        await updateDoc(doc(categoryCollectionRef, editingCategory.id), { name: currentCategoryName });
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: currentCategoryName } : c));
        toast({ title: "Category Updated", description: `Category "${currentCategoryName}" updated.` });
      } else {
        const docRef = await addDoc(categoryCollectionRef, {
          name: currentCategoryName,
          createdAt: serverTimestamp()
        });
        setCategories([...categories, { id: docRef.id, name: currentCategoryName }]);
        toast({ title: "Category Added", description: `Category "${currentCategoryName}" added.` });
      }
    } catch (e:any) {
      toast({ title: "Error saving category", description: e.message || String(e), variant: "destructive" });
    }
    setCurrentCategoryName('');
    setEditingCategory(null);
    setIsCategoryDialogOpen(false);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!truckId) return;
    // Basic confirmation, could be improved with a modal
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This will not delete items in it.`)) return;

    try {
      await deleteDoc(doc(db, "trucks", truckId, "menuCategories", categoryId));
      setCategories(categories.filter(c => c.id !== categoryId));
      // Items in the deleted category remain but might need manual re-categorization by the user.
      // Or, you could update items to a default/uncategorized state here.
      toast({ title: "Category Deleted", description: `Category "${categoryName}" deleted. Items may need re-categorizing.`, variant: "destructive" });
    } catch (e:any) {
      toast({ title: "Error deleting category", description: e.message || String(e), variant: "destructive" });
    }
  };

  // MENU ITEM CRUD
  const handleSaveItem = async () => {
    if (!itemName || !itemPrice || !itemCategory || !truckId) {
      toast({ title: "Missing Fields", description: "Name, price, and category are required.", variant: "destructive"});
      return;
    }
    let imageUrl: string | undefined = editingItem?.imageUrl; // Keep old image if not changed

    if (itemImageFile) { // A new file was selected
      try {
        const imageRef = ref(storage, `trucks/${truckId}/menuImages/${itemImageFile.name}_${Date.now()}`);
        await uploadBytes(imageRef, itemImageFile);
        imageUrl = await getDownloadURL(imageRef);
      } catch (uploadError: any) {
        toast({ title: "Image Upload Failed", description: uploadError.message || "Could not upload image.", variant: "destructive"});
        return; // Stop if image upload fails
      }
    }
    
    const itemData: Omit<MenuItem, 'id'> = {
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice),
      category: itemCategory,
      imageUrl: imageUrl || undefined, // Ensure it's undefined not null for Firestore if no image
    };

    try {
      const itemCollectionRef = collection(db, "trucks", truckId, "menuItems");
      if (editingItem) {
        await updateDoc(doc(itemCollectionRef, editingItem.id), itemData);
        setMenuItems(menuItems.map(item =>
          item.id === editingItem.id
            ? { ...item, ...itemData, id: item.id } // Ensure id is preserved
            : item
        ));
        toast({ title: "Item Updated", description: `"${itemName}" updated.` });
      } else {
        const docRef = await addDoc(itemCollectionRef, { ...itemData, createdAt: serverTimestamp() });
        setMenuItems([...menuItems, { ...itemData, id: docRef.id }]);
        toast({ title: "Item Added", description: `"${itemName}" added to ${itemCategory}.` });
      }
    } catch (e:any) {
      toast({ title: "Error saving item", description: e.message || String(e), variant: "destructive" });
    }
    resetItemForm();
    setEditingItem(null);
    setIsItemDialogOpen(false);
    setItemImageFile(null); // Clear file after save
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!truckId) return;
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await deleteDoc(doc(db, "trucks", truckId, "menuItems", itemId));
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      toast({ title: "Item Deleted", variant: "destructive" });
    } catch (e:any) {
      toast({ title: "Error deleting item", description: e.message || String(e), variant: "destructive" });
    }
  };

  // DIALOG OPEN/CLOSE & FORM RESET
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
  const resetItemForm = () => {
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemCategory(categories.length > 0 ? categories[0].name : '');
    setItemImageFile(null);
    setItemImagePreview(undefined);
  };
  const openEditItemDialog = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemCategory(item.category);
    setItemImageFile(null); // Reset file input
    setItemImagePreview(item.imageUrl || undefined);
    setIsItemDialogOpen(true);
  };
  const openNewItemDialog = () => {
    setEditingItem(null);
    resetItemForm();
    if (categories.length > 0 && !itemCategory) setItemCategory(categories[0].name);
    setIsItemDialogOpen(true);
  };

  // RENDER
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading menu management...</p>
      </div>
    );
  }
  if (error && !truckId) { // Show error prominently if truckId is missing and causing data load failure
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Error Loading Menu Data</AlertTitle>
          <AlertDescription>{error} Ensure your truck profile is complete.</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/owner/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  if (!currentUser) { // Should be caught by auth listener, but as a fallback
     return (
      <div className="container mx-auto px-4 py-8 text-center">
         <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTitle>Not Authenticated</AlertTitle>
            <AlertDescription>Please log in to manage your menu.</AlertDescription>
         </Alert>
         <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
          <Utensils className="mr-3 h-8 w-8" /> Manage Your Menu
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      {/* --- CATEGORY DIALOG --- */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input id="categoryName" value={currentCategoryName} onChange={e => setCurrentCategoryName(e.target.value)} placeholder="e.g., Appetizers" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCategoryDialogOpen(false); setEditingCategory(null); setCurrentCategoryName('');}}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- ITEM DIALOG --- */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="itemName"><Tag className="inline mr-1 h-4 w-4"/>Item Name</Label>
              <Input id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g., Gourmet Burger" />
            </div>
            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea id="itemDescription" value={itemDescription} onChange={e => setItemDescription(e.target.value)} placeholder="Describe the item..." />
            </div>
            <div>
              <Label htmlFor="itemPrice"><DollarSign className="inline mr-1 h-4 w-4"/>Price</Label>
              <Input id="itemPrice" type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="e.g., 9.99" />
            </div>
            <div>
              <Label htmlFor="itemCategorySelect">Category</Label>
              <Select value={itemCategory} onValueChange={setItemCategory} disabled={categories.length === 0}>
                <SelectTrigger id="itemCategorySelect">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && <p className="text-xs text-destructive mt-1">Please add a category first.</p>}
            </div>
            <div>
              <Label htmlFor="itemImageFile"><ImageIcon className="inline mr-1 h-4 w-4"/>Item Image</Label>
              <Input id="itemImageFile" type="file" accept="image/*" onChange={handleImageFileChange} className="mt-1"/>
              {itemImagePreview && (
                <div className="mt-2 relative w-24 h-24">
                  <NextImage src={itemImagePreview} alt="Preview" layout="fill" className="rounded object-cover" data-ai-hint="food item"/>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsItemDialogOpen(false); setEditingItem(null); resetItemForm(); setItemImageFile(null); }}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={categories.length === 0 && !editingItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- CATEGORIES + ITEMS UI --- */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Menu Categories</CardTitle>
              <Button variant="ghost" size="icon" onClick={openNewCategoryDialog}>
                <PlusCircle className="h-5 w-5 text-primary" />
              </Button>
            </div>
            <CardDescription>Organize your menu sections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.length > 0 ? categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-2 border rounded-md bg-muted/30">
                <span>{cat.name}</span>
                <div className="space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditCategoryDialog(cat)}> <Edit3 className="h-4 w-4" /> </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id, cat.name)}> <Trash2 className="h-4 w-4 text-destructive" /> </Button>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No categories yet. Click '+' to add one.</p>}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Menu Items</CardTitle>
                <Button onClick={openNewItemDialog} disabled={categories.length === 0}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Add New Item
                </Button>
             </div>
            <CardDescription>Add, edit, or remove items from your menu.</CardDescription>
             {categories.length === 0 && <p className="text-xs text-destructive pt-2">Please add a category before adding menu items.</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            {menuItems.length > 0 ? menuItems.map(item => (
              <Card key={item.id} className="bg-card p-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                    {item.imageUrl && (
                        <div className="w-full sm:w-1/3 h-40 sm:h-auto relative">
                          <NextImage src={item.imageUrl} alt={item.name} layout="fill" className="object-cover" data-ai-hint="food item" />
                        </div>
                    )}
                    <div className={`flex-1 p-4 flex flex-col justify-between ${item.imageUrl ? 'sm:w-2/3' : 'w-full'}`}>
                        <div>
                            <CardTitle className="text-lg mb-1">{item.name}</CardTitle>
                            <CardDescription className="text-xs text-primary mb-1">${item.price.toFixed(2)} - {item.category}</CardDescription>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-auto">
                            <Button variant="outline" size="sm" onClick={() => openEditItemDialog(item)}> <Edit3 className="mr-1 h-3 w-3"/> Edit </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}> <Trash2 className="mr-1 h-3 w-3"/> Delete </Button>
                        </div>
                    </div>
                </div>
              </Card>
            )) : <p className="text-sm text-muted-foreground py-10 text-center">No menu items yet. Add some after creating categories!</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
