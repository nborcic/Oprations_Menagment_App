import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Job, JobStatus, Priority } from '@/types';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { JobStatusBadge, PriorityBadge } from '@/components/JobStatusBadge';
import { formatDate } from '@/lib/utils';

const STATUS_OPTIONS: { value: ''; label: string } | { value: JobStatus; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
] as const;

export function JobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [priority, setPriority] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const s = searchParams.get('status');
    if (s) setStatus(s);
  }, [searchParams]);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['jobs', status, priority, search],
    queryFn: () => api.get('/jobs', {
      params: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(search ? { search } : {}),
      }
    }).then(r => r.data),
  });

  function handleStatusChange(v: string) {
    setStatus(v);
    if (v) setSearchParams({ status: v });
    else setSearchParams({});
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Jobs"
        subtitle={jobs ? `${jobs.length} job${jobs.length !== 1 ? 's' : ''}` : ''}
        actions={
          <button
            onClick={() => navigate('/jobs/new')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Job
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs…"
          className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
        />
        <select
          value={status}
          onChange={e => handleStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(status || priority || search) && (
          <button
            onClick={() => { setStatus(''); setPriority(''); setSearch(''); setSearchParams({}); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !jobs?.length ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your filters or create a new job."
          action={
            <button
              onClick={() => navigate('/jobs/new')}
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Job
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Scheduled</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map(job => (
                <tr
                  key={job.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900 line-clamp-1">{job.title}</p>
                    {job._count && job._count.notes > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{job._count.notes} note{job._count.notes !== 1 ? 's' : ''}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">{job.customer.name}</td>
                  <td className="px-5 py-3.5"><JobStatusBadge status={job.status} /></td>
                  <td className="px-5 py-3.5 hidden lg:table-cell"><PriorityBadge priority={job.priority} /></td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-gray-500">{formatDate(job.scheduledDate)}</td>
                  <td className="px-5 py-3.5 hidden xl:table-cell text-gray-500">{job.assignedTo?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
