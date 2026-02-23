'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { IconLoader2, IconLogIn, IconChefHat, IconUser, IconArrowLeft } from '@/components/ui/branded-icons';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome back! 🎉',
          description: 'Login successful. Redirecting...',
        });

        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-8xl opacity-20">🌮</div>
        <div className="absolute top-20 right-20 text-6xl opacity-20">🍔</div>
        <div className="absolute bottom-10 left-1/4 text-7xl opacity-20">🍕</div>
        <div className="absolute bottom-20 right-10 text-5xl opacity-20">🌭</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-2 border-orange-200 bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl">
          <CardHeader className="space-y-2 text-center pb-2">
            <div className="mx-auto mb-2">
              <Image
                src="/logo.png"
                alt="Food Truck Next 2 Me"
                width={80}
                height={60}
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back! 👋</CardTitle>
            <CardDescription className="text-slate-500">
              Sign in to find your favorite food trucks
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-white border-2 border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400 rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-500 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white border-2 border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400 rounded-xl h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 text-lg shadow-lg rounded-xl"
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <IconLogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-orange-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">New to Food Truck Next 2 Me?</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="w-full bg-white border-2 border-orange-200 text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 rounded-xl h-12"
                  >
                    <IconUser className="mr-2 h-4 w-4" />
                    Customer
                  </Button>
                </Link>
                <Link href="/owner/signup">
                  <Button
                    variant="outline"
                    className="w-full bg-white border-2 border-orange-200 text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 rounded-xl h-12"
                  >
                    <IconChefHat className="mr-2 h-4 w-4" />
                    Owner
                  </Button>
                </Link>
              </div>
            </div>

            <Link
              href="/"
              className="mt-6 flex items-center justify-center text-sm text-slate-500 hover:text-orange-600 transition-colors font-medium"
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
