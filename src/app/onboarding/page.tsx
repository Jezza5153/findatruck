'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconChefHat, IconMapPin, IconArrowRight, IconArrowLeft, IconCheck, IconLoader2,
    IconUtensils, IconLeaf, IconPizza, IconCoffee, IconSoup, IconFish, IconBeef, IconIceCream,
    IconBell, IconNavigation, IconCamera, IconCalendar
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Cuisine options for customer preferences
const cuisineOptions = [
    { id: 'mexican', label: 'Mexican', icon: '🌮' },
    { id: 'asian', label: 'Asian', icon: '🍜' },
    { id: 'american', label: 'American', icon: '🍔' },
    { id: 'italian', label: 'Italian', icon: '🍕' },
    { id: 'bbq', label: 'BBQ', icon: '🍖' },
    { id: 'seafood', label: 'Seafood', icon: '🦐' },
    { id: 'mediterranean', label: 'Mediterranean', icon: '🥙' },
    { id: 'indian', label: 'Indian', icon: '🍛' },
    { id: 'desserts', label: 'Desserts', icon: '🍦' },
    { id: 'coffee', label: 'Coffee & Tea', icon: '☕' },
    { id: 'vegan', label: 'Vegan', icon: '🥗' },
    { id: 'fusion', label: 'Fusion', icon: '🍱' },
];

const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'dairy-free', label: 'Dairy-Free' },
    { id: 'nut-free', label: 'Nut-Free' },
];

