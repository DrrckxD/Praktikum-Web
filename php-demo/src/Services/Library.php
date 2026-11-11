<?php

declare(strict_types=1);

namespace FlipPlay\Services;

use FlipPlay\Models\Media;

/** Library: kumpulan media yang tersedia di platform FlipPlay. */
class Library
{
    /** @var Media[] */
    private array $items = [];

    /** Menambahkan media ke dalam library. */
    public function add(Media $media): void
    {
        $this->items[$media->getId()] = $media;
    }

    /** @return Media[] Semua media yang tersedia. */
    public function all(): array
    {
        return array_values($this->items);
    }

    /** @return Media[] Media yang judulnya mengandung kata kunci (tidak peka huruf besar/kecil). */
    public function searchByTitle(string $keyword): array
    {
        return array_values(array_filter(
            $this->items,
            fn (Media $m): bool => stripos($m->getTitle(), $keyword) !== false
        ));
    }

    public function findById(int $id): ?Media
    {
        return $this->items[$id] ?? null;
    }

    public function count(): int
    {
        return count($this->items);
    }
}
