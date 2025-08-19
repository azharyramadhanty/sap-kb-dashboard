import React from 'react';

interface LineChartData {
  date: string;
  score: number;
  userId: string;
}

interface LineChartProps {
  data: LineChartData[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p>No data available</p>
      </div>
    );
  }

  // Group data by user
  const userGroups = data.reduce((acc, item) => {
    if (!acc[item.userId]) {
      acc[item.userId] = [];
    }
    acc[item.userId].push(item);
    return acc;
  }, {} as Record<string, LineChartData[]>);

  const users = Object.keys(userGroups);
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
  
  // Get unique dates and sort them
  const dates = [...new Set(data.map(d => d.date))].sort();
  const maxScore = Math.max(...data.map(d => d.score));
  const minScore = Math.min(...data.map(d => d.score));
  const scoreRange = maxScore - minScore || 1;

  const chartWidth = 400;
  const chartHeight = 200;
  const padding = 40;

  const getX = (dateIndex: number) => padding + (dateIndex * (chartWidth - 2 * padding)) / (dates.length - 1);
  const getY = (score: number) => chartHeight - padding - ((score - minScore) / scoreRange) * (chartHeight - 2 * padding);

  return (
    <div className="space-y-4">
      <svg width={chartWidth} height={chartHeight} className="border border-slate-200 rounded-lg bg-white">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = padding + (i * (chartHeight - 2 * padding)) / 4;
          const score = maxScore - (i * scoreRange) / 4;
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-slate-500"
              >
                {Math.round(score)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {dates.map((date, index) => (
          <text
            key={date}
            x={getX(index)}
            y={chartHeight - 10}
            textAnchor="middle"
            className="text-xs fill-slate-500"
          >
            {new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
          </text>
        ))}

        {/* Lines for each user */}
        {users.map((userId, userIndex) => {
          const userColor = colors[userIndex % colors.length];
          const userScores = userGroups[userId].sort((a, b) => a.date.localeCompare(b.date));
          
          const pathData = userScores.map((item, index) => {
            const dateIndex = dates.indexOf(item.date);
            const x = getX(dateIndex);
            const y = getY(item.score);
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ');

          return (
            <g key={userId}>
              <path
                d={pathData}
                fill="none"
                stroke={userColor}
                strokeWidth="2"
                className="hover:stroke-width-3"
              />
              {/* Data points */}
              {userScores.map((item) => {
                const dateIndex = dates.indexOf(item.date);
                const x = getX(dateIndex);
                const y = getY(item.score);
                return (
                  <circle
                    key={`${userId}-${item.date}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={userColor}
                    className="hover:r-6 transition-all"
                    title={`User ${userId}: ${item.score} (${item.date})`}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {users.map((userId, index) => (
          <div key={userId} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-sm text-slate-600">User {userId}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;