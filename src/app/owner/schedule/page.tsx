'use client';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar'; // Using react-calendar
import 'react-calendar/dist/Calendar.css'; // Default styling for react-calendar
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  CalendarClock,
  Power,
  PlusCircle,
  Trash2,
  Loader2,
  AlertTriangle,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { UserDocument, FoodTruck } from '@/lib/types'; // Import FoodTruck for main truck doc update

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type RegularHoursEntry = {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};
type RegularHours = { [key: string]: RegularHoursEntry };
type SpecialHour = {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'open-custom' | 'closed';
  openTime?: string; // HH:mm
  closeTime?: string; // HH:mm
};

const defaultRegularHours: RegularHours = daysOfWeek.reduce((acc, day) => {
  acc[day] = {
    openTime: '09:00',
    closeTime: '17:00',
    isClosed: day === 'Sunday' || day === 'Saturday',
  };
  return acc;
}, {} as RegularHours);

export default function OwnerSchedulePage() {
  const { toast } = useToast();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [regularHours, setRegularHours] =
    useState<RegularHours>(defaultRegularHours);
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [isTruckOpenOverride, setIsTruckOpenOverride] = useState<
    boolean | null
  >(null);

  const [calendarDate, setCalendarDate] = useState<Date | null>(null); // For react-calendar, type is Date or Date[]
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<SpecialHour | null>(
    null
  );
  const [specialStatus, setSpecialStatus] = useState<
    'open-custom' | 'closed' | ''
  >('');
  const [specialOpenTime, setSpecialOpenTime] = useState('');
  const [specialCloseTime, setSpecialCloseTime] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserDocument;
          if (userData.role === 'owner') {
            const resolvedTruckId = userData.truckId || user.uid;
            setTruckId(resolvedTruckId);
          } else {
            toast({
              title: 'Access Denied',
              description: 'This page is for owners.',
              variant: 'destructive',
            });
            router.push('/login');
            setIsLoading(false);
            return;
          }
        } else {
          toast({
            title: 'Error',
            description: 'User profile not found.',
            variant: 'destructive',
          });
          router.push('/login');
          setIsLoading(false);
          return;
        }
      } else {
        router.push('/login?redirect=/owner/schedule');
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [router, toast]);

  useEffect(() => {
    if (!truckId || !currentUser) {
      if (!currentUser) setIsLoading(false); // If no user, stop loading
      return;
    }
    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const scheduleDocRef = doc(
          db,
          'trucks',
          truckId,
          'settings',
          'schedule'
        );
        const snap = await getDoc(scheduleDocRef);
        if (snap.exists()) {
          const data = snap.data();
          setRegularHours(data.regularHours || defaultRegularHours);
          setSpecialHours(data.specialHours || []);
          setIsTruckOpenOverride(
            data.isTruckOpenOverride === undefined
              ? null
              : data.isTruckOpenOverride
          );
        } else {
          // No schedule document, use defaults. User can save to create one.
          setRegularHours(defaultRegularHours);
          setSpecialHours([]);
          setIsTruckOpenOverride(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load schedule data.');
        toast({
          title: 'Load Error',
          description: err.message,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    };
    fetchSchedule();
  }, [truckId, currentUser, toast]);

  const dateToISO = (d: Date) => d.toISOString().slice(0, 10);

  const openSpecialDialog = (date: Date) => {
    const iso = dateToISO(date);
    const found = specialHours.find((sh) => sh.date === iso);
    setCalendarDate(date);
    if (found) {
      setEditingSpecial(found);
      setSpecialStatus(found.status);
      setSpecialOpenTime(found.openTime || '09:00');
      setSpecialCloseTime(found.closeTime || '17:00');
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
      toast({
        title: 'Missing Info',
        description: 'Please select a status for the special day.',
        variant: 'destructive',
      });
      return;
    }
    const iso = dateToISO(calendarDate);
    if (
      specialStatus === 'open-custom' &&
      (!specialOpenTime || !specialCloseTime)
    ) {
      toast({
        title: 'Missing Times',
        description:
          "For 'Open (Custom Hours)', please enter both open and close times.",
        variant: 'destructive',
      });
      return;
    }

    const newSpecialHour: SpecialHour = {
      id: editingSpecial?.id || `${iso}_${Date.now()}`,
      date: iso,
      status: specialStatus,
      openTime: specialStatus === 'open-custom' ? specialOpenTime : undefined,
      closeTime: specialStatus === 'open-custom' ? specialCloseTime : undefined,
    };

    const newList = specialHours.filter((sh) => sh.date !== iso);
    newList.push(newSpecialHour);
    setSpecialHours(newList.sort((a, b) => a.date.localeCompare(b.date))); // Keep sorted
    setDialogOpen(false);
    toast({
      title: 'Special Day Saved',
      description: `Hours for ${iso} have been updated.`,
    });
  };

  const handleDeleteSpecial = () => {
    if (!calendarDate) return;
    const iso = dateToISO(calendarDate);
    setSpecialHours(specialHours.filter((sh) => sh.date !== iso));
    setDialogOpen(false);
    toast({
      title: 'Special Day Removed',
      description: `Custom hours for ${iso} removed.`,
      variant: 'destructive',
    });
  };

  // Helper to determine if the truck is currently open based on schedule
  const getTruckOpenStatusAndHoursSummary = (): {
    isOpen: boolean;
    summary: string;
  } => {
    if (isTruckOpenOverride !== null) {
      return {
        isOpen: isTruckOpenOverride,
        summary: isTruckOpenOverride
          ? 'Open (Manual Override)'
          : 'Closed (Manual Override)',
      };
    }

    const now = new Date();
    const todayISO = dateToISO(now);
    const todayDayName = daysOfWeek[now.getDay() === 0 ? 6 : now.getDay() - 1]; // Sunday is 0 -> 6, Monday is 1 -> 0

    const specialDay = specialHours.find((sh) => sh.date === todayISO);

    let currentDayHours;
    let summaryPrefix = '';

    if (specialDay) {
      summaryPrefix = `Today (Special - ${specialDay.date}): `;
      if (specialDay.status === 'closed')
        return { isOpen: false, summary: summaryPrefix + 'Closed' };
      currentDayHours = {
        openTime: specialDay.openTime!,
        closeTime: specialDay.closeTime!,
        isClosed: false,
      };
    } else {
      summaryPrefix = `Today (${todayDayName}): `;
      currentDayHours = regularHours[todayDayName];
      if (currentDayHours.isClosed)
        return { isOpen: false, summary: summaryPrefix + 'Closed' };
    }

    const { openTime, closeTime } = currentDayHours;
    const summary = summaryPrefix + `${openTime} - ${closeTime}`;

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const openDate = new Date(now);
    openDate.setHours(openH, openM, 0, 0);
    const closeDate = new Date(now);
    closeDate.setHours(closeH, closeM, 0, 0);

    // Handle overnight case for close time (e.g. 22:00 - 02:00)
    if (closeDate < openDate) {
      closeDate.setDate(closeDate.getDate() + 1);
      // If current time is past midnight but before new close time, also adjust 'now' for comparison
      if (now < openDate) {
        // e.g. it's 1 AM, open was 10 PM previous day
        const nowAdjusted = new Date(now);
        nowAdjusted.setDate(nowAdjusted.getDate() + 1);
        return {
          isOpen: nowAdjusted >= openDate && nowAdjusted < closeDate,
          summary,
        };
      }
    }

    return { isOpen: now >= openDate && now < closeDate, summary };
  };

  const handleSaveAll = async () => {
    if (!truckId) {
      toast({
        title: 'Error',
        description: 'Truck ID not found.',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    try {
      const scheduleDocRef = doc(db, 'trucks', truckId, 'settings', 'schedule');
      await setDoc(scheduleDocRef, {
        regularHours,
        specialHours,
        isTruckOpenOverride,
        updatedAt: serverTimestamp(),
      });

      // Update main truck document with current isOpen status and operatingHoursSummary
      const { isOpen, summary } = getTruckOpenStatusAndHoursSummary();
      const truckDocRef = doc(db, 'trucks', truckId);
      await updateDoc(truckDocRef, {
        isOpen: isOpen,
        operatingHoursSummary: summary, // This summary is for "today", might need a more general one.
        // For now, we'll use this dynamic daily summary.
        // A better general summary could be "Mon-Fri: 9-5, Sat: 10-2"
      });

      toast({
        title: 'Schedule Saved!',
        description: 'Operating hours updated successfully.',
      });
    } catch (e: any) {
      toast({
        title: 'Save Error',
        description: e?.message || 'Failed to save schedule.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const handleRegularHoursChange = (
    day: string,
    field: keyof RegularHoursEntry,
    value: string | boolean
  ) => {
    setRegularHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  if (isLoading)
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Loading schedule…</p>
      </div>
    );

  if (!currentUser) {
    // Fallback if auth state changes unexpectedly
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          {' '}
          <LogIn className="h-4 w-4" /> <AlertTitle>Access Denied</AlertTitle>{' '}
          <AlertDescription>Please log in as an owner.</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/login?redirect=/owner/schedule">Login</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
          <CalendarClock className="mr-3 h-8 w-8" /> Schedule & Operating Hours
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            Special Hours Calendar
          </CardTitle>
          <CardDescription>
            Click a date to set custom hours or mark as closed (e.g., holidays,
            events). Regular hours apply otherwise.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          {' '}
          {/* Centering Calendar */}
          <Calendar
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const iso = dateToISO(date);
                const special = specialHours.find((sh) => sh.date === iso);
                if (special)
                  return special.status === 'closed'
                    ? 'bg-red-300 !text-white hover:bg-red-400'
                    : 'bg-green-300 !text-white hover:bg-green-400';
              }
              return '';
            }}
            onClickDay={(value) => openSpecialDialog(value as Date)} // Cast value to Date
            minDetail="month"
            prev2Label={null}
            next2Label={null}
            className="react-calendar-override rounded-md border shadow" // Custom class for more specific overrides
          />
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpecial
                ? 'Edit Special Hours for'
                : 'Set Special Hours for'}{' '}
              {calendarDate ? dateToISO(calendarDate) : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label>Status for this day</Label>
            <Select
              value={specialStatus}
              onValueChange={(v) =>
                setSpecialStatus(v as 'open-custom' | 'closed' | '')
              }
            >
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
                  <Input
                    id="specialOpenTime"
                    type="time"
                    value={specialOpenTime}
                    onChange={(e) => setSpecialOpenTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="specialCloseTime">Close Time</Label>
                  <Input
                    id="specialCloseTime"
                    type="time"
                    value={specialCloseTime}
                    onChange={(e) => setSpecialCloseTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-between mt-4">
            {editingSpecial ? (
              <Button
                variant="destructive"
                onClick={handleDeleteSpecial}
                className="mr-auto sm:mr-0"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete Entry
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveSpecial}>Save Special Day</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Regular Weekly Hours</CardTitle>
            <CardDescription>
              Set standard opening/closing times.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 border rounded-md bg-muted/30"
              >
                <Label className="sm:col-span-1 font-semibold self-center text-sm">
                  {day}
                </Label>
                <div className="sm:col-span-1">
                  <Label htmlFor={`${day}-open-time`} className="text-xs">
                    Open
                  </Label>
                  <Input
                    id={`${day}-open-time`}
                    type="time"
                    className="mt-1"
                    value={regularHours[day].openTime}
                    onChange={(e) =>
                      handleRegularHoursChange(day, 'openTime', e.target.value)
                    }
                    disabled={regularHours[day].isClosed || isSaving}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor={`${day}-close-time`} className="text-xs">
                    Close
                  </Label>
                  <Input
                    id={`${day}-close-time`}
                    type="time"
                    className="mt-1"
                    value={regularHours[day].closeTime}
                    onChange={(e) =>
                      handleRegularHoursChange(day, 'closeTime', e.target.value)
                    }
                    disabled={regularHours[day].isClosed || isSaving}
                  />
                </div>
                <div className="sm:col-span-1 flex items-center space-x-2 justify-self-start sm:justify-self-end pt-4 sm:pt-0">
                  <Switch
                    id={`${day}-closed`}
                    checked={regularHours[day].isClosed}
                    onCheckedChange={(checked) =>
                      handleRegularHoursChange(day, 'isClosed', checked)
                    }
                    disabled={isSaving}
                  />
                  <Label htmlFor={`${day}-closed`} className="text-xs">
                    Closed
                  </Label>
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
                <Label htmlFor="override-status-select" className="font-medium">
                  Manual Override
                </Label>
                <Select
                  value={
                    isTruckOpenOverride === null
                      ? 'auto'
                      : isTruckOpenOverride
                        ? 'open'
                        : 'closed'
                  }
                  onValueChange={(value) => {
                    setIsTruckOpenOverride(
                      value === 'auto' ? null : value === 'open'
                    );
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger
                    id="override-status-select"
                    className="w-[150px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic (Schedule)</SelectItem>
                    <SelectItem value="open">Force Open</SelectItem>
                    <SelectItem value="closed">Force Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Manually set truck status, overriding schedule. "Automatic" uses
                defined hours.
              </p>
            </CardContent>
          </Card>
          <Button
            className="w-full py-3 text-base"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Save All Schedule Changes
          </Button>
        </div>
      </div>
      <style jsx global>{`
        .react-calendar-override {
          background: hsl(var(--card));
          border-color: hsl(var(--border));
        }
        .react-calendar-override .react-calendar__navigation button {
          color: hsl(var(--primary));
        }
        .react-calendar-override .react-calendar__navigation button:hover {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }
        .react-calendar-override
          .react-calendar__month-view__weekdays__weekday {
          color: hsl(var(--muted-foreground));
        }
        .react-calendar-override .react-calendar__tile {
          color: hsl(var(--foreground));
        }
        .react-calendar-override .react-calendar__tile:hover {
          background-color: hsl(var(--muted));
        }
        .react-calendar-override .react-calendar__tile--active {
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }
        .react-calendar-override .react-calendar__tile--now {
          background-color: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
        }
      `}</style>
    </div>
  );
}
