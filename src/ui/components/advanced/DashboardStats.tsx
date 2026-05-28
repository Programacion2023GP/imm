// // src/ui/components/advanced/DashboardStats.tsx
// import React from "react";
// import { FiUsers, FiUserCheck, FiUserX, FiTrendingUp } from "react-icons/fi";
// // import  from "../../../types/crud-advanced.types";
// import { type DashboardStats as DashboardStatsType } from "./DashboardStats";
// interface DashboardStatsProps<T = any> {
//    stats: DashboardStatsType<T>;
//    loading?: boolean;
//    title?: string;
//    onRefresh?: () => void;
// }

// const DashboardStats: React.FC<DashboardStatsProps> = ({
//    stats,
//    loading = false,
//    title = "Estadísticas",
//    onRefresh,
// }) => {
//    const statCards = [
//       {
//          label: "Total",
//          value: stats.total,
//          icon: <FiUsers className="w-6 h-6 text-blue-600" />,
//          bgColor: "bg-blue-50",
//          textColor: "text-blue-600",
//       },
//       {
//          label: "Activos",
//          value: stats.active,
//          icon: <FiUserCheck className="w-6 h-6 text-green-600" />,
//          bgColor: "bg-green-50",
//          textColor: "text-green-600",
//       },
//       {
//          label: "Inactivos",
//          value: stats.inactive,
//          icon: <FiUserX className="w-6 h-6 text-red-600" />,
//          bgColor: "bg-red-50",
//          textColor: "text-red-600",
//       },
//       {
//          label: "Tendencia",
//          value:
//             stats.trends && stats.trends.length > 1
//                ? `${(((stats.trends[stats.trends.length - 1].count - stats.trends[stats.trends.length - 2].count) / stats.trends[stats.trends.length - 2].count) * 100).toFixed(1)}%`
//                : "N/A",
//          icon: <FiTrendingUp className="w-6 h-6 text-purple-600" />,
//          bgColor: "bg-purple-50",
//          textColor: "text-purple-600",
//       },
//    ];

//    return (
//       <div className="space-y-4">
//          <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//             {onRefresh && (
//                <button
//                   onClick={onRefresh}
//                   className="text-xs font-medium text-blue-600 hover:text-blue-800">
//                   Actualizar
//                </button>
//             )}
//          </div>

//          {loading ? (
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//                {[1, 2, 3, 4].map((i) => (
//                   <div
//                      key={i}
//                      className="p-5 bg-gray-50 rounded-xl animate-pulse">
//                      <div className="w-10 h-10 mb-3 bg-gray-200 rounded-lg"></div>
//                      <div className="w-20 h-4 mb-2 bg-gray-200 rounded"></div>
//                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
//                   </div>
//                ))}
//             </div>
//          ) : (
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//                {statCards.map((card, idx) => (
//                   <div
//                      key={idx}
//                      className={`${card.bgColor} rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
//                      <div className="flex items-center justify-between mb-3">
//                         <span className="p-2 bg-white rounded-lg shadow-sm">
//                            {card.icon}
//                         </span>
//                      </div>
//                      <p className="mb-1 text-xs font-medium text-gray-600">
//                         {card.label}
//                      </p>
//                      <p className={`text-2xl font-bold ${card.textColor}`}>
//                         {card.value}
//                      </p>
//                   </div>
//                ))}
//             </div>
//          )}

//          {/* Trends Chart (simplified) */}
//          {stats.trends && stats.trends.length > 0 && (
//             <div className="p-5 bg-white border border-gray-200 rounded-xl">
//                <h4 className="mb-4 text-sm font-semibold text-gray-700">
//                   Tendencia
//                </h4>
//                <div className="flex items-end h-32 space-x-1">
//                   {stats.trends.map((trend, idx) => {
//                      const maxCount = Math.max(
//                         ...stats.trends.map((t) => t.count),
//                      );
//                      const height =
//                         maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
//                      return (
//                         <div
//                            key={idx}
//                            className="flex-1 transition-colors bg-blue-500 rounded-t cursor-pointer hover:bg-blue-600"
//                            style={{ height: `${height}%` }}
//                            title={`${trend.date}: ${trend.count}`}></div>
//                      );
//                   })}
//                </div>
//                <div className="flex justify-between mt-2 text-xs text-gray-500">
//                   <span>{stats.trends[0]?.date}</span>
//                   <span>{stats.trends[stats.trends.length - 1]?.date}</span>
//                </div>
//             </div>
//          )}
//       </div>
//    );
// };

// export default DashboardStats;
