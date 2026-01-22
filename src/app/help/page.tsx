
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconLifeBuoy, IconMail, IconMessageSquare } from '@/components/ui/branded-icons';

const faqItems = [
  {
    value: "item-1",
    question: "How does real-time GPS tracking work for food trucks?",
    answer: "Food truck owners can update their location through their owner dashboard, either by manually inputting an address or (in future updates) by enabling live GPS tracking. This location is then displayed on the map for users to see in real-time."
  },
  {
    value: "item-2",
    question: "How do I place an order with a food truck?",
    answer: "Once you find a food truck on the map or through search, you can visit their profile page to view their menu. Select your desired items, customize them if options are available, and add them to your cart. Proceed to checkout to complete your order. (Ordering feature coming soon!)"
  },
  {
    value: "item-3",
    question: "What payment methods are accepted?",
    answer: "Payment methods will vary by individual food truck but are expected to include major credit/debit cards. Some trucks may also support digital payment options. (Specific payment integrations are planned for future updates)."
  },
  {
    value: "item-4",
    question: "How can I get notified when my favorite food truck is nearby?",
    answer: "After creating a customer account and logging in, you can go to your dashboard to set notification preferences. You can favorite trucks and set a radius to receive alerts when they are operating near you."
  },
  {
    value: "item-5",
    question: "What if there's an issue with my order or the platform?",
    answer: "For order-specific issues, it's best to contact the food truck directly if possible. For platform-related issues, feedback, or if you cannot reach the truck, please use our contact form on this page. Live chat support is also planned."
  },
  {
    value: "item-6",
    question: "How do I register my food truck on FindATruck?",
    answer: "Food truck owners can register by navigating to the 'Owner Portal' (link in the site header or footer) and selecting 'Register Your Truck'. You'll need to provide details about your truck, cuisine, and create an owner account."
  }
];

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <IconLifeBuoy className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Help & FAQ</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Find answers to common questions and learn how to contact us.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="text-left hover:text-primary text-base">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <IconMail className="mr-2 h-6 w-6 text-primary" /> Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action="#" method="POST"> {/* Placeholder action */}
                <div>
                  <Label htmlFor="name-contact">Your Name</Label>
                  <Input id="name-contact" name="name" type="text" placeholder="John Doe" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email-contact">Your Email</Label>
                  <Input id="email-contact" name="email" type="email" placeholder="you@example.com" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="subject-contact">Subject</Label>
                  <Input id="subject-contact" name="subject" type="text" placeholder="e.g., Issue with an order" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message-contact">Message</Label>
                  <Textarea id="message-contact" name="message" rows={4} placeholder="How can we help you?" required className="mt-1" />
                </div>
                <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <IconMessageSquare className="mr-2 h-5 w-5 text-primary" /> Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Need immediate assistance? Our live chat support will be available here soon.
              </p>
              <Button disabled className="w-full">Chat Now (Coming Soon)</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
