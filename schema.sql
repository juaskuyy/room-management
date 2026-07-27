DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent TEXT NOT NULL CHECK (agent IN ('nikiroom', 'vinzzroom')),
  date TEXT NOT NULL,
  check_in_time TEXT,
  unit TEXT NOT NULL,
  rental_duration TEXT,
  income INTEGER NOT NULL DEFAULT 0,
  expense INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transactions_agent ON transactions(agent);
CREATE INDEX idx_transactions_date ON transactions(date);
