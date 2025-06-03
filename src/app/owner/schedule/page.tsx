'use client';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarClock, Power, PlusCircle, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import type { UserDocument } from '@/lib/types';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type RegularHoursEntry = { openTime: string; closeTime: string; isClosed: boolean };
type RegularHours = {
  [key: string]: RegularHoursEntry;
};
type SpecialHour = {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'open-custom' | 'closed';
  openTime?: string; // HH:mm
  closeTime?: string; // HH:mm
};

const defaultRegularHours: RegularHours = daysOfWeek.reduce((acc, day) => {
  acc[day] = { openTime: '09:00', closeTime: '17:00', isClosed: day === "Sunday" || day === "Saturday" }; // Default closed on weekends
  return acc;
}, {} as RegularHours);

export default function OwnerSchedulePage() {
  const { toast } = useToast();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [regularHours, setRegularHours] = useState<RegularHours>(defaultRegularHours);
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [isTruckOpenOverride, setIsTruckOpenOverride] = useState<boolean | null>(null); // null means use schedule logic

  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<SpecialHour | null>(null);
  const [specialStatus, setSpecialStatus] = useState<'open-custom' | 'closed' | ''>('');
  const [specialOpenTime, setSpecialOpenTime] = useState('');
  const [specialCloseTime, setSpecialCloseTime] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserDocument;
          // Assuming truckId is user.uid for the trucks collection document ID
          const resolvedTruckId = userData.truckId || user.uid; 
          setTruckId(resolvedTruckId);

          const scheduleDocRef = doc(db, "trucks", resolvedTruckId, "settings", "schedule");
          const snap = await getDoc(scheduleDocRef);
          if (snap.exists()) {
            const data = snap.data();
            setRegularHours(data.regularHours || defaultRegularHours);
            setSpecialHours(data.specialHours || []);
            setIsTruckOpenOverride(data.isTruckOpenOverride === undefined ? null : data.isTruckOpenOverride);
          }
        } else {
            toast({title: "Error", description: "User profile not found.", variant: "destructive"});
            router.push('/owner/dashboard');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router, toast]);

  const dateToISO = (d: Date) => d.toISOString().slice(0, 10);

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
      setSpecialOpenTime('09:00');
      setSpecialCloseTime('17:00');
    }
    setDialogOpen(true);
  };

  const handleSaveSpecial = () => {
    if (!calendarDate || !specialStatus) {
      toast({ title: "Missing Info", description: "Please select a status for the special day.", variant: "destructive" }); return;
    }
    const iso = dateToISO(calendarDate);
    if (specialStatus === 'open-custom' && (!specialOpenTime || !specialCloseTime)) {
      toast({ title: "Missing Times", description: "For 'Open (Custom Hours)', please enter both open and close times.", variant: "destructive" }); return;
    }
    
    let updatedSpecialHour: SpecialHour = {
      id: editingSpecial?.id || `${iso}_${Date.now()}`, // Ensure unique ID
      date: iso,
      status: specialStatus,
      openTime: specialStatus === 'open-custom' ? specialOpenTime : undefined,
      closeTime: specialStatus === 'open-custom' ? specialCloseTime : undefined,
    };
    
    const newList = specialHours.filter(sh => sh.date !== iso); // Remove old entry if exists
    newList.push(updatedSpecialHour); // Add new/updated entry
    setSpecialHours(newList);
    setDialogOpen(false);
    toast({ title: "Special Day Saved", description: `Hours for ${iso} have been updated.` });
  };

  const handleDeleteSpecial = () => {
    if (!calendarDate) return;
    const iso = dateToISO(calendarDate);
    setSpecialHours(specialHours.filter(sh => sh.date !== iso));
    setDialogOpen(false);
    toast({ title: "Special Day Removed", description: `Custom hours for ${iso} removed.`, variant: "destructive" });
  };

  const handleSaveAll = async () => {
    if (!truckId) {
      toast({ title: "Error", description: "Truck ID not found. Cannot save schedule.", variant: "destructive" }); return;
    }
    setIsSaving(true);
    try {
      const scheduleDocRef = doc(db, "trucks", truckId, "settings", "schedule");
      await setDoc(scheduleDocRef, {
        regularHours,
        specialHours,
        isTruckOpenOverride,
        updatedAt: new Date().toISOString(),
      });
      
      // Also update the main truck document's isOpen status and operatingHoursSummary based on the new schedule
      // This part needs a helper function to determine current open status and generate summary string
      // For simplicity, let's just save the schedule data itself for now.
      // A more complex `updateTruckStatusFromSchedule` function would be called here.
      
      toast({ title: "Schedule Saved!", description: "Your operating hours have been successfully updated." });
    } catch (e: any) {
      toast({ title: "Save Error", description: e?.message || "Failed to save schedule.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleRegularHoursChange = (day: string, field: keyof RegularHoursEntry, value: string | boolean) => {
    setRegularHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  if (loading) return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
      <p className="text-muted-foreground">Loading your schedule…</p>
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
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">Special Hours Calendar</CardTitle>
          <CardDescription>
            Click a date to set custom hours or mark as closed (e.g., holidays, events). Regular hours apply otherwise.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const iso = dateToISO(date);
                const special = specialHours.find(sh => sh.date === iso);
                if (special) return special.status === 'closed' ? 'bg-red-200 hover:bg-red-300' : 'bg-green-200 hover:bg-green-300';
              }
              return null;
            }}
            onClickDay={openSpecialDialog}
            minDetail="month"
            prev2Label={null}
            next2Label={null}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpecial ? "Edit Special Hours for" : "Set Special Hours for"} {calendarDate ? dateToISO(calendarDate) : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label>Status for this day</Label>
            <Select value={specialStatus} onValueChange={v => setSpecialStatus(v as 'open-custom' | 'closed' | '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open-custom">Open (Custom Hours)</SelectItem>
                <SelectItem value="closed">Closed All Day</SelectItem>
              </SelectContent>
            </Select>
            {specialStatus === 'open-custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="specialOpenTime">Open Time</Label>
                  <Input id="specialOpenTime" type="time" value={specialOpenTime} onChange={e => setSpecialOpenTime(e.target.value)} className="mt-1"/>
                </div>
                <div>
                  <Label htmlFor="specialCloseTime">Close Time</Label>
                  <Input id="specialCloseTime" type="time" value={specialCloseTime} onChange={e => setSpecialCloseTime(e.target.value)} className="mt-1"/>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            {editingSpecial ? (
              <Button variant="destructive" onClick={handleDeleteSpecial} className="mr-auto sm:mr-0">
                <Trash2 className="h-4 w-4 mr-1" /> Delete Entry
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSpecial}>
                 Save Special Day
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Regular Weekly Hours</CardTitle>
            <CardDescription>
              Set your standard opening and closing times for each day of the week.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map(day => (
              <div key={day} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 border rounded-md bg-muted/30">
                <Label className="sm:col-span-1 font-semibold self-center text-sm">{day}</Label>
                <div className="sm:col-span-1">
                  <Label htmlFor={`${day}-open-time`} className="text-xs">Open</Label>
                  <Input
                    id={`${day}-open-time`} type="time" className="mt-1"
                    value={regularHours[day].openTime}
                    onChange={(e) => handleRegularHoursChange(day, 'openTime', e.target.value)}
                    disabled={regularHours[day].isClosed || isSaving}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor={`${day}-close-time`} className="text-xs">Close</Label>
                  <Input
                    id={`${day}-close-time`} type="time" className="mt-1"
                    value={regularHours[day].closeTime}
                    onChange={(e) => handleRegularHoursChange(day, 'closeTime', e.target.value)}
                    disabled={regularHours[day].isClosed || isSaving}
                  />
                </div>
                <div className="sm:col-span-1 flex items-center space-x-2 justify-self-start sm:justify-self-end pt-4 sm:pt-0">
                  <Switch
                    id={`${day}-closed`}
                    checked={regularHours[day].isClosed}
                    onCheckedChange={(checked) => handleRegularHoursChange(day, 'isClosed', checked)}
                    disabled={isSaving}
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
                <Power className="mr-2 h-5 w-5" /> Override Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="override-status-select" className="font-medium">Manual Override</Label>
                 <Select
                    value={isTruckOpenOverride === null ? "auto" : (isTruckOpenOverride ? "open" : "closed")}
                    onValueChange={(value) => {
                        if (value === "auto") setIsTruckOpenOverride(null);
                        else setIsTruckOpenOverride(value === "open");
                    }}
                    disabled={isSaving}
                    >
                    <SelectTrigger id="override-status-select" className="w-[150px]">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="auto">Automatic (Schedule)</SelectItem>
                        <SelectItem value="open">Force Open</SelectItem>
                        <SelectItem value="closed">Force Closed</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Manually set your truck's status, overriding the schedule. Select "Automatic" to use defined hours.</p>
            </CardContent>
          </Card>
          <Button className="w-full py-3 text-base" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4" />}
            Save All Schedule Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
