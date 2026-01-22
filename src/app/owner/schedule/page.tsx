'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar, Clock, MapPin, Plus, Trash2, Save, Loader2, CalendarDays, X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ScheduleEntry {
  id: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  address: string;
  note?: string;
}

export default function OwnerSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: '',
    endDate: '',
    startTime: '10:00',
    endTime: '20:00',
    address: '',
    note: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/owner/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const truckId = (session?.user as any)?.truckId;
        if (truckId) {
          const res = await fetch(`/api/trucks/${truckId}`);
          const data = await res.json();
          if (data.success && data.data.specialHours) {
            // Convert specialHours to our schedule format
            const entries = data.data.specialHours.map((h: any, i: number) => ({
              id: `entry-${i}`,
              date: h.date,
              endDate: h.endDate,
              startTime: h.openTime || '10:00',
              endTime: h.closeTime || '20:00',
              address: h.address || data.data.address || '',
              note: h.note || ''
            }));
            setSchedule(entries);
          }
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchSchedule();
    }
  }, [status, session]);

  const addEntry = () => {
    if (!newEntry.date || !newEntry.address) {
      toast({
        title: 'Missing fields',
        description: 'Please enter date and location',
        variant: 'destructive'
      });
      return;
    }

    const entry: ScheduleEntry = {
      id: `entry-${Date.now()}`,
      date: newEntry.date,
      endDate: newEntry.endDate || undefined,
      startTime: newEntry.startTime,
      endTime: newEntry.endTime,
      address: newEntry.address,
      note: newEntry.note
    };

    setSchedule([...schedule, entry].sort((a, b) => a.date.localeCompare(b.date)));
    setNewEntry({ date: '', endDate: '', startTime: '10:00', endTime: '20:00', address: '', note: '' });
    setShowAddForm(false);
    toast({ title: '📅 Entry added!' });
  };

  const deleteEntry = (id: string) => {
    setSchedule(schedule.filter(e => e.id !== id));
    toast({ title: 'Entry removed' });
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      const truckId = (session?.user as any)?.truckId;
      const specialHours = schedule.map(e => ({
        date: e.date,
        endDate: e.endDate,
        status: 'open-custom',
        openTime: e.startTime,
        closeTime: e.endTime,
        address: e.address,
        note: e.note
      }));

      await fetch(`/api/trucks/${truckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialHours })
      });

      toast({
        title: '✅ Schedule saved!',
        description: 'Your planned locations are now visible to customers'
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save schedule', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isUpcoming = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr + 'T00:00:00');
    return date >= today;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-700" />
          <Skeleton className="h-64 bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  const upcomingSchedule = schedule.filter(e => isUpcoming(e.date));
  const pastSchedule = schedule.filter(e => !isUpcoming(e.date));

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
              <CalendarDays className="w-8 h-8 text-purple-400" />
              Schedule Planner
            </h1>
            <p className="text-slate-400 mt-1">
              Plan where you'll be • Customers can see your upcoming locations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Date
            </Button>
            {schedule.length > 0 && (
              <Button
                onClick={saveSchedule}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save All
              </Button>
            )}
          </div>
        </motion.div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-800/80 border-purple-500/30 mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg text-purple-400">Add Scheduled Location</CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Start Date *</Label>
                    <Input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">End Date (optional, for range)</Label>
                    <Input
                      type="date"
                      value={newEntry.endDate}
                      onChange={(e) => setNewEntry({ ...newEntry, endDate: e.target.value })}
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Open Time</Label>
                    <Input
                      type="time"
                      value={newEntry.startTime}
                      onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Close Time</Label>
                    <Input
                      type="time"
                      value={newEntry.endTime}
                      onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Location / Address *</Label>
                  <Input
                    placeholder="e.g., Central Park, near the fountain"
                    value={newEntry.address}
                    onChange={(e) => setNewEntry({ ...newEntry, address: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Note (optional)</Label>
                  <Input
                    placeholder="e.g., Special taco Tuesday!"
                    value={newEntry.note}
                    onChange={(e) => setNewEntry({ ...newEntry, note: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-slate-600 bg-slate-700/50 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addEntry}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upcoming Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            Upcoming ({upcomingSchedule.length})
          </h2>

          {upcomingSchedule.length > 0 ? (
            <div className="space-y-3">
              {upcomingSchedule.map((entry) => (
                <Card key={entry.id} className="bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors shadow-lg">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 text-center py-2 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-400">
                        {new Date(entry.date + 'T00:00:00').getDate()}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span className="font-medium truncate">{entry.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entry.startTime} - {entry.endTime}
                        </span>
                        {entry.endDate && (
                          <span>→ {formatDate(entry.endDate)}</span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-sm text-yellow-400 mt-1">📝 {entry.note}</p>
                      )}
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-900 border-slate-800 shadow-lg">
              <CardContent className="p-8 text-center">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                <p className="text-slate-400">No upcoming dates scheduled</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  className="mt-4 border-slate-600 bg-slate-700/50 text-slate-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Date
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Past Schedule */}
        {pastSchedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-4 text-slate-500 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Past ({pastSchedule.length})
            </h2>
            <div className="space-y-2 opacity-60">
              {pastSchedule.slice(0, 5).map((entry) => (
                <Card key={entry.id} className="bg-slate-800/30 border-slate-700/30">
                  <CardContent className="p-3 flex items-center gap-4 text-sm">
                    <span className="text-slate-500 w-24">{formatDate(entry.date)}</span>
                    <span className="flex-1 truncate text-slate-400">{entry.address}</span>
                    <span className="text-slate-500">{entry.startTime} - {entry.endTime}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-slate-500 hover:text-red-400 h-6 w-6"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
