# Room Management Tahap 2

Fitur: tambah, edit, hapus, pencarian, export CSV, dan Cloudflare D1.

1. Upload semua file ke root repo `room-management` dan timpa file lama.
2. Cloudflare Dashboard → D1 SQL Database → Create database.
3. Nama database: `room-management-db`.
4. Buka Console database, salin isi `schema.sql`, lalu Execute.
5. Workers & Pages → room-management → Settings → Bindings.
6. Tambahkan D1 binding:
   - Variable name: `DB`
   - Database: `room-management-db`
7. Save lalu Redeploy.
8. Tes `https://alamat-kamu.pages.dev/api/health`.
