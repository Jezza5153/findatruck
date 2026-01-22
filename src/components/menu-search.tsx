'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    isAvailable?: boolean;
    isSpecial?: boolean;
    imageUrl?: string;
}

interface MenuSearchProps {
    items: MenuItem[];
    onFilteredItems?: (items: MenuItem[]) => void;
}

export function MenuSearch({ items, onFilteredItems }: MenuSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;

        const term = searchTerm.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.category?.toLowerCase().includes(term)
        );
    }, [items, searchTerm]);

    // Notify parent of filtered items
    useMemo(() => {
        onFilteredItems?.(filteredItems);
    }, [filteredItems, onFilteredItems]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            {searchTerm && (
                <p className="text-xs text-slate-500 mt-1">
                    {filteredItems.length} of {items.length} items
                </p>
            )}
        </div>
    );
}

export default MenuSearch;
