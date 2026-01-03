export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PARTIAL_RECEIVED = 'partial_received',
  FULLY_RECEIVED = 'fully_received',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export const PurchaseOrderStatusDescription = {
  [PurchaseOrderStatus.DRAFT]: {
    description: 'Draft - Purchase Order is being prepared',
    color: '#gray',
    allowedTransitions: [PurchaseOrderStatus.SENT, PurchaseOrderStatus.CANCELLED],
  },
  [PurchaseOrderStatus.SENT]: {
    description: 'Sent - Purchase Order sent to supplier',
    color: '#blue',
    allowedTransitions: [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.REJECTED, PurchaseOrderStatus.CANCELLED],
  },
  [PurchaseOrderStatus.APPROVED]: {
    description: 'Approved - Purchase Order approved by supplier',
    color: '#green',
    allowedTransitions: [PurchaseOrderStatus.PARTIAL_RECEIVED, PurchaseOrderStatus.FULLY_RECEIVED, PurchaseOrderStatus.CANCELLED],
  },
  [PurchaseOrderStatus.REJECTED]: {
    description: 'Rejected - Purchase Order rejected by supplier',
    color: '#red',
    allowedTransitions: [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.CANCELLED],
  },
  [PurchaseOrderStatus.PARTIAL_RECEIVED]: {
    description: 'Partial Received - Some items have been received',
    color: '#orange',
    allowedTransitions: [PurchaseOrderStatus.FULLY_RECEIVED, PurchaseOrderStatus.CLOSED],
  },
  [PurchaseOrderStatus.FULLY_RECEIVED]: {
    description: 'Fully Received - All items have been received',
    color: '#green',
    allowedTransitions: [PurchaseOrderStatus.CLOSED],
  },
  [PurchaseOrderStatus.CANCELLED]: {
    description: 'Cancelled - Purchase Order has been cancelled',
    color: '#red',
    allowedTransitions: [], // Final state
  },
  [PurchaseOrderStatus.CLOSED]: {
    description: 'Closed - Purchase Order completed and closed',
    color: '#purple',
    allowedTransitions: [], // Final state
  },
};

export const isPurchaseOrderStatusTransitionValid = (
  fromStatus: PurchaseOrderStatus,
  toStatus: PurchaseOrderStatus,
): boolean => {
  if (fromStatus === toStatus) return false;
  const allowedTransitions = PurchaseOrderStatusDescription[fromStatus].allowedTransitions;
  return allowedTransitions.includes(toStatus);
};