'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconLifeBuoy, IconMail, IconMessageSquare, IconCheck, IconLoader2 } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

const faqItems = [
  {
    value: "item-1",
    question: "How do I find food trucks near me in Adelaide?",
    answer: "Start with the live map or browse the Adelaide food truck directory by location and cuisine. The platform is built to help you move from broad searching to a better truck choice quickly."
  },
  {
    value: "item-2",
    question: "How do event enquiries work?",
    answer: "If you are planning a wedding, corporate function, festival, or private event, use the hire flow to send a free enquiry with your date, location, guest count, and event details."
  },
  {
    value: "item-3",
    question: "How do I list my food truck on Food Truck Next 2 Me?",
    answer: "Food truck owners can create a free owner account, add their truck details, and start building a profile that helps them get discovered across Adelaide and South Australia."
  },
  {
    value: "item-4",
    question: "What areas does the platform cover?",
    answer: "Food Truck Next 2 Me focuses on Adelaide and the wider South Australia region, including city, coastal, hills, event, and wine-region discovery."
  },
  {
    value: "item-5",
    question: "Can I use the site without an account?",
    answer: "Yes. Public visitors can browse the map, discover trucks, explore event pages, and use the hire flow without creating an account."
  },
  {
    value: "item-6",
    question: "How do I contact Food Truck Next 2 Me?",
    answer: "If you need platform support, owner listing help, or general guidance, email info@foodtrucknext2me.com or use the contact options on this page."
  }
];

const quickLinks = [
  { href: '/map', label: 'Open live map' },
  { href: '/food-trucks', label: 'Browse trucks' },
  { href: '/hire-food-truck', label: 'Hire a food truck' },
  { href: '/contact', label: 'Contact page' },
];

export default function HelpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="ambient-shell min-h-screen px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqItems.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                  },
                })),
              },
              {
                '@context': 'https://schema.org',
                '@type': 'ContactPage',
                name: 'Help and FAQ',
                url: 'https://foodtrucknext2me.com/help',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://foodtrucknext2me.com',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Help & FAQ',
                    item: 'https://foodtrucknext2me.com/help',
                  },
                ],
              },
            ]),
          }}
        />

        <section className="surface-panel overflow-hidden p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconLifeBuoy className="h-4 w-4 text-orange-500" />
                Help, support, and FAQ
              </div>
              <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                Get answers quickly and keep moving through the platform with confidence.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                This page is here to answer the common questions customers, event planners, and owners ask when
                they first land on Food Truck Next 2 Me.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Fast path</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Answers</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Common Adelaide discovery, owner, and event questions all in one place.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Direct support</p>
                <a href="mailto:info@foodtrucknext2me.com" className="mt-3 block font-display text-2xl font-bold text-slate-950 hover:text-orange-600">
                  info@foodtrucknext2me.com
                </a>
                <p className="mt-2 text-sm leading-6 text-slate-600">Best for platform questions and owner listing help.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex whitespace-nowrap rounded-full border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="border border-orange-100 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-3xl text-slate-950">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map(item => (
                    <AccordionItem key={item.value} value={item.value}>
                      <AccordionTrigger className="text-left text-base font-semibold text-slate-800 hover:text-orange-600">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-7 text-slate-600">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border border-orange-100 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center font-display text-2xl text-slate-950">
                  <IconMail className="mr-2 h-6 w-6 text-orange-500" /> Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSuccess ? (
                  <div className="text-center py-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <IconCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-green-700">Message Sent!</h3>
                    <p className="mb-4 text-sm text-slate-600">
                      Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsSuccess(false)}
                      className="text-sm"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name-contact">Your Name</Label>
                        <Input
                          id="name-contact"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          required
                          className="mt-1"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-contact">Your Email</Label>
                        <Input
                          id="email-contact"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          className="mt-1"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject-contact">Subject</Label>
                        <Input
                          id="subject-contact"
                          name="subject"
                          type="text"
                          placeholder="How can we help?"
                          required
                          className="mt-1"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="message-contact">Message</Label>
                        <Textarea
                          id="message-contact"
                          name="message"
                          rows={4}
                          placeholder="Tell us what you need help with."
                          required
                          className="mt-1"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 w-full bg-primary hover:bg-primary/90"
                      >
                        {isSubmitting ? (
                          <>
                            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="border border-orange-100 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center font-display text-xl text-slate-950">
                  <IconMessageSquare className="mr-2 h-5 w-5 text-orange-500" /> Need a better route?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm leading-7 text-slate-600">
                  If your question is really about discovery, event bookings, or listing a truck, these pages are usually the fastest next step.
                </p>
                <div className="space-y-3">
                  <Link href="/map" className="block rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-100">
                    Open the live map
                  </Link>
                  <Link href="/hire-food-truck" className="block rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                    Start an event enquiry
                  </Link>
                  <Link href="/owner/signup" className="block rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                    List your truck
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
