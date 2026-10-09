import cors from "cors";
import { randomBytes, timingSafeEqual } from "node:crypto";
import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  contactInsert,
  contactsNewestFirst,
  database,
  deleteContact,
  deletePurchase,
  purchaseInsert,
  purchasesNewestFirst,
  updateContactAdminFields,
  updatePurchaseAdminFields,
} from "./database.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const host = process.env.HOST || "0.0.0.0";
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const distDirectory = resolve(currentDirectory, "../dist");
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean));
const adminSessions = new Map();
const sessionDurationSeconds = 8 * 60 * 60;

const plans = {
  Essential: 499,
  Professional: 1499,
  Business: 2999,
};

const crossOriginCors = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error("This origin is not allowed to access the TAXELLO API.");
    error.status = 403;
    callback(error);
  },
});

app.use("/api", (request, response, next) => {
  const origin = request.get("origin");
  const requestHost = (request.get("x-forwarded-host") || request.get("host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();

  // Railway serves the frontend and API from one origin. Same-origin fetches
  // need no CORS headers, so don't run them through the cross-origin allowlist.
  if (origin && requestHost) {
    try {
      if (new URL(origin).host.toLowerCase() === requestHost) {
        return next();
      }
    } catch {
      // Invalid Origin headers fall through to the explicit allowlist check.
    }
  }

  return crossOriginCors(request, response, next);
});
app.use(express.json({ limit: "1mb" }));

function readText(body, field, maxLength) {
  const value = body?.[field];
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const phoneProfiles = [
  { code: "971", min: 9, max: 9, pattern: /^[2-9]\d{8}$/ },
  { code: "91", min: 10, max: 10, pattern: /^[6-9]\d{9}$/ },
  { code: "44", min: 9, max: 10, pattern: /^[1-9]\d{8,9}$/ },
  { code: "61", min: 9, max: 9, pattern: /^[2-9]\d{8}$/ },
  { code: "65", min: 8, max: 8, pattern: /^[3689]\d{7}$/ },
  { code: "1", min: 10, max: 10, pattern: /^[2-9]\d{9}$/ },
];

function normalizePhone(value) {
  const trimmed = value.trim();
  if (!/^\+[\d\s()-]+$/.test(trimmed)) return null;

  const compact = trimmed.replace(/[\s()-]/g, "");
  const profile = phoneProfiles.find(({ code }) => compact.startsWith(`+${code}`));
  if (!profile) return null;

  const nationalNumber = compact.slice(profile.code.length + 1);
  if (nationalNumber.length < profile.min || nationalNumber.length > profile.max) return null;
  if (!profile.pattern.test(nationalNumber)) return null;

  return `+${profile.code} ${nationalNumber}`;
}

function safeCredentialMatch(candidate, expected) {
  if (!candidate || !expected) return false;
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
}

function getSessionToken(request) {
  const cookies = request.headers.cookie || "";
  const entry = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith("taxello_admin="));
  return entry ? decodeURIComponent(entry.slice("taxello_admin=".length)) : "";
}

function setSessionCookie(response, token, maxAge) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `taxello_admin=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=${maxAge}${secureFlag}`
  );
}

function requireAdmin(request, response, next) {
  const token = getSessionToken(request);
  const expiresAt = adminSessions.get(token);

  if (!token || !expiresAt || expiresAt <= Date.now()) {
    if (token) adminSessions.delete(token);
    return response.status(401).json({ success: false, error: "Admin login required." });
  }

  next();
}

function validationError(res, message) {
  return res.status(400).json({ success: false, error: message });
}

app.get("/api/health", (_request, response) => {
  response.json({ success: true, message: "TAXELLO API is running" });
});

app.post("/api/admin/login", (request, response) => {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return response.status(503).json({
      success: false,
      error: "Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in the server environment.",
    });
  }

  const username = typeof request.body?.username === "string" ? request.body.username.trim().slice(0, 256) : "";
  const password = typeof request.body?.password === "string" ? request.body.password.slice(0, 256) : "";
  if (!safeCredentialMatch(username, ADMIN_USERNAME) || !safeCredentialMatch(password, ADMIN_PASSWORD)) {
    return response.status(401).json({ success: false, error: "Invalid username or password." });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + sessionDurationSeconds * 1000;
  for (const [sessionToken, expiry] of adminSessions) {
    if (expiry <= Date.now()) adminSessions.delete(sessionToken);
  }
  adminSessions.set(token, expiresAt);
  setSessionCookie(response, token, sessionDurationSeconds);

  return response.json({ success: true, message: "Admin login successful." });
});

app.post("/api/admin/logout", (request, response) => {
  adminSessions.delete(getSessionToken(request));
  setSessionCookie(response, "", 0);
  return response.json({ success: true, message: "Admin logged out." });
});

app.get("/api/admin/session", requireAdmin, (_request, response) => {
  response.json({ success: true, authenticated: true });
});

