'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // TODO: Implement actual password reset API
            // For now, simulate the request
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real implementation, you would call:
            // await fetch('/api/auth/forgot-password', {
            //   method: 'POST',
            //   body: JSON.stringify({ email }),
            // });

            setIsSuccess(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                className="relative z-10 w-full max-w-md mx-auto px-4"
                initial="initial"
                animate="animate"
            >
                {/* Back link */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <Link href="/login" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to sign in
                    </Link>
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm"
                >
                    {isSuccess ? (
                        // Success State
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                            <p className="text-slate-400 mb-6">
                                If an account exists for <strong className="text-white">{email}</strong>, we've sent password reset instructions.
                            </p>
                            <p className="text-sm text-slate-500 mb-6">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => setIsSuccess(false)}
                                    variant="outline"
                                    className="w-full border-slate-600 hover:bg-white/10"
                                >
                                    Try Again
                                </Button>
                                <Link href="/login">
                                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        // Form State
                        <>
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                                    <Mail className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
                                <p className="text-slate-400">
                                    Enter your email and we'll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-slate-700/50 border-slate-600 focus:border-primary text-white placeholder:text-slate-500"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-400">{error}</p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>
                            </form>

                            <p className="text-center text-sm text-slate-400 mt-6">
                                Remember your password?{' '}
                                <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
