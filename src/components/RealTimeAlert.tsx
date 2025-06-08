'use client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function RealTimeAlert({ alerts }) {
  if (!alerts?.length) return null;
  return (
    <div className="mb-4">
      {alerts.map(a => (
        <Alert key={a.id} variant={a.type}>
          <AlertTitle>{a.title}</AlertTitle>
          <AlertDescription>{a.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
