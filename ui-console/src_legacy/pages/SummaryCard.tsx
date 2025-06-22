import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  trend?: string;
  icon?: ReactNode;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export default function SummaryCard({ title, value, trend, icon, change, changeLabel, className }: Props) {
  return (
    <Card className={`p-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {trend && <p className="text-xs text-gray-500">{trend}</p>}
      {change !== undefined && (
        <p className="text-xs text-gray-500">
          {change > 0 ? '+' : ''}{change}% {changeLabel}
        </p>
      )}
    </Card>
  );
}