import React from 'react';
import { DivideIcon, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  previousValue?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon = DivideIcon, color, previousValue }) => {
  const getPercentageChange = () => {
    if (previousValue === undefined || previousValue === 0) return null;
    
    const change = ((value - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };
  
  const percentChange = getPercentageChange();
  
  return (
    <div className="stat-card">
      <div className="flex items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-slate-600">{title}</h3>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold text-slate-900">{value.toLocaleString()}</p>
            {percentChange && (
              <span className={`ml-2 text-sm font-medium ${
                Number(percentChange) >= 0 
                  ? 'text-emerald-600' 
                  : 'text-red-600'
              }`}>
                {Number(percentChange) >= 0 ? '↗' : '↘'} {Math.abs(Number(percentChange))}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;