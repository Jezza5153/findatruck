
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarClock, Power, PlusCircle, Trash2 } from "lucide-react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

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

export default function OwnerSchedulePage() {
  const { toast } = useToast();
  const [regularHours, setRegularHours] = useState<RegularHours>(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { openTime: '09:00', closeTime: '17:00', isClosed: false };
      return acc;
    }, {} as RegularHours)
  );
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [newSpecialDate, setNewSpecialDate] = useState('');
  const [newSpecialStatus, setNewSpecialStatus] = useState<'open-custom' | 'closed' | ''>('');
  const [newSpecialOpenTime, setNewSpecialOpenTime] = useState('');
  const [newSpecialCloseTime, setNewSpecialCloseTime] = useState('');
  const [isTruckOpen, setIsTruckOpen] = useState(true); // Simulated truck status

  const handleRegularHoursChange = (day: string, field: keyof RegularHours[string], value: string | boolean) => {
    setRegularHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleAddSpecialHour = () => {
    if (!newSpecialDate || !newSpecialStatus) {
      toast({ title: "Missing Information", description: "Please select a date and status for special hours.", variant: "destructive"});
      return;
    }
    if (newSpecialStatus === 'open-custom' && (!newSpecialOpenTime || !newSpecialCloseTime)) {
      toast({ title: "Missing Times", description: "Please provide open and close times for custom hours.", variant: "destructive"});
      return;
    }
    setSpecialHours(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        date: newSpecialDate,
        status: newSpecialStatus as 'open-custom' | 'closed', // Assert type after validation
        openTime: newSpecialStatus === 'open-custom' ? newSpecialOpenTime : undefined,
        closeTime: newSpecialStatus === 'open-custom' ? newSpecialCloseTime : undefined,
      }
    ]);
    // Reset form
    setNewSpecialDate('');
    setNewSpecialStatus('');
    setNewSpecialOpenTime('');
    setNewSpecialCloseTime('');
    toast({ title: "Special Hours Added", description: `Entry for ${newSpecialDate} created.`});
  };

  const handleRemoveSpecialHour = (id: string) => {
    setSpecialHours(prev => prev.filter(sh => sh.id !== id));
    toast({ title: "Special Hours Removed", description: `Entry removed.`, variant: "destructive"});
  };
  
  const handleSaveRegularHours = () => {
    // In a real app, this would send data to the backend
    console.log("Regular hours saved:", regularHours);
    toast({ title: "Regular Hours Saved", description: "Your standard operating hours have been updated."});
  };

  const handleUpdateStatus = () => {
     // In a real app, this would send data to the backend
    console.log("Truck status updated:", isTruckOpen);
    toast({ title: "Truck Status Updated", description: `Your truck is now marked as ${isTruckOpen ? 'Open' : 'Closed'}.`});
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
            <Button className="mt-4" onClick={handleSaveRegularHours}>Save Regular Hours</Button>
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
                <Button className="w-full" onClick={handleUpdateStatus}>Update Status</Button>
            </CardContent>
            </Card>

            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl">Special Hours / Closures</CardTitle>
                <CardDescription>Add one-time changes or closures (e.g., holidays, events).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="special-date">Date</Label>
                    <Input id="special-date" type="date" className="mt-1" value={newSpecialDate} onChange={e => setNewSpecialDate(e.target.value)}/>
                </div>
                <div>
                    <Label htmlFor="special-status">Status</Label>
                    <Select value={newSpecialStatus} onValueChange={(value) => setNewSpecialStatus(value as 'open-custom' | 'closed' | '')}>
                        <SelectTrigger id="special-status" className="mt-1">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open-custom">Open (Custom Hours)</SelectItem>
                            <SelectItem value="closed">Closed All Day</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {newSpecialStatus === 'open-custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="special-open-time" className="text-xs">Open Time</Label>
                      <Input id="special-open-time" type="time" className="mt-1" value={newSpecialOpenTime} onChange={e => setNewSpecialOpenTime(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="special-close-time" className="text-xs">Close Time</Label>
                      <Input id="special-close-time" type="time" className="mt-1" value={newSpecialCloseTime} onChange={e => setNewSpecialCloseTime(e.target.value)} />
                    </div>
                  </div>
                )}
                <Button variant="secondary" className="w-full" onClick={handleAddSpecialHour}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Special Hours
                </Button>
                
                {specialHours.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Upcoming Special Hours:</h4>
                    {specialHours.map(sh => (
                      <div key={sh.id} className="text-xs p-2 border rounded-md bg-muted/50 flex justify-between items-center">
                        <div>
                          <p><strong>{sh.date}:</strong> {sh.status === 'closed' ? 'Closed' : `Open ${sh.openTime} - ${sh.closeTime}`}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveSpecialHour(sh.id)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
