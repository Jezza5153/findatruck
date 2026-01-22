import { IconMap } from '@/components/ui/branded-icons';

export function MapPlaceholder() {
  return (
    <div
      className="w-full h-[calc(100vh-200px)] md:h-[calc(100vh-150px)] bg-muted rounded-lg flex items-center justify-center shadow-inner"
      aria-label="Map placeholder showing food truck locations"
    >
      <div className="text-center text-muted-foreground">
        <IconMap className="h-24 w-24 mx-auto mb-4 text-gray-400" />
        <p className="text-xl font-semibold">Map Loading...</p>
        <p className="text-sm">Food truck locations will appear here.</p>
      </div>
    </div>
  );
}
