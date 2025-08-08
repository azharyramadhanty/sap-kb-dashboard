import React from 'react';

interface PieChartData {
  topic: string;
  count: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChartComponent: React.FC<PieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p>No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  let cumulativePercentage = 0;

  const createPath = (percentage: number, startPercentage: number) => {
    const startAngle = (startPercentage / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((startPercentage + percentage) / 100) * 2 * Math.PI - Math.PI / 2;
    
    const x1 = 50 + 40 * Math.cos(startAngle);
    const y1 = 50 + 40 * Math.sin(startAngle);
    const x2 = 50 + 40 * Math.cos(endAngle);
    const y2 = 50 + 40 * Math.sin(endAngle);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
      {/* Pie Chart SVG */}
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const path = createPath(percentage, cumulativePercentage);
            const currentCumulative = cumulativePercentage;
            cumulativePercentage += percentage;
            
            return (
              <path
                key={index}
                d={path}
                fill={item.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title={`${item.topic}: ${item.count} (${percentage.toFixed(1)}%)`}
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{total}</div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = ((item.count / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {item.topic}
                </div>
                <div className="text-xs text-slate-500">
                  {item.count} pertanyaan ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PieChartComponent;