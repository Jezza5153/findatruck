
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OwnerMenuPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
          <Utensils className="mr-3 h-8 w-8" /> Manage Your Menu
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Menu Management</CardTitle>
          <CardDescription>
            Add, edit, or remove menu items, set prices, manage categories, and mark items as available/unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This section is where you'll control everything about your food truck's menu.
            Full functionality is under construction.
          </p>
          <div className="space-y-4">
            <Button>Add New Menu Item</Button>
            <Button variant="secondary">Add New Category</Button>
          </div>
          {/* Placeholder for menu item list, category management, and add/edit forms */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-2">Example Menu Item (Placeholder)</h3>
            <div className="p-4 border rounded-md bg-muted/50">
                <p className="font-medium">Spicy Chicken Tacos (Set of 3)</p>
                <p className="text-sm text-muted-foreground">Category: Main Courses | Price: $12.00</p>
                <p className="text-sm">Our signature tacos with a fiery kick!</p>
                <div className="mt-2 space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
