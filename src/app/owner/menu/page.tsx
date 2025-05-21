
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type MenuItem = {
  id: string; // Will be assigned by backend
  name: string;
  description: string;
  price: number;
  category: string; // Name of the category
  imageUrl?: string;
};

type MenuCategory = {
  id: string; // Will be assigned by backend
  name: string;
};

export default function OwnerMenuPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentCategoryName, setCurrentCategoryName] = useState('');
  
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState(''); // Will store category name
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);


  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Fetch categories from backend: GET /api/owner/menu/categories
        // TODO: Fetch menu items from backend: GET /api/owner/menu/items
        // For now, simulate delay and empty data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCategories([
            // { id: 'temp-main', name: 'Main Courses (Loaded)' }, // Example if fetched
        ]);
        setMenuItems([
            // { id: 'temp-1', name: 'Burger (Loaded)', description: 'Desc', price: 10, category: 'Main Courses (Loaded)'}
        ]);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load menu data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuData();
  }, []);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setItemImageFile(file);
      setItemImagePreview(URL.createObjectURL(file));
    } else {
      setItemImageFile(null);
      setItemImagePreview(null);
    }
  };

  const handleSaveCategory = async () => {
    if (!currentCategoryName.trim()) {
        toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive"});
        return;
    }
    // TODO: API call to save/update category
    // if (editingCategory) { PUT /api/owner/menu/categories/{editingCategory.id} }
    // else { POST /api/owner/menu/categories }
    // On success, refetch categories or update state optimistically
    
    // Simulating for now:
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: currentCategoryName } : c));
      toast({ title: "Category Updated", description: `Category "${currentCategoryName}" has been updated.` });
    } else {
      const newCategory = { id: `temp-${Date.now()}`, name: currentCategoryName }; // temp ID
      setCategories([...categories, newCategory]);
      toast({ title: "Category Added", description: `Category "${currentCategoryName}" has been added.` });
    }
    setCurrentCategoryName('');
    setEditingCategory(null);
    setIsCategoryDialogOpen(false);
  };
  
  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    // TODO: API call: DELETE /api/owner/menu/categories/{categoryId}
    // Backend should handle deleting associated menu items or disassociating them.
    // On success, refetch or update state.
    
    // Simulating for now:
    setMenuItems(menuItems.filter(item => item.category !== categoryName));
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({ title: "Category Deleted", description: `Category "${categoryName}" and its items deleted.`, variant: "destructive" });
  };

  const handleSaveItem = async () => {
    if (!itemName || !itemPrice || !itemCategory) {
        toast({ title: "Missing Fields", description: "Name, price, and category are required.", variant: "destructive"});
        return;
    }
    
    // TODO: API call
    // const formData = new FormData();
    // formData.append('name', itemName);
    // formData.append('description', itemDescription);
    // formData.append('price', itemPrice);
    // formData.append('categoryName', itemCategory); // Send category name, backend finds/creates ID
    // if (itemImageFile) formData.append('image', itemImageFile);
    // if (editingItem) { PUT /api/owner/menu/items/{editingItem.id} with formData }
    // else { POST /api/owner/menu/items with formData }
    // On success, refetch items or update state optimistically.
    
    // Simulating for now:
    const newItemData = {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        category: itemCategory, // Store category name
        imageUrl: itemImagePreview || (editingItem && !itemImageFile ? editingItem.imageUrl : undefined) // Preserve old image if not changed
    };

    if (editingItem) {
        setMenuItems(menuItems.map(item => item.id === editingItem.id ? { ...item, ...newItemData } : item));
        toast({ title: "Item Updated", description: `"${itemName}" has been updated.` });
    } else {
        const newItem = { id: `temp-item-${Date.now()}`, ...newItemData }; // temp ID
        setMenuItems([...menuItems, newItem]);
        toast({ title: "Item Added", description: `"${itemName}" has been added to ${itemCategory}.` });
    }
    resetItemForm();
    setEditingItem(null);
    setIsItemDialogOpen(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    // TODO: API call: DELETE /api/owner/menu/items/{itemId}
    // On success, refetch or update state.

    // Simulating for now:
    setMenuItems(menuItems.filter(item => item.id !== itemId));
    toast({ title: "Item Deleted", variant: "destructive" });
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
  
  const resetItemForm = () => {
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemCategory(categories.length > 0 ? categories[0].name : '');
    setItemImageFile(null);
    setItemImagePreview(null);
  };
  
  const openEditItemDialog = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemCategory(item.category); // Set category name
    setItemImageFile(null); // Reset file input
    setItemImagePreview(item.imageUrl || null);
    setIsItemDialogOpen(true);
  };
  
  const openNewItemDialog = () => {
    setEditingItem(null);
    resetItemForm();
    if (categories.length > 0 && !itemCategory) {
      setItemCategory(categories[0].name);
    }
    setIsItemDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading menu management...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Error Loading Menu Data</AlertTitle>
          <AlertDescription>{error}. Please ensure you are logged in and try refreshing.</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/owner/dashboard">Back to Dashboard</Link>
            </Button>
        </div>
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

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input id="categoryName" value={currentCategoryName} onChange={(e) => setCurrentCategoryName(e.target.value)} placeholder="e.g., Appetizers" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCategoryDialogOpen(false); setEditingCategory(null); setCurrentCategoryName('');}}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="itemName"><Tag className="inline mr-1 h-4 w-4"/>Item Name</Label>
              <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Gourmet Burger" />
            </div>
            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea id="itemDescription" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Describe the item..." />
            </div>
             <div>
              <Label htmlFor="itemPrice"><DollarSign className="inline mr-1 h-4 w-4"/>Price</Label>
              <Input id="itemPrice" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="e.g., 9.99" />
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
                {itemImagePreview && <NextImage src={itemImagePreview} alt="Preview" width={100} height={100} className="mt-2 rounded object-cover" data-ai-hint="food item"/>}
                {!itemImagePreview && editingItem?.imageUrl && <NextImage src={editingItem.imageUrl} alt={editingItem.name} width={100} height={100} className="mt-2 rounded object-cover" data-ai-hint="food item"/>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsItemDialogOpen(false); setEditingItem(null); resetItemForm(); }}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={categories.length === 0 && !editingItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Card key={item.id} className="bg-muted/20 p-0">
                <div className="flex flex-col sm:flex-row">
                    {item.imageUrl && (
                        <div className="w-full sm:w-1/3 h-32 sm:h-auto relative">
                        <NextImage src={item.imageUrl} alt={item.name} layout="fill" className="rounded-t-md sm:rounded-l-md sm:rounded-tr-none object-cover" data-ai-hint="food item" />
                        </div>
                    )}
                    <div className={`flex-grow p-4 ${item.imageUrl ? 'sm:w-2/3' : 'w-full'}`}>
                        <CardTitle className="text-lg mb-1">{item.name}</CardTitle>
                        <CardDescription className="text-xs text-primary mb-1">${item.price.toFixed(2)} - {item.category}</CardDescription>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
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
