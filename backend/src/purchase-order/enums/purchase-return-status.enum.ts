export enum PurchaseReturnStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  CANCELLED = 'cancelled',
}

export const PurchaseReturnStatusDescription = {
  [PurchaseReturnStatus.DRAFT]: {
    description: 'Draft - Purchase return is being prepared',
    color: '#gray',
    allowedTransitions: [
      PurchaseReturnStatus.APPROVED,
      PurchaseReturnStatus.CANCELLED,
    ],
  },
  [PurchaseReturnStatus.APPROVED]: {
    description: 'Approved - Purchase return approved for processing',
    color: '#blue',
    allowedTransitions: [
      PurchaseReturnStatus.PROCESSED,
      PurchaseReturnStatus.CANCELLED,
    ],
  },
  [PurchaseReturnStatus.PROCESSED]: {
    description:
      'Processed - Purchase return has been processed and inventory updated',
    color: '#green',
    allowedTransitions: [], // Final state
  },
  [PurchaseReturnStatus.CANCELLED]: {
    description: 'Cancelled - Purchase return has been cancelled',
    color: '#red',
    allowedTransitions: [], // Final state
  },
};

export const isStatusTransitionValid = (
  fromStatus: PurchaseReturnStatus,
  toStatus: PurchaseReturnStatus,
): boolean => {
  if (fromStatus === toStatus) return false;
  const allowedTransitions =
    PurchaseReturnStatusDescription[fromStatus].allowedTransitions;
  return allowedTransitions.includes(toStatus);
};
