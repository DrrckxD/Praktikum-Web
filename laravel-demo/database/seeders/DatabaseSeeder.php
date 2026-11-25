<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Data awal sama dengan simulasi Modul 3. */
    public function run(): void
    {
        $items = [
            ['title' => 'Kimetsu no Yaiba', 'type' => 'anime', 'genre' => 'Action', 'rating' => 8.6, 'episodes' => 26],
            ['title' => 'Fullmetal Alchemist: Brotherhood', 'type' => 'anime', 'genre' => 'Adventure', 'rating' => 9.1, 'episodes' => 64],
            ['title' => 'Boku no Hero Academia', 'type' => 'manga', 'genre' => 'Shounen', 'rating' => 8.5, 'chapters' => 432],
            ['title' => 'Berserk', 'type' => 'manga', 'genre' => 'Dark Fantasy', 'rating' => 9.4, 'chapters' => 380],
            ['title' => 'Breaking Bad', 'type' => 'drama', 'genre' => 'Crime', 'rating' => 9.3, 'episodes' => 62, 'runtime' => 47],
        ];

        foreach ($items as $item) {
            Media::create($item);
        }

        $user = User::factory()->create(['name' => 'Derrick', 'email' => 'derrick@example.com']);
        $user->media()->attach(
            Media::whereIn('title', ['Kimetsu no Yaiba', 'Boku no Hero Academia', 'Breaking Bad'])->pluck('id')
        );
    }
}
