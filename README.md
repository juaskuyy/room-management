# Update Room Management

Fitur:
- Login admin aman dengan session cookie.
- Dashboard hanya 2 rekap: NikiRoom dan VinzzRoom.
- Total pemasukan, pengeluaran, dan saldo dipisah per room.
- Pengeluaran NikiRoom dan VinzzRoom memiliki form serta tabel sendiri.
- Keterangan pengeluaran tampil pada tabel.
- Tambah, edit, dan hapus tetap tersedia.

## Pasang
1. Ganti `GANTI_DENGAN_DATABASE_ID_D1` pada `wrangler.toml` dengan ID D1 milikmu.
2. Buka D1 > Console, lalu jalankan isi `schema.sql`.
3. Worker > Settings > Variables and Secrets, tambahkan:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET` (teks acak minimal 32 karakter)
4. Upload semua file ke repo GitHub dan commit.
5. Deploy command: `npx wrangler deploy`.

`CREATE TABLE IF NOT EXISTS` tidak menghapus data lama. Namun jika struktur tabel lama berbeda, export/cadangkan D1 terlebih dahulu.