// Customer Onboarding Component
function CustomerOnboarding({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [dietary, setDietary] = useState<string[]>([]);
    const [radius, setRadius] = useState(5);
    const [isLoading, setIsLoading] = useState(false);

    const toggleCuisine = (id: string) => {
        setCuisines(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleDietary = (id: string) => {
        setDietary(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cuisinePreferences: cuisines, dietaryTags: dietary, notificationRadius: radius }),
            });
        } catch {
            // Continue anyway - preferences can be set later
        }
        setIsLoading(false);
        onComplete();
    };

    const steps = [
        // Step 1: Cuisine preferences
        <div key="cuisines" className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <IconUtensils className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What do you crave?</h2>
                <p className="text-slate-400">Select your favorite cuisines - we'll help you find them</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {cuisineOptions.map(cuisine => (
                    <button
                        key={cuisine.id}
                        onClick={() => toggleCuisine(cuisine.id)}
                        className={cn(
                            "p-3 rounded-xl border-2 transition-all text-center",
                            cuisines.includes(cuisine.id)
                                ? "border-primary bg-primary/20 text-white"
                                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                        )}
                    >
                        <span className="text-2xl block mb-1">{cuisine.icon}</span>
                        <span className="text-xs">{cuisine.label}</span>
                    </button>
                ))}
            </div>
        </div>,

        // Step 2: Dietary preferences
        <div key="dietary" className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <IconLeaf className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Any dietary needs?</h2>
                <p className="text-slate-400">We'll highlight trucks that match your requirements</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                {dietaryOptions.map(option => (
                    <button
                        key={option.id}
                        onClick={() => toggleDietary(option.id)}
                        className={cn(
                            "px-4 py-2 rounded-full border-2 transition-all text-sm font-medium",
                            dietary.includes(option.id)
                                ? "border-green-500 bg-green-500/20 text-green-400"
                                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
                Skip this if you don't have specific dietary needs
            </p>
        </div>,

        // Step 3: Notification radius
        <div key="radius" className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <IconBell className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Alert radius</h2>
                <p className="text-slate-400">How far should we look for nearby trucks?</p>
            </div>
            <div className="max-w-sm mx-auto space-y-8 pt-4">
                <div className="text-center">
                    <span className="text-5xl font-bold text-white">{radius}</span>
                    <span className="text-xl text-slate-400 ml-2">km</span>
                </div>
                <Slider
                    value={[radius]}
                    onValueChange={([val]) => setRadius(val)}
                    min={1}
                    max={25}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-500">
                    <span>1 km</span>
                    <span>25 km</span>
                </div>
            </div>
        </div>,
    ];

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {steps[step]}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
                <Button
                    variant="ghost"
                    onClick={() => step > 0 ? setStep(step - 1) : onComplete()}
                    className="text-slate-400 hover:text-white"
                >
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    {step === 0 ? 'Skip' : 'Back'}
                </Button>

                <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-slate-600"
                            )}
                        />
                    ))}
                </div>

                {step < steps.length - 1 ? (
                    <Button
                        onClick={() => setStep(step + 1)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
                    >
                        Next
                        <IconArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
                    >
                        {isLoading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : (
                            <>
                                Get Started
                                <IconCheck className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </>
    );
}

// Owner Onboarding Component
function OwnerOnboarding({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        truckName: '',
        cuisine: '',
        city: '',
        description: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/trucks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
        } catch {
            // Continue anyway
        }
        setIsLoading(false);
        onComplete();
    };

    const steps = [
        // Step 1: Basic info
        <div key="basics" className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <IconChefHat className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Tell us about your truck</h2>
                <p className="text-slate-400">Basic information to get you started</p>
            </div>
            <div className="space-y-4 max-w-sm mx-auto">
                <div className="space-y-2">
                    <Label className="text-slate-300">Truck Name *</Label>
                    <Input
                        placeholder="e.g., Taco King"
                        value={formData.truckName}
                        onChange={(e) => updateField('truckName', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-300">Primary Cuisine *</Label>
                    <Input
                        placeholder="e.g., Mexican, Asian Fusion"
                        value={formData.cuisine}
                        onChange={(e) => updateField('cuisine', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-300">Base City *</Label>
                    <Input
                        placeholder="e.g., Los Angeles, CA"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                    />
                </div>
            </div>
        </div>,

        // Step 2: Description
        <div key="description" className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                    <IconCamera className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Describe your truck</h2>
                <p className="text-slate-400">What makes your food special?</p>
            </div>
            <div className="max-w-sm mx-auto">
                <textarea
                    placeholder="Tell customers what you're all about... (You can add photos later)"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-primary"
                />
            </div>
        </div>,

        // Step 3: What's next
        <div key="next" className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <IconCheck className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You're almost ready!</h2>
                <p className="text-slate-400">Here's what you can do next</p>
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
                {[
                    { icon: IconCamera, text: 'Add photos of your truck and food' },
                    { icon: IconUtensils, text: 'Build your menu with prices' },
                    { icon: IconCalendar, text: 'Set your schedule and locations' },
                    { icon: IconNavigation, text: 'Go live and start serving!' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-slate-300 text-sm">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>,
    ];

    const isStep1Valid = formData.truckName && formData.cuisine && formData.city;

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {steps[step]}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
                <Button
                    variant="ghost"
                    onClick={() => step > 0 && setStep(step - 1)}
                    disabled={step === 0}
                    className="text-slate-400 hover:text-white disabled:opacity-50"
                >
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-slate-600"
                            )}
                        />
                    ))}
                </div>

                {step < steps.length - 1 ? (
                    <Button
                        onClick={() => setStep(step + 1)}
                        disabled={step === 0 && !isStep1Valid}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50"
                    >
                        Next
                        <IconArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
                    >
                        {isLoading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : (
                            <>
                                Go to Dashboard
                                <IconArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </>
    );
}

// Inner content that uses useSearchParams (must be wrapped in Suspense)
function OnboardingContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');

    // Determine role from session or URL param
    const role = session?.user?.role || roleParam || 'customer';

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login?redirect=/onboarding');
        }
    }, [status, router]);

    const handleComplete = () => {
        if (role === 'owner') {
            router.push('/owner/dashboard');
        } else {
            router.push('/map');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center py-12">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[80px] animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-lg mx-auto px-4">
                <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm">
                    {role === 'owner' ? (
                        <OwnerOnboarding onComplete={handleComplete} />
                    ) : (
                        <CustomerOnboarding onComplete={handleComplete} />
                    )}
                </div>
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function OnboardingLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

// Default export with Suspense boundary (required for useSearchParams)
export default function OnboardingPage() {
    return (
        <Suspense fallback={<OnboardingLoading />}>
            <OnboardingContent />
        </Suspense>
    );
}

