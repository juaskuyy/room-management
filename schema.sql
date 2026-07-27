CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT NOT NULL CHECK (room IN ('NikiRoom','VinzzRoom')),
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  date TEXT NOT NULL,
  time TEXT DEFAULT '',
  unit TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  amount INTEGER NOT NULL CHECK (amount >= 0),
  description TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_transactions_room_type ON transactions(room, type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
