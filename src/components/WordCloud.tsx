import React from 'react';

interface WordCloudData {
  text: string;
  value: number;
}

interface WordCloudProps {
  data: WordCloudData[];
}

const WordCloud: React.FC<WordCloudProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500">
        <p>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-6 bg-slate-50 rounded-lg min-h-32">
      {data.map((item, index) => {
        const fontSize = Math.max(14, (item.value / maxValue) * 32);
        const color = colors[index % colors.length];
        
        return (
          <span
            key={item.text}
            className="font-semibold transition-all duration-200 hover:scale-110 cursor-pointer"
            style={{
              fontSize: `${fontSize}px`,
              color: color,
            }}
            title={`${item.text}: ${item.value} pertanyaan`}
          >
            {item.text}
          </span>
        );
      })}
    </div>
  );
};

export default WordCloud;