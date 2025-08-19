import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface QuestionErrorData {
  question: string;
  category: string;
  errorRate: number;
  totalAttempts: number;
}

interface QuestionErrorTableProps {
  data: QuestionErrorData[];
}

const QuestionErrorTable: React.FC<QuestionErrorTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No error data available</p>
      </div>
    );
  }

  const getErrorColor = (errorRate: number) => {
    if (errorRate >= 80) return 'bg-red-100 text-red-800';
    if (errorRate >= 60) return 'bg-orange-100 text-orange-800';
    if (errorRate >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PLN SSoT':
        return 'bg-blue-100 text-blue-800';
      case 'SAP CMCT':
        return 'bg-purple-100 text-purple-800';
      case 'SAP FI':
        return 'bg-emerald-100 text-emerald-800';
      case 'SAP QM':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getErrorColor(item.errorRate)}`}>
                    {item.errorRate}% error
                  </span>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              </div>
              
              <p className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">
                {item.question}
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{item.totalAttempts} attempts</span>
                <span>{Math.round((100 - item.errorRate) * item.totalAttempts / 100)} correct</span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.errorRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionErrorTable;