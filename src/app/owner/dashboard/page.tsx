import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Edit, Eye, MapPinIcon, MenuSquare, DollarSign, Settings, Power } from "lucide-react";

export default function OwnerDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your food truck's presence and operations.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span className="text-sm font-medium text-green-600">Status: Open</span>
            <Button variant="outline" size="sm">
                <Power className="mr-2 h-4 w-4"/> Toggle Open/Closed
            </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MapPinIcon className="mr-2 h-5 w-5 text-primary" /> Update Location
            </CardTitle>
            <CardDescription>Manually set or enable live GPS tracking.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-primary hover:bg-primary/90">Set Location</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MenuSquare className="mr-2 h-5 w-5 text-primary" /> Manage Menu
            </CardTitle>
            <CardDescription>Update items, prices, and availability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Edit Menu</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Eye className="mr-2 h-5 w-5 text-primary" /> View Live Orders
            </CardTitle>
            <CardDescription>Track incoming orders and update statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">See Orders (3 New)</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Edit className="mr-2 h-5 w-5 text-primary" /> Schedule Hours
            </CardTitle>
            <CardDescription>Set your regular and special operating hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Set Hours</Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BarChart className="mr-2 h-5 w-5 text-primary" /> View Analytics
            </CardTitle>
            <CardDescription>Track popular items, revenue, and ratings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">View Analytics</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Settings className="mr-2 h-5 w-5 text-primary" /> Truck Settings
            </CardTitle>
            <CardDescription>Manage truck profile, photos, and description.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
