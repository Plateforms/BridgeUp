const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const colors = {
  success: 'bg-accent-light text-accent border-accent/20',
  error: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function Toast({ message, type = 'info', onClose }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium animate-slide-up ${colors[type]}`}>
      <span className="text-base">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 cursor-pointer" aria-label="Close">&times;</button>
    </div>
  );
}
