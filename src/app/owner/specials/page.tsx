'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Tag, Plus, Calendar, Clock, Trash2, Edit2, Loader2,
    Sparkles, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Special {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    discountPercent?: number | null;
    startTime?: string | null;
    endTime?: string | null;
    isActive: boolean;
}

export default function OwnerSpecialsPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [specials, setSpecials] = useState<Special[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSpecial, setEditingSpecial] = useState<Special | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountPercent: '',
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.replace('/login?redirect=/owner/specials');
            return;
        }

        if (authStatus === 'authenticated') {
            fetchSpecials();
        }
    }, [authStatus, router]);

    const fetchSpecials = async () => {
        try {
            const res = await fetch('/api/trucks/my/specials');
            if (res.ok) {
                const data = await res.json();
                setSpecials(data.specials || []);
            }
        } catch {
            // Ignore
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const body = {
            ...formData,
            discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : null,
            startTime: formData.startTime || null,
            endTime: formData.endTime || null,
        };

        try {
            if (editingSpecial) {
                await fetch(`/api/trucks/my/specials/${editingSpecial.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            } else {
                await fetch('/api/trucks/my/specials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            }

            fetchSpecials();
            setIsDialogOpen(false);
            resetForm();
        } catch {
            // Handle error
        }
    };

    const toggleActive = async (special: Special) => {
        try {
            await fetch(`/api/trucks/my/specials/${special.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !special.isActive }),
            });
            setSpecials(prev =>
                prev.map(s => s.id === special.id ? { ...s, isActive: !s.isActive } : s)
            );
        } catch {
            // Handle error
        }
    };

    const deleteSpecial = async (id: string) => {
        try {
            await fetch(`/api/trucks/my/specials/${id}`, { method: 'DELETE' });
            setSpecials(prev => prev.filter(s => s.id !== id));
        } catch {
            // Handle error
        }
    };

    const openEdit = (special: Special) => {
        setEditingSpecial(special);
        setFormData({
            title: special.title,
            description: special.description || '',
            discountPercent: special.discountPercent?.toString() || '',
            startTime: special.startTime ? format(new Date(special.startTime), "yyyy-MM-dd'T'HH:mm") : '',
            endTime: special.endTime ? format(new Date(special.endTime), "yyyy-MM-dd'T'HH:mm") : '',
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingSpecial(null);
        setFormData({ title: '', description: '', discountPercent: '', startTime: '', endTime: '' });
    };

    if (authStatus === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const activeSpecials = specials.filter(s => s.isActive);
    const inactiveSpecials = specials.filter(s => !s.isActive);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Specials</h1>
                                <p className="text-slate-400">{specials.length} promotion{specials.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Special
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
                                <DialogHeader>
                                    <DialogTitle>{editingSpecial ? 'Edit Special' : 'Create Special'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label>Title *</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="e.g., 2-for-1 Tacos"
                                            required
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Buy any taco, get one free"
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Discount %</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.discountPercent}
                                            onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: e.target.value }))}
                                            placeholder="e.g., 20"
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Start Time</Label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Time</Label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
                                        {editingSpecial ? 'Update Special' : 'Create Special'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 space-y-6">
                {specials.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No specials yet</h2>
                        <p className="text-slate-400 mb-6">
                            Create promotions to attract more customers
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {/* Active Specials */}
                        {activeSpecials.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Active ({activeSpecials.length})
                                </h2>
                                <div className="space-y-3">
                                    {activeSpecials.map((special, i) => (
                                        <SpecialCard
                                            key={special.id}
                                            special={special}
                                            index={i}
                                            onEdit={() => openEdit(special)}
                                            onToggle={() => toggleActive(special)}
                                            onDelete={() => deleteSpecial(special.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inactive Specials */}
                        {inactiveSpecials.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                    <EyeOff className="w-4 h-4" />
                                    Inactive ({inactiveSpecials.length})
                                </h2>
                                <div className="space-y-3">
                                    {inactiveSpecials.map((special, i) => (
                                        <SpecialCard
                                            key={special.id}
                                            special={special}
                                            index={i}
                                            onEdit={() => openEdit(special)}
                                            onToggle={() => toggleActive(special)}
                                            onDelete={() => deleteSpecial(special.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function SpecialCard({
    special,
    index,
    onEdit,
    onToggle,
    onDelete
}: {
    special: Special;
    index: number;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "p-4 rounded-xl border transition-all",
                special.isActive
                    ? "bg-slate-800/80 border-slate-700/50"
                    : "bg-slate-800/40 border-slate-700/30 opacity-60"
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{special.title}</h3>
                        {special.discountPercent && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-500/20 text-green-400">
                                {special.discountPercent}% OFF
                            </span>
                        )}
                    </div>
                    {special.description && (
                        <p className="text-sm text-slate-400 mt-1">{special.description}</p>
                    )}
                    {(special.startTime || special.endTime) && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {special.startTime && format(new Date(special.startTime), 'MMM d, h:mm a')}
                            {special.startTime && special.endTime && ' - '}
                            {special.endTime && format(new Date(special.endTime), 'MMM d, h:mm a')}
                        </p>
                    )}
                </div>
                <Switch checked={special.isActive} onCheckedChange={onToggle} />
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/30">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="flex-1 text-slate-400 hover:text-white"
                >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="flex-1 text-slate-400 hover:text-red-400"
                >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                </Button>
            </div>
        </motion.div>
    );
}
