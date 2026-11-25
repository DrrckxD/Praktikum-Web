# FlipPlay REST API (Demo Modul 4)

Lanjutan simulasi OOP FlipPlay (`../php-demo`) sebagai REST API Laravel 12.

## Menjalankan

1. Nyalakan MySQL (Laragon: **Start All**), lalu buat database `flipplay`.
2. Di folder `laravel-demo`:

```bash
composer install
cp .env.example .env      # sesuaikan DB_PASSWORD bila perlu
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Untuk mengulang dari data bersih: `php artisan migrate:fresh --seed`.

## Struktur data

| Tabel        | Isi |
|--------------|-----|
| `media`      | title (unik), type (`anime`/`manga`/`drama`), genre, rating, episodes, chapters, runtime |
| `users`      | pengguna |
| `media_user` | pivot koleksi (many-to-many), unik per pasangan |

Kolom wajib per jenis: anime → `episodes`; manga → `chapters`; drama → `episodes`, `runtime`.

## Endpoint

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET    | `/api/media?search=&type=` | Daftar media (10 per halaman), filter judul/jenis |
| POST   | `/api/media` | Tambah media (201) |
| GET    | `/api/media/{id}` | Detail media beserta pengguna yang mengoleksi |
| PATCH  | `/api/media/{id}` | Ubah sebagian data |
| DELETE | `/api/media/{id}` | Hapus media |
| GET    | `/api/users` | Daftar pengguna |
| POST   | `/api/users` | Tambah pengguna (`name`, `email`, `password`) |
| GET    | `/api/users/{id}` | Detail pengguna beserta koleksinya |
| GET    | `/api/users/{id}/collection` | Koleksi pengguna |
| POST   | `/api/users/{id}/collection` | Tambah ke koleksi (`media_id`); 409 bila sudah ada |
| DELETE | `/api/users/{id}/collection/{media_id}` | Hapus dari koleksi; 404 bila tidak ada |

## Pengujian

- **Postman:** import `postman/FlipPlay.postman_collection.json`, jalankan berurutan (folder 1 → 2 → 3).
- **Otomatis:** `php artisan test` (memakai SQLite in-memory, data MySQL tidak tersentuh).
