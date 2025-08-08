import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, MessageSquare, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import PieChartComponent from '../components/PieChartComponent';
import TopQuestions from '../components/TopQuestions';
import UnansweredQuestions from '../components/UnansweredQuestions';

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

interface AnalyticsData {
  totalQuestions: number;
  relevantPercentage: number;
  totalDocumentReferences: number;
  dailyQuestions: { date: string; count: number }[];
  topicDistribution: { topic: string; count: number; color: string }[];
  topQuestions: { question: string; count: number }[];
  unansweredQuestions: ChatMessage[];
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading chat history data
      // In real implementation, this would fetch from your API
      const mockChatHistory: ChatMessage[] = [
        {
          id: '1',
          timestamp: '2025-01-15T09:30:00Z',
          user_question: 'Bagaimana cara mengakses SAP CMCT module?',
          ai_response: 'Untuk mengakses SAP CMCT module, Anda perlu...',
          is_relevant: true,
          document_references: ['SAP_CMCT_Guide.pdf', 'User_Manual_CMCT.docx'],
          topic: 'SAP CMCT',
          confidence_score: 0.95
        },
        {
          id: '2',
          timestamp: '2025-01-15T10:15:00Z',
          user_question: 'Apa itu financial posting di SAP FI?',
          ai_response: 'Financial posting di SAP FI adalah proses...',
          is_relevant: true,
          document_references: ['SAP_FI_Manual.pdf'],
          topic: 'SAP FI',
          confidence_score: 0.88
        },
        {
          id: '3',
          timestamp: '2025-01-15T11:20:00Z',
          user_question: 'Cuaca hari ini bagaimana?',
          ai_response: 'Maaf, saya tidak dapat memberikan informasi cuaca...',
          is_relevant: false,
          document_references: [],
          topic: 'Off-topic',
          confidence_score: 0.1
        },
        {
          id: '4',
          timestamp: '2025-01-15T14:30:00Z',
          user_question: 'Bagaimana cara melakukan quality inspection di SAP QM?',
          ai_response: 'Untuk melakukan quality inspection di SAP QM...',
          is_relevant: true,
          document_references: ['QM_Process_Guide.pdf', 'Quality_Manual.docx'],
          topic: 'SAP QM',
          confidence_score: 0.92
        },
        {
          id: '5',
          timestamp: '2025-01-14T09:45:00Z',
          user_question: 'Bagaimana cara mengakses SAP CMCT module?',
          ai_response: 'Untuk mengakses SAP CMCT module, Anda perlu...',
          is_relevant: true,
          document_references: ['SAP_CMCT_Guide.pdf'],
          topic: 'SAP CMCT',
          confidence_score: 0.95
        },
        {
          id: '6',
          timestamp: '2025-01-14T11:30:00Z',
          user_question: 'Apa fungsi dari GL Account di SAP FI?',
          ai_response: 'GL Account (General Ledger Account) di SAP FI berfungsi...',
          is_relevant: true,
          document_references: ['SAP_FI_Manual.pdf', 'GL_Account_Setup.pdf'],
          topic: 'SAP FI',
          confidence_score: 0.90
        },
        {
          id: '7',
          timestamp: '2025-01-14T15:20:00Z',
          user_question: 'Bagaimana cara setup material master di SAP?',
          ai_response: 'Maaf, saya tidak memiliki informasi yang cukup...',
          is_relevant: false,
          document_references: [],
          topic: 'SAP General',
          confidence_score: 0.3
        },
        {
          id: '8',
          timestamp: '2025-01-13T10:15:00Z',
          user_question: 'Apa itu financial posting di SAP FI?',
          ai_response: 'Financial posting di SAP FI adalah proses...',
          is_relevant: true,
          document_references: ['SAP_FI_Manual.pdf'],
          topic: 'SAP FI',
          confidence_score: 0.88
        },
        {
          id: '9',
          timestamp: '2025-01-13T13:45:00Z',
          user_question: 'Bagaimana cara melakukan inspection lot di SAP QM?',
          ai_response: 'Inspection lot di SAP QM adalah...',
          is_relevant: true,
          document_references: ['QM_Process_Guide.pdf'],
          topic: 'SAP QM',
          confidence_score: 0.85
        },
        {
          id: '10',
          timestamp: '2025-01-12T09:30:00Z',
          user_question: 'Bagaimana cara mengakses SAP CMCT module?',
          ai_response: 'Untuk mengakses SAP CMCT module, Anda perlu...',
          is_relevant: true,
          document_references: ['SAP_CMCT_Guide.pdf'],
          topic: 'SAP CMCT',
          confidence_score: 0.95
        },
        {
          id: '11',
          timestamp: '2025-01-12T14:20:00Z',
          user_question: 'Apa perbedaan antara cost center dan profit center?',
          ai_response: 'Maaf, informasi tentang cost center dan profit center...',
          is_relevant: false,
          document_references: [],
          topic: 'SAP General',
          confidence_score: 0.25
        },
        {
          id: '12',
          timestamp: '2025-01-11T11:15:00Z',
          user_question: 'Bagaimana cara melakukan vendor payment di SAP FI?',
          ai_response: 'Vendor payment di SAP FI dapat dilakukan...',
          is_relevant: true,
          document_references: ['SAP_FI_Manual.pdf', 'Payment_Process.pdf'],
          topic: 'SAP FI',
          confidence_score: 0.87
        }
      ];

