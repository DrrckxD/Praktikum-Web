<?php

declare(strict_types=1);

namespace FlipPlay\Models;

/** Media berjenis anime (ditonton per episode). */
class Anime extends Media
{
    private int $episodes;

    public function __construct(string $title, string $genre, float $rating, int $episodes)
    {
        parent::__construct($title, $genre, $rating);
        $this->episodes = $episodes;
    }

    public function getType(): string
    {
        return 'Anime';
    }

    protected function getExtraInfo(): string
    {
        return 'Episode : ' . $this->episodes;
    }
}
