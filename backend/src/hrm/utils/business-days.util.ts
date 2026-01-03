/**
 * Calculate business days between two dates, excluding Friday and Saturday
 * This is a shared utility for HRM module (attendance and leave)
 */
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset time to midnight to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    return 0;
  }

  let businessDays = 0;
  const currentDay = new Date(start);

  while (currentDay <= end) {
    const dayOfWeek = currentDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday

    // Count only days that are not Friday (5) or Saturday (6)
    // Include: Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4)
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      businessDays++;
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return businessDays;
}

/**
 * Calculate total days between two dates (including all days)
 */
export function calculateTotalDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    return 0;
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  return diffDays;
}

/**
 * Check if a date is a weekend (Friday or Saturday)
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
}

/**
 * Get the next business day (excluding Friday and Saturday)
 */
export function getNextBusinessDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  while (isWeekend(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}

/**
 * Get the previous business day (excluding Friday and Saturday)
 */
export function getPreviousBusinessDay(date: Date): Date {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);

  while (isWeekend(prevDay)) {
    prevDay.setDate(prevDay.getDate() - 1);
  }

  return prevDay;
}