import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, ClipboardList, LogOut, RefreshCw, Search, Trash2, Users } from "lucide-react";
import { deleteApiRequest, getApiRequest, patchApiRequest, postApiRequest } from "../lib/api";
import { useToast } from "../components/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";
import "./PageStyles.css";

const contactStatuses = ["new", "contacted", "in_progress", "resolved"];
const purchaseStatuses = ["pending", "contacted", "in_progress", "completed", "cancelled"];
const currencyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
const labelStatus = (status) => status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function RecordCard({ record, type, onStatusChange, onSaveNote, onDelete }) {
  const isPurchase = type === "purchase";
  const [note, setNote] = useState(record.admin_note || "");
  const statusOptions = isPurchase ? purchaseStatuses : contactStatuses;
  const fields = isPurchase
    ? [["Phone", record.phone || "Not provided"], ["Plan", record.plan], ["Amount", record.amount == null ? "Not available" : currencyFormatter.format(record.amount)], ["Requirements", record.requirements || "None provided"], ["Date", formatDate(record.created_at)]]
    : [["Phone", record.phone || "Not provided"], ["Service", record.service || "Not provided"], ["Message", record.message || "No message"], ["Date", formatDate(record.created_at)]];

  return <article className="admin-record-card">
    <div className="admin-record-heading">
      <div className="admin-record-person"><h3>{record.name}</h3><a href={`mailto:${record.email}`}>{record.email}</a></div>
      <span className={`admin-status-badge status-${record.status || "new"}`}>{labelStatus(record.status || "new")}</span>
    </div>
    <dl className="admin-record-fields">{fields.map(([label, value]) => <div className={label === "Message" || label === "Requirements" ? "admin-record-wide" : ""} key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <details className="admin-record-detail">
      <summary>Manage request</summary>
      <div className="admin-record-controls">
        <label>Status<select value={record.status || statusOptions[0]} onChange={(event) => onStatusChange(record, type, event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}</select></label>
        <label>Internal note<textarea rows="3" maxLength="2000" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a private follow-up note" /></label>
        <div className="admin-record-actions"><button type="button" className="admin-refresh-button" onClick={() => onSaveNote(record, type, note)}>Save note</button><button type="button" className="admin-delete-button" onClick={() => onDelete(record, type)}><Trash2 size={15} /> Delete</button></div>
      </div>
    </details>
  </article>;
}

function RecordsSection({ title, records, type, emptyMessage, onStatusChange, onSaveNote, onDelete }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const statuses = type === "purchase" ? purchaseStatuses : contactStatuses;
  const filteredRecords = useMemo(() => records.filter((record) => {
    const text = [record.name, record.email, record.phone, record.service, record.plan, record.message, record.requirements].filter(Boolean).join(" ").toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (status === "all" || record.status === status);
  }), [records, query, status]);

  return <section className="admin-data-section">
    <div className="admin-section-heading"><h2>{title}</h2><span>{filteredRecords.length} of {records.length}</span></div>
    <div className="admin-list-filters">
      <label className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${type === "purchase" ? "requests" : "enquiries"}`} aria-label={`Search ${title}`} /></label>
      <label className="admin-status-filter"><span>Filter</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{labelStatus(item)}</option>)}</select></label>
    </div>
    {filteredRecords.length === 0
      ? <p className="admin-empty-state">{records.length ? "No records match these filters." : emptyMessage}</p>
      : <div className="admin-record-grid">{filteredRecords.map((record) => <RecordCard key={record.id} record={record} type={type} onStatusChange={onStatusChange} onSaveNote={onSaveNote} onDelete={onDelete} />)}</div>}
  </section>;
}

function AdminDashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const { showToast } = useToast();
  const contacts = data?.contacts ?? [];
  const purchases = data?.purchases ?? [];
  const loading = data === null && !error;
  const summaries = [
    { label: "Total enquiries", value: contacts.length, icon: Users },
    { label: "New enquiries", value: contacts.filter((item) => item.status === "new").length, icon: AlertCircle },
    { label: "In progress", value: contacts.filter((item) => item.status === "in_progress").length + purchases.filter((item) => item.status === "in_progress").length, icon: BarChart3 },
    { label: "Purchase requests", value: purchases.length, icon: ClipboardList },
    { label: "Pending purchases", value: purchases.filter((item) => item.status === "pending").length, icon: RefreshCw },
  ];

  const fetchAdminData = useCallback(async () => {
    const [contactResult, purchaseResult] = await Promise.all([getApiRequest("/api/admin/contacts"), getApiRequest("/api/admin/purchases")]);
    return { contacts: Array.isArray(contactResult.contacts) ? contactResult.contacts : [], purchases: Array.isArray(purchaseResult.purchases) ? purchaseResult.purchases : [] };
  }, []);

  const loadAdminData = useCallback(async (showFeedback = false) => {
    setRefreshing(true);
    setError("");
    try {
      setData(await fetchAdminData());
      if (showFeedback) showToast("Dashboard data refreshed", "success");
    } catch (requestError) {
      setError(requestError.message || "The latest records could not be loaded.");
      if (showFeedback) showToast("Something went wrong. Please try again.", "error");
    } finally {
      setRefreshing(false);
    }
  }, [fetchAdminData, showToast]);

  useEffect(() => {
    let current = true;
    async function loadInitialData() {
      try {
        const result = await fetchAdminData();
        if (current) setData(result);
      } catch (requestError) {
        if (current) setError(requestError.message || "The latest records could not be loaded.");
      }
    }
    loadInitialData();
    return () => { current = false; };
  }, [fetchAdminData]);

  function confirmAction(action) {
    setConfirmation(action);
  }

  async function executeConfirmation() {
    if (!confirmation) return;
    const action = confirmation;
    setConfirmation({ ...action, busy: true });
    try {
      if (action.kind === "refresh") await loadAdminData(true);
      if (action.kind === "logout") await onLogout();
      if (action.kind === "delete") {
        const plural = action.type === "contact" ? "contacts" : "purchases";
        await deleteApiRequest(`/api/admin/${plural}/${action.record.id}`);
        await loadAdminData();
        showToast(action.type === "contact" ? "Enquiry deleted" : "Purchase request deleted", "success");
      }
      if (action.kind === "status") {
        const plural = action.type === "contact" ? "contacts" : "purchases";
        await patchApiRequest(`/api/admin/${plural}/${action.record.id}`, { status: action.status, adminNote: action.record.admin_note || "" });
        await loadAdminData();
        showToast("Status updated", "success");
      }
    } catch (requestError) {
      showToast(requestError.message || "Something went wrong. Please try again.", "error");
    } finally {
      setConfirmation(null);
    }
  }

  async function saveNote(record, type, adminNote) {
    try {
      const plural = type === "contact" ? "contacts" : "purchases";
      await patchApiRequest(`/api/admin/${plural}/${record.id}`, { status: record.status, adminNote });
      await loadAdminData();
      showToast("Internal note saved", "success");
    } catch (requestError) {
      showToast(requestError.message || "Something went wrong. Please try again.", "error");
    }
  }

  return <main className="admin-page">
    <div className="admin-header-row"><div className="admin-heading"><span className="page-eyebrow">TAXELLO ADMIN</span><h1>Dashboard overview</h1><p>Review, organise and follow up on incoming requests.</p></div>
      <div className="admin-header-actions"><button className="admin-refresh-button" type="button" onClick={() => confirmAction({ kind: "refresh", title: "Refresh dashboard?", message: "Refresh the dashboard and load the latest records?", confirmLabel: "Refresh" })} disabled={loading || refreshing}><RefreshCw size={16} className={refreshing ? "is-refreshing" : ""} />{refreshing ? "Refreshing..." : "Refresh data"}</button><button className="admin-refresh-button" type="button" onClick={() => confirmAction({ kind: "logout", title: "Log out?", message: "Are you sure you want to log out?", confirmLabel: "Log out" })}><LogOut size={16} /> Log out</button></div>
    </div>
    <div className="admin-cards">{summaries.map(({ label, value, icon: Icon }) => <article key={label}><Icon /><span>{label}</span><strong>{loading ? "--" : value}</strong></article>)}</div>
    {loading && <div className="admin-state" role="status">Loading enquiries and purchase requests...</div>}
    {!loading && error && <div className="admin-state admin-error-state" role="alert"><AlertCircle size={20} /><div><strong>We couldn't load the latest data.</strong><p>{error}</p><p>Check that the TAXELLO backend is running, then refresh this page.</p></div></div>}
    {!loading && !error && <div className="admin-data-list"><RecordsSection title="Contact enquiries" records={contacts} type="contact" emptyMessage="No contact enquiries yet." onStatusChange={(record, type, status) => confirmAction({ kind: "status", record, type, status, title: "Update enquiry status?", message: `Change this enquiry to ${labelStatus(status)}?`, confirmLabel: "Update" })} onSaveNote={saveNote} onDelete={(record, type) => confirmAction({ kind: "delete", record, type, title: "Delete this enquiry?", message: "Are you sure you want to delete this enquiry? This action cannot be undone.", confirmLabel: "Delete", danger: true })} />
      <RecordsSection title="Purchase requests" records={purchases} type="purchase" emptyMessage="No purchase requests yet." onStatusChange={(record, type, status) => confirmAction({ kind: "status", record, type, status, title: "Update request status?", message: `Change this purchase request to ${labelStatus(status)}?`, confirmLabel: "Update" })} onSaveNote={saveNote} onDelete={(record, type) => confirmAction({ kind: "delete", record, type, title: "Delete this request?", message: "Are you sure you want to delete this purchase request? This action cannot be undone.", confirmLabel: "Delete", danger: true })} /></div>}
    <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.title} message={confirmation?.message} confirmLabel={confirmation?.confirmLabel} danger={confirmation?.danger} busy={confirmation?.busy} onCancel={() => setConfirmation(null)} onConfirm={executeConfirmation} />
  </main>;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    let current = true;
    getApiRequest("/api/admin/session").then(() => { if (current) setAuthenticated(true); }).catch((requestError) => {
      if (current && requestError.status !== 401) setError("Could not connect to the TAXELLO admin service.");
    }).finally(() => { if (current) setCheckingSession(false); });
    return () => { current = false; };
  }, []);

  async function confirmLogin() {
    setSubmitting(true);
    setError("");
    try {
      await postApiRequest("/api/admin/login", credentials);
      setAuthenticated(true);
      setConfirmationOpen(false);
      setCredentials(null);
    } catch (requestError) {
      setError(requestError.status === 401 ? "The username or password is incorrect." : requestError.message);
      setConfirmationOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  function requestLogin(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setCredentials({ username: data.get("username"), password: data.get("password") });
    setConfirmationOpen(true);
  }

  async function handleLogout() {
    await postApiRequest("/api/admin/logout", {});
    setAuthenticated(false);
  }

  if (checkingSession) return <main className="admin-page"><div className="admin-state" role="status">Checking admin session...</div></main>;
  if (authenticated) return <AdminDashboard onLogout={handleLogout} />;
  return <main className="admin-page admin-login-page"><section className="admin-login-card"><span className="page-eyebrow">TAXELLO ADMIN</span><h1>Welcome back</h1><p>Sign in to view and manage incoming requests.</p><form onSubmit={requestLogin}><label htmlFor="admin-username">Username</label><input id="admin-username" name="username" autoComplete="username" required /><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required />{error && <p className="admin-login-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={submitting}>Continue to login</button></form></section>
    <ConfirmDialog open={confirmationOpen} title="Sign in to TAXELLO Admin?" message="Are you sure you want to sign in to the TAXELLO Admin dashboard?" confirmLabel="Sign in" busy={submitting} onCancel={() => { setConfirmationOpen(false); setCredentials(null); }} onConfirm={confirmLogin} />
  </main>;
}
