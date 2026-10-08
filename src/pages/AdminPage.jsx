import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BarChart3, ClipboardList, LogOut, RefreshCw, Users } from "lucide-react";
import { getApiRequest, postApiRequest } from "../lib/api";
import "./PageStyles.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function RecordCard({ record, type }) {
  const isPurchase = type === "purchase";
  const details = isPurchase
    ? [
        ["Phone", record.phone || "Not provided"],
        ["Plan", record.plan],
        ["Amount", record.amount == null ? "Not available" : currencyFormatter.format(record.amount)],
        ["Requirements", record.requirements || "None provided"],
        ["Date", formatDate(record.created_at)],
      ]
    : [
        ["Phone", record.phone || "Not provided"],
        ["Service", record.service || "Not provided"],
        ["Message", record.message || "No message"],
        ["Date", formatDate(record.created_at)],
      ];

  return <article className="admin-record-card">
    <div className="admin-record-heading">
      <div className="admin-record-person">
        <h3>{record.name}</h3>
        <a href={`mailto:${record.email}`}>{record.email}</a>
      </div>
      <span className={`admin-status-badge status-${record.status || "new"}`}>{record.status || "new"}</span>
    </div>
    <dl className="admin-record-fields">
      {details.map(([label, value]) => <div className={label === "Message" || label === "Requirements" ? "admin-record-wide" : ""} key={label}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>)}
    </dl>
  </article>;
}

function RecordsSection({ title, records, type, emptyMessage }) {
  return <section className="admin-data-section">
    <div className="admin-section-heading">
      <h2>{title}</h2>
      <span>{records.length} {records.length === 1 ? "record" : "records"}</span>
    </div>
    {records.length === 0
      ? <p className="admin-empty-state">{emptyMessage}</p>
      : <div className="admin-record-grid">{records.map((record) => <RecordCard key={record.id} record={record} type={type} />)}</div>}
  </section>;
}

function AdminDashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const contacts = data?.contacts ?? [];
  const purchases = data?.purchases ?? [];
  const loading = data === null && !error;

  const fetchAdminData = useCallback(async () => {
    const [contactResult, purchaseResult] = await Promise.all([
        getApiRequest("/api/admin/contacts"),
        getApiRequest("/api/admin/purchases"),
    ]);
    return {
      contacts: Array.isArray(contactResult.contacts) ? contactResult.contacts : [],
      purchases: Array.isArray(purchaseResult.purchases) ? purchaseResult.purchases : [],
    };
  }, []);

  const loadAdminData = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      setData(await fetchAdminData());
    } catch (requestError) {
      setError(requestError.message || "The latest enquiries could not be loaded.");
    } finally {
      setRefreshing(false);
    }
  }, [fetchAdminData]);

  useEffect(() => {
    let isCurrent = true;

    async function loadInitialData() {
      try {
        const result = await fetchAdminData();
        if (isCurrent) setData(result);
      } catch (requestError) {
        if (isCurrent) setError(requestError.message || "The latest enquiries could not be loaded.");
      }
    }

    loadInitialData();
    return () => { isCurrent = false; };
  }, [fetchAdminData]);

  const totalRecords = contacts.length + purchases.length;

  return <main className="admin-page">
    <div className="admin-header-row">
      <div className="admin-heading">
        <span className="page-eyebrow">TAXELLO ADMIN</span>
        <h1>Dashboard overview</h1>
        <p>Your workspace for managing enquiries, clients and services.</p>
      </div>
      <div className="admin-header-actions">
        <button className="admin-refresh-button" type="button" onClick={loadAdminData} disabled={loading || refreshing}>
          <RefreshCw size={16} className={refreshing ? "is-refreshing" : ""} />
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
        <button className="admin-refresh-button" type="button" onClick={onLogout}><LogOut size={16} /> Log out</button>
      </div>
    </div>

    <div className="admin-cards">
      <article><Users /><span>Contact enquiries</span><strong>{loading ? "--" : contacts.length}</strong><small>Messages from the contact form</small></article>
      <article><ClipboardList /><span>Plan requests</span><strong>{loading ? "--" : purchases.length}</strong><small>Purchase enquiries awaiting follow-up</small></article>
      <article><BarChart3 /><span>Total records</span><strong>{loading ? "--" : totalRecords}</strong><small>Contacts and plan requests</small></article>
    </div>

    {loading && <div className="admin-state" role="status">Loading contacts and purchases...</div>}
    {!loading && error && <div className="admin-state admin-error-state" role="alert"><AlertCircle size={20} /><div><strong>We couldn't load the latest data.</strong><p>{error}</p><p>Check that the TAXELLO backend is running, then refresh this page.</p></div></div>}
    {!loading && !error && <div className="admin-data-list">
      <RecordsSection title="Contact enquiries" records={contacts} type="contact" emptyMessage="No contact enquiries yet. New messages will appear here." />
      <RecordsSection title="Plan requests" records={purchases} type="purchase" emptyMessage="No plan requests yet. New purchase enquiries will appear here." />
    </div>}

    <p className="admin-notice">TAXELLO admin workspace.</p>
  </main>;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    getApiRequest("/api/admin/session")
      .then(() => { if (current) setAuthenticated(true); })
      .catch((requestError) => {
        if (current && requestError.status !== 401) setError("Could not connect to the TAXELLO admin service.");
      })
      .finally(() => { if (current) setCheckingSession(false); });
    return () => { current = false; };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      await postApiRequest("/api/admin/login", {
        username: formData.get("username"),
        password: formData.get("password"),
      });
      setAuthenticated(true);
    } catch (requestError) {
      setError(requestError.status === 401 ? "The username or password is incorrect." : requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await postApiRequest("/api/admin/logout", {});
    } finally {
      setAuthenticated(false);
    }
  }

  if (checkingSession) return <main className="admin-page"><div className="admin-state" role="status">Checking admin session...</div></main>;
  if (authenticated) return <AdminDashboard onLogout={handleLogout} />;

  return <main className="admin-page admin-login-page">
    <section className="admin-login-card">
      <span className="page-eyebrow">TAXELLO ADMIN</span>
      <h1>Welcome back</h1>
      <p>Sign in to view enquiries and plan requests.</p>
      <form onSubmit={handleLogin}>
        <label htmlFor="admin-username">Username</label>
        <input id="admin-username" name="username" autoComplete="username" required />
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Log in"}</button>
      </form>
    </section>
  </main>;
}
