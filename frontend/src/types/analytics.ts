export interface DailySale {
  date: string;
  total: number;
  orders: number;
}

export interface Last30DaysAnalytics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  dailySales: DailySale[];
}

export interface MonthlySale {
  month: number;
  monthName: string;
  total: number;
  orders: number;
}

export interface MonthWiseAnalytics {
  year: number;
  monthlySales: MonthlySale[];
  totalYearlySales: number;
  totalYearlyOrders: number;
}