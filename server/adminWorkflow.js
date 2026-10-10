export const adminStatuses = {
  contacts: new Set(["new", "contacted", "accepted", "in_progress", "completed", "cancelled", "resolved"]),
  purchases: new Set(["pending", "contacted", "accepted", "in_progress", "completed", "cancelled"]),
};

export const adminStatusTransitions = {
  contacts: {
    new: new Set(["accepted", "cancelled"]),
    contacted: new Set(["accepted", "cancelled"]),
    accepted: new Set(["in_progress", "cancelled"]),
    in_progress: new Set(["completed", "cancelled"]),
    completed: new Set(),
    resolved: new Set(),
    cancelled: new Set(),
  },
  purchases: {
    pending: new Set(["accepted", "cancelled"]),
    contacted: new Set(["accepted", "cancelled"]),
    accepted: new Set(["in_progress", "cancelled"]),
    in_progress: new Set(["completed", "cancelled"]),
    completed: new Set(),
    cancelled: new Set(),
  },
};

export function isValidAdminStatus(type, status) {
  return Boolean(adminStatuses[type]?.has(status));
}

export function canTransitionAdminStatus(type, currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  return isValidAdminStatus(type, nextStatus) && Boolean(adminStatusTransitions[type]?.[currentStatus]?.has(nextStatus));
}
