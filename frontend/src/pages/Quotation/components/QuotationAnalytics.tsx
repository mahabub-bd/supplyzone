import { Activity, DollarSign, FileText, Target } from "lucide-react";
import { CompactMetricCard } from "../../../components/common/CompactMetricCard";
import { useGetQuotationAnalyticsQuery } from "../../../features/quotation/quotationApi";
import { formatCurrencyEnglish } from "../../../utlis";

export default function QuotationAnalyticsCompact() {
  const { data, isLoading, error } = useGetQuotationAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg border border-gray-200 bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !data?.data) return null;

  const analytics = data.data;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 py-4">
      <CompactMetricCard
        icon={FileText}
        label="Quotations"
        value={analytics.totalQuotations}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />

      <CompactMetricCard
        icon={DollarSign}
        label="Total Value"
        value={formatCurrencyEnglish(analytics.totalAmount)}
        iconBg="bg-green-50"
        iconColor="text-green-600"
      />

      <CompactMetricCard
        icon={Target}
        label="Avg Value"
        value={formatCurrencyEnglish(analytics.averageQuotationValue)}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      />

      <CompactMetricCard
        icon={Activity}
        label="Conversion"
        value={`${(analytics.conversionRate * 100).toFixed(1)}%`}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
    </div>
  );
}
