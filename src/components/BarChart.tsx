import React from 'react';

interface BarChartProps {
  data: { date: string; count: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p>No data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const maxHeight = 200;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between space-x-2 h-64">
        {data.map((item, index) => {
          const height = (item.count / maxCount) * maxHeight;
          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-16">
              <div className="flex items-end h-52">
                <div
                  className="bg-blue-600 rounded-t-md transition-all duration-300 hover:bg-blue-700 min-w-8 flex items-end justify-center text-white text-xs font-medium pb-1"
                  style={{ height: `${height}px` }}
                  title={`${item.count} pertanyaan`}
                >
                  {item.count > 0 && item.count}
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-600 text-center">
                {formatDate(item.date)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Jumlah Pertanyaan</span>
        </div>
      </div>
    </div>
  );
};

export default BarChart;