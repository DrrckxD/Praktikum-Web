<?php

declare(strict_types=1);

namespace FlipPlay\Models;

/**
 * Class dasar (parent) untuk semua jenis media di FlipPlay.
 * Abstract: tidak bisa di-instansiasi langsung, harus lewat Anime / Manga / Drama.
 */
abstract class Media
{
    private static int $counter = 0;

    protected int $id;
    protected string $title;
    protected string $genre;
    protected float $rating;

    public function __construct(string $title, string $genre, float $rating)
    {
        $this->id = ++self::$counter;
        $this->title = $title;
        $this->genre = $genre;
        $this->rating = $rating;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getGenre(): string
    {
        return $this->genre;
    }

    public function getRating(): float
    {
        return $this->rating;
    }

    /** Jenis media (Anime / Manga / Drama), ditentukan oleh child class. */
    abstract public function getType(): string;

    /** Informasi tambahan khusus tiap jenis media (episode / chapter). */
    abstract protected function getExtraInfo(): string;

    /** Ringkasan satu baris untuk daftar media. */
    public function getSummary(): string
    {
        return sprintf('[%d] %s (%s) - %s', $this->id, $this->title, $this->getType(), $this->genre);
    }

    /** Detail lengkap suatu media. */
    public function getDetail(): string
    {
        return implode(PHP_EOL, [
            'ID      : ' . $this->id,
            'Judul   : ' . $this->title,
            'Jenis   : ' . $this->getType(),
            'Genre   : ' . $this->genre,
            'Rating  : ' . number_format($this->rating, 1),
            $this->getExtraInfo(),
        ]);
    }
}
