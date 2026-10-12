import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowDownUp, BarChart3, Check, ChevronLeft, ChevronRight, ClipboardList, Download, ExternalLink, FileText, IndianRupee, LoaderCircle, LogOut, Mail, MessageCircle, Phone, RefreshCw, Search, Trash2, Users } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { deleteApiRequest, getApiRequest, patchApiRequest, postApiRequest } from "../lib/api";
import { allStatusValues, countBucket, matchesStatusFilter, parseAmount, recordStatus, recordsToCsv, statusDefinitions, statusFilterValues, sumRequestedPlanValue } from "../lib/adminData";
import { phoneLinkNumber } from "../../shared/phone.js";
import { plans } from "../data/plans";
import { useToast } from "../components/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";
import "./AdminPage.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
const statusLabel = (status) => status === "resolved" ? "Completed" : (status || "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
function downloadCsv(records, type) {
  const csv = recordsToCsv(records, type);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `taxello-${type}-requests-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
const parseDate = (value) => {
  if (!value || typeof value !== "string") return null;
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const formatDate = (value) => {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "Date unavailable";
};
const isOverdue = (record) => {
  const open = record.status === "new" || record.status === "pending";
  const submitted = parseDate(record.created_at);
  return open && submitted && Date.now() - submitted.getTime() > 24 * 60 * 60 * 1000;
};

function MetricGroup({ title, records, kind, onMetricClick }) {
  const metrics = [
    { label: kind === "contact" ? "Total enquiries" : "Total requests", value: records.length, icon: kind === "contact" ? Users : ClipboardList, filter: "all" },
    { label: "Open", value: countBucket(records, kind, "open"), icon: Mail, filter: "open" },
    { label: "Completed", value: countBucket(records, kind, "completed"), icon: Check, filter: "completed" },
    { label: "Cancelled", value: countBucket(records, kind, "cancelled"), icon: AlertCircle, filter: "cancelled" },
  ];
  const otherCount = countBucket(records, kind, "other");
  if (otherCount) metrics.push({ label: "Other", value: otherCount, icon: BarChart3, filter: "other" });
  const requestedValue = kind === "purchase" ? sumRequestedPlanValue(records, plans.map((plan) => plan.name)) : null;
  return <section className={`tax-admin-metric-group tax-admin-metric-${kind}`} aria-label={title}>
    <h2 className={`tax-admin-heading-pill ${kind === "contact" ? "pill-enquiries" : "pill-purchases"}`}>{title}</h2>
    <div className="tax-admin-metrics">{metrics.map(({ label, value, icon: Icon, filter }) => <button className="tax-admin-metric" type="button" key={label} onClick={() => onMetricClick(kind, filter)} aria-label={`Show ${filter === "all" ? "all" : label.toLowerCase()} ${kind === "contact" ? "contact enquiries" : "purchase requests"}`}>
      <span className="tax-admin-metric-icon"><Icon size={16} aria-hidden="true" /></span><span className="tax-admin-metric-label">{label}</span><strong>{value}</strong>
    </button>)}</div>
    {requestedValue && <div className="tax-admin-requested-value"><span><IndianRupee size={14} aria-hidden="true" />Total requested plan value</span><strong>{currencyFormatter.format(requestedValue.total)}</strong><small>Known plans with valid stored amounts; cancelled, unknown, or invalid-value requests are excluded. This is not revenue.</small></div>}
  </section>;
}

function StatusBreakdown({ title, records, type, onStatusClick }) {
  const knownStatuses = allStatusValues(type);
  const counts = statusDefinitions[type].map(({ key, label, statuses }) => ({
    key,
    label,
    count: records.filter((record) => statuses.includes(recordStatus(type, record))).length,
  }));
  const otherCount = records.filter((record) => !knownStatuses.has(recordStatus(type, record))).length;
  if (otherCount) counts.push({ key: "other", label: "Other", count: otherCount });
  const accessibleSummary = counts.map(({ label, count }) => `${label}: ${count}`).join(", ");
  const nonzeroCounts = counts.filter(({ count }) => count > 0);
  return <section className="tax-admin-visual-card" aria-label={`${title} by status`}>
    <header><div><span className="tax-admin-eyebrow">STATUS BREAKDOWN</span><h3 className="tax-admin-heading-pill pill-analytics">{title}</h3></div><strong>{records.length} total</strong></header>
    <p className="tax-admin-chart-summary">Records by current status: {accessibleSummary}.</p>
    {records.length ? <div className="tax-admin-segmented-bar" role="img" aria-label={accessibleSummary}>{nonzeroCounts.map(({ key, label, count }) => <span key={key} className={`segment-${key}`} style={{ flexGrow: count }} title={`${label}: ${count}`} />)}</div>
      : <p className="tax-admin-chart-empty">No {type === "contact" ? "enquiry" : "purchase request"} data yet.</p>}
    {Boolean(records.length) && <ul className="tax-admin-status-legend">{counts.map(({ key, label, count }) => <li key={key}><button type="button" onClick={() => onStatusClick(type, key === "completed" ? "completed" : type === "purchase" && key === "contacted" ? "open" : key)} aria-label={`Show ${count} ${label.toLowerCase()} ${type === "contact" ? "contact enquiries" : "purchase requests"}`}><span className={`legend-dot segment-${key}`} aria-hidden="true" />{label}<strong>{count}</strong></button></li>)}</ul>}
  </section>;
}

function RecentSubmissions({ contacts, purchases }) {
  const recent = [
    ...contacts.map((record) => ({ ...record, kind: "contact", summary: record.service || "Service not specified" })),
    ...purchases.map((record) => ({ ...record, kind: "purchase", summary: record.plan || "Plan not specified" })),
  ].map((record) => ({ ...record, parsedDate: parseDate(record.created_at) }))
    .filter((record) => record.parsedDate)
    .sort((a, b) => b.parsedDate - a.parsedDate)
    .slice(0, 6);
  return <section className="tax-admin-visual-card tax-admin-recent-card">
    <header><div><span className="tax-admin-eyebrow">LATEST ACTIVITY</span><h3 className="tax-admin-heading-pill pill-overview">Recent submissions</h3></div><span>Newest first</span></header>
    {recent.length ? <ul className="tax-admin-recent-list">{recent.map((record) => <li key={`${record.kind}-${record.id}`}>
      <Link to={`/admin/${record.kind === "contact" ? "enquiries" : "purchases"}?record=${encodeURIComponent(record.id)}`} className="tax-admin-recent-link" aria-label={`Open ${record.kind === "contact" ? "contact enquiry" : "purchase request"} ${record.id}`}><span className={`tax-admin-recent-type type-${record.kind}`}>{record.kind === "contact" ? "Contact" : "Purchase"}</span><div className="tax-admin-recent-info"><strong>{record.name || "Name unavailable"}</strong><span>{record.summary}</span></div><time dateTime={record.parsedDate.toISOString()}>{formatDate(record.created_at)}</time></Link>
    </li>)}</ul> : <p className="tax-admin-chart-empty">No dated submissions are available yet.</p>}
  </section>;
}

function LastUpdated({ value, loading }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer); };
  }, []);
  if (!value) return <span className="tax-admin-last-updated">{loading ? "Updating…" : "Not updated"}</span>;
  const elapsedMinutes = Math.max(0, Math.floor((now - value) / 60_000));
  const label = elapsedMinutes < 1 ? "Updated just now" : `Updated ${elapsedMinutes} min ago`;
  return <time className="tax-admin-last-updated" dateTime={new Date(value).toISOString()} title={new Date(value).toLocaleString()}>{label}</time>;
}

function RecordCard({ record, type, onStatusChange, onSaveNote, onDelete, busyNoteId, busyRequestId, operationFeedback }) {
  const isPurchase = type === "purchase";
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(null);
  const reduceMotion = useReducedMotion();
  const disclosureTransition = reduceMotion ? { duration: 0.01 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] };
  const persistedNote = record.admin_note || "";
  const note = noteDraft?.source === persistedNote ? noteDraft.value : persistedNote;
  const currentStatus = record.status || (isPurchase ? "pending" : "new");
  const details = isPurchase
    ? [["Phone", record.phone || "Not provided"], ["Requirements", record.requirements || "None provided"]]
    : [["Phone", record.phone || "Not provided"], ["Message", record.message || "No message provided"]];
  const overdue = isOverdue(record);
  const canAccept = isPurchase ? ["pending", "contacted"].includes(currentStatus) : ["new", "contacted"].includes(currentStatus);
  const canStart = currentStatus === "accepted";
  const canComplete = currentStatus === "in_progress";
  const canCancel = ["new", "pending", "contacted", "accepted", "in_progress"].includes(currentStatus);
  const noteBusy = busyNoteId === `${type}-${record.id}`;
  const requestBusy = busyRequestId === `${type}-${record.id}`;
  const normalizedPhone = phoneLinkNumber(record.phone);

  return <article className="tax-admin-record" id={`tax-admin-${type}-${record.id}`} tabIndex={-1}>
    <div className="tax-admin-record-main">
      <div className="tax-admin-record-person"><h3>{record.name || "Name unavailable"}</h3>{record.email && <a href={`mailto:${record.email}`}>{record.email}</a>}{normalizedPhone && <div className="tax-admin-contact-links"><a href={`tel:+${normalizedPhone}`} aria-label={`Call ${record.name || "request contact"} at ${record.phone}`}><Phone size={13} aria-hidden="true" />{record.phone}</a><a href={`https://wa.me/${normalizedPhone}`} target="_blank" rel="noopener noreferrer" aria-label={`Message ${record.name || "request contact"} on WhatsApp`}><MessageCircle size={13} aria-hidden="true" />WhatsApp</a></div>}</div>
      <span className={`tax-admin-status status-${currentStatus}`} aria-label={`Status: ${statusLabel(currentStatus)}`}>{statusLabel(currentStatus)}</span>
      {overdue && <span className="tax-admin-overdue" title="This request was submitted more than 24 hours ago while still new or pending"><AlertCircle size={14} />Waiting over 24 hours</span>}
    </div>
    <div className="tax-admin-record-meta">
      <div><span>{isPurchase ? "Selected plan" : "Requested service"}</span><strong>{isPurchase ? record.plan : (record.service || "Not specified")}</strong></div>
      {isPurchase && <div><span>Plan fee</span><strong>{parseAmount(record.amount) === null ? "Not available" : currencyFormatter.format(parseAmount(record.amount))}</strong></div>}
      <div><span>Submitted</span><strong>{formatDate(record.created_at)}</strong></div>
    </div>
    <div className="tax-admin-record-actions" aria-label="Request actions">
      {canAccept && <button type="button" className="tax-admin-button tax-admin-button-primary" aria-busy={requestBusy} onClick={() => onStatusChange(record, type, "accepted")} disabled={requestBusy}>{requestBusy ? <><LoaderCircle className="tax-admin-action-spinner" size={14} aria-hidden="true" />Saving status…</> : "Accept request"}</button>}
      {canStart && <button type="button" className="tax-admin-button tax-admin-button-primary" aria-busy={requestBusy} onClick={() => onStatusChange(record, type, "in_progress")} disabled={requestBusy}>{requestBusy ? <><LoaderCircle className="tax-admin-action-spinner" size={14} aria-hidden="true" />Saving status…</> : "Start work"}</button>}
      {canComplete && <button type="button" className="tax-admin-button tax-admin-button-primary" aria-busy={requestBusy} onClick={() => onStatusChange(record, type, "completed")} disabled={requestBusy}>{requestBusy ? <><LoaderCircle className="tax-admin-action-spinner" size={14} aria-hidden="true" />Saving status…</> : "Mark completed"}</button>}
      {canCancel && <button type="button" className="tax-admin-button tax-admin-button-muted tax-admin-button-ghost" aria-busy={requestBusy} onClick={() => onStatusChange(record, type, "cancelled")} disabled={requestBusy}>{requestBusy ? <><LoaderCircle className="tax-admin-action-spinner" size={14} aria-hidden="true" />Saving status…</> : "Cancel request"}</button>}
      <div className="tax-admin-details">
        <button type="button" className="tax-admin-disclosure-trigger" aria-expanded={detailsOpen} aria-controls={`details-${type}-${record.id}`} onClick={() => setDetailsOpen((open) => !open)}>View details</button>
        <AnimatePresence initial={false}>{detailsOpen && <motion.div id={`details-${type}-${record.id}`} key="details" className="tax-admin-details-content" initial={{ height: 0, opacity: 0, y: -4 }} animate={{ height: "auto", opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -4 }} transition={disclosureTransition} style={{ overflow: "hidden" }}><div className="tax-admin-detail-body">{details.map(([label, value]) => <div key={label}><span>{label}</span><p>{value}</p></div>)}</div></motion.div>}</AnimatePresence>
      </div>
      <div className="tax-admin-note-details">
        <button type="button" className="tax-admin-disclosure-trigger" aria-expanded={noteOpen} aria-controls={`note-content-${type}-${record.id}`} onClick={() => setNoteOpen((open) => !open)}><FileText size={15} />{record.admin_note ? "View note" : "Add note"}</button>
        <AnimatePresence initial={false}>{noteOpen && <motion.div id={`note-content-${type}-${record.id}`} key="note" className="tax-admin-note-content" initial={{ height: 0, opacity: 0, y: -4 }} animate={{ height: "auto", opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -4 }} transition={disclosureTransition} style={{ overflow: "hidden" }}><div className="tax-admin-note-editor"><label htmlFor={`note-${type}-${record.id}`}>Internal note</label><textarea id={`note-${type}-${record.id}`} rows="3" maxLength="2000" value={note} onChange={(event) => setNoteDraft({ source: persistedNote, value: event.target.value })} placeholder="Private follow-up note" />
          <button type="button" className="tax-admin-button tax-admin-button-primary" onClick={() => onSaveNote(record, type, note)} disabled={noteBusy}>{noteBusy ? "Saving…" : "Save note"}</button>
        </div></motion.div>}</AnimatePresence>
      </div>
      <button type="button" className="tax-admin-icon-button tax-admin-delete" aria-label={requestBusy ? "Deleting record" : `Permanently delete ${isPurchase ? "purchase request" : "contact enquiry"}`} title={requestBusy ? "Deleting record" : "Permanently delete"} disabled={requestBusy} onClick={() => onDelete(record, type)}><Trash2 size={16} /></button>
    </div>
    {operationFeedback && <p className={`tax-admin-action-feedback ${operationFeedback.type}`} role={operationFeedback.type === "error" ? "alert" : "status"}>{operationFeedback.message}</p>}
  </article>;
}

function RecordsPanel({ title, records, type, active, onStatusChange, onSaveNote, onDelete, busyNoteId, busyRequestId, operationFeedback }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [pagination, setPagination] = useState({ key: "", page: 1 });
  const statuses = statusFilterValues(type);
  const recordParam = new URLSearchParams(location.search).get("record");
  const selectedRecordId = recordParam && /^\d+$/.test(recordParam) ? Number(recordParam) : null;
  const statusParam = new URLSearchParams(location.search).get("status");
  const validFilters = new Set(["all", "open", "completed", "cancelled", "other", ...statuses]);
  const status = active && validFilters.has(statusParam) ? statusParam : "all";
  const visibleQuery = selectedRecordId ? String(selectedRecordId) : query;
  const filterKey = `${visibleQuery}\u0000${status}\u0000${sort}`;
  const page = pagination.key === filterKey ? pagination.page : 1;
  const setPage = (nextPage) => setPagination({ key: filterKey, page: typeof nextPage === "function" ? nextPage(page) : nextPage });
  const filtered = useMemo(() => {
    const normalizedQuery = visibleQuery.trim().toLowerCase();
    const matching = records.filter((record) => {
      const fields = type === "purchase"
        ? [record.id, record.name, record.email, record.phone, record.plan, record.requirements]
        : [record.id, record.name, record.email, record.phone, record.service, record.message];
      const statusMatches = matchesStatusFilter(record, type, status);
      const matchesRecordLink = selectedRecordId ? Number(record.id) === selectedRecordId : fields.filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
      return statusMatches && matchesRecordLink;
    });
    const timestamp = (record) => parseDate(record.created_at)?.getTime() ?? null;
    return matching.toSorted((a, b) => {
      if (sort === "amount-low" || sort === "amount-high") {
        const amountA = parseAmount(a.amount);
        const amountB = parseAmount(b.amount);
        if (amountA === null && amountB !== null) return 1;
        if (amountB === null && amountA !== null) return -1;
        if (amountA !== null && amountB !== null && amountA !== amountB) return sort === "amount-low" ? amountA - amountB : amountB - amountA;
      }
      const dateA = timestamp(a);
      const dateB = timestamp(b);
      if (dateA === null && dateB !== null) return 1;
      if (dateB === null && dateA !== null) return -1;
      return dateA === null || dateB === null ? 0 : sort === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }, [records, visibleQuery, selectedRecordId, status, sort, type]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRecords = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  useEffect(() => {
    if (!active || !selectedRecordId || !filtered.some((record) => Number(record.id) === selectedRecordId)) return;
    const target = document.getElementById(`tax-admin-${type}-${selectedRecordId}`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.focus({ preventScroll: true });
  }, [active, filtered, selectedRecordId, type]);
  const start = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const end = Math.min(safePage * pageSize, filtered.length);
  const updateQuery = (value) => {
    setQuery(value);
    setPagination({ key: "", page: 1 });
    if (selectedRecordId) {
      const search = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
      navigate(`${location.pathname}${search}`, { replace: true });
    }
  };
  const updateStatus = (value) => {
    const search = value === "all" ? "" : `?status=${encodeURIComponent(value)}`;
    navigate(`${location.pathname}${search}`, { replace: true });
  };
  const updateSort = (value) => { setSort(value); setPagination({ key: "", page: 1 }); };
  const hasActiveFilter = query.trim() !== "" || status !== "all";
  const selectedRecordMissing = selectedRecordId && !records.some((record) => Number(record.id) === selectedRecordId);

  return <section className={`tax-admin-panel tax-admin-panel-${type}`} aria-label={title}>
    <header className="tax-admin-panel-heading"><div><span className="tax-admin-eyebrow">REQUEST MANAGEMENT</span><h2 className={`tax-admin-heading-pill ${type === "contact" ? "pill-enquiries" : "pill-purchases"}`}>{title}</h2></div><span className="tax-admin-count">{filtered.length} {hasActiveFilter ? "matching" : "total requests"}</span></header>
    <div className="tax-admin-controls">
      <label className="tax-admin-search"><Search size={16} aria-hidden="true" /><input value={visibleQuery} onChange={(event) => updateQuery(event.target.value)} placeholder={type === "purchase" ? "Search name, email or plan" : "Search name, email or service"} aria-label={`Search ${title}`} /></label>
      <label className="tax-admin-field"><span>Status</span><select value={status} onChange={(event) => updateStatus(event.target.value)}><option value="all">All statuses</option><option value="open">Open</option><option value="other">Other</option>{statuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select></label>
      <label className="tax-admin-field tax-admin-sort"><span><ArrowDownUp size={14} />Sort</span><select value={sort} onChange={(event) => updateSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option>{type === "purchase" && <><option value="amount-low">Amount: low to high</option><option value="amount-high">Amount: high to low</option></>}</select></label>
    </div>
    {pageRecords.length ? <div className="tax-admin-record-list">{pageRecords.map((record) => <RecordCard key={record.id} record={record} type={type} onStatusChange={onStatusChange} onSaveNote={onSaveNote} onDelete={onDelete} busyNoteId={busyNoteId} busyRequestId={busyRequestId} operationFeedback={operationFeedback[`${type}-${record.id}`]} />)}</div>
      : <div className="tax-admin-empty"><span><Search size={19} /></span><h3>{selectedRecordMissing ? "This request is no longer available" : records.length ? "No matching requests" : `No ${type === "purchase" ? "purchase requests" : "contact enquiries"} yet`}</h3><p>{selectedRecordMissing ? "It may have been deleted. You can return to the full request list." : records.length ? "Try adjusting the search or status filter." : "New submissions will appear here."}</p>{selectedRecordMissing && <button className="tax-admin-button tax-admin-button-muted" type="button" onClick={() => { setQuery(""); navigate(location.pathname, { replace: true }); }}>Show all requests</button>}</div>}
    <footer className="tax-admin-pagination"><span>Showing {start}–{end} of {filtered.length}</span><div><button type="button" className="tax-admin-icon-button" aria-label="Previous page" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={17} /></button><span>Page {safePage} of {pageCount}</span><button type="button" className="tax-admin-icon-button" aria-label="Next page" disabled={safePage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRight size={17} /></button></div></footer>
  </section>;
}

function AdminDashboard({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const actionInProgress = useRef(false);
  const [busyNoteId, setBusyNoteId] = useState(null);
  const [operationFeedback, setOperationFeedback] = useState({});
  const { showToast } = useToast();
  const currentPath = location.pathname.replace(/\/+$/, "");
  const view = currentPath.endsWith("/enquiries") ? "contacts" : currentPath.endsWith("/purchases") ? "purchases" : "dashboard";
  const contacts = data?.contacts ?? [];
  const purchases = data?.purchases ?? [];
  const loading = data === null && !error;

  const fetchAdminData = useCallback(async () => {
    const [contactResult, purchaseResult] = await Promise.all([getApiRequest("/api/admin/contacts"), getApiRequest("/api/admin/purchases")]);
    return { contacts: Array.isArray(contactResult.contacts) ? contactResult.contacts : [], purchases: Array.isArray(purchaseResult.purchases) ? purchaseResult.purchases : [] };
  }, []);
  const loadAdminData = useCallback(async (showFeedback = false) => {
    setRefreshing(true);
    setError("");
    try {
      setData(await fetchAdminData());
      setLastUpdated(Date.now());
      if (showFeedback) showToast("Dashboard data refreshed", "success");
      return true;
    } catch (requestError) {
      setError(requestError.message || "The latest records could not be loaded.");
      if (showFeedback) showToast("Could not refresh the dashboard. Please try again.", "error");
      return false;
    } finally { setRefreshing(false); }
  }, [fetchAdminData, showToast]);
  useEffect(() => {
    let current = true;
    fetchAdminData().then((result) => { if (current) { setData(result); setLastUpdated(Date.now()); } }).catch((requestError) => {
      if (current) setError(requestError.message || "The latest records could not be loaded.");
    });
    return () => { current = false; };
  }, [fetchAdminData]);

  const openMetric = (type, filter) => {
    const path = type === "contact" ? "/admin/enquiries" : "/admin/purchases";
    navigate(filter === "all" ? path : `${path}?status=${encodeURIComponent(filter)}`);
  };

  const confirmStatusChange = (record, type, status) => {
    setOperationFeedback((current) => ({ ...current, [`${type}-${record.id}`]: null }));
    const action = { accepted: "Accept request", in_progress: "Start work", completed: "Mark completed", cancelled: "Cancel request" }[status];
    const noun = type === "contact" ? "enquiry" : "purchase request";
    setConfirmation({ kind: "status", record, type, status, title: status === "cancelled" ? "Cancel this request?" : `${action}?`, message: status === "cancelled" ? `The ${noun} will be retained with Cancelled status.` : `Save this ${noun} as ${statusLabel(status)}?`, confirmLabel: action, busyLabel: "Saving status…", danger: status === "cancelled" });
  };
  const confirmDelete = (record, type) => setConfirmation({ kind: "delete", record, type, title: "Delete record?", message: type === "purchase" ? "Are you sure you want to delete this purchase record?" : "Are you sure you want to delete this contact enquiry?", confirmLabel: "Delete", busyLabel: "Deleting record…", danger: true });
  const replaceRecord = (type, record) => {
    const key = type === "contact" ? "contacts" : "purchases";
    setData((current) => current && ({ ...current, [key]: current[key].map((item) => item.id === record.id ? record : item) }));
  };
  const removeRecord = (type, id) => {
    const key = type === "contact" ? "contacts" : "purchases";
    setData((current) => current && ({ ...current, [key]: current[key].filter((item) => item.id !== id) }));
  };
  async function executeConfirmation() {
    if (!confirmation || actionInProgress.current) return;
    actionInProgress.current = true;
    const action = confirmation;
    setConfirmation({ ...action, busy: true });
    try {
      if (action.kind === "logout") await onLogout();
      if (action.kind === "delete") {
        const plural = action.type === "contact" ? "contacts" : "purchases";
        await deleteApiRequest(`/api/admin/${plural}/${action.record.id}`);
        removeRecord(action.type, action.record.id);
        setLastUpdated(Date.now());
        showToast(action.type === "contact" ? "Enquiry deleted" : "Purchase request deleted", "success");
      }
      if (action.kind === "status") {
        const plural = action.type === "contact" ? "contacts" : "purchases";
        const result = await patchApiRequest(`/api/admin/${plural}/${action.record.id}`, { status: action.status, adminNote: action.record.admin_note || "" });
        if (!result.record) throw new Error("The updated request was not returned by the server.");
        replaceRecord(action.type, result.record);
        setLastUpdated(Date.now());
        setOperationFeedback((current) => ({ ...current, [`${action.type}-${action.record.id}`]: { type: "success", message: `Status updated to ${statusLabel(result.record.status)}.` } }));
        showToast("Request status updated", "success");
      }
      setConfirmation(null);
    } catch (requestError) {
      if (action.kind === "status") {
        setOperationFeedback((current) => ({ ...current, [`${action.type}-${action.record.id}`]: { type: "error", message: requestError.message || "Status update failed. Please try again." } }));
      }
      showToast(requestError.message || "Something went wrong. Please try again.", "error");
      setConfirmation({ ...action, busy: false });
    } finally {
      actionInProgress.current = false;
    }
  }
  async function saveNote(record, type, adminNote) {
    const noteId = `${type}-${record.id}`;
    setBusyNoteId(noteId);
    try {
      const plural = type === "contact" ? "contacts" : "purchases";
      const result = await patchApiRequest(`/api/admin/${plural}/${record.id}`, { status: record.status || (type === "contact" ? "new" : "pending"), adminNote });
      if (!result.record) throw new Error("The updated request was not returned by the server.");
      replaceRecord(type, result.record);
      setLastUpdated(Date.now());
      showToast("Internal note saved", "success");
    } catch (requestError) { showToast(requestError.message || "Could not save the note. Please try again.", "error"); }
    finally { setBusyNoteId(null); }
  }

  return <div className="tax-admin-shell">
    <aside className="tax-admin-sidebar" aria-label="Admin navigation">
      <div className="tax-admin-brand" aria-label="TAXELLO Admin Dashboard"><span className="tax-admin-brand-mark" aria-hidden="true">T</span><span><strong>TAXELLO</strong><small>ADMIN WORKSPACE</small></span></div>
      <span className="tax-admin-nav-label">WORKSPACE</span>
      <nav className="tax-admin-nav">
        <NavLink to="/admin" end className={({ isActive }) => `tax-admin-nav-item tax-admin-nav-overview${isActive ? " active" : ""}`}><BarChart3 size={17} />Dashboard</NavLink>
        <NavLink to="/admin/enquiries" className={({ isActive }) => `tax-admin-nav-item tax-admin-nav-enquiries${isActive ? " active" : ""}`}><Mail size={17} />Contact Enquiries</NavLink>
        <NavLink to="/admin/purchases" className={({ isActive }) => `tax-admin-nav-item tax-admin-nav-purchases${isActive ? " active" : ""}`}><ClipboardList size={17} />Purchase Requests</NavLink>
      </nav>
      <div className="tax-admin-sidebar-bottom"><div className="tax-admin-profile"><span className="tax-admin-profile-avatar" aria-hidden="true">A</span><strong>Administrator</strong></div><a href={window.location.origin} target="_blank" rel="noopener noreferrer" className="tax-admin-nav-item"><ExternalLink size={16} />View Website</a><button type="button" className="tax-admin-nav-item tax-admin-logout" onClick={() => setConfirmation({ kind: "logout", title: "Log out of the workspace?", message: "Your admin session will end on this device.", confirmLabel: "Log out" })}><LogOut size={16} />Logout</button></div>
    </aside>
    <main className="tax-admin-main">
      <header className="tax-admin-topbar"><div><span className="tax-admin-eyebrow">TAXELLO / ADMIN</span><h1>{view === "dashboard" ? "Dashboard" : view === "contacts" ? "Contact Enquiries" : "Purchase Requests"}</h1></div><div className="tax-admin-top-actions"><span className="tax-admin-session"><span />Secure session</span><LastUpdated value={lastUpdated} loading={loading || refreshing} />{view !== "dashboard" && <button type="button" className="tax-admin-button tax-admin-button-muted tax-admin-export" aria-label={`Export all ${view === "contacts" ? "contact enquiries" : "purchase requests"} as CSV`} title={`Export all ${view === "contacts" ? "contact enquiries" : "purchase requests"}`} onClick={() => downloadCsv(view === "contacts" ? contacts : purchases, view === "contacts" ? "contacts" : "purchases")} disabled={loading || refreshing || !data}><Download size={15} />Export all {view === "contacts" ? "enquiries" : "purchases"} CSV</button>}<button type="button" className="tax-admin-button tax-admin-button-muted" aria-label="Refresh admin data" onClick={() => loadAdminData(true)} disabled={loading || refreshing}><RefreshCw size={15} className={refreshing ? "tax-admin-spinning" : ""} />{refreshing ? "Refreshing" : "Refresh data"}</button></div></header>
      {loading && <div className="tax-admin-state" role="status">Loading enquiries and purchase requests...</div>}
      {error && <div className="tax-admin-error" role="alert"><AlertCircle size={19} /><div><strong>{data ? "Some data may be out of date" : "We couldn't load the dashboard"}</strong><p>{error}</p><button type="button" className="tax-admin-button tax-admin-button-muted" onClick={() => loadAdminData(true)}>Try again</button></div></div>}
      {data && view === "dashboard" && <>
        <div className="tax-admin-welcome"><div><span className="tax-admin-eyebrow">OVERVIEW</span><h2 className="tax-admin-heading-pill pill-overview">Your request activity</h2></div></div>
        <div className="tax-admin-metric-groups"><MetricGroup title="Contact enquiries" records={contacts} kind="contact" onMetricClick={openMetric} /><MetricGroup title="Purchase requests" records={purchases} kind="purchase" onMetricClick={openMetric} /></div>
        <div className="tax-admin-visual-grid"><StatusBreakdown title="Contact enquiries" records={contacts} type="contact" onStatusClick={openMetric} /><StatusBreakdown title="Purchase requests" records={purchases} type="purchase" onStatusClick={openMetric} /></div>
        <RecentSubmissions contacts={contacts} purchases={purchases} />
      </>}
      {data && <div className="tax-admin-route-panels" aria-hidden={view === "dashboard"}>
        <div hidden={view !== "contacts"}><RecordsPanel title="Contact enquiries" records={contacts} type="contact" active={view === "contacts"} onStatusChange={confirmStatusChange} onSaveNote={saveNote} onDelete={confirmDelete} busyNoteId={busyNoteId} busyRequestId={confirmation?.busy ? `${confirmation.type}-${confirmation.record?.id}` : null} operationFeedback={operationFeedback} /></div>
        <div hidden={view !== "purchases"}><RecordsPanel title="Purchase requests" records={purchases} type="purchase" active={view === "purchases"} onStatusChange={confirmStatusChange} onSaveNote={saveNote} onDelete={confirmDelete} busyNoteId={busyNoteId} busyRequestId={confirmation?.busy ? `${confirmation.type}-${confirmation.record?.id}` : null} operationFeedback={operationFeedback} /></div>
      </div>}
    </main>
    <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.title} message={confirmation?.message} confirmLabel={confirmation?.confirmLabel} busyLabel={confirmation?.busyLabel} danger={confirmation?.danger} busy={confirmation?.busy} onCancel={() => setConfirmation(null)} onConfirm={executeConfirmation} />
  </div>;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    getApiRequest("/api/admin/session").then(() => { if (current) setAuthenticated(true); }).catch((requestError) => {
      if (current && requestError.status !== 401) setError("Could not connect to the TAXELLO admin service.");
    }).finally(() => { if (current) setCheckingSession(false); });
    return () => { current = false; };
  }, []);
  async function login(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try { await postApiRequest("/api/admin/login", { username: form.get("username"), password: form.get("password") }); setAuthenticated(true); }
    catch (requestError) { setError(requestError.status === 401 ? "The username or password is incorrect." : requestError.message || "Could not sign in. Please try again."); }
    finally { setSubmitting(false); }
  }
  async function logout() { await postApiRequest("/api/admin/logout", {}); setAuthenticated(false); }
  if (checkingSession) return <main className="tax-admin-login-wrap"><div className="tax-admin-login-card" role="status">Checking admin session…</div></main>;
  if (authenticated) return <AdminDashboard onLogout={logout} />;
  return <main className="tax-admin-login-wrap"><section className="tax-admin-login-card"><span className="tax-admin-eyebrow">PRIVATE WORKSPACE</span><h1>Admin sign in</h1><p>Sign in to review and manage TAXELLO requests.</p><form onSubmit={login}><label htmlFor="admin-username">Username</label><input id="admin-username" name="username" autoComplete="username" required /><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required />{error && <p className="tax-admin-login-error" role="alert">{error}</p>}<button className="tax-admin-button tax-admin-button-primary" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button></form></section></main>;
}
