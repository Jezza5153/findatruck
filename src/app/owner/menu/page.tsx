
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils, PlusCircle, Edit3, Trash2, Image as ImageIcon, DollarSign, Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import Image from "next/image"; // Corrected import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string; // Optional
};

type MenuCategory = {
  id: string;
  name: string;
};

export default function OwnerMenuPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: 'main', name: 'Main Courses' }, { id: 'sides', name: 'Sides' }, {id: 'drinks', name: 'Drinks'}
  ]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Spicy Chicken Tacos (Set of 3)', description: 'Our signature tacos with a fiery kick!', price: 12.00, category: 'Main Courses', imageUrl: 'https://placehold.co/300x200.png' },
    { id: '2', name: 'Classic Cheeseburger', description: 'Juicy beef patty with cheddar and fixings.', price: 10.50, category: 'Main Courses', imageUrl: 'https://placehold.co/300x200.png' },
    { id: '3', name: 'Crispy Fries', description: 'Perfectly salted golden fries.', price: 4.00, category: 'Sides' },
  ]);
  
  // State for adding/editing items and categories - simplified for brevity
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentCategoryName, setCurrentCategoryName] = useState('');
  // Form state for new/editing item
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);


  const handleSaveCategory = () => {
    // Logic to save or update category (mocked)
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: currentCategoryName } : c));
      toast({ title: "Category Updated", description: `Category "${currentCategoryName}" has been updated.` });
    } else {
      const newCategory = { id: Date.now().toString(), name: currentCategoryName };
      setCategories([...categories, newCategory]);
      toast({ title: "Category Added", description: `Category "${currentCategoryName}" has been added.` });
    }
    setCurrentCategoryName('');
    setEditingCategory(null);
    setIsCategoryDialogOpen(false);
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    // Also remove items in this category or re-assign them
    setMenuItems(menuItems.filter(item => item.category !== categories.find(c=>c.id === categoryId)?.name));
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({ title: "Category Deleted", variant: "destructive" });
  };

  const handleSaveItem = () => {
    // Basic validation
    if (!itemName || !itemPrice || !itemCategory) {
        toast({ title: "Missing Fields", description: "Name, price, and category are required.", variant: "destructive"});
        return;
    }
    // Logic to save or update item (mocked)
    const newItemData = {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        category: itemCategory,
        imageUrl: itemImageFile ? URL.createObjectURL(itemImageFile) : (editingItem?.imageUrl || 'https://placehold.co/300x200.png')
    };

    if (editingItem) {
        setMenuItems(menuItems.map(item => item.id === editingItem.id ? { ...item, ...newItemData } : item));
        toast({ title: "Item Updated", description: `"${itemName}" has been updated.` });
    } else {
        const newItem = { id: Date.now().toString(), ...newItemData };
        setMenuItems([...menuItems, newItem]);
        toast({ title: "Item Added", description: `"${itemName}" has been added to ${itemCategory}.` });
    }
    resetItemForm();
    setEditingItem(null);
    setIsItemDialogOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
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
    setItemCategory('');
    setItemImageFile(null);
  };
  
  const openEditItemDialog = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemCategory(item.category);
    // Image handling is more complex, typically not reset directly to file object
    setIsItemDialogOpen(true);
  };
  
  const openNewItemDialog = () => {
    setEditingItem(null);
    resetItemForm();
    if (categories.length > 0) setItemCategory(categories[0].name); // Default to first category
    setIsItemDialogOpen(true);
  };


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

      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the name of this category.' : 'Create a new category for your menu items.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input 
                id="categoryName" 
                value={currentCategoryName} 
                onChange={(e) => setCurrentCategoryName(e.target.value)} 
                placeholder="e.g., Appetizers, Desserts" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Management Dialog */}
       <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the details of this menu item.' : 'Add a new item to your menu.'}
            </DialogDescription>
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
              <Label htmlFor="itemCategory">Category</Label>
              <Select value={itemCategory} onValueChange={setItemCategory} >
                <SelectTrigger id="itemCategory">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="itemImage"><ImageIcon className="inline mr-1 h-4 w-4"/>Item Image</Label>
                <Input id="itemImage" type="file" accept="image/*" onChange={(e) => setItemImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1"/>
                {editingItem?.imageUrl && !itemImageFile && <Image src={editingItem.imageUrl} alt={editingItem.name} width={100} height={100} className="mt-2 rounded" data-ai-hint="food item"/>}
                {itemImageFile && <Image src={URL.createObjectURL(itemImageFile)} alt="Preview" width={100} height={100} className="mt-2 rounded" data-ai-hint="food item"/>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="grid md:grid-cols-3 gap-6">
        {/* Categories Section */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Menu Categories</CardTitle>
              <Button variant="ghost" size="icon" onClick={openNewCategoryDialog}>
                <PlusCircle className="h-5 w-5 text-primary" />
              </Button>
            </div>
            <CardDescription>Organize your menu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.length > 0 ? categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-2 border rounded-md bg-muted/30">
                <span>{cat.name}</span>
                <div className="space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditCategoryDialog(cat)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No categories yet. Add one!</p>}
          </CardContent>
        </Card>

        {/* Menu Items Section */}
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
                <div className="flex">
                    {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.name} width={120} height={120} className="rounded-l-md object-cover" data-ai-hint="food item" />
                    )}
                    <div className="flex-grow p-4">
                        <CardTitle className="text-lg mb-1">{item.name}</CardTitle>
                        <CardDescription className="text-xs text-primary mb-1">${item.price.toFixed(2)} - {item.category}</CardDescription>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditItemDialog(item)}>
                                <Edit3 className="mr-1 h-3 w-3"/> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="mr-1 h-3 w-3"/> Delete
                            </Button>
                        </div>
                    </div>
                </div>
              </Card>
            )) : <p className="text-sm text-muted-foreground">No menu items yet. Add some!</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