app.post("/api/contact", (request, response, next) => {
  try {
    const contact = {
      name: readText(request.body, "name", 120),
      email: readText(request.body, "email", 254),
      phone: readText(request.body, "phone", 40),
      service: readText(request.body, "service", 120),
      message: readText(request.body, "message", 5000),
    };

    if (!contact.name || !contact.email || !contact.service) {
      return validationError(response, "Name, email and service are required.");
    }
    if (!isValidEmail(contact.email)) {
      return validationError(response, "Enter a valid email address.");
    }

    const normalizedPhone = contact.phone ? normalizePhone(contact.phone) : null;
    if (contact.phone && !normalizedPhone) {
      return validationError(response, "Enter a valid international phone number.");
    }

    const result = contactInsert.run(
      contact.name,
      contact.email,
      normalizedPhone,
      contact.service,
      contact.message || null
    );

    return response.status(201).json({
      success: true,
      message: "Your enquiry has been received.",
      id: Number(result.lastInsertRowid),
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/purchases", (request, response, next) => {
  try {
    const purchase = {
      name: readText(request.body, "name", 120),
      email: readText(request.body, "email", 254),
      phone: readText(request.body, "phone", 40),
      plan: readText(request.body, "plan", 80),
      requirements: readText(request.body, "requirements", 5000),
    };

    if (!purchase.name || !purchase.email || !purchase.phone || !purchase.plan) {
      return validationError(response, "Name, email, phone and plan are required.");
    }
    if (!isValidEmail(purchase.email)) {
      return validationError(response, "Enter a valid email address.");
    }
    const normalizedPhone = normalizePhone(purchase.phone);
    if (!normalizedPhone) {
      return validationError(response, "Enter a valid international phone number.");
    }
    if (!Object.hasOwn(plans, purchase.plan)) {
      return validationError(response, "Select a valid TAXELLO plan.");
    }

    const result = purchaseInsert.run(
      purchase.name,
      purchase.email,
      normalizedPhone,
      purchase.plan,
      plans[purchase.plan],
      purchase.requirements || null
    );

    return response.status(201).json({
      success: true,
      message: "Your plan enquiry has been received.",
      id: Number(result.lastInsertRowid),
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/contacts", requireAdmin, (_request, response, next) => {
  try {
    return response.json({ success: true, contacts: contactsNewestFirst.all() });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/purchases", requireAdmin, (_request, response, next) => {
  try {
    return response.json({ success: true, purchases: purchasesNewestFirst.all() });
  } catch (error) {
    return next(error);
  }
});

const adminStatuses = {
  contacts: new Set(["new", "contacted", "accepted", "in_progress", "completed", "cancelled", "resolved"]),
  purchases: new Set(["pending", "contacted", "accepted", "in_progress", "completed", "cancelled"]),
};

function updateAdminRecord(request, response, next, { table, updater, statuses }) {
  try {
    const id = Number(request.params.id);
    const status = readText(request.body, "status", 30);
    const adminNote = readText(request.body, "adminNote", 2000);
    if (!Number.isSafeInteger(id) || id < 1) return validationError(response, "Enter a valid record ID.");
    if (!statuses.has(status)) return validationError(response, "Select a valid status.");
    const result = updater.run(status, adminNote || null, id);
    if (!result.changes) return response.status(404).json({ success: false, error: "Record not found." });
    const record = database.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    return response.json({ success: true, record });
  } catch (error) {
    return next(error);
  }
}

function deleteAdminRecord(request, response, next, statement) {
  try {
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return validationError(response, "Enter a valid record ID.");
    const result = statement.run(id);
    if (!result.changes) return response.status(404).json({ success: false, error: "Record not found." });
    return response.json({ success: true, message: "Record deleted." });
  } catch (error) {
    return next(error);
  }
}

app.patch("/api/admin/contacts/:id", requireAdmin, (request, response, next) =>
  updateAdminRecord(request, response, next, { table: "contacts", updater: updateContactAdminFields, statuses: adminStatuses.contacts })
);
app.patch("/api/admin/purchases/:id", requireAdmin, (request, response, next) =>
  updateAdminRecord(request, response, next, { table: "purchases", updater: updatePurchaseAdminFields, statuses: adminStatuses.purchases })
);
app.delete("/api/admin/contacts/:id", requireAdmin, (request, response, next) =>
  deleteAdminRecord(request, response, next, deleteContact)
);
app.delete("/api/admin/purchases/:id", requireAdmin, (request, response, next) =>
  deleteAdminRecord(request, response, next, deletePurchase)
);

app.use("/api", (_request, response) => {
  response.status(404).json({ success: false, error: "API endpoint not found." });
});

app.use(express.static(distDirectory));
app.get(/.*/, (_request, response) => {
  response.sendFile(resolve(distDirectory, "index.html"));
});

app.use((error, _request, response, _next) => {
  if (response.headersSent) return _next(error);
  console.error("TAXELLO API error:", error.message);
  const status = error.status || (error.type === "entity.parse.failed" ? 400 : 500);
  const message = status === 400 ? "Invalid JSON request body." : "Something went wrong. Please try again.";
  response.status(status).json({ success: false, error: status === 403 ? error.message : message });
});

const server = app.listen(port, host, () => {
  console.log(`TAXELLO API running at http://${host}:${port}`);
  console.log(`SQLite database: ${new URL("./taxello.db", import.meta.url).pathname}`);
});

function stopServer() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);
