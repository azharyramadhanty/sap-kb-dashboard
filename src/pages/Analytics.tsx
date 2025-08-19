import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, MessageSquare, TrendingUp, AlertCircle, FileText, Trophy, Target, Users, BookOpen } from 'lucide-react';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import PieChartComponent from '../components/PieChartComponent';
import TopQuestions from '../components/TopQuestions';
import UnansweredQuestions from '../components/UnansweredQuestions';
import WordCloud from '../components/WordCloud';
import LineChart from '../components/LineChart';
import LeaderboardTable from '../components/LeaderboardTable';
import QuestionErrorTable from '../components/QuestionErrorTable';
import quizScoresData from '../data/quiz_scores.json';
import quizDetailsData from '../data/quiz_details.json';

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
  wordCloudData: { text: string; value: number }[];
}

interface QuizAnalyticsData {
  averageScore: number;
  averageAccuracy: number;
  totalQuizzes: number;
  leaderboard: { userId: string; userName: string; averageScore: number; totalQuizzes: number; averageAccuracy: number }[];
  scoresTrend: { date: string; score: number; userId: string }[];
  accuracyByCategory: { category: string; accuracy: number }[];
  errorQuestions: { question: string; errorRate: number; category: string; totalAttempts: number }[];
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz'>('chat');
  const [chatAnalyticsData, setChatAnalyticsData] = useState<AnalyticsData | null>(null);
  const [quizAnalyticsData, setQuizAnalyticsData] = useState<QuizAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatAnalyticsData();
    loadQuizAnalyticsData();
  }, []);

  const loadChatAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock chat history data
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

      // Word cloud data
      const wordCloudData = Object.entries(topicData)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value);

      setChatAnalyticsData({
        totalQuestions,
        relevantPercentage,
        totalDocumentReferences,
        dailyQuestions,
        topicDistribution,
        topQuestions,
        unansweredQuestions,
        wordCloudData
      });
    } catch (error) {
      console.error('Error loading chat analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizAnalyticsData = async () => {
    try {
      // Process quiz data
      const scores = quizScoresData;
      const details = quizDetailsData;

      // Calculate KPIs
      const averageScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
      const averageAccuracy = scores.reduce((sum, score) => sum + score.accuracy, 0) / scores.length;
      const totalQuizzes = scores.length;

      // Create leaderboard
      const userStats = scores.reduce((acc, score) => {
        if (!acc[score.userId]) {
          acc[score.userId] = {
            userId: score.userId,
            userName: `User ${score.userId}`,
            totalScore: 0,
            totalAccuracy: 0,
            quizCount: 0
          };
        }
        acc[score.userId].totalScore += score.score;
        acc[score.userId].totalAccuracy += score.accuracy;
        acc[score.userId].quizCount += 1;
        return acc;
      }, {} as Record<string, any>);

      const leaderboard = Object.values(userStats).map((user: any) => ({
        userId: user.userId,
        userName: user.userName,
        averageScore: Math.round(user.totalScore / user.quizCount),
        totalQuizzes: user.quizCount,
        averageAccuracy: Math.round(user.totalAccuracy / user.quizCount)
      })).sort((a, b) => b.averageScore - a.averageScore);

      // Scores trend
      const scoresTrend = scores
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(score => ({
          date: new Date(score.timestamp).toISOString().split('T')[0],
          score: score.score,
          userId: score.userId
        }));

      // Accuracy by category
      const categoryStats = details.reduce((acc, detail) => {
        detail.questions.forEach(question => {
          if (!acc[question.category]) {
            acc[question.category] = { correct: 0, total: 0 };
          }
          acc[question.category].total += 1;
          
          const userAnswer = detail.userAnswers.find(ua => 
            detail.questions[ua.questionIndex]?.id === question.id
          );
          if (userAnswer && userAnswer.isCorrect) {
            acc[question.category].correct += 1;
          }
        });
        return acc;
      }, {} as Record<string, { correct: number; total: number }>);

      const accuracyByCategory = Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        accuracy: Math.round((stats.correct / stats.total) * 100)
      }));

      // Questions with highest error rate
      const questionStats = details.reduce((acc, detail) => {
        detail.questions.forEach((question, index) => {
          if (!acc[question.id]) {
            acc[question.id] = {
              question: question.question,
              category: question.category,
              correct: 0,
              total: 0
            };
          }
          acc[question.id].total += 1;
          
          const userAnswer = detail.userAnswers[index];
          if (userAnswer && userAnswer.isCorrect) {
            acc[question.id].correct += 1;
          }
        });
        return acc;
      }, {} as Record<string, any>);

      const errorQuestions = Object.values(questionStats)
        .map((stat: any) => ({
          question: stat.question,
          category: stat.category,
          errorRate: Math.round(((stat.total - stat.correct) / stat.total) * 100),
          totalAttempts: stat.total
        }))
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 10);

      setQuizAnalyticsData({
        averageScore,
        averageAccuracy,
        totalQuizzes,
        leaderboard,
        scoresTrend,
        accuracyByCategory,
        errorQuestions
      });
    } catch (error) {
      console.error('Error loading quiz analytics data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Comprehensive insights into chat interactions and quiz performance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="inline-block w-4 h-4 mr-2" />
            Chat Insights
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quiz'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Trophy className="inline-block w-4 h-4 mr-2" />
            Quiz Insights
          </button>
        </nav>
      </div>

      {/* Chat Insights Tab */}
      {activeTab === 'chat' && chatAnalyticsData && (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Pertanyaan"
              value={chatAnalyticsData.totalQuestions}
              icon={MessageSquare}
              color="bg-blue-600"
            />
            <StatCard
              title="Pertanyaan Relevan"
              value={chatAnalyticsData.relevantPercentage}
              icon={TrendingUp}
              color="bg-emerald-600"
            />
            <StatCard
              title="Referensi Dokumen"
              value={chatAnalyticsData.totalDocumentReferences}
              icon={FileText}
              color="bg-purple-600"
            />
            <StatCard
              title="Tidak Terjawab"
              value={chatAnalyticsData.unansweredQuestions.length}
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
              <BarChart data={chatAnalyticsData.dailyQuestions} />
            </div>

            {/* Pie Chart - Topic Distribution */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Distribusi Topik
                </h2>
              </div>
              <PieChartComponent data={chatAnalyticsData.topicDistribution} />
            </div>
          </div>

          {/* Word Cloud */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Topik Populer
              </h2>
            </div>
            <WordCloud data={chatAnalyticsData.wordCloudData} />
          </div>

          {/* Top Questions and Unanswered Questions */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <TopQuestions questions={chatAnalyticsData.topQuestions} />
            <UnansweredQuestions questions={chatAnalyticsData.unansweredQuestions} />
          </div>
        </div>
      )}

      {/* Quiz Insights Tab */}
      {activeTab === 'quiz' && quizAnalyticsData && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Rata-rata Skor"
              value={Math.round(quizAnalyticsData.averageScore)}
              icon={Target}
              color="bg-blue-600"
            />
            <StatCard
              title="Akurasi Rata-rata"
              value={Math.round(quizAnalyticsData.averageAccuracy)}
              icon={TrendingUp}
              color="bg-emerald-600"
            />
            <StatCard
              title="Total Quiz Diambil"
              value={quizAnalyticsData.totalQuizzes}
              icon={BookOpen}
              color="bg-purple-600"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Line Chart - Score Trends */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Tren Skor User
                </h2>
              </div>
              <LineChart data={quizAnalyticsData.scoresTrend} />
            </div>

            {/* Bar Chart - Accuracy by Category */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Akurasi per Kategori
                </h2>
              </div>
              <BarChart 
                data={quizAnalyticsData.accuracyByCategory.map(item => ({
                  date: item.category,
                  count: item.accuracy
                }))} 
              />
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Leaderboard */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Leaderboard
                </h2>
              </div>
              <LeaderboardTable data={quizAnalyticsData.leaderboard} />
            </div>

            {/* Error Questions */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Pertanyaan Sulit
                </h2>
              </div>
              <QuestionErrorTable data={quizAnalyticsData.errorQuestions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;