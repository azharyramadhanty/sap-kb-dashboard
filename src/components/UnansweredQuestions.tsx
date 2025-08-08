import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface ChatMessage {
  id: string;
  timestamp: string;
  user_question: string;
  ai_response: string;
  is_relevant: boolean;
  document_references: string[];
  topic: string;
  confidence_score: number;
}

interface UnansweredQuestionsProps {
  questions: ChatMessage[];
}

const UnansweredQuestions: React.FC<UnansweredQuestionsProps> = ({ questions }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Pertanyaan Tidak Terjawab
          </h2>
        </div>
        <div className="text-center py-8 text-slate-500">
          <AlertCircle className="mx-auto h-12 w-12 text-emerald-300" />
          <p className="mt-2">Semua pertanyaan berhasil dijawab!</p>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (score: number) => {
    if (score < 0.3) return 'bg-red-100 text-red-800';
    if (score < 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getConfidenceText = (score: number) => {
    if (score < 0.3) return 'Rendah';
    if (score < 0.5) return 'Sedang';
    return 'Cukup';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <AlertCircle className="mr-2 h-5 w-5" />
          Pertanyaan Tidak Terjawab
        </h2>
        <span className="text-sm text-slate-500">{questions.length} pertanyaan</span>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {questions.slice(0, 10).map((question, index) => (
          <div key={question.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  #{index + 1}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(question.confidence_score)}`}>
                  {getConfidenceText(question.confidence_score)}
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <Clock className="mr-1 h-3 w-3" />
                {formatTime(question.timestamp)}
              </div>
            </div>
            
            <p className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">
              {question.user_question}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {question.topic}
              </span>
              <span className="text-xs text-slate-500">
                Confidence: {Math.round(question.confidence_score * 100)}%
              </span>
            </div>
          </div>
        ))}
        
        {questions.length > 10 && (
          <div className="text-center py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Dan {questions.length - 10} pertanyaan lainnya...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnansweredQuestions;