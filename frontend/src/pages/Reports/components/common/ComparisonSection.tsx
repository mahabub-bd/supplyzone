import { ArrowDown, ArrowUp, DollarSign, ShoppingBag } from "lucide-react";

interface ComparisonData {
  current: {
    revenue?: number;
    orders?: number;
  };
  previous: {
    revenue?: number;
    orders?: number;
  };
  growth: {
    revenue?: {
      value: number;
      percentage: number;
    };
    orders?: {
      value: number;
      percentage: number;
    };
  };
}

interface ComparisonSectionProps {
  comparison: ComparisonData;
}

export default function ComparisonSection({ comparison }: ComparisonSectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Period Comparison
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Comparing current period with previous period
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Revenue Comparison */}
          {comparison.current?.revenue !== undefined && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Revenue
                  </h4>
                </div>
                {comparison.growth?.revenue?.percentage !== undefined && (
                  <div
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      comparison.growth.revenue.percentage >= 0
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {comparison.growth.revenue.percentage >= 0 ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {Math.abs(comparison.growth.revenue.percentage).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Current Period
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ৳{(comparison.current.revenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Previous Period
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    ৳{(comparison.previous?.revenue || 0).toLocaleString()}
                  </span>
                </div>
                {comparison.growth?.revenue?.value !== undefined && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Growth
                      </span>
                      <span
                        className={`font-semibold ${
                          comparison.growth.revenue.value >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        ৳{comparison.growth.revenue.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Comparison */}
          {comparison.current?.orders !== undefined && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Orders
                  </h4>
                </div>
                {comparison.growth?.orders?.percentage !== undefined && (
                  <div
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      comparison.growth.orders.percentage >= 0
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {comparison.growth.orders.percentage >= 0 ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {Math.abs(comparison.growth.orders.percentage).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Current Period
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comparison.current.orders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Previous Period
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {comparison.previous?.orders || 0}
                  </span>
                </div>
                {comparison.growth?.orders?.value !== undefined && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Growth
                      </span>
                      <span
                        className={`font-semibold ${
                          comparison.growth.orders.value >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {comparison.growth.orders.value >= 0 ? "+" : ""}
                        {comparison.growth.orders.value}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
