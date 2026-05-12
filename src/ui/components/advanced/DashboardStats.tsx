// src/ui/components/advanced/DashboardStats.tsx
import React from "react";
import { FiUsers, FiUserCheck, FiUserX, FiTrendingUp } from "react-icons/fi";
import { DashboardStats as DashboardStatsType } from "../../types/crud-advanced.types";

interface DashboardStatsProps<T = any> {
  stats: DashboardStatsType<T>;
  loading?: boolean;
  title?: string;
  onRefresh?: () => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  loading = false,
  title = "Estadísticas",
  onRefresh,
}) => {
  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: <FiUsers className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Activos",
      value: stats.active,
      icon: <FiUserCheck className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Inactivos",
      value: stats.inactive,
      icon: <FiUserX className="h-6 w-6 text-red-600" />,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "Tendencia",
      value: stats.trends && stats.trends.length > 1
        ? `${((stats.trends[stats.trends.length - 1].count - stats.trends[stats.trends.length - 2].count) / stats.trends[stats.trends.length - 2].count * 100).toFixed(1)}%`
        : 'N/A',
      icon: <FiTrendingUp className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Actualizar
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-50 rounded-xl p-5 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`${card.bgColor} rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-white rounded-lg shadow-sm">
                  {card.icon}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trends Chart (simplified) */}
      {stats.trends && stats.trends.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Tendencia</h4>
          <div className="flex items-end space-x-1 h-32">
            {stats.trends.map((trend, idx) => {
              const maxCount = Math.max(...stats.trends.map(t => t.count));
              const height = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${trend.date}: ${trend.count}`}
                ></div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{stats.trends[0]?.date}</span>
            <span>{stats.trends[stats.trends.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
