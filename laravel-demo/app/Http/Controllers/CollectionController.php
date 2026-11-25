<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCollectionRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;

/** Custom action: mengubah relasi koleksi (tabel pivot media_user). */
class CollectionController extends Controller
{
    /** GET /api/users/{user}/collection */
    public function index(User $user)
    {
        return MediaResource::collection($user->media()->orderBy('media.id')->get());
    }

    /** POST /api/users/{user}/collection */
    public function store(AddToCollectionRequest $request, User $user)
    {
        $mediaId = $request->integer('media_id');

        if ($user->media()->whereKey($mediaId)->exists()) {
            return $this->duplicate();
        }

        try {
            $user->media()->attach($mediaId);
        } catch (UniqueConstraintViolationException) {
            // Dua request bersamaan: ditahan oleh unique index di tabel pivot
            return $this->duplicate();
        }

        return (new MediaResource(Media::findOrFail($mediaId)))
            ->additional(['message' => 'Media ditambahkan ke koleksi.'])
            ->response()
            ->setStatusCode(201);
    }

    /** DELETE /api/users/{user}/collection/{media} */
    public function destroy(User $user, Media $media)
    {
        if ($user->media()->detach($media->id) === 0) {
            return response()->json(['message' => 'Media tidak ada di koleksi pengguna.'], 404);
        }

        return response()->json(['message' => 'Media dihapus dari koleksi.']);
    }

    private function duplicate(): JsonResponse
    {
        return response()->json(['message' => 'Media sudah ada di koleksi pengguna.'], 409);
    }
}
