'use client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Edit, Eye, MapPinIcon, MenuSquare, Power, CalendarClock, CreditCard } from "lucide-react";

export default function OwnerDashboardPage() {
  // This status and location can be enhanced with Firestore in the future.
  // For now, simulate "Open" and link to edit profile for location management.

  return (
    <div className="container mx-auto px-4 py-8">
      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your food truck's presence and operations.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span className="text-sm font-medium text-green-600">Status: Open (Simulated)</span>
            <Button variant="outline" size="sm" disabled>
                <Power className="mr-2 h-4 w-4"/> Toggle Open/Closed
            </Button>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Location Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MapPinIcon className="mr-2 h-5 w-5 text-primary" /> Location Management
            </CardTitle>
            <CardDescription>
              Set your address or share your live location with customers.<br/>
              (Set in <b>Profile</b>)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link href="/owner/profile">
                Manage Truck Location
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Menu Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MenuSquare className="mr-2 h-5 w-5 text-primary" /> Manage Menu
            </CardTitle>
            <CardDescription>Update items, prices, and availability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/menu">Edit Menu</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Eye className="mr-2 h-5 w-5 text-primary" /> View Live Orders
            </CardTitle>
            <CardDescription>Track incoming orders and update statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/orders">See Orders</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Schedule/Hours */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CalendarClock className="mr-2 h-5 w-5 text-primary" /> Schedule Hours
            </CardTitle>
            <CardDescription>Set your regular and special operating hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/schedule">Set Hours</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <LineChart className="mr-2 h-5 w-5 text-primary" /> View Analytics
            </CardTitle>
            <CardDescription>Track popular items, revenue, and ratings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
             <Edit className="mr-2 h-5 w-5 text-primary" /> Truck Profile
            </CardTitle>
            <CardDescription>Manage truck profile, photos, and description.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Billing */}
         <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
             <CreditCard className="mr-2 h-5 w-5 text-primary" /> Billing & Subscription
            </CardTitle>
            <CardDescription>Manage your premium features and payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/billing">Manage Billing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
