export interface DateRange {
  fromDate: Date;
  toDate: Date;
  previousFromDate?: Date;
  previousToDate?: Date;
}

export function getDateRange(rangeType: string, customFromDate?: string, customToDate?: string): DateRange {
  const now = new Date();
  let fromDate: Date;
  let toDate: Date;
  let previousFromDate: Date;
  let previousToDate: Date;

  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date: Date) => {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d;
  };

  switch (rangeType) {
    case 'today':
      fromDate = startOfDay(now);
      toDate = endOfDay(now);
      previousFromDate = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      previousToDate = endOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      break;

    case 'yesterday':
      fromDate = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      toDate = endOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      previousFromDate = startOfDay(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
      previousToDate = endOfDay(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
      break;

    case 'this_week':
      const dayOfWeek = now.getDay();
      const startOfThisWeek = startOfDay(new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000));
      fromDate = startOfThisWeek;
      toDate = endOfDay(now);
      previousFromDate = startOfDay(new Date(startOfThisWeek.getTime() - 7 * 24 * 60 * 60 * 1000));
      previousToDate = endOfDay(new Date(startOfThisWeek.getTime() - 24 * 60 * 60 * 1000));
      break;

    case 'last_week':
      const lastWeekEnd = endOfDay(new Date(now.getTime() - (now.getDay() + 1) * 24 * 60 * 60 * 1000));
      toDate = lastWeekEnd;
      fromDate = startOfDay(new Date(lastWeekEnd.getTime() - 6 * 24 * 60 * 60 * 1000));
      previousFromDate = startOfDay(new Date(fromDate.getTime() - 7 * 24 * 60 * 60 * 1000));
      previousToDate = endOfDay(new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000));
      break;

    case 'this_month':
      fromDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      toDate = endOfDay(now);
      previousFromDate = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      previousToDate = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      break;

    case 'last_month':
      fromDate = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      toDate = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      previousFromDate = startOfDay(new Date(now.getFullYear(), now.getMonth() - 2, 1));
      previousToDate = endOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 0));
      break;

    case 'this_quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      fromDate = startOfDay(new Date(now.getFullYear(), quarter * 3, 1));
      toDate = endOfDay(now);
      previousFromDate = startOfDay(new Date(now.getFullYear(), (quarter - 1) * 3, 1));
      previousToDate = endOfDay(new Date(now.getFullYear(), quarter * 3, 0));
      break;

    case 'last_quarter':
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      const yearForLastQuarter = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const adjustedLastQuarter = lastQuarter < 0 ? lastQuarter + 4 : lastQuarter;
      fromDate = startOfDay(new Date(yearForLastQuarter, adjustedLastQuarter * 3, 1));
      toDate = endOfDay(new Date(yearForLastQuarter, (adjustedLastQuarter + 1) * 3, 0));
      const prevQuarter = adjustedLastQuarter - 1;
      const yearForPrevQuarter = prevQuarter < 0 ? yearForLastQuarter - 1 : yearForLastQuarter;
      const adjustedPrevQuarter = prevQuarter < 0 ? prevQuarter + 4 : prevQuarter;
      previousFromDate = startOfDay(new Date(yearForPrevQuarter, adjustedPrevQuarter * 3, 1));
      previousToDate = endOfDay(new Date(yearForPrevQuarter, (adjustedPrevQuarter + 1) * 3, 0));
      break;

    case 'this_year':
      fromDate = startOfDay(new Date(now.getFullYear(), 0, 1));
      toDate = endOfDay(now);
      previousFromDate = startOfDay(new Date(now.getFullYear() - 1, 0, 1));
      previousToDate = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
      break;

    case 'last_year':
      fromDate = startOfDay(new Date(now.getFullYear() - 1, 0, 1));
      toDate = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
      previousFromDate = startOfDay(new Date(now.getFullYear() - 2, 0, 1));
      previousToDate = endOfDay(new Date(now.getFullYear() - 2, 11, 31));
      break;

    case 'custom':
    default:
      fromDate = customFromDate ? startOfDay(new Date(customFromDate)) : startOfDay(now);
      toDate = customToDate ? endOfDay(new Date(customToDate)) : endOfDay(now);
      const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000));
      previousFromDate = startOfDay(new Date(fromDate.getTime() - (daysDiff + 1) * 24 * 60 * 60 * 1000));
      previousToDate = endOfDay(new Date(toDate.getTime() - (daysDiff + 1) * 24 * 60 * 60 * 1000));
      break;
  }

  return { fromDate, toDate, previousFromDate, previousToDate };
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function calculateGrowthRate(current: number, previous: number): {
  value: number;
  percentage: number;
} {
  const change = current - previous;
  const percentage = calculatePercentageChange(current, previous);
  return { value: change, percentage };
}
