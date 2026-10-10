export default function ResultsCard({ issue, index }) {
  const severityConfig = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'severity-high',
      icon: '🔴',
      label: 'High Impact',
    },
    medium: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'severity-medium',
      icon: '🟡',
      label: 'Medium Impact',
    },
    low: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'severity-low',
      icon: '🔵',
      label: 'Low Impact',
    },
  };

  const config = severityConfig[issue.severity] || severityConfig.medium;

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-5 transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-lg">{config.icon}</span>
          <h4 className="font-semibold text-gray-900">{issue.category}</h4>
        </div>
        <span className={config.badge}>
          {config.label}
        </span>
      </div>

      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
        {issue.issue}
      </p>

      {issue.impact && (
        <div className="bg-white/60 rounded-lg p-3 mt-2">
          <p className="text-xs text-gray-500 mb-1 font-medium">Impact on AI Search Visibility:</p>
          <p className="text-sm text-gray-600">{issue.impact}</p>
        </div>
      )}

      {issue.dimension && (
        <p className="text-xs text-gray-400 mt-2">
          Dimension: {issue.dimension}
        </p>
      )}
    </div>
  );
}
