import React from 'react';
import { TrendingUp } from 'lucide-react';

interface TopQuestionsProps {
  questions: { question: string; count: number }[];
}

const TopQuestions: React.FC<TopQuestionsProps> = ({ questions }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Top 5 Pertanyaan Populer
          </h2>
        </div>
        <div className="text-center py-8 text-slate-500">
          <p>Tidak ada data pertanyaan populer</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...questions.map(q => q.count));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Top 5 Pertanyaan Populer
        </h2>
      </div>
      
      <div className="space-y-4">
        {questions.map((item, index) => {
          const percentage = (item.count / maxCount) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      {item.question}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.count}x
                  </span>
                </div>
              </div>
              
              <div className="ml-9">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopQuestions;