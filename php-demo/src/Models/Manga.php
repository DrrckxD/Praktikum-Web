<?php

declare(strict_types=1);

namespace FlipPlay\Models;

/** Media berjenis manga (dibaca per chapter). */
class Manga extends Media
{
    private int $chapters;

    public function __construct(string $title, string $genre, float $rating, int $chapters)
    {
        parent::__construct($title, $genre, $rating);
        $this->chapters = $chapters;
    }

    public function getType(): string
    {
        return 'Manga';
    }

    protected function getExtraInfo(): string
    {
        return 'Chapter : ' . $this->chapters;
    }
}
