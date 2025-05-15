import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';

const faqItems = [
  {
    value: "item-1",
    question: "How does real-time GPS tracking work?",
    answer: "Food truck owners can update their location through their dashboard, either manually or by enabling live GPS tracking. This location is then displayed on the map for users to see."
  },
  {
    value: "item-2",
    question: "How do I place an order?",
    answer: "Find a food truck on the map or list, view their menu on their profile page, select your items, customize if needed, and add to cart. Then proceed to checkout to complete your order."
  },
  {
    value: "item-3",
    question: "What payment methods are accepted?",
    answer: "Payment methods vary by truck but generally include major credit/debit cards. Some trucks may also support options like Apple Pay or Google Pay. (This is a placeholder, actual payment integration would specify)."
  },
  {
    value: "item-4",
    question: "How do I get notified when a truck is nearby?",
    answer: "In your user dashboard, you can set notification preferences for your favorite trucks, including a radius for proximity alerts."
  },
  {
    value: "item-5",
    question: "What if there's an issue with my order?",
    answer: "Please contact the food truck directly if possible. For platform-related issues or if you cannot reach the truck, you can use our contact form or live chat (if available)."
  }
];

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary flex items-center">
        <LifeBuoy className="mr-3 h-8 w-8" /> Help & FAQ
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="text-left hover:text-primary">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <MessageSquare className="mr-2 h-6 w-6 text-primary" /> Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action="#" method="POST"> {/* Placeholder action */}
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" name="name" type="text" placeholder="John Doe" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" rows={4} placeholder="How can we help you?" required className="mt-1" />
                </div>
                <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90">
                  <Mail className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Live Chat (Coming Soon)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Need immediate assistance? Our live chat support will be available here soon.
              </p>
              <Button disabled className="w-full mt-4">Chat Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
