const colors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  student: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  company: 'bg-teal-50 text-teal-700 border-teal-200',
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function Badge({ variant = 'pending', className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${colors[variant] || colors.pending} ${className}`}>
      {children}
    </span>
  );
}
