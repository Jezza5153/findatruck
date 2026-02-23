'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  IconUtensils, IconPlus, IconTrash2, IconEdit2, IconGripVertical,
  IconDollarSign, IconImage, IconSave, IconLoader2, IconX, IconUpload
} from '@/components/ui/branded-icons';
import { motion } from 'framer-motion';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isSpecial?: boolean;
  availability?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  order: number;
}

export default function OwnerMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setIconUploading] = useState(false);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/owner/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const truckId = (session?.user as any)?.truckId;
        if (truckId) {
          const res = await fetch(`/api/trucks/${truckId}/menu`);
          const data = await res.json();
          if (data.success) {
            setItems(data.data.items || []);
            setCategories(data.data.categories || []);
          }
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchMenu();
    }
  }, [status, session]);

  const handleImageIconUpload = async (file: File, isEdit = false) => {
    setIconUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'menu-item');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (isEdit && editingItem) {
          setEditingItem({ ...editingItem, imageUrl: data.url });
        } else {
          setNewItem({ ...newItem, imageUrl: data.url });
        }
        toast({ title: 'Image uploaded!' });
      } else {
        throw new Error(data.error || 'IconUpload failed');
      }
    } catch (error) {
      toast({
        title: 'IconUpload failed',
        description: 'Could not upload image',
        variant: 'destructive'
      });
    } finally {
      setIconUploading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: 'Missing fields',
        description: 'Please enter name and price',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const truckId = (session?.user as any)?.truckId;
      const res = await fetch(`/api/trucks/${truckId}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          category: newItem.category || 'General',
          imageUrl: newItem.imageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setItems([...items, data.data]);
        setNewItem({ name: '', description: '', price: '', category: '', imageUrl: '' });
        setShowAddForm(false);
        toast({ title: 'Item added!' });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      const truckId = (session?.user as any)?.truckId;
      const res = await fetch(`/api/trucks/${truckId}/menu`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          imageUrl: editingItem.imageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setItems(items.map(i => i.id === editingItem.id ? editingItem : i));
        setEditingItem(null);
        toast({ title: 'Item updated!' });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const truckId = (session?.user as any)?.truckId;
      await fetch(`/api/trucks/${truckId}/menu?itemId=${itemId}`, {
        method: 'DELETE'
      });
      setItems(items.filter(i => i.id !== itemId));
      toast({ title: 'Item deleted' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive'
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-700" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <IconUtensils className="w-8 h-8 text-orange-400" />
              Menu Manager
            </h1>
            <p className="text-slate-400 mt-1">{items.length} items in your menu</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <IconPlus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </motion.div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageIconUpload(e.target.files[0])}
        />
        <input
          type="file"
          ref={editFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageIconUpload(e.target.files[0], true)}
        />

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-800/80 border-slate-700/50 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image upload */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Item Image</Label>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-xl bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors"
                    >
                      {newItem.imageUrl ? (
                        <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      ) : uploading ? (
                        <IconLoader2 className="w-6 h-6 text-slate-400 animate-spin" />
                      ) : (
                        <IconUpload className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400">Click to upload an image</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Item Name *</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Deluxe Burger"
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Price *</Label>
                    <div className="relative">
                      <IconDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        placeholder="12.99"
                        className="bg-slate-900/50 border-slate-600 text-white pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Juicy beef patty with all the fixings..."
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {saving ? (
                      <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><IconSave className="w-4 h-4 mr-2" />Save Item</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Edit Form Modal */}
        {editingItem && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-800/80 border-orange-500/50 mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-orange-400">Editing: {editingItem.name}</CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setEditingItem(null)}>
                  <IconX className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Edit image */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Item Image</Label>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-24 h-24 rounded-xl bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors"
                    >
                      {editingItem.imageUrl ? (
                        <img src={editingItem.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      ) : uploading ? (
                        <IconLoader2 className="w-6 h-6 text-slate-400 animate-spin" />
                      ) : (
                        <IconUpload className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400">Click to change image</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Item Name *</Label>
                    <Input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Price *</Label>
                    <div className="relative">
                      <IconDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        step="0.01"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-900/50 border-slate-600 text-white pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingItem(null)}
                    className="border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditItem}
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {saving ? (
                      <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><IconSave className="w-4 h-4 mr-2" />Update Item</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {items.length > 0 ? (
            items.map((item) => (
              <Card
                key={item.id}
                className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors group ${editingItem?.id === item.id ? 'ring-2 ring-orange-500' : ''}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-slate-500 cursor-grab">
                    <IconGripVertical className="w-5 h-5" />
                  </div>

                  <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <IconImage className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      {item.isSpecial && (
                        <Badge className="bg-orange-500 text-xs">Special</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 truncate">{item.description || 'No description'}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-green-400">${item.price.toFixed(2)}</p>
                    {item.availability === 'sold_out' && (
                      <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingItem(item)}
                      className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10"
                    >
                      <IconEdit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                    >
                      <IconTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <IconUtensils className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold mb-2">No menu items yet</h3>
                <p className="text-slate-400 mb-4">Start adding items to your menu</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500"
                >
                  <IconPlus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

