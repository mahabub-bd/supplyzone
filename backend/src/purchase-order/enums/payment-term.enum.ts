export enum PaymentTerm {
  IMMEDIATE = 'immediate',
  NET_7 = 'net_7',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  CUSTOM = 'custom',
}

export const PaymentTermDescription = {
  [PaymentTerm.IMMEDIATE]: 'Payment Due Immediately',
  [PaymentTerm.NET_7]: 'Payment Due in 7 Days',
  [PaymentTerm.NET_15]: 'Payment Due in 15 Days',
  [PaymentTerm.NET_30]: 'Payment Due in 30 Days',
  [PaymentTerm.NET_45]: 'Payment Due in 45 Days',
  [PaymentTerm.NET_60]: 'Payment Due in 60 Days',
  [PaymentTerm.NET_90]: 'Payment Due in 90 Days',
  [PaymentTerm.CUSTOM]: 'Custom Payment Terms',
};