'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconUsers,
  IconSearch,
  IconLoader2,
  IconMail,
  IconTruck,
  IconTrash2,
} from '@/components/ui/branded-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/login?redirect=/admin/users');
      return;
    }

    if (authStatus === 'authenticated') {
      if ((session?.user as any)?.role !== 'admin') {
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

  const updateRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchUsers();
    } catch {
      // Handle error
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        setDeleteConfirm(null);
      }
    } catch {
      // Handle error
    }
  };

  const filteredUsers = users
    .filter((user) => roleFilter === 'all' || user.role === roleFilter)
    .filter(
      (user) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name?.toLowerCase().includes(search.toLowerCase())
    );

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-orange-300" />
      </div>
    );
  }

  const roleCounts = {
    all: users.length,
    customer: users.filter((user) => user.role === 'customer').length,
    owner: users.filter((user) => user.role === 'owner').length,
    admin: users.filter((user) => user.role === 'admin').length,
  };

  return (
    <div className="pb-24 pt-8 text-white">
      <div className="container mx-auto max-w-6xl space-y-6 px-4">
        <section className="role-panel-dark-strong p-6 sm:p-8">
          <div className="role-pill-dark mb-4">
            <IconUsers className="h-4 w-4 text-orange-300" />
            User management
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Users</h1>
              <p className="mt-2 text-white/60">{users.length} registered accounts across customer, owner, and admin roles.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Customers</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{roleCounts.customer}</p>
              </div>
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Owners</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{roleCounts.owner}</p>
              </div>
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Admins</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{roleCounts.admin}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="role-input-dark h-12 rounded-full pl-10"
              />
            </div>
            <div className="inline-flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              {(['all', 'customer', 'owner', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors',
                    roleFilter === role ? 'bg-orange-500 text-slate-950' : 'text-white/60 hover:text-white'
                  )}
                >
                  {role} ({roleCounts[role]})
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {filteredUsers.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="role-panel-dark flex items-center justify-between p-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/18 to-white/8 text-lg">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">{user.name || user.email.split('@')[0]}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
                        user.role === 'admin'
                          ? 'bg-violet-400/15 text-violet-200'
                          : user.role === 'owner'
                            ? 'bg-amber-400/15 text-amber-200'
                            : 'bg-white/8 text-white/55'
                      )}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 truncate text-sm text-white/55">
                    <IconMail className="h-3 w-3" />
                    {user.email}
                  </p>
                  {user.truckName ? (
                    <p className="flex items-center gap-1 text-xs text-white/40">
                      <IconTruck className="h-3 w-3" />
                      {user.truckName}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <span className="hidden text-xs text-white/40 sm:inline">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </span>

                {user.role !== 'admin' ? (
                  <div className="flex gap-1 rounded-full border border-white/10 bg-black/20 p-1">
                    <button
                      onClick={() => updateRole(user.id, 'customer')}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                        user.role === 'customer' ? 'bg-white/12 text-white' : 'text-white/45 hover:text-white'
                      )}
                    >
                      Customer
                    </button>
                    <button
                      onClick={() => updateRole(user.id, 'owner')}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                        user.role === 'owner' ? 'bg-amber-400/15 text-amber-200' : 'text-white/45 hover:text-white'
                      )}
                    >
                      Owner
                    </button>
                  </div>
                ) : null}

                {user.role !== 'admin' ? (
                  deleteConfirm === user.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteUser(user.id)}
                        className="h-8 px-2 text-xs text-red-200 hover:bg-red-400/10 hover:text-red-100"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(null)}
                        className="h-8 px-2 text-xs text-white/60"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm(user.id)}
                      className="h-8 w-8 rounded-full p-0 text-white/40 hover:bg-red-400/10 hover:text-red-200"
                    >
                      <IconTrash2 className="h-4 w-4" />
                    </Button>
                  )
                ) : null}
              </div>
            </motion.div>
          ))}

          {filteredUsers.length === 0 ? (
            <div className="role-panel-dark py-12 text-center text-white/45">
              <IconUsers className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No users found</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
