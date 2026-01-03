/**
 * Test script to verify business days calculation (excluding Friday and Saturday)
 */
import { calculateBusinessDays, isWeekend } from './business-days.util';

// Test cases for business days calculation
function testBusinessDaysCalculation() {
  console.log('Testing Business Days Calculation (excluding Friday and Saturday)');
  console.log('================================================================');

  // Test Case 1: Week days only
  const startDate1 = new Date('2025-01-05'); // Sunday
  const endDate1 = new Date('2025-01-09');   // Thursday
  const result1 = calculateBusinessDays(startDate1, endDate1);
  console.log(`Test 1 - ${startDate1.toDateString()} to ${endDate1.toDateString()}: ${result1} business days (Expected: 5)`);

  // Test Case 2: Including weekend (Friday and Saturday)
  const startDate2 = new Date('2025-01-05'); // Sunday
  const endDate2 = new Date('2025-01-11');   // Saturday
  const result2 = calculateBusinessDays(startDate2, endDate2);
  console.log(`Test 2 - ${startDate2.toDateString()} to ${endDate2.toDateString()}: ${result2} business days (Expected: 5)`);

  // Test Case 3: Only weekend days
  const startDate3 = new Date('2025-01-10'); // Friday
  const endDate3 = new Date('2025-01-11');   // Saturday
  const result3 = calculateBusinessDays(startDate3, endDate3);
  console.log(`Test 3 - ${startDate3.toDateString()} to ${endDate3.toDateString()}: ${result3} business days (Expected: 0)`);

  // Test Case 4: Single day - weekday
  const startDate4 = new Date('2025-01-06'); // Monday
  const endDate4 = new Date('2025-01-06');   // Monday
  const result4 = calculateBusinessDays(startDate4, endDate4);
  console.log(`Test 4 - ${startDate4.toDateString()}: ${result4} business days (Expected: 1)`);

  // Test Case 5: Single day - Friday
  const startDate5 = new Date('2025-01-10'); // Friday
  const endDate5 = new Date('2025-01-10');   // Friday
  const result5 = calculateBusinessDays(startDate5, endDate5);
  console.log(`Test 5 - ${startDate5.toDateString()}: ${result5} business days (Expected: 0)`);
}

// Test weekend detection
function testWeekendDetection() {
  console.log('\nTesting Weekend Detection');
  console.log('========================');

  const testDates = [
    { date: new Date('2025-01-05'), expected: false, name: 'Sunday' },    // Should be business day
    { date: new Date('2025-01-06'), expected: false, name: 'Monday' },    // Should be business day
    { date: new Date('2025-01-07'), expected: false, name: 'Tuesday' },   // Should be business day
    { date: new Date('2025-01-08'), expected: false, name: 'Wednesday' }, // Should be business day
    { date: new Date('2025-01-09'), expected: false, name: 'Thursday' },  // Should be business day
    { date: new Date('2025-01-10'), expected: true, name: 'Friday' },     // Should be weekend
    { date: new Date('2025-01-11'), expected: true, name: 'Saturday' },   // Should be weekend
  ];

  testDates.forEach(({ date, expected, name }) => {
    const result = isWeekend(date);
    const status = result === expected ? '✓' : '✗';
    console.log(`${status} ${name} (${date.toDateString()}): ${result ? 'Weekend' : 'Business Day'} ${result === expected ? '(Correct)' : '(Wrong - Expected ' + (expected ? 'Weekend' : 'Business Day') + ')'}`);
  });
}

// Example for leave request calculation
function exampleLeaveCalculation() {
  console.log('\nExample Leave Request Calculation');
  console.log('==================================');

  const leaveStart = new Date('2025-01-05'); // Sunday
  const leaveEnd = new Date('2025-01-15');   // Wednesday

  const businessDays = calculateBusinessDays(leaveStart, leaveEnd);

  console.log(`Leave period: ${leaveStart.toDateString()} to ${leaveEnd.toDateString()}`);
  console.log(`Total calendar days: ${Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1}`);
  console.log(`Business days (excluding Fri-Sat): ${businessDays}`);
  console.log(`This employee would be charged ${businessDays} leave days`);
}

// Run all tests
if (require.main === module) {
  testBusinessDaysCalculation();
  testWeekendDetection();
  exampleLeaveCalculation();
}

export { testBusinessDaysCalculation, testWeekendDetection, exampleLeaveCalculation };