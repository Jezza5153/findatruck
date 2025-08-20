'use client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const RealTimeAlert = ({
  alerts,
}: {
  alerts: Array<{ id: string; type: string; title: string; message: string }>;
}) => {
  if (!alerts?.length) return null;
  return (
    <div className="mb-4">
      {alerts.map((a) => (
        <Alert
          key={a.id}
          variant={a.type === 'error' ? 'destructive' : 'default'}
        >
          <AlertTitle>{a.title}</AlertTitle>
          <AlertDescription>{a.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default RealTimeAlert;