      // Process data for analytics
      const totalQuestions = mockChatHistory.length;
      const relevantQuestions = mockChatHistory.filter(msg => msg.is_relevant).length;
      const relevantPercentage = Math.round((relevantQuestions / totalQuestions) * 100);
      const totalDocumentReferences = mockChatHistory.reduce((sum, msg) => sum + msg.document_references.length, 0);

      // Daily questions data
      const dailyData = mockChatHistory.reduce((acc, msg) => {
        const date = new Date(msg.timestamp).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dailyQuestions = Object.entries(dailyData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Topic distribution
      const topicData = mockChatHistory.reduce((acc, msg) => {
        acc[msg.topic] = (acc[msg.topic] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
      const topicDistribution = Object.entries(topicData)
        .map(([topic, count], index) => ({ 
          topic, 
          count, 
          color: colors[index % colors.length] 
        }))
        .sort((a, b) => b.count - a.count);

      // Top questions
      const questionCounts = mockChatHistory.reduce((acc, msg) => {
        if (msg.is_relevant) {
          acc[msg.user_question] = (acc[msg.user_question] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topQuestions = Object.entries(questionCounts)
        .map(([question, count]) => ({ question, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Unanswered questions
      const unansweredQuestions = mockChatHistory.filter(msg => 
        !msg.is_relevant || msg.confidence_score < 0.5
      );

      setAnalyticsData({
        totalQuestions,
        relevantPercentage,
        totalDocumentReferences,
        dailyQuestions,
        topicDistribution,
        topQuestions,
        unansweredQuestions
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load analytics data</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Chat Analytics</h1>
        <p className="mt-2 text-slate-600">
          Analisis interaksi pengguna dengan sistem AI Knowledge Management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pertanyaan"
          value={analyticsData.totalQuestions}
          icon={MessageSquare}
          color="bg-blue-600"
        />
        <StatCard
          title="Pertanyaan Relevan"
          value={analyticsData.relevantPercentage}
          icon={TrendingUp}
          color="bg-emerald-600"
        />
        <StatCard
          title="Referensi Dokumen"
          value={analyticsData.totalDocumentReferences}
          icon={FileText}
          color="bg-purple-600"
        />
        <StatCard
          title="Tidak Terjawab"
          value={analyticsData.unansweredQuestions.length}
          icon={AlertCircle}
          color="bg-red-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Bar Chart - Daily Questions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Pertanyaan per Hari
            </h2>
          </div>
          <BarChart data={analyticsData.dailyQuestions} />
        </div>

        {/* Pie Chart - Topic Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Distribusi Topik
            </h2>
          </div>
          <PieChartComponent data={analyticsData.topicDistribution} />
        </div>
      </div>

      {/* Top Questions and Unanswered Questions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TopQuestions questions={analyticsData.topQuestions} />
        <UnansweredQuestions questions={analyticsData.unansweredQuestions} />
      </div>
    </div>
  );
};

export default Analytics;