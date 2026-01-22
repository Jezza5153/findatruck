'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users, Search, MoreVertical, Shield, Ban, Loader2, Mail, Truck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface UserData {
    id: string;
    name?: string | null;
    email: string;
    role: 'customer' | 'owner' | 'admin';
    createdAt: string;
    truckName?: string;
}

export default function AdminUsersPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.replace('/login?redirect=/admin/users');
            return;
        }

        if (authStatus === 'authenticated') {
            if (session?.user?.role !== 'admin') {
                router.replace('/');
                return;
            }
            fetchUsers();
        }
    }, [authStatus, session, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch {
            // Ignore
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (id: string, updates: { role?: string; banned?: boolean }) => {
        try {
            await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            fetchUsers();
        } catch {
            // Handle error
        }
    };

    const filteredUsers = users
        .filter(u => roleFilter === 'all' || u.role === roleFilter)
        .filter(u =>
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.name?.toLowerCase().includes(search.toLowerCase())
        );

    if (authStatus === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const roleCounts = {
        all: users.length,
        customer: users.filter(u => u.role === 'customer').length,
        owner: users.filter(u => u.role === 'owner').length,
        admin: users.filter(u => u.role === 'admin').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Users</h1>
                            <p className="text-slate-400">{users.length} registered</p>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search by email or name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700"
                            />
                        </div>
                        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                            {(['all', 'customer', 'owner', 'admin'] as const).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm rounded-md transition-colors capitalize",
                                        roleFilter === role ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {role} ({roleCounts[role]})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-4">
                <div className="space-y-2">
                    {filteredUsers.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/30"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{user.name || user.email.split('@')[0]}</span>
                                        <span className={cn(
                                            "px-1.5 py-0.5 text-[10px] rounded capitalize",
                                            user.role === 'admin' ? "bg-purple-500/20 text-purple-400" :
                                                user.role === 'owner' ? "bg-yellow-500/20 text-yellow-400" :
                                                    "bg-slate-700 text-slate-400"
                                        )}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 truncate flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {user.email}
                                    </p>
                                    {user.truckName && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Truck className="w-3 h-3" />
                                            {user.truckName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                </span>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                        {user.role !== 'admin' && (
                                            <DropdownMenuItem
                                                onClick={() => updateUser(user.id, { role: 'admin' })}
                                                className="flex items-center gap-2"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Make Admin
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => updateUser(user.id, { banned: true })}
                                            className="text-red-400 flex items-center gap-2"
                                        >
                                            <Ban className="w-4 h-4" />
                                            Ban User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </motion.div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>No users found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
