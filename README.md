# Room Management — Workers Assets + D1

1. Upload seluruh isi folder ini ke root repo GitHub `room-management`.
2. Buat D1 bernama `room-management-db`.
3. Jalankan isi `schema.sql` pada D1 Console.
4. Salin Database ID D1.
5. Ganti `GANTI_DENGAN_DATABASE_ID_D1` di `wrangler.toml`.
6. Commit perubahan.
7. Cloudflare build settings:
   - Build command: kosong
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
8. Deploy lalu buka `/api/health`.
