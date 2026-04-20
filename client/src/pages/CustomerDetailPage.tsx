import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Customer } from '@/types';
import { PageLoader } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { JobStatusBadge, PriorityBadge } from '@/components/JobStatusBadge';
import { formatDate } from '@/lib/utils';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`).then(r => r.data),
  });

  if (isLoading) return <PageLoader />;
  if (!customer) return <div className="p-6 text-gray-500">Customer not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title={customer.name}
        subtitle="Customer profile"
        actions={
          <button
            onClick={() => navigate(`/customers/${id}/edit`)}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Contact Info</h2>
          <dl className="space-y-3 text-sm">
            {customer.email && (
              <div>
                <dt className="text-gray-400 text-xs mb-0.5">Email</dt>
                <dd className="text-gray-800">{customer.email}</dd>
              </div>
            )}
            {customer.phone && (
              <div>
                <dt className="text-gray-400 text-xs mb-0.5">Phone</dt>
                <dd className="text-gray-800">{customer.phone}</dd>
              </div>
            )}
            {customer.address && (
              <div>
                <dt className="text-gray-400 text-xs mb-0.5">Address</dt>
                <dd className="text-gray-800">{customer.address}</dd>
              </div>
            )}
            {customer.notes && (
              <div>
                <dt className="text-gray-400 text-xs mb-0.5">Notes</dt>
                <dd className="text-gray-700 italic">{customer.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Jobs <span className="text-gray-400 font-normal">({customer.jobs?.length ?? 0})</span>
            </h2>
            <button
              onClick={() => navigate(`/jobs/new?customerId=${customer.id}`)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Job
            </button>
          </div>
          {!customer.jobs?.length ? (
            <div className="p-8 text-center text-sm text-gray-400">No jobs yet</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {customer.jobs.map(job => (
                <li
                  key={job.id}
                  className="px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(job.scheduledDate)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={job.priority} />
                      <JobStatusBadge status={job.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
