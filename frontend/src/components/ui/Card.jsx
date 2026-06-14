export default function Card({ hover = false, className = '', children, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${hover ? 'hover:shadow-md hover:border-slate-300 transition-all' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
