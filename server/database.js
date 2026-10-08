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
