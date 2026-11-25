<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Media extends Model
{
    public const TYPES = ['anime', 'manga', 'drama'];

    /** Kolom tambahan yang dipakai tiap jenis media (pengganti child class di Modul 3). */
    public const TYPE_FIELDS = [
        'anime' => ['episodes'],
        'manga' => ['chapters'],
        'drama' => ['episodes', 'runtime'],
    ];

    protected $table = 'media';

    protected $fillable = [
        'title',
        'type',
        'genre',
        'rating',
        'episodes',
        'chapters',
        'runtime',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'episodes' => 'integer',
            'chapters' => 'integer',
            'runtime' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        // Kosongkan kolom yang tidak relevan dengan jenis media
        static::saving(function (Media $media) {
            $unused = array_diff(['episodes', 'chapters', 'runtime'], self::TYPE_FIELDS[$media->type] ?? []);

            foreach ($unused as $field) {
                $media->{$field} = null;
            }
        });
    }

    /** Pengguna yang memasukkan media ini ke koleksinya. */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /** Query scope: cari berdasarkan potongan judul. */
    public function scopeSearchByTitle(Builder $query, string $keyword): Builder
    {
        return $query->where('title', 'like', '%'.$keyword.'%');
    }
}
