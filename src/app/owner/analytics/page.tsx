'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OwnerAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/owner/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            Analytics
          </h1>
          <p className="text-slate-400 mb-8">
            Track your performance and sales
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
              <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon!</h3>
              <p className="text-slate-400">
                Detailed analytics and insights are under development.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
