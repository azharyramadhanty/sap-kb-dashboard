import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardData {
  userId: string;
  userName: string;
  averageScore: number;
  totalQuizzes: number;
  averageAccuracy: number;
}

interface LeaderboardTableProps {
  data: LeaderboardData[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No leaderboard data available</p>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-slate-600">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-100 text-yellow-800',
        2: 'bg-gray-100 text-gray-800',
        3: 'bg-amber-100 text-amber-800'
      };
      return colors[rank as keyof typeof colors] || 'bg-slate-100 text-slate-800';
    }
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                User
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Avg Score
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Accuracy
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Quizzes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((user, index) => {
              const rank = index + 1;
              return (
                <tr key={user.userId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(rank)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                        {user.userId}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900">
                          {user.userName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRankBadge(rank)}`}>
                      {user.averageScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-slate-900">{user.averageAccuracy}%</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-slate-900">{user.totalQuizzes}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;