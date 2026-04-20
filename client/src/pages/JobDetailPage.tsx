import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Job } from '@/types';
import { PageLoader } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { JobStatusBadge, PriorityBadge } from '@/components/JobStatusBadge';
import { formatDate, formatDateTime, timeAgo, actionLabel } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [noteText, setNoteText] = useState('');

  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then(r => r.data),
  });

  const noteMutation = useMutation({
    mutationFn: (content: string) => api.post(`/jobs/${id}/notes`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      setNoteText('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/jobs/${id}`),
    onSuccess: () => navigate('/jobs'),
  });

  function handleDelete() {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    deleteMutation.mutate();
  }

  function handleSubmitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    noteMutation.mutate(noteText.trim());
  }

  if (isLoading) return <PageLoader />;
  if (!job) return <div className="p-6 text-gray-500">Job not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={job.title}
        subtitle={`Created ${formatDate(job.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/jobs/${id}/edit`)}
              className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            {user?.role === 'ADMIN' && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd><JobStatusBadge status={job.status} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Priority</dt>
                <dd><PriorityBadge priority={job.priority} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Scheduled</dt>
                <dd className="text-gray-800">{formatDate(job.scheduledDate)}</dd>
              </div>
              {job.completedDate && (
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Completed</dt>
                  <dd className="text-gray-800">{formatDate(job.completedDate)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Assigned To</dt>
                <dd className="text-gray-800">{job.assignedTo?.name ?? <span className="text-gray-400">—</span>}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Created By</dt>
                <dd className="text-gray-800">{job.createdBy?.name}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer</h2>
            <button
              onClick={() => navigate(`/customers/${job.customer.id}`)}
              className="text-sm font-medium text-blue-600 hover:underline text-left"
            >
              {job.customer.name}
            </button>
            {job.description && (
              <div className="mt-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Notes <span className="text-gray-400 font-normal">({job.notes?.length ?? 0})</span>
              </h2>
            </div>
            <div className="p-5">
              <form onSubmit={handleSubmitNote} className="mb-4">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note…"
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  type="submit"
                  disabled={!noteText.trim() || noteMutation.isPending}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  {noteMutation.isPending ? 'Posting…' : 'Post Note'}
                </button>
              </form>

              {!job.notes?.length ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes yet. Be the first to add one.</p>
              ) : (
                <ul className="space-y-3">
                  {job.notes.map(note => (
                    <li key={note.id} className="bg-gray-50 rounded-lg p-4 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                            {note.author.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 text-xs">{note.author.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{timeAgo(note.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Activity Log</h2>
            </div>
            {!job.activityLogs?.length ? (
              <p className="text-sm text-gray-400 text-center py-8">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {job.activityLogs.map(log => (
                  <li key={log.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{log.user.name}</span>{' '}
                        <span className="text-gray-500">{actionLabel(log.action)}</span>
                        {log.action === 'JOB_STATUS_CHANGED' && log.metadata && (
                          <span className="text-gray-500">
                            {' '}from <span className="font-medium">{String(log.metadata.from)}</span> to <span className="font-medium">{String(log.metadata.to)}</span>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
