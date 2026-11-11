<?php

declare(strict_types=1);

namespace FlipPlay\Models;

/** Media berjenis drama / serial TV. */
class Drama extends Media
{
    private int $episodes;
    private int $runtime;

    public function __construct(string $title, string $genre, float $rating, int $episodes, int $runtime)
    {
        parent::__construct($title, $genre, $rating);
        $this->episodes = $episodes;
        $this->runtime = $runtime;
    }

    public function getType(): string
    {
        return 'Drama';
    }

    protected function getExtraInfo(): string
    {
        return 'Episode : ' . $this->episodes . ' (' . $this->runtime . ' menit/episode)';
    }
}
