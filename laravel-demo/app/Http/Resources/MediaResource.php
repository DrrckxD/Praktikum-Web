<?php

namespace App\Http\Resources;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Media */
class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $typeFields = Media::TYPE_FIELDS[$this->type] ?? [];

        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type,
            'genre' => $this->genre,
            'rating' => $this->rating,
            'episodes' => $this->when(in_array('episodes', $typeFields, true), $this->episodes),
            'chapters' => $this->when(in_array('chapters', $typeFields, true), $this->chapters),
            'runtime' => $this->when(in_array('runtime', $typeFields, true), $this->runtime),
            'users' => UserResource::collection($this->whenLoaded('users')),
        ];
    }
}
