'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { IconLoader2, IconChefHat, IconArrowLeft, IconTruck } from '@/components/ui/branded-icons';
import { motion } from 'framer-motion';

const CUISINE_TYPES = [
  'American', 'Mexican', 'BBQ', 'Asian', 'Italian', 'Burgers',
  'Vegan', 'Desserts', 'Seafood', 'Mediterranean', 'Indian', 'Other'
];

export default function OwnerSignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    truckName: '',
    cuisineType: '',
    description: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCuisineChange = (value: string) => {
    setFormData(prev => ({ ...prev, cuisineType: value }));
  };

  const validateStep1 = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.truckName || !formData.cuisineType) {
      toast({
        title: 'Missing fields',
        description: 'Please enter your truck name and cuisine type.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      // Register the user and truck
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.toLowerCase(),
          password: formData.password,
          role: 'owner',
          truckName: formData.truckName,
          cuisineType: formData.cuisineType,
          description: formData.description,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Failed to sign in after registration');
      }

      toast({
        title: 'Welcome to Findatruck!',
        description: 'Your account and truck have been created.',
      });

      router.push('/owner/dashboard');
      router.refresh();
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-slate-700/50 bg-slate-800/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
              {step === 1 ? (
                <IconChefHat className="w-8 h-8 text-white" />
              ) : (
                <IconTruck className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {step === 1 ? 'Create Owner Account' : 'Setup Your Truck'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {step === 1
                ? 'Step 1 of 2: Your personal details'
                : 'Step 2 of 2: Your food truck details'
              }
            </CardDescription>

            {/* Progress indicator */}
            <div className="flex gap-2 justify-center pt-2">
              <div className={`h-1.5 w-16 rounded-full ${step >= 1 ? 'bg-yellow-500' : 'bg-slate-600'}`} />
              <div className={`h-1.5 w-16 rounded-full ${step >= 2 ? 'bg-yellow-500' : 'bg-slate-600'}`} />
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-yellow-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-yellow-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-yellow-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-yellow-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-6 text-lg shadow-lg"
                  >
                    Continue to Truck Setup
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="truckName" className="text-slate-300">Truck Name *</Label>
                    <Input
                      id="truckName"
                      name="truckName"
                      type="text"
                      placeholder="Tasty Bites"
                      value={formData.truckName}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-yellow-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Cuisine Type *</Label>
                    <Select value={formData.cuisineType} onValueChange={handleCuisineChange}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select cuisine type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {CUISINE_TYPES.map((cuisine) => (
                          <SelectItem key={cuisine} value={cuisine} className="text-white hover:bg-slate-700">
                            {cuisine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-300">Description (optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Tell customers about your food truck..."
                      value={formData.description}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-yellow-500 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">Phone (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link href="/owner/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            <Link
              href="/"
              className="mt-6 flex items-center justify-center text-sm text-slate-400 hover:text-white transition-colors"
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
