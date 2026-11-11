<?php

declare(strict_types=1);

namespace FlipPlay\Models;

use FlipPlay\Services\Library;

/** Pengguna FlipPlay beserta koleksi media miliknya. */
class User
{
    private string $name;
    private Library $collection;

    public function __construct(string $name)
    {
        $this->name = $name;
        $this->collection = new Library();
    }

    public function getName(): string
    {
        return $this->name;
    }

    /** Menambahkan media ke koleksi pribadi pengguna. */
    public function addToCollection(Media $media): void
    {
        $this->collection->add($media);
    }

    /** @return Media[] */
    public function getCollection(): array
    {
        return $this->collection->all();
    }
}
