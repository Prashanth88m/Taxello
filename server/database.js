import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const databasePath = fileURLToPath(new URL("./taxello.db", import.meta.url));
export const database = new DatabaseSync(databasePath);

database.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    plan TEXT NOT NULL,
    amount REAL,
    requirements TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

for (const table of ["contacts", "purchases"]) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((column) => column.name === "admin_note")) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN admin_note TEXT`);
  }
}

export const contactInsert = database.prepare(`
  INSERT INTO contacts (name, email, phone, service, message)
  VALUES (?, ?, ?, ?, ?)
`);

export const purchaseInsert = database.prepare(`
  INSERT INTO purchases (name, email, phone, plan, amount, requirements)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const contactsNewestFirst = database.prepare(
  "SELECT * FROM contacts ORDER BY created_at DESC, id DESC"
);

export const purchasesNewestFirst = database.prepare(
  "SELECT * FROM purchases ORDER BY created_at DESC, id DESC"
);

export const updateContactAdminFields = database.prepare(
  "UPDATE contacts SET status = ?, admin_note = ? WHERE id = ?"
);
export const updatePurchaseAdminFields = database.prepare(
  "UPDATE purchases SET status = ?, admin_note = ? WHERE id = ?"
);
export const deleteContact = database.prepare("DELETE FROM contacts WHERE id = ?");
export const deletePurchase = database.prepare("DELETE FROM purchases WHERE id = ?");
