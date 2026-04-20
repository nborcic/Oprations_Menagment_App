import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { DashboardStats, ActivityLog } from '@/types';
import { StatCard } from '@/components/StatCard';
import { PageLoader } from '@/components/LoadingSpinner';
import { actionLabel, timeAgo } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: () => api.get('/jobs/stats').then(r => r.data),
  });

  const { data: activity, isLoading: activityLoading } = useQuery<ActivityLog[]>({
    queryKey: ['activity'],
    queryFn: () => api.get('/jobs/activity').then(r => r.data),
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.name.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's going on today.</p>
      </div>

      {statsLoading ? (
        <PageLoader />
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Customers"
            value={stats.customers}
            color="bg-violet-500"
            onClick={() => navigate('/customers')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="Open Jobs"
            value={stats.open}
            color="bg-blue-500"
            onClick={() => navigate('/jobs?status=OPEN')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="bg-amber-500"
            onClick={() => navigate('/jobs?status=IN_PROGRESS')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            color="bg-red-500"
            onClick={() => navigate('/jobs?status=OVERDUE')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            color="bg-green-500"
            onClick={() => navigate('/jobs?status=COMPLETED')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Total Jobs"
            value={stats.total}
            color="bg-gray-500"
            onClick={() => navigate('/jobs')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
        </div>
        {activityLoading ? (
          <PageLoader />
        ) : (
          <ul className="divide-y divide-gray-100">
            {activity?.slice(0, 15).map((log) => (
              <li key={log.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0 mt-0.5">
                  {log.user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{log.user.name}</span>{' '}
                    <span className="text-gray-500">{actionLabel(log.action)}</span>
                    {log.job && (
                      <>
                        {' '}
                        <button
                          onClick={() => navigate(`/jobs/${log.job!.id}`)}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {log.job.title}
                        </button>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.createdAt)}</p>
                </div>
              </li>
            ))}
            {!activity?.length && (
              <li className="px-5 py-8 text-center text-sm text-gray-400">No activity yet</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
