import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon, color = 'bg-blue-500', onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300 transition-all'
      )}
    >
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0', color)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
