<?php

declare(strict_types=1);

/**
 * FlipPlay - Prototype Backend (OOP PHP)
 * Entry point simulasi. Jalankan lewat terminal:  php index.php
 */

use FlipPlay\Models\Anime;
use FlipPlay\Models\Drama;
use FlipPlay\Models\Manga;
use FlipPlay\Models\Media;
use FlipPlay\Models\User;
use FlipPlay\Services\Library;

// Autoloader sederhana: namespace FlipPlay\X\Y  ->  src/X/Y.php
spl_autoload_register(function (string $class): void {
    $prefix = 'FlipPlay\\';
    if (strpos($class, $prefix) !== 0) {
        return;
    }
    $path = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

function section(string $title): void
{
    echo PHP_EOL . str_repeat('=', 50) . PHP_EOL . $title . PHP_EOL . str_repeat('=', 50) . PHP_EOL;
}

/** @param Media[] $items */
function printList(array $items): void
{
    if ($items === []) {
        echo '(tidak ada media ditemukan)' . PHP_EOL;
        return;
    }
    foreach ($items as $media) {
        echo $media->getSummary() . PHP_EOL;
    }
}

// --- Simulasi ---------------------------------------------------------------

$library = new Library();

// 1. Menambahkan media ke dalam library
section('1. Menambahkan media ke library');
$library->add(new Anime('Kimetsu no Yaiba', 'Action', 8.6, 26));
$library->add(new Anime('Fullmetal Alchemist: Brotherhood', 'Adventure', 9.1, 64));
$library->add(new Manga('Boku no Hero Academia', 'Shounen', 8.5, 432));
$library->add(new Manga('Berserk', 'Dark Fantasy', 9.4, 380));
$library->add(new Drama('Breaking Bad', 'Crime', 9.3, 62, 47));
echo $library->count() . ' media berhasil ditambahkan.' . PHP_EOL;

// 2. Menampilkan daftar media yang tersedia
section('2. Daftar media yang tersedia');
printList($library->all());

// 3. Mencari media berdasarkan judul
section('3. Pencarian judul:');
printList($library->searchByTitle('berserk'));

// 4. Menampilkan informasi detail suatu media
section('4. Detail media ID');
$detail = $library->findById(5);
echo ($detail !== null ? $detail->getDetail() : 'Media tidak ditemukan.') . PHP_EOL;

// 5. Menampilkan koleksi media milik pengguna
section('5. Koleksi milik pengguna');
$user = new User('Derrick');
foreach ([1, 3, 5] as $id) {
    $media = $library->findById($id);
    if ($media !== null) {
        $user->addToCollection($media);
    }
}
echo 'Koleksi ' . $user->getName() . ':' . PHP_EOL;
printList($user->getCollection());
