export const statusDefinitions = {
  contact: [
    { key: "new", label: "New", statuses: ["new"] },
    { key: "contacted", label: "Contacted", statuses: ["contacted"] },
    { key: "accepted", label: "Accepted", statuses: ["accepted"] },
    { key: "in_progress", label: "In progress", statuses: ["in_progress"] },
    { key: "completed", label: "Completed", statuses: ["completed", "resolved"] },
    { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
  ],
  purchase: [
    { key: "pending", label: "Pending", statuses: ["pending"] },
    { key: "contacted", label: "Contacted (legacy)", statuses: ["contacted"] },
    { key: "accepted", label: "Accepted", statuses: ["accepted"] },
    { key: "in_progress", label: "In progress", statuses: ["in_progress"] },
    { key: "completed", label: "Completed", statuses: ["completed"] },
    { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
  ],
};

const openStatuses = {
  contact: new Set(["new", "contacted", "accepted", "in_progress"]),
  purchase: new Set(["pending", "contacted", "accepted", "in_progress"]),
};

export const recordStatus = (type, record) => record.status || (type === "contact" ? "new" : "pending");

export function getRequestBucket(type, status) {
  const normalizedStatus = status || (type === "contact" ? "new" : "pending");
  if (openStatuses[type].has(normalizedStatus)) return "open";
  if (normalizedStatus === "completed" || (type === "contact" && normalizedStatus === "resolved")) return "completed";
  if (normalizedStatus === "cancelled") return "cancelled";
  return "other";
}

export const countBucket = (records, type, bucket) => records.filter((record) => getRequestBucket(type, recordStatus(type, record)) === bucket).length;
export const allStatusValues = (type) => new Set(statusDefinitions[type].flatMap(({ statuses }) => statuses));

export function statusFilterValues(type) {
  return [...new Set(statusDefinitions[type]
    .flatMap(({ statuses }) => statuses)
    .filter((status) => status !== "resolved" && !(type === "purchase" && status === "contacted")))];
}

export const matchesStatusFilter = (record, type, filter) => filter === "all"
  || filter === "completed" && getRequestBucket(type, recordStatus(type, record)) === "completed"
  || filter === "open" && getRequestBucket(type, recordStatus(type, record)) === "open"
  || filter === "other" && getRequestBucket(type, recordStatus(type, record)) === "other"
  || recordStatus(type, record) === filter;

export function parseAmount(value) {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function sumRequestedPlanValue(purchases, knownPlanNames) {
  const knownPlans = new Set(knownPlanNames);
  return purchases.reduce((summary, record) => {
    if (recordStatus("purchase", record) === "cancelled") {
      summary.excludedCancelled += 1;
      return summary;
    }
    const amount = parseAmount(record.amount);
    if (!knownPlans.has(record.plan) || amount === null) {
      summary.excludedUnknownOrInvalid += 1;
      return summary;
    }
    summary.total += amount;
    summary.included += 1;
    return summary;
  }, { total: 0, included: 0, excludedCancelled: 0, excludedUnknownOrInvalid: 0 });
}

function csvCell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function recordsToCsv(records, type) {
  const columns = type === "purchase"
    ? [["ID", "id"], ["Name", "name"], ["Email", "email"], ["Phone", "phone"], ["Plan", "plan"], ["Plan fee", "amount"], ["Status", "status"], ["Submitted", "created_at"], ["Requirements", "requirements"]]
    : [["ID", "id"], ["Name", "name"], ["Email", "email"], ["Phone", "phone"], ["Service", "service"], ["Status", "status"], ["Submitted", "created_at"], ["Message", "message"]];
  return [columns.map(([label]) => csvCell(label)).join(","), ...records.map((record) => columns.map(([, key]) => csvCell(record[key])).join(","))].join("\r\n");
}
