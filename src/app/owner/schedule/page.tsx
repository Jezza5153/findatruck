
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarClock, Power } from "lucide-react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function OwnerSchedulePage() {
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
          <CardContent className="space-y-6">
            {daysOfWeek.map(day => (
              <div key={day} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 border rounded-md bg-muted/30">
                <Label htmlFor={`${day}-open`} className="sm:col-span-1 font-semibold">{day}</Label>
                <div className="sm:col-span-1">
                  <Label htmlFor={`${day}-open-time`} className="text-xs">Open Time</Label>
                  <Input id={`${day}-open-time`} type="time" className="mt-1" />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor={`${day}-close-time`} className="text-xs">Close Time</Label>
                  <Input id={`${day}-close-time`} type="time" className="mt-1" />
                </div>
                <div className="sm:col-span-1 flex items-center space-x-2 justify-self-start sm:justify-self-end pt-4">
                  <Switch id={`${day}-closed`} />
                  <Label htmlFor={`${day}-closed`} className="text-xs">Closed</Label>
                </div>
              </div>
            ))}
            <Button className="mt-4">Save Regular Hours</Button>
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
                    <Switch id="open-status" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">Toggle this to immediately mark your truck as open or closed on the map.</p>
                <Button className="w-full">Update Status</Button>
            </CardContent>
            </Card>

            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl">Special Hours / Closures</CardTitle>
                <CardDescription>Add one-time changes or closures.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label htmlFor="special-date">Date</Label>
                    <Input id="special-date" type="date" className="mt-1"/>
                </div>
                <div>
                    <Label htmlFor="special-status">Status</Label>
                    <Select>
                        <SelectTrigger id="special-status" className="mt-1">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open-custom">Open (Custom Hours)</SelectItem>
                            <SelectItem value="closed">Closed All Day</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Add conditional time inputs here if "Open (Custom Hours)" is selected */}
                <Button variant="secondary" className="w-full">Add Special Hours</Button>
                <p className="text-xs text-muted-foreground mt-2">List of special hours/closures will appear here.</p>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
