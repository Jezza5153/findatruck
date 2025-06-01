'use client';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarClock, Power, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type RegularHours = {
  [key: string]: { openTime: string; closeTime: string; isClosed: boolean };
};
type SpecialHour = {
  id: string;
  date: string;
  status: 'open-custom' | 'closed';
  openTime?: string;
  closeTime?: string;
};

const defaultRegularHours: RegularHours = daysOfWeek.reduce((acc, day) => {
  acc[day] = { openTime: '09:00', closeTime: '17:00', isClosed: false };
  return acc;
}, {} as RegularHours);

export default function OwnerSchedulePage() {
  const { toast } = useToast();

  // Auth and loading states
  const [ownerUid, setOwnerUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Schedule states
  const [regularHours, setRegularHours] = useState<RegularHours>(defaultRegularHours);
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [isTruckOpen, setIsTruckOpen] = useState(true);

  // Dialog states
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<SpecialHour | null>(null);
  const [specialStatus, setSpecialStatus] = useState<'open-custom' | 'closed' | ''>('');
  const [specialOpenTime, setSpecialOpenTime] = useState('');
  const [specialCloseTime, setSpecialCloseTime] = useState('');

  // On mount: get auth, load data from Firestore
  useEffect(() => {
    setLoading(true);
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        setOwnerUid(user.uid);
        // Load schedule from Firestore
        const docRef = doc(db, "trucks", user.uid, "settings", "hours");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setRegularHours(data.regularHours || defaultRegularHours);
          setSpecialHours(data.specialHours || []);
          setIsTruckOpen(data.isTruckOpen ?? true);
        }
      }
      setLoading(false);
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);

  // Helpers for calendar
  const dateToISO = (d: Date) => d.toISOString().slice(0, 10);

  // Open dialog for special day (existing or new)
  const openSpecialDialog = (date: Date) => {
    const iso = dateToISO(date);
    const found = specialHours.find(sh => sh.date === iso);
    setCalendarDate(date);
    if (found) {
      setEditingSpecial(found);
      setSpecialStatus(found.status);
      setSpecialOpenTime(found.openTime || '');
      setSpecialCloseTime(found.closeTime || '');
    } else {
      setEditingSpecial(null);
      setSpecialStatus('');
      setSpecialOpenTime('');
      setSpecialCloseTime('');
    }
    setDialogOpen(true);
  };

  // Save/update special hour
  const handleSaveSpecial = () => {
    if (!calendarDate || !specialStatus) {
      toast({ title: "Missing Info", description: "Please select a status.", variant: "destructive" }); return;
    }
    const iso = dateToISO(calendarDate);
    if (specialStatus === 'open-custom' && (!specialOpenTime || !specialCloseTime)) {
      toast({ title: "Missing Times", description: "Enter open and close time.", variant: "destructive" }); return;
    }
    let updated: SpecialHour = {
      id: editingSpecial?.id || Date.now().toString(),
      date: iso,
      status: specialStatus,
      openTime: specialStatus === 'open-custom' ? specialOpenTime : undefined,
      closeTime: specialStatus === 'open-custom' ? specialCloseTime : undefined,
    };
    let newList = specialHours.filter(sh => sh.date !== iso).concat([updated]);
    setSpecialHours(newList);
    setDialogOpen(false);
    toast({ title: "Special Hour Saved", description: `${iso} updated.` });
  };

  // Delete special hour
  const handleDeleteSpecial = () => {
    if (!calendarDate) return;
    const iso = dateToISO(calendarDate);
    setSpecialHours(specialHours.filter(sh => sh.date !== iso));
    setDialogOpen(false);
    toast({ title: "Special Day Removed", description: `${iso} entry removed.`, variant: "destructive" });
  };

  // Save all to Firestore
  const handleSaveAll = async () => {
    if (!ownerUid) {
      toast({ title: "Auth Error", description: "Please log in.", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, "trucks", ownerUid, "settings", "hours");
      await setDoc(docRef, {
        regularHours,
        specialHours,
        isTruckOpen,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: "Schedule Saved!", description: "Your hours have been updated." });
    } catch (e: any) {
      toast({ title: "Save Error", description: e?.message || "Failed to save hours.", variant: "destructive" });
    }
    setLoading(false);
  };

  // Regular hours handlers
  const handleRegularHoursChange = (day: string, field: keyof RegularHours[string], value: string | boolean) => {
    setRegularHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  if (loading) return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin mb-4" />
      <p>Loading your schedule…</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
          <CalendarClock className="mr-3 h-8 w-8" /> Schedule & Operating Hours
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      {/* Calendar View */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">Special Hours Calendar</CardTitle>
          <CardDescription>
            Click a date to set custom hours or mark as closed for special days (holidays, events, etc).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            tileClassName={({ date }) => {
              const iso = dateToISO(date);
              const special = specialHours.find(sh => sh.date === iso);
              if (special) return special.status === 'closed' ? 'bg-red-200' : 'bg-green-200';
              return '';
            }}
            onClickDay={openSpecialDialog}
            minDetail="month"
            prev2Label={null}
            next2Label={null}
          />
        </CardContent>
      </Card>
      {/* Dialog for adding/editing special hours */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpecial ? "Edit Special Hours" : "Add Special Hours"}
              <span className="ml-2 text-muted-foreground text-xs">{calendarDate ? dateToISO(calendarDate) : ''}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label>Status</Label>
            <Select value={specialStatus} onValueChange={v => setSpecialStatus(v as 'open-custom' | 'closed' | '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open-custom">Open (Custom Hours)</SelectItem>
                <SelectItem value="closed">Closed All Day</SelectItem>
              </SelectContent>
            </Select>
            {specialStatus === 'open-custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Open Time</Label>
                  <Input type="time" value={specialOpenTime} onChange={e => setSpecialOpenTime(e.target.value)} />
                </div>
                <div>
                  <Label>Close Time</Label>
                  <Input type="time" value={specialCloseTime} onChange={e => setSpecialCloseTime(e.target.value)} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {editingSpecial && (
              <Button variant="destructive" onClick={handleDeleteSpecial}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <Button onClick={handleSaveSpecial}>
              <PlusCircle className="h-4 w-4 mr-1" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regular Hours + Status */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Regular Operating Hours</CardTitle>
            <CardDescription>
              Set your standard weekly opening and closing times.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map(day => (
              <div key={day} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 border rounded-md bg-muted/30">
                <Label htmlFor={`${day}-open`} className="sm:col-span-1 font-semibold self-center">{day}</Label>
                <div className="sm:col-span-1">
                  <Label htmlFor={`${day}-open-time`} className="text-xs">Open Time</Label>
                  <Input
                    id={`${day}-open-time`}
                    type="time"
                    className="mt-1"
                    value={regularHours[day].openTime}
                    onChange={(e) => handleRegularHoursChange(day, 'openTime', e.target.value)}
                    disabled={regularHours[day].isClosed}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor={`${day}-close-time`} className="text-xs">Close Time</Label>
                  <Input
                    id={`${day}-close-time`}
                    type="time"
                    className="mt-1"
                    value={regularHours[day].closeTime}
                    onChange={(e) => handleRegularHoursChange(day, 'closeTime', e.target.value)}
                    disabled={regularHours[day].isClosed}
                  />
                </div>
                <div className="sm:col-span-1 flex items-center space-x-2 justify-self-start sm:justify-self-end pt-4 sm:pt-0">
                  <Switch
                    id={`${day}-closed`}
                    checked={regularHours[day].isClosed}
                    onCheckedChange={(checked) => handleRegularHoursChange(day, 'isClosed', checked)}
                  />
                  <Label htmlFor={`${day}-closed`} className="text-xs">Closed</Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Power className="mr-2 h-5 w-5" /> Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="open-status" className="font-medium">Truck Open</Label>
                <Switch id="open-status" checked={isTruckOpen} onCheckedChange={setIsTruckOpen} />
              </div>
              <p className="text-xs text-muted-foreground">Toggle this to immediately mark your truck as open or closed on the map.</p>
            </CardContent>
          </Card>
          <Button className="w-full" onClick={handleSaveAll}>
            <PlusCircle className="mr-2 h-4 w-4" /> Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
